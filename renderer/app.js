const { ipcRenderer } = require('electron');

let noteId = null;
let isAlwaysOnTop = true;
let isBackgroundMode = false;
let isDeleting = false;

// DOM elements
const textarea = document.querySelector('.note-textarea');
const btnToggleTop = document.querySelector('.btn-toggle-top');
const btnOpacity = document.querySelector('.btn-opacity');
const btnNew = document.querySelector('.btn-new');
const btnDelete = document.querySelector('.btn-delete');

// Load note content
ipcRenderer.on('load-content', (event, data) => {
  noteId = data.id;
  textarea.value = data.content || '';
  textarea.focus();
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

ipcRenderer.on('always-on-top-status', (event, status) => {
  isAlwaysOnTop = status;
  btnToggleTop.classList.toggle('pinned', status);
  btnToggleTop.title = status ? 'Always on Top ✓' : 'Not Always on Top';
});

// Toggle opacity (background mode)
btnOpacity.addEventListener('click', () => {
  isBackgroundMode = !isBackgroundMode;
  const opacity = isBackgroundMode ? 0.3 : 1.0;
  ipcRenderer.send('set-opacity', opacity);
  btnOpacity.classList.toggle('background-mode', isBackgroundMode);
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
