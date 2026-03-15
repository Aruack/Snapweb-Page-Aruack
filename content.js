(() => {
    if (window.__snapWebInjected) return;
    window.__snapWebInjected = true;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'CAPTURE_VISIBLE') {
            captureVisible();
        } else if (request.action === 'CAPTURE_FULL') {
            captureFull();
        } else if (request.action === 'CAPTURE_SELECTED') {
            captureSelected();
        }
    });

    async function captureVisible() {
        const dataUrl = await new Promise(resolve => {
            chrome.runtime.sendMessage({ action: 'CAPTURE_FRAME' }, (response) => {
                const err = chrome.runtime.lastError;
                if (err) console.warn('Message error:', err);
                resolve(response);
            });
        });
        if (dataUrl) openResult(dataUrl);
    }

    async function captureFull() {
        const originalOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden'; // Hide the page scrollbars

        const totalHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );

        const originalScrollY = window.scrollY;
        let currentY = 0;
        let canvas = null;
        let ctx = null;
        let dprRatio = 1;

        while (currentY < totalHeight) {
            window.scrollTo(0, currentY);
            // Wait 600ms to allow smooth rendering and to stay under Chrome's capture visible tab quota limit
            await new Promise(r => setTimeout(r, 600)); 

            const dataUrl = await new Promise(resolve => {
                chrome.runtime.sendMessage({ action: 'CAPTURE_FRAME' }, (response) => {
                    const err = chrome.runtime.lastError;
                    if (err) console.warn('Message error:', err);
                    resolve(response);
                });
            });
            if (!dataUrl) break; // End capture if there's an error

            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            if (!canvas) {
                // Extrapolate exact screen pixel ratio natively from image resolution
                dprRatio = img.width / window.innerWidth;
                canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = Math.round(totalHeight * dprRatio);
                ctx = canvas.getContext('2d');
            }

            const actualScrollY = window.scrollY;
            const yOffset = Math.round(actualScrollY * dprRatio);
            ctx.drawImage(img, 0, yOffset, img.width, img.height);

            // Reached the document bottom
            if (actualScrollY + window.innerHeight >= totalHeight) break;
            
            currentY += window.innerHeight;
        }

        // Restore scroll position
        window.scrollTo(0, originalScrollY);
        document.documentElement.style.overflow = originalOverflow;

        if (canvas) {
            const finalDataUrl = canvas.toDataURL('image/png');
            openResult(finalDataUrl);
        }
    }

    function captureSelected() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
        overlay.style.zIndex = '999999';
        overlay.style.cursor = 'crosshair';
        document.body.appendChild(overlay);

        let startX, startY;
        const selection = document.createElement('div');
        selection.style.position = 'absolute';
        selection.style.border = '2px dashed #fff';
        selection.style.backgroundColor = 'rgba(255,255,255,0.1)';
        overlay.appendChild(selection);

        const onMouseDown = (e) => {
            startX = e.clientX;
            startY = e.clientY;
            selection.style.left = startX + 'px';
            selection.style.top = startY + 'px';
            selection.style.width = '0px';
            selection.style.height = '0px';
            
            overlay.addEventListener('mousemove', onMouseMove);
            overlay.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            const currentX = e.clientX;
            const currentY = e.clientY;
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            selection.style.left = left + 'px';
            selection.style.top = top + 'px';
            selection.style.width = width + 'px';
            selection.style.height = height + 'px';
        };

        const onMouseUp = async (e) => {
            overlay.removeEventListener('mousemove', onMouseMove);
            overlay.removeEventListener('mouseup', onMouseUp);
            
            const rect = selection.getBoundingClientRect();
            document.body.removeChild(overlay);
            
            await new Promise(r => setTimeout(r, 100)); // wait for overlay to vanish completely
            
            if (rect.width > 5 && rect.height > 5) {
                const dataUrl = await new Promise(resolve => {
                    chrome.runtime.sendMessage({ action: 'CAPTURE_FRAME' }, (response) => {
                        const err = chrome.runtime.lastError;
                        if (err) console.warn('Message error:', err);
                        resolve(response);
                    });
                });
                if (!dataUrl) return;
                
                const img = new Image();
                img.src = dataUrl;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                
                const dpr = img.width / window.innerWidth;
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(rect.width * dpr);
                canvas.height = Math.round(rect.height * dpr);
                const ctx = canvas.getContext('2d');
                
                // Draw precisely the cropped area and retain retinal density
                ctx.drawImage(
                    img, 
                    Math.round(rect.left * dpr), Math.round(rect.top * dpr), Math.round(rect.width * dpr), Math.round(rect.height * dpr),
                    0, 0, canvas.width, canvas.height
                );
                
                const finalDataUrl = canvas.toDataURL('image/png');
                openResult(finalDataUrl);
            }
        };

        overlay.addEventListener('mousedown', onMouseDown);
    }
    
    function openResult(dataUrl) {
        chrome.runtime.sendMessage({ 
            action: 'OPEN_RESULT', 
            dataUrl: dataUrl, 
            title: document.title || 'Screenshot'
        });
    }
})();
