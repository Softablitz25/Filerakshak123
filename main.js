const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const PASSWORD_FILE = path.join(app.getPath('userData'), 'vault-password.json');

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

// ✅ Save password (with optional security question/answer)
ipcMain.on('save-password', (event, data) => {
  const hashedPassword = bcrypt.hashSync(data.password, 10);
  fs.writeFileSync(PASSWORD_FILE, JSON.stringify({
    password: hashedPassword,
    securityQuestion: data.securityQuestion || '',
    securityAnswer: data.securityAnswer || ''
  }));
  console.log("Password saved securely!");
  event.reply('password-saved', true);
});

// ✅ Vault existence check
ipcMain.handle('vault-exists', () => {
  return fs.existsSync(PASSWORD_FILE);
});

// ✅ Check password
ipcMain.on('check-password', (event, password) => {
  if (!fs.existsSync(PASSWORD_FILE)) {
    event.reply('password-check-result', false);
    return;
  }
  const savedData = JSON.parse(fs.readFileSync(PASSWORD_FILE, 'utf-8'));
  const isMatch = bcrypt.compareSync(password, savedData.password);
  event.reply('password-check-result', isMatch);
});

// Close events
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
