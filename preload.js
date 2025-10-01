// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// 'api' naam ka ek secure bridge bana rahe hain
// Isse aapka React code Electron se safely baat kar payega
contextBridge.exposeInMainWorld('api', {
  // 'savePassword' naam ka ek function bana rahe hain
  // Jab React se yeh call hoga, toh yeh 'save-password' naam ka message Electron ko bhejega
  savePassword: (password) => ipcRenderer.send('save-password', password),
});