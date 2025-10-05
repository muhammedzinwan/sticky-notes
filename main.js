const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const NOTES_FILE = path.join(app.getPath('userData'), 'notes.json');
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');
let notes = [];
let settings = {
  fontSize: 16,
  defaultColor: 'yellow',
  alwaysOnTop: true,
  defaultOpacity: 1.0
};
let tray = null;
let settingsWindow = null;

// Load saved notes
function loadNotes() {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      const data = fs.readFileSync(NOTES_FILE, 'utf8');
      notes = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    notes = [];
  }
}

// Load settings
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      settings = { ...settings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings
function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Save notes
function saveNotes() {
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// Create a new sticky note window
function createNoteWindow(noteData = {}) {
  const { width = 240, height = 240, x, y, content = '', id = Date.now().toString() } = noteData;

  // Get screen bounds to position new notes
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;

  // Default position: center or offset from last note
  const defaultX = x || Math.floor(screenWidth / 2 - width / 2) + (notes.length * 30);
  const defaultY = y || Math.floor(screenHeight / 2 - height / 2) + (notes.length * 30);

  // Load icon
  const iconPath = path.join(__dirname, 'resources', 'yellow-note-paper-with-red-pin_1284-42430.png');

  const noteWindow = new BrowserWindow({
    width,
    height,
    x: defaultX,
    y: defaultY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  noteWindow.loadFile('renderer/index.html');

  // Store note ID and deletion flag
  noteWindow.noteId = id;
  noteWindow.isDeleting = false;

  // Send initial content and settings to renderer
  noteWindow.webContents.on('did-finish-load', () => {
    noteWindow.webContents.send('load-content', { content, id });
    noteWindow.webContents.send('settings-updated', settings);
  });

  // Save position when window is moved
  let moveTimeout;
  noteWindow.on('move', () => {
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      const bounds = noteWindow.getBounds();
      const noteIndex = notes.findIndex(n => n.id === noteWindow.noteId);
      if (noteIndex !== -1) {
        notes[noteIndex].x = bounds.x;
        notes[noteIndex].y = bounds.y;
        notes[noteIndex].width = bounds.width;
        notes[noteIndex].height = bounds.height;
        saveNotes();
      }
    }, 300); // Debounce 300ms
  });

  // Handle window close - only remove from storage if explicitly deleted
  noteWindow.on('close', () => {
    if (noteWindow.isDeleting) {
      const noteIndex = notes.findIndex(n => n.id === noteWindow.noteId);
      if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        saveNotes();
      }
    }
  });

  return noteWindow;
}

// Create settings window
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  // Load icon
  const iconPath = path.join(__dirname, 'resources', 'yellow-note-paper-with-red-pin_1284-42430.png');

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    title: 'Sticky Notes Settings',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  settingsWindow.loadFile('renderer/settings.html');

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// Create system tray
function createTray() {
  const { nativeImage } = require('electron');

  // Try to load tray icon, fallback to PNG converted to icon
  let trayIcon;
  const trayIconPath = path.join(__dirname, 'resources', 'tray-icon.ico');
  const trayPngPath = path.join(__dirname, 'resources', 'yellow-note-paper-with-red-pin_1284-42430.png');

  if (fs.existsSync(trayIconPath)) {
    trayIcon = nativeImage.createFromPath(trayIconPath);
  } else if (fs.existsSync(trayPngPath)) {
    // Use PNG and resize for tray
    trayIcon = nativeImage.createFromPath(trayPngPath).resize({ width: 16, height: 16 });
  } else {
    // Fallback: create empty icon
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'New Note',
      click: () => createNoteWindow()
    },
    {
      label: 'Settings',
      click: () => createSettingsWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Sticky Notes');
  tray.setContextMenu(contextMenu);

  // Double-click to create new note
  tray.on('double-click', () => {
    createNoteWindow();
  });
}

// IPC handlers
ipcMain.on('save-note', (event, data) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const bounds = window.getBounds();

  const noteIndex = notes.findIndex(n => n.id === data.id);
  const noteData = {
    id: data.id,
    content: data.content,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };

  if (noteIndex !== -1) {
    notes[noteIndex] = noteData;
  } else {
    notes.push(noteData);
  }

  saveNotes();
});

ipcMain.on('delete-note', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.isDeleting = true;
  window.close();
});

ipcMain.on('toggle-always-on-top', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const isAlwaysOnTop = window.isAlwaysOnTop();
  window.setAlwaysOnTop(!isAlwaysOnTop);
  event.reply('always-on-top-status', !isAlwaysOnTop);
});

ipcMain.on('set-opacity', (event, opacity) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.setOpacity(opacity);
});

ipcMain.on('new-note', () => {
  createNoteWindow();
});

// Settings IPC handlers
ipcMain.on('get-settings', (event) => {
  event.reply('settings-data', settings);
});

ipcMain.on('save-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  saveSettings();
  // Notify all note windows to update
  BrowserWindow.getAllWindows().forEach(win => {
    if (!win.isDestroyed() && win.webContents) {
      win.webContents.send('settings-updated', settings);
    }
  });
});

// App ready
app.whenReady().then(() => {
  loadNotes();
  loadSettings();

  // Create system tray
  createTray();

  // Register global shortcut for new note
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    createNoteWindow();
  });

  // Load existing notes or create first one
  if (notes.length === 0) {
    createNoteWindow();
  } else {
    notes.forEach(note => createNoteWindow(note));
  }
});

// Don't quit when all windows are closed - keep running in tray
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createNoteWindow();
  }
});
