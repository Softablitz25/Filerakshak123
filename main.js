const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// --- Paths ---
const userDataPath = app.getPath('userData');
const vaultConfigPath = path.join(userDataPath, 'vault-password.json');
const vaultDataPath = path.join(userDataPath, 'vault-data.json');
const vaultStoragePath = path.join(userDataPath, 'secure_vault_files');

// --- Initialize folders and files ---
if (!fs.existsSync(vaultStoragePath)) {
  fs.mkdirSync(vaultStoragePath);
}
if (!fs.existsSync(vaultDataPath)) {
  fs.writeFileSync(vaultDataPath, JSON.stringify({ Photos: [], PDFs: [], "Other Files": [] }));
}

// --- Helper Functions ---
const readVaultData = () => JSON.parse(fs.readFileSync(vaultDataPath, 'utf-8'));
const writeVaultData = (data) => fs.writeFileSync(vaultDataPath, JSON.stringify(data, null, 2));


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

  win.loadURL('http://localhost:5173');
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);


// --- IPC Handlers ---

ipcMain.on('save-password', (event, data) => {
  const hashedPassword = bcrypt.hashSync(data.password, 10);
  fs.writeFileSync(vaultConfigPath, JSON.stringify({ password: hashedPassword }));
});

ipcMain.handle('vault-exists', () => {
  return fs.existsSync(vaultConfigPath);
});

// ✅ Sahi Password Check (hang nahi hoga)
ipcMain.handle('check-password', (event, password) => {
  if (!fs.existsSync(vaultConfigPath)) return false;
  const savedData = JSON.parse(fs.readFileSync(vaultConfigPath, 'utf-8'));
  return bcrypt.compareSync(password, savedData.password);
});

// ✅ File Data Dena
ipcMain.handle('get-vault-data', () => {
  return readVaultData();
});

// ✅ File Upload (MOVE karke)
ipcMain.handle('upload-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
  if (canceled || filePaths.length === 0) return { success: false };

  const vaultData = readVaultData();
  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(vaultStoragePath, fileName);
    
    try {
      fs.renameSync(filePath, destinationPath); // File ko MOVE karega
    } catch (err) {
      // Agar move fail ho to copy karke delete karega
      fs.copyFileSync(filePath, destinationPath);
      fs.unlinkSync(filePath);
    }

    const stats = fs.statSync(destinationPath);
    const fileDetails = { name: fileName, path: destinationPath, size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`};
    const extension = fileName.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) vaultData.Photos.push(fileDetails);
    else if (extension === 'pdf') vaultData.PDFs.push(fileDetails);
    else vaultData["Other Files"].push(fileDetails);
  }

  writeVaultData(vaultData);
  return { success: true };
});

// ✅ File Open karna
ipcMain.handle('open-file', async (event, filePath) => {
  if (filePath && filePath.startsWith(vaultStoragePath)) {
    const error = await shell.openPath(filePath);
    if (error) return { success: false, message: error };
    return { success: true };
  }
  return { success: false, message: "Security Error." };
});
// ipc handle for renaming a file
// ✅ File Rename karna (FINAL CODE)
ipcMain.handle('rename-file', async (event, file, newName) => {
  try {
    const dir = path.dirname(file.path);
    const newPath = path.join(dir, newName);

    // 1. Check karein ki naye naam se file pehle se मौजूद to nahi hai
    if (fs.existsSync(newPath)) {
      return { success: false, message: 'A file with that name already exists.' };
    }

    // 2. Asli file ko disk par rename karein
    fs.renameSync(file.path, newPath);

    // 3. vault-data.json mein record update karein
    const vaultData = readVaultData();
    let fileUpdated = false;

    for (const cat in vaultData) {
      // Sahi file ko uske purane path se dhundein
      const fileIndex = vaultData[cat].findIndex(f => f.path === file.path);
      
      if (fileIndex !== -1) {
        // File milne par uska naam aur path update karein
        vaultData[cat][fileIndex].name = newName;
        vaultData[cat][fileIndex].path = newPath;
        fileUpdated = true;
        break; // Loop se bahar aa jayein
      }
    }

    if (fileUpdated) {
      writeVaultData(vaultData);
      return { success: true };
    } else {
      // Agar kisi wajah se JSON mein file na mile (bahut rare case)
      return { success: false, message: 'File record not found in the database.' };
    }

  } catch (error) {
    console.error('File rename failed:', error);
    return { success: false, message: 'Could not rename the file on the disk.' };
  }
});

// ✅ File Export karna (aur app se delete karna)
ipcMain.handle('export-file', async (event, file) => {
  const { filePath } = await dialog.showSaveDialog({ title: 'Export File', defaultPath: file.name });
  if (filePath) {
    try {
      fs.copyFileSync(file.path, filePath); // Pehle file ko copy karo

      // Ab app se delete karo
      fs.unlinkSync(file.path); 
      const vaultData = readVaultData();
      Object.keys(vaultData).forEach(cat => {
        vaultData[cat] = vaultData[cat].filter(f => f.path !== file.path);
      });
      writeVaultData(vaultData);

      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to export file.' };
    }
  }
  return { success: false, message: 'Export cancelled.' };
});

// ✅ File Delete karna
ipcMain.handle('delete-file', (event, file) => {
  const choice = dialog.showMessageBoxSync({
    type: 'warning',
    buttons: ['Cancel', 'Delete'],
    defaultId: 0,
    title: 'Delete File',
    message: `Are you sure you want to permanently delete "${file.name}"?`
  });

  if (choice === 1) { // 1 means 'Delete'
    fs.unlinkSync(file.path);
    const vaultData = readVaultData();
    Object.keys(vaultData).forEach(cat => {
      vaultData[cat] = vaultData[cat].filter(f => f.path !== file.path);
    });
    writeVaultData(vaultData);
    return { success: true };
  }
  return { success: false };
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });