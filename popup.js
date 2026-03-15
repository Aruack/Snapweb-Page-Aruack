document.addEventListener('DOMContentLoaded', () => {
    // UI Interactions
    document.getElementById('btn-visible').addEventListener('click', () => triggerCapture('INIT_CAPTURE_VISIBLE'));
    document.getElementById('btn-full').addEventListener('click', () => triggerCapture('INIT_CAPTURE_FULL'));
    document.getElementById('btn-selected').addEventListener('click', () => triggerCapture('INIT_CAPTURE_SELECTED'));

    const darkModeToggle = document.getElementById('dark-mode');

    // Load dark mode preference
    chrome.storage.local.get(['darkMode'], (data) => {
        if (data.darkMode) {
            darkModeToggle.checked = true;
            document.body.classList.add('dark-mode');
        }
    });

    // Save dark mode preference
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        chrome.storage.local.set({ darkMode: darkModeToggle.checked });
    });

    function triggerCapture(action) {
        chrome.runtime.sendMessage({ action: action });
        window.close(); // Close extension popup to allow capture
    }
});
