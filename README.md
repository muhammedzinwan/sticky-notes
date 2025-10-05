# Sticky Notes App

Beautiful desktop sticky notes with realistic pin aesthetic for Windows.

## Features

- 📌 **Pure CSS Design**: Beautiful sticky notes with realistic shadows and corner curl
- 🖱️ **Easy Dragging**: Click and drag from the top pin area
- 👁️ **Background Mode**: Toggle to 30% opacity (Ctrl+B)
- 📍 **Always on Top**: Keep notes visible (Ctrl+T)
- 💾 **Auto-Save**: Notes persist across sessions with position memory
- ⌨️ **Keyboard Shortcuts**: Quick access to all features
- ➕ **Multiple Notes**: Create unlimited notes (Ctrl+Shift+N)
- ⚙️ **Settings Panel**: Customize font size, colors, and behavior
- 🎨 **System Tray**: Runs in background with tray menu

## Installation

### Development

```bash
npm install
npm start
```

### Production Build (Recommended)

**1. Install dependencies:**
```bash
npm install
```

**2. Build the application:**

```bash
# Full installer + portable executable
npm run build

# Portable version only (no installation required)
npm run build:portable

# Build without packaging (for testing)
npm run build:dir
```

**3. Find your build:**
- **Installer**: `dist/Sticky Notes Setup.exe` (installs to Program Files)
- **Portable**: `dist/StickyNotes-Portable.exe` (run anywhere, no installation)

## Why Use Production Build?

| Development (`npm start`) | Production Build |
|--------------------------|------------------|
| ❌ 200-300MB RAM | ✅ 80-150MB RAM |
| ❌ Slower startup | ✅ Fast startup |
| ❌ Needs Node.js | ✅ Standalone executable |
| ❌ Larger disk usage | ✅ Optimized & compressed |
| ❌ Dev tools included | ✅ Production-only code |

**Recommended**: Use portable build (`StickyNotes-Portable.exe`) for daily use!

## Usage

### From System Tray
- **Right-click** tray icon → New Note / Settings / Quit
- **Double-click** tray icon → Create new note

### Keyboard Shortcuts
- **Ctrl+Shift+N**: Create new note
- **Ctrl+T**: Toggle always-on-top
- **Ctrl+B**: Toggle background mode (opacity)
- **Ctrl+W**: Delete current note

### Settings
Right-click tray icon → Settings to customize:
- Font size (12-24px)
- Default note color (6 colors available)
- Always on top behavior
- Default opacity

## File Structure

```
sticky-notes/
├── main.js                 # Electron main process
├── renderer/
│   ├── index.html         # Note UI
│   ├── styles.css         # Styling
│   ├── app.js             # Renderer logic
│   ├── settings.html      # Settings UI
│   ├── settings.css       # Settings styles
│   └── settings.js        # Settings logic
├── resources/             # Images (if any)
├── build/
│   └── icon.ico          # App icon
├── dist/                  # Built executables (after build)
└── package.json
```

## Tech Stack

- **Electron** - Desktop framework
- **HTML/CSS/JavaScript** - UI
- **electron-builder** - Production packaging
- **Google Fonts (Caveat)** - Handwriting font
- **Pure CSS** - All visual effects (no images!)

## Build Configuration

The app is optimized for Windows with:
- ✅ ASAR packaging (faster loading)
- ✅ Maximum compression
- ✅ Both installer and portable versions
- ✅ Desktop shortcuts
- ✅ Start menu integration
- ✅ System tray support

## Data Storage

- **Notes**: `%APPDATA%/sticky-notes/notes.json`
- **Settings**: `%APPDATA%/sticky-notes/settings.json`

## License

MIT

---

**For daily use**: Build the portable version once (`npm run build:portable`) and use `StickyNotes-Portable.exe` - it's optimized and doesn't require Node.js!
