// main.js

// Step 2.1: 'ipcMain' ko yahan import karein
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

// Step 2.2: Yeh naya code add karein jo password save karne ki request sunega
ipcMain.on('save-password', (event, password) => {
  console.log(`Password React se mil gaya hai: ${password}`);
  // <<-- YAHAN PAR PASSWORD KO DATABASE YA FILE MEIN SAVE KARNE KA ASLI LOGIC LIKHA JAYEGA -->>
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});