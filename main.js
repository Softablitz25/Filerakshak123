// main.js

// Use CommonJS 'require' syntax consistently
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Point to your preload script
      preload: path.join(__dirname, 'preload.js'),
      
      // --- SECURITY BEST PRACTICES ---
      nodeIntegration: false, // Keep Node.js integration off in the renderer
      contextIsolation: true, // Protect against prototype pollution
    },
  });

  // This logic for loading dev vs. production is correct
  if (app.isPackaged) {
    // Production: load your built frontend
    win.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  } else {
    // Development: load the Vite dev server
    // Make sure the port matches your vite.config.js
    win.loadURL('http://localhost:5173'); 
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});