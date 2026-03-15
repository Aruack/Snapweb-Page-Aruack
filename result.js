document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['extension_screenshot', 'screenshot_title'], (data) => {
        if (data.extension_screenshot) {
            const img = document.getElementById('preview');
            img.src = data.extension_screenshot;
            window.screenshotDataUrl = data.extension_screenshot;
            window.originalDataUrl = data.extension_screenshot;
            window.pageTitle = data.screenshot_title || 'Screenshot';
            
            const tempImg = new Image();
            tempImg.src = data.extension_screenshot;
            tempImg.onload = () => {
                document.getElementById('resize-w').value = tempImg.naturalWidth;
                document.getElementById('resize-h').value = tempImg.naturalHeight;
            };

            // Cleanup to free extension storage limits
            chrome.storage.local.remove('extension_screenshot');
        }
    });

    document.getElementById('btn-resize').addEventListener('click', () => {
        const newW = parseInt(document.getElementById('resize-w').value);
        const newH = parseInt(document.getElementById('resize-h').value);
        if (!newW || !newH || newW <= 0 || newH <= 0) return;
        
        const tempImg = new Image();
        tempImg.src = window.originalDataUrl;
        tempImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = newW;
            canvas.height = newH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(tempImg, 0, 0, newW, newH);
            
            const resizedUrl = canvas.toDataURL('image/png');
            document.getElementById('preview').src = resizedUrl;
            window.screenshotDataUrl = resizedUrl;
        };
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        document.getElementById('preview').src = window.originalDataUrl;
        window.screenshotDataUrl = window.originalDataUrl;
        
        const tempImg = new Image();
        tempImg.src = window.originalDataUrl;
        tempImg.onload = () => {
            document.getElementById('resize-w').value = tempImg.naturalWidth;
            document.getElementById('resize-h').value = tempImg.naturalHeight;
        };
    });

    document.getElementById('btn-download').addEventListener('click', () => {
        const format = document.getElementById('format').value;
        const imgUrl = window.screenshotDataUrl;
        
        let finalUrl = imgUrl;
        // Convert format if necessary
        if (format === 'jpeg' && imgUrl.startsWith('data:image/png')) {
            const canvas = document.createElement('canvas');
            const img = document.getElementById('preview');
            // Scale correctly
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff'; // JPEG doesn't support transparency, fill white
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            finalUrl = canvas.toDataURL('image/jpeg', 0.9);
        }

        // Generate filename dynamically: target name + timestamp
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const sec = String(date.getSeconds()).padStart(2, '0');
        
        let safeTitle = window.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        if (safeTitle.length > 30) safeTitle = safeTitle.substring(0, 30);
        const filename = `${safeTitle}_${yyyy}${mm}${dd}_${hh}${min}${sec}.${format}`;

        // Initiate download
        const a = document.createElement('a');
        a.href = finalUrl;
        a.download = filename;
        a.click();
    });

    document.getElementById('btn-copy').addEventListener('click', async () => {
        try {
            const img = document.getElementById('preview');
            
            // ClipboardItem API generally requires Blob objects natively
            const res = await fetch(window.screenshotDataUrl);
            const blob = await res.blob();
            
            // Force PNG for clipboard items
            let clipboardBlob = blob;
            if (blob.type !== 'image/png') {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                clipboardBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            }

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': clipboardBlob })
            ]);
            
            const btn = document.getElementById('btn-copy');
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
        } catch (err) {
            console.error(err);
            alert('Failed to copy image directly to clipboard! You might need to right-click the image and select "Copy image".');
        }
    });
});
