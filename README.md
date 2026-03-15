# Snapweb Page Aruack 📸

Snapweb Page Aruack is a privacy-focused Chrome Extension (Manifest V3) to effortlessly capture, resize, & export screenshots. Snap the visible area, draw a custom box around specific elements, or let the extension automatically scroll and stitch massive full-page retina screenshots natively. Export as PNG, JPEG, or copy to clipboard instantly!

[![Developer](https://img.shields.io/badge/Developed%20by-Aruack-blue?style=flat-square&logo=github)](https://github.com/aruack)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=flat-square)](#)

## ✨ Features
- **Capture Visible Area**: Instantly snap what you see on your screen.
- **Capture Full Page**: Automatically scrolls and stitches the entire webpage mathematically, respecting retina/high-DPI resolution.
- **Capture Selected Area**: Drag and select a custom bounding box natively on the page.
- **Image Resizer**: Adjust the width and height of your screenshot before exporting.
- **Save & Export**: Download instantly as **PNG** or **JPEG**, or copy the image directly to your OS clipboard.
- **Dark Mode UI**: Clean, responsive, and gorgeous modern interface.

## 🚀 Installation (Developer Mode)
Since this extension is not yet published on the Chrome Web Store, you can manually install it locally:

1. Clone or download this repository to your computer:
   ```bash
   git clone https://github.com/aruack/snapweb-page-aruack.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left corner.
5. Select the folder containing the extension files.
6. The extension is now installed! Click the puzzle piece icon 🧩 in Chrome to pin it to your toolbar.

## ⌨️ Keyboard Shortcuts
For lightning-fast workflow, you can capture the visible area without even clicking the extension!
- **Windows/Linux**: `Ctrl+Shift+X`
- **Mac**: `Command+Shift+X`

*(Note: You can customize these shortcuts in Chrome by navigating to `chrome://extensions/shortcuts`)*

## 🛠️ Built With
- **Vanilla JavaScript** (ES6+)
- **HTML5 & CSS3**
- **Chrome Extension API** (`chrome.tabs`, `chrome.scripting`, `chrome.storage`, `chrome.downloads`)
- Canvas API (for image pixel stitching & resizing manipulation)

## 👤 Author
**Aruack**
- GitHub: [@aruack](https://github.com/aruack)

## 📜 License
This project is open-source and available under the MIT License.
