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

// main.js (SAHI CODE)

// Is version mein password aur security details, dono save ho rahe hain.
ipcMain.on('save-password', (event, data) => {
  const hashedPassword = bcrypt.hashSync(data.password, 10);
  const answerHash = bcrypt.hashSync(data.securityAnswer, 10);

  const configData = {
    password: hashedPassword,
    security: {
      question: data.securityQuestion, // e.g., "pet", "city"
      answer: answerHash,
    }
  };

  // Yahan galti thi. Ab poora 'configData' object save hoga.
  fs.writeFileSync(vaultConfigPath, JSON.stringify(configData, null, 2));
});

ipcMain.handle('vault-exists', () => {
  return fs.existsSync(vaultConfigPath);
});

ipcMain.handle('check-password', (event, password) => {
  if (!fs.existsSync(vaultConfigPath)) return false;
  const savedData = JSON.parse(fs.readFileSync(vaultConfigPath, 'utf-8'));
  return bcrypt.compareSync(password, savedData.password);
});

ipcMain.handle('get-vault-data', () => {
  return readVaultData();
});

// ✅ FINAL 'upload-file' handler with strict type checking
ipcMain.handle('upload-file', async (event, { parentId, category }) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  });

  if (canceled || filePaths.length === 0) {
    return { success: false, message: "No files selected." };
  }

  const vaultData = readVaultData();
  let addedCount = 0;
  let skippedCount = 0;

  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const extension = path.extname(fileName).substring(1).toLowerCase();

    // --- STRICT TYPE CHECKING LOGIC ---
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension);
    const isPdf = extension === 'pdf';

    let canUpload = false;
    if (category === "Photos" && isImage) {
      canUpload = true;
    } else if (category === "PDFs" && isPdf) {
      canUpload = true;
    } else if (category === "Other Files" && !isImage && !isPdf) {
      canUpload = true;
    }

    if (!canUpload) {
      console.log(`Skipping file: ${fileName}. Type does not match category "${category}".`);
      skippedCount++;
      continue; // Skip to the next file
    }
    // --- END OF LOGIC ---

    const destinationPath = path.join(vaultStoragePath, fileName);
    if (fs.existsSync(destinationPath)) {
      console.log(`Skipping duplicate file: ${fileName}`);
      skippedCount++;
      continue;
    }

    fs.renameSync(filePath, destinationPath);
    addedCount++;

    const stats = fs.statSync(destinationPath);
    const fileDetails = {
      id: `file-${Date.now()}-${Math.random()}`,
      type: 'file',
      name: fileName,
      path: destinationPath,
      size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
      parentId: parentId,
    };

    if (vaultData[category]) {
      vaultData[category].push(fileDetails);
    } else {
      console.error(`Error: Category "${category}" does not exist.`);
      vaultData["Other Files"].push(fileDetails); // Fallback
    }
  }

  writeVaultData(vaultData);

  let message = "";
  if (addedCount > 0) {
    message += `${addedCount} file(s) added successfully.`;
  }
  if (skippedCount > 0) {
    message += ` ${skippedCount} file(s) were skipped due to wrong category or being a duplicate.`;
  }

  if (addedCount === 0 && skippedCount > 0) {
    return { success: false, message: `No files were added. ${skippedCount} file(s) were skipped.` };
  }

  return { success: true, message: message.trim() };
});


ipcMain.handle('open-file', async (event, filePath) => {
  if (filePath && filePath.startsWith(vaultStoragePath)) {
    const error = await shell.openPath(filePath);
    if (error) return { success: false, message: error };
    return { success: true };
  }
  return { success: false, message: "Security Error." };
});

ipcMain.handle('rename-file', async (event, itemToRename, newName) => {
  try {
    const vaultData = readVaultData();
    let itemUpdated = false;

    if (itemToRename.type === 'file') {
      const dir = path.dirname(itemToRename.path);
      const newPath = path.join(dir, newName);

      if (fs.existsSync(newPath)) {
        return { success: false, message: 'A file with that name already exists.' };
      }
      fs.renameSync(itemToRename.path, newPath);

      for (const cat in vaultData) {
        const item = vaultData[cat].find(i => i.id === itemToRename.id);
        if (item) {
          item.name = newName;
          item.path = newPath;
          itemUpdated = true;
          break;
        }
      }
    } else {
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

ipcMain.handle('export-file', async (event, file) => {
  const { filePath } = await dialog.showSaveDialog({ title: 'Export File', defaultPath: file.name });
  if (filePath) {
    try {
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path);
      const vaultData = readVaultData();
      Object.keys(vaultData).forEach(cat => {
        vaultData[cat] = vaultData[cat].filter(f => f.id !== file.id);
      });
      writeVaultData(vaultData);
      return { success: true };
    } catch (error) {
      console.error('File export failed:', error);
      return { success: false, message: 'Failed to export and remove file.' };
    }
  }
  return { success: false, message: 'Export cancelled.' };
});

ipcMain.handle('create-folder', (event, { category, folderName, parentId }) => {
  if (!folderName || folderName.trim() === '') {
    return { success: false, message: 'Folder name cannot be empty.' };
  }
  const vaultData = readVaultData();
  const nameExists = vaultData[category].some(item =>
    item.parentId === parentId && item.name === folderName
  );
  if (nameExists) {
    return { success: false, message: `An item named "${folderName}" already exists here.` };
  }
  const newFolder = {
    id: `folder-${Date.now()}`,
    type: 'folder',
    name: folderName,
    parentId: parentId,
  };
  vaultData[category].push(newFolder);
  writeVaultData(vaultData);
  return { success: true, newFolder };
});

ipcMain.handle('get-file-as-data-url', async (event, filePath) => {
  try {
    const fileData = fs.readFileSync(filePath);
    const fileExtension = path.extname(filePath).substring(1).toLowerCase();
    let mimeType = 'application/octet-stream';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension)) {
      mimeType = `image/${fileExtension}`;
    } else if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    }

    return `data:${mimeType};base64,${fileData.toString('base64')}`;
  } catch (error) {
    console.error("Error reading file for data URL:", error);
    return null;
  }
});
// forgot password handlers
// --- ADD THIS ENTIRE BLOCK TO YOUR MAIN.JS ---

// A. Handler to get the user's chosen security question
ipcMain.handle('get-security-question', () => {
  if (!fs.existsSync(vaultConfigPath)) {
    return { success: false };
  }
  const savedConfig = JSON.parse(fs.readFileSync(vaultConfigPath, 'utf-8'));
  if (!savedConfig.security || !savedConfig.security.question) {
    return { success: false, message: "No security question is set for this vault." };
  }
  return { success: true, question: savedConfig.security.question };
});

// B. Handler to verify the user's answer
ipcMain.handle('verify-answer', (event, userAnswer) => {
  const savedConfig = JSON.parse(fs.readFileSync(vaultConfigPath, 'utf-8'));
  const answerHash = savedConfig.security.answer;

  const isMatch = bcrypt.compareSync(userAnswer, answerHash);
  return { success: isMatch };
});

// C. Handler to reset the password after successful verification
ipcMain.handle('reset-password', (event, newPassword) => {
  try {
    const savedConfig = JSON.parse(fs.readFileSync(vaultConfigPath, 'utf-8'));

    // Update only the password hash
    savedConfig.password = bcrypt.hashSync(newPassword, 10);

    // Save the updated config file
    fs.writeFileSync(vaultConfigPath, JSON.stringify(savedConfig, null, 2));

    return { success: true };
  } catch (error) {
    console.error("Password reset failed:", error);
    return { success: false, message: "Could not reset password." };
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });