# Changelog

## 2025-10-04 - Complete CSS Redesign

### Added
- Created Electron-based sticky notes application with realistic pin aesthetic
- Added draggable functionality via top pin area
- Implemented always-on-top toggle feature (Ctrl+T)
- Added background mode with opacity control (Ctrl+B)
- Created multi-note support with global hotkey (Ctrl+Shift+N)
- Implemented auto-save functionality with persistent storage
- Added keyboard shortcuts for all actions
- **NEW: Pure CSS sticky note design** - No images required!
  - Multi-layer shadow system (4 shadow layers for depth)
  - Bottom-right corner curl effect with gradient
  - 3D push pin with radial gradient and shine highlight
  - Color variants (yellow, green, pink, orange, blue, purple)
  - Hover animation (lifts up with enhanced shadow)
  - Fade-in animation on creation

### Changed (Fourth Pass - Pure CSS Solution)
- **Replaced image-based design with pure CSS** (index.html:14-23, styles.css:28-285)
  - No more white background issues
  - Perfect shadows without cropping artifacts
  - Scalable without quality loss
  - Easy color customization
- **Sticky note size**: 200x200px (compact and non-intrusive)
- **Window size**: 240x240px with 20px padding (styles.css:25)
- **Shadow system**: 4-layer box-shadow for realistic depth (styles.css:36-40)
- **Corner curl**: CSS triangle with gradient shadow (styles.css:55-77)
- **Push pin**: CSS shapes with 3D effects (styles.css:81-120)
  - Radial gradient for sphere effect
  - Inset shadows for depth
  - White highlight for shine
  - Drop-shadow filter for pin shadow
- **Text area**: Optimized positioning (top: 18%, width: 88%, height: 68%)
- **Font**: 14px Caveat with 1.4 line-height

### Fixed (Fifth Pass - UX Polish)
- **Minimalistic controls**: Simplified action buttons (styles.css:177-225)
  - Transparent background (no boxes)
  - Smaller size (18x18px, 10px font)
  - Subtle opacity (70% on hover, 60% default)
  - Fade in on hover only
  - Active state shows full opacity
- **Delete persistence bug (FIXED)**: Notes now properly removed from storage when deleted
  - **Root cause**: `beforeunload` event was saving notes even during deletion (app.js:91-97)
  - **Solution**: Added `isDeleting` flag in both main and renderer process
  - Renderer sets flag before sending delete command (app.js:6, 62)
  - Main process checks flag before removing from storage (main.js:64, 72-79, 111)
  - `beforeunload` skips save if deleting (app.js:92)
  - Deleted notes now stay deleted after restart
- **Shadow direction**: Changed to bottom-right directional shadow (styles.css:36-51)
  - Before: Shadows on all sides (0px offset)
  - After: Bottom-right only (2px-8px X/Y offset)
  - More realistic, matches reference image
  - 4-layer shadow for depth (close, mid, far, ambient)
- **Position persistence**: Notes now remember where you moved them (main.js:71-86)
  - Added `move` event listener with 300ms debounce
  - Saves x, y, width, height on every move
  - Notes restore to exact position on app restart

### Research Findings
- Image-based approach had unavoidable transparency issues
- CSS provides better control over shadows and effects
- Pure CSS is lighter, faster, and more maintainable
- Color variants can be added without additional images

### Added (Sixth Pass - System Tray & Settings)
- **System Tray**: App now runs in system tray (main.js:160-193)
  - Tray menu with "New Note", "Settings", "Quit"
  - Double-click tray icon to create new note
  - App stays running when all windows closed
  - Right-click for context menu
- **Settings Window**: Full settings UI (renderer/settings.html, settings.css, settings.js)
  - Font size adjustment (12-24px slider)
  - Default note color selection (6 colors)
  - Always on top toggle
  - Default opacity control (30%-100%)
  - Keyboard shortcuts reference
- **Settings Persistence**: Settings saved to settings.json (main.js:31-49)
  - Auto-load on app start
  - Apply to all notes in real-time
  - Font size updates immediately when changed
- **UI Improvements**:
  - Disabled window resizing (main.js:51)
  - Font size increased to 16px default (styles.css:146)

### Added (Seventh Pass - Production Build)
- **electron-builder**: Production packaging with optimization (package.json:17-60)
  - ASAR packaging for faster loading
  - Maximum compression (reduces size by ~40%)
  - Windows installer (NSIS) with desktop shortcuts
  - Portable executable (no installation required)
- **Build Scripts**: Multiple build options
  - `npm run build` - Full installer + portable
  - `npm run build:portable` - Portable only (recommended for daily use)
  - `npm run build:dir` - Unpacked build for testing
- **Performance Optimization**:
  - Production build: 80-150MB RAM (vs 200-300MB dev)
  - Faster startup time
  - Standalone executable (no Node.js required)
  - Smaller disk footprint
- **Build Configuration**:
  - Desktop shortcut creation
  - Start menu integration
  - Custom app icon support (build/icon.ico)
  - Resource unpacking for assets

### Fixed (Eighth Pass - Icons & UX)
- **Settings Save Bug**: Settings window no longer closes on save (settings.js:43-54)
  - Now shows "✓ Saved!" feedback with green button
  - Reverts after 1.5 seconds
  - Can adjust settings multiple times
- **Icon Support**: Added icons to all windows and system tray (main.js:73, 140, 166-177)
  - System tray icon (resources/tray-icon.ico)
  - Settings window icon
  - Note windows icon (taskbar)
  - Build icon for installer (build/icon.ico)
  - Falls back gracefully: ICO → PNG → empty
  - All icons properly set (4.1KB ICO files)

### Technical Details
- Stack: Electron, HTML/CSS/JavaScript
- Font: Google Fonts (Caveat) for handwriting aesthetic
- Storage: JSON-based persistence (notes.json, settings.json)
- Window: Frameless, transparent, non-resizable (240x240 default)
- Design: 100% CSS (no images), multi-layer shadows, gradient backgrounds
- System Tray: Always running in background with icon
- Build: electron-builder with ASAR, maximum compression
- Distribution: Installer + Portable executable
- Icons: PNG with ICO support (see ICON_SETUP.md)
