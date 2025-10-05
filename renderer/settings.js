const { ipcRenderer } = require('electron');

// DOM elements
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const defaultColorSelect = document.getElementById('defaultColor');
const alwaysOnTopCheckbox = document.getElementById('alwaysOnTop');
const opacitySlider = document.getElementById('defaultOpacity');
const opacityValue = document.getElementById('opacityValue');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Load current settings
ipcRenderer.send('get-settings');

ipcRenderer.on('settings-data', (event, settings) => {
  fontSizeSlider.value = settings.fontSize || 16;
  fontSizeValue.textContent = `${settings.fontSize || 16}px`;
  defaultColorSelect.value = settings.defaultColor || 'yellow';
  alwaysOnTopCheckbox.checked = settings.alwaysOnTop !== false;
  opacitySlider.value = settings.defaultOpacity || 1.0;
  opacityValue.textContent = `${Math.round((settings.defaultOpacity || 1.0) * 100)}%`;
});

// Update slider values
fontSizeSlider.addEventListener('input', (e) => {
  fontSizeValue.textContent = `${e.target.value}px`;
});

opacitySlider.addEventListener('input', (e) => {
  opacityValue.textContent = `${Math.round(e.target.value * 100)}%`;
});

// Save settings
saveBtn.addEventListener('click', () => {
  const newSettings = {
    fontSize: parseInt(fontSizeSlider.value),
    defaultColor: defaultColorSelect.value,
    alwaysOnTop: alwaysOnTopCheckbox.checked,
    defaultOpacity: parseFloat(opacitySlider.value)
  };

  ipcRenderer.send('save-settings', newSettings);

  // Show feedback
  saveBtn.textContent = '✓ Saved!';
  saveBtn.style.background = '#4CAF50';
  saveBtn.style.color = 'white';

  setTimeout(() => {
    saveBtn.textContent = 'Save Settings';
    saveBtn.style.background = '';
    saveBtn.style.color = '';
  }, 1500);
});

// Cancel
cancelBtn.addEventListener('click', () => {
  window.close();
});
