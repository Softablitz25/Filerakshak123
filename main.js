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

// main.js

// Sets up a listener for the 'upload-file' event from the frontend.
ipcMain.handle('upload-file', async (event, { parentId }) => {
  // 1. Open the native file selection dialog for the user.
  const { canceled, filePaths } = await dialog.showOpenDialog({ 
    properties: ['openFile', 'multiSelections'] 
  });
  
  // If the user cancels, stop the process.
  if (canceled || filePaths.length === 0) {
    return { success: false };
  }

  // Load the current vault database (JSON file) into memory.
  const vaultData = readVaultData();
  
  // Process each file the user selected.
  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(vaultStoragePath, fileName);

    // Prevent overwriting by skipping files that already exist in the vault.
    if (fs.existsSync(destinationPath)) {
        console.log(`Skipping duplicate file: ${fileName}`);
        continue;
    }
    
    // 2. Physically MOVE the file from its original location to the app's secure folder.
    fs.renameSync(filePath, destinationPath);

    const stats = fs.statSync(destinationPath);
    
    // 3. Create a logical record (a "library card") for the file to be saved in the JSON database.
    const fileDetails = {
      id: `file-${Date.now()}-${Math.random()}`,
      type: 'file',
      name: fileName,
      path: destinationPath, // The actual path for opening the file later.
      size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
      // This links the file to the virtual folder the user is currently in.
      parentId: parentId, 
    };
    
    // Automatically determine which category the file belongs to based on its extension.
    const extension = fileName.split('.').pop().toLowerCase();
    let targetCategory = "Other Files";
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      targetCategory = "Photos";
    } else if (extension === 'pdf') {
      targetCategory = "PDFs";
    }

    // Add the new file record to the appropriate category in our in-memory data.
    vaultData[targetCategory].push(fileDetails);
  }

  // 4. Save all the changes back to the vault-data.json file on the disk.
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
// ✅ File/Folder Rename karna (Updated to use ID)
ipcMain.handle('rename-file', async (event, itemToRename, newName) => {
  try {
    const vaultData = readVaultData();
    let itemUpdated = false;

    // Sirf file hone par hi disk par rename karein
    if (itemToRename.type === 'file') {
      const dir = path.dirname(itemToRename.path);
      const newPath = path.join(dir, newName);

      if (fs.existsSync(newPath)) {
        return { success: false, message: 'A file with that name already exists.' };
      }
      fs.renameSync(itemToRename.path, newPath);

      // JSON mein path bhi update karna zaroori hai
      for (const cat in vaultData) {
        const item = vaultData[cat].find(i => i.id === itemToRename.id);
        if (item) {
          item.name = newName;
          item.path = newPath; // Path bhi update karein
          itemUpdated = true;
          break;
        }
      }
    } else { // Agar folder hai, to sirf JSON mein naam badlein
      for (const cat in vaultData) {
        const item = vaultData[cat].find(i => i.id === itemToRename.id);
        if (item) {
          item.name = newName;
          itemUpdated = true;
          break;
        }
      }
    }

    if (itemUpdated) {
      writeVaultData(vaultData);
      return { success: true };
    } else {
      return { success: false, message: 'Item record not found in the database.' };
    }
  } catch (error) {
    console.error('Item rename failed:', error);
    return { success: false, message: 'Could not rename the item.' };
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
// Handles the 'create-folder' event from the frontend.
ipcMain.handle('create-folder', (event, { category, folderName, parentId }) => {
  // 1. Validate the folder name to ensure it's not empty.
  if (!folderName || folderName.trim() === '') {
    return { success: false, message: 'Folder name cannot be empty.' };
  }

  // Load the current vault database into memory.
  const vaultData = readVaultData();

  // 2. Check if a folder or file with the same name already exists in the current location.
  const nameExists = vaultData[category].some(item => 
    item.parentId === parentId && item.name === folderName
  );
  if (nameExists) {
    return { success: false, message: `An item named "${folderName}" already exists here.` };
  }

  // 3. Create the new virtual folder's record.
  const newFolder = {
    id: `folder-${Date.now()}`, // A unique ID for this folder.
    type: 'folder',
    name: folderName,
    parentId: parentId, // Links this folder to its parent (a category or another folder).
  };

  // Add the new folder record to the correct category.
  vaultData[category].push(newFolder);
  
  // 4. Save the updated data back to the vault-data.json file.
  writeVaultData(vaultData);

  return { success: true, newFolder };
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });