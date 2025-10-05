const { ipcRenderer } = require('electron');

let noteId = null;
let isAlwaysOnTop = true;
let isBackgroundMode = false;
let isDeleting = false;
let blurTimeout = null;

// DOM elements
const textarea = document.querySelector('.note-textarea');
const btnToggleTop = document.querySelector('.btn-toggle-top');
const btnOpacity = document.querySelector('.btn-opacity');
const btnNew = document.querySelector('.btn-new');
const btnDelete = document.querySelector('.btn-delete');
const stickyNote = document.querySelector('.sticky-note');
const pushPin = document.querySelector('.push-pin');

// Generate random pin color
function getRandomPinColor() {
  const colors = [
    { light: '#FF8A8A', dark: '#FF5252', pressedLight: '#FF6B6B', pressedDark: '#E53935' }, // Red (default)
    { light: '#FFB366', dark: '#FF9800', pressedLight: '#FF9E40', pressedDark: '#F57C00' }, // Orange
    { light: '#FFD966', dark: '#FFC107', pressedLight: '#FFCA28', pressedDark: '#FFA000' }, // Yellow
    { light: '#81C784', dark: '#4CAF50', pressedLight: '#66BB6A', pressedDark: '#388E3C' }, // Green
    { light: '#64B5F6', dark: '#2196F3', pressedLight: '#42A5F5', pressedDark: '#1976D2' }, // Blue
    { light: '#BA68C8', dark: '#9C27B0', pressedLight: '#AB47BC', pressedDark: '#7B1FA2' }, // Purple
    { light: '#F06292', dark: '#E91E63', pressedLight: '#EC407A', pressedDark: '#C2185B' }, // Pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Load note content
ipcRenderer.on('load-content', (event, data) => {
  noteId = data.id;
  textarea.value = data.content || '';
  textarea.focus();

  // Set initial pinned state (default is always on top)
  stickyNote.classList.add('pinned');

  // Set random pin color
  const pinColor = getRandomPinColor();
  stickyNote.style.setProperty('--pin-light', pinColor.light);
  stickyNote.style.setProperty('--pin-dark', pinColor.dark);
  stickyNote.style.setProperty('--pin-pressed-light', pinColor.pressedLight);
  stickyNote.style.setProperty('--pin-pressed-dark', pinColor.pressedDark);
});

// Apply settings when updated
ipcRenderer.on('settings-updated', (event, settings) => {
  if (settings.fontSize) {
    textarea.style.fontSize = `${settings.fontSize}px`;
  }
});

// Auto-save on content change
let saveTimeout;
textarea.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    ipcRenderer.send('save-note', {
      id: noteId,
      content: textarea.value
    });
  }, 500); // Debounce 500ms
});

// Toggle always-on-top
btnToggleTop.addEventListener('click', () => {
  ipcRenderer.send('toggle-always-on-top');
});

// Make push pin clickable (same functionality)
pushPin.addEventListener('click', () => {
  ipcRenderer.send('toggle-always-on-top');
});

ipcRenderer.on('always-on-top-status', (event, status) => {
  isAlwaysOnTop = status;
  btnToggleTop.classList.toggle('pinned', status);
  btnToggleTop.title = status ? 'Always on Top ✓' : 'Not Always on Top';

  // Toggle visual pin state
  stickyNote.classList.toggle('pinned', status);
});

// Toggle opacity (background mode)
btnOpacity.addEventListener('click', () => {
  isBackgroundMode = !isBackgroundMode;
  if (!isBackgroundMode) {
    // Exiting background mode - restore full opacity
    clearTimeout(blurTimeout);
    ipcRenderer.send('set-opacity', 1.0);
  } else {
    // Entering background mode - set to transparent
    ipcRenderer.send('set-opacity', 0.3);
  }
  btnOpacity.classList.toggle('background-mode', isBackgroundMode);
  stickyNote.classList.toggle('background-mode', isBackgroundMode);
  btnOpacity.title = isBackgroundMode ? 'Background Mode ✓' : 'Normal Mode';
});

// Create new note
btnNew.addEventListener('click', () => {
  ipcRenderer.send('new-note');
});

// Delete note
btnDelete.addEventListener('click', () => {
  if (textarea.value.trim() === '' || confirm('Delete this note?')) {
    isDeleting = true;
    ipcRenderer.send('delete-note');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+T: Toggle always on top
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    btnToggleTop.click();
  }

  // Ctrl+B: Toggle background mode
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    btnOpacity.click();
  }

  // Ctrl+W: Delete note
  if (e.ctrlKey && e.key === 'w') {
    e.preventDefault();
    btnDelete.click();
  }

  // Ctrl+Shift+N: New note (handled by main process globally)
});

// Save on window unload (only if not deleting)
window.addEventListener('beforeunload', () => {
  if (!isDeleting) {
    ipcRenderer.send('save-note', {
      id: noteId,
      content: textarea.value
    });
  }
});

// Background mode focus behavior - bring to full opacity when focused
window.addEventListener('focus', () => {
  if (isBackgroundMode) {
    clearTimeout(blurTimeout);
    ipcRenderer.send('set-opacity', 1.0);
  }
});

window.addEventListener('blur', () => {
  if (isBackgroundMode) {
    // Wait 3 seconds before fading back to background mode
    clearTimeout(blurTimeout);
    blurTimeout = setTimeout(() => {
      ipcRenderer.send('set-opacity', 0.3);
    }, 3000);
  }
});
