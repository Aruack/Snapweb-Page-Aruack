chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (['INIT_CAPTURE_VISIBLE', 'INIT_CAPTURE_FULL', 'INIT_CAPTURE_SELECTED'].includes(request.action)) {
        processCaptureInit(request.action);
    } else if (request.action === 'CAPTURE_FRAME') {
        captureTabWithRetry(5, (dataUrl, error) => {
            if (error) console.error('Capture failed:', error);
            sendResponse(dataUrl);
        });
        return true; // Indicates async response
    } else if (request.action === 'OPEN_RESULT') {
        chrome.storage.local.set({ 
            extension_screenshot: request.dataUrl, 
            screenshot_title: request.title 
        }, () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('result.html') });
        });
    }
});

let lastCaptureTime = 0;

function captureTabWithRetry(retries, callback) {
    const now = Date.now();
    const timeSinceLast = now - lastCaptureTime;
    const minInterval = 600; // At least 600ms between any capture call

    if (timeSinceLast < minInterval) {
        // Enforce the wait time globally
        setTimeout(() => captureTabWithRetry(retries, callback), minInterval - timeSinceLast);
        return;
    }

    lastCaptureTime = Date.now();
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
            console.warn('Capture error:', chrome.runtime.lastError.message);
            if (retries > 0) {
                setTimeout(() => captureTabWithRetry(retries - 1, callback), 600);
            } else {
                callback(null, chrome.runtime.lastError.message);
            }
        } else {
            callback(dataUrl, null);
        }
    });
}

chrome.commands.onCommand.addListener((command) => {
    if (command === 'capture-visible') {
        processCaptureInit('INIT_CAPTURE_VISIBLE');
    }
});

async function processCaptureInit(action) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;
    const tab = tabs[0];
    
    // Cannot inject scripts into chrome:// or extension marketplace pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore')) {
        console.warn('Cannot capture restricted chrome pages.');
        return;
    }

    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        
        // Minor delay to ensure listener is registered within content script
        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: action.replace('INIT_', '') });
        }, 100);
    } catch (err) {
        console.error('Failed to inject script:', err);
    }
}
