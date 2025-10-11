const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron'); // session ko yahan import karein
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// --- Paths ---
const userDataPath = app.getPath('userData');
console.log('THE EXACT PATH IS:', userDataPath)
const vaultConfigPath = path.join(userDataPath, 'vault-password.json');
const vaultDataPath = path.join(userDataPath, 'vault-data.json');
const vaultStoragePath = path.join(userDataPath, 'secure_vault_files');
const securityLogsPath = path.join(userDataPath, 'security_logs');
// --- Global variable to hold the password for the session ---
let sessionPassword = null;

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

// --- Initialize folders and files ---
if (!fs.existsSync(vaultStoragePath)) {
  fs.mkdirSync(vaultStoragePath);
}
// this is for security logs like images captured on intrusion
if (!fs.existsSync(securityLogsPath)) {
  fs.mkdirSync(securityLogsPath);
}
// If vault-data.json doesn't exist, create it with the new categories
if (!fs.existsSync(vaultDataPath)) {
  fs.writeFileSync(vaultDataPath, JSON.stringify({ Photos: [], PDFs: [], Audio: [], Video: [], "Other Files": [] }));
}

// --- Helper Functions ---
const readVaultData = () => JSON.parse(fs.readFileSync(vaultDataPath, 'utf-8'));
const writeVaultData = (data) => fs.writeFileSync(vaultDataPath, JSON.stringify(data, null, 2));


// --- Corrected file categorization ---
const getCategoryFromFile = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    // Photo formats
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.webp':
      return 'Photos';
    // PDF documents
    case '.pdf':
      return 'PDFs';
    // Audio formats
    case '.mp3':
    case '.wav':
    case '.aac':
    case '.m4a':
    case '.flac':
      return 'Audio';
    // Video formats
    case '.mp4':
    case '.mov':
    case '.avi':
    case '.mkv':
    case '.webm':
    case '.ogg':
      return 'Video';
    // Default for any other file type
    default:
      return 'Other Files';
  }
};


// --- Encryption and Decryption Functions ---
const getKey = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
};

const encryptFile = (buffer, password) => {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]);
};

const decryptFile = (encryptedBuffer, password) => {
  try {
    const salt = encryptedBuffer.slice(0, SALT_LENGTH);
    const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const key = getKey(password, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return null;
  }
};


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

  // Camera permission ko automatically allow karein
  const ses = win.webContents.session;
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true); // Permission de dein
    } else {
      callback(false); // Baaki sabko reject karein
    }
  });

  win.setMenu(null);
  win.loadURL('http://localhost:5173');
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// --- IPC Handlers ---
// hnadler for the image capture....
ipcMain.on('save-intruder-image', (event, imageDataUrl) => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const imagePath = path.join(securityLogsPath, `intruder-${timestamp}.jpeg`);
    const logPath = path.join(securityLogsPath, 'security_alerts.log');

    const data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(data, 'base64');

    fs.writeFileSync(imagePath, buffer);
    console.log(`Intruder image saved to: ${imagePath}`);

    const logEntry = `[${new Date().toLocaleString()}] - Maximum failed login attempts detected. Image captured: ${path.basename(imagePath)}\n`;
    fs.appendFileSync(logPath, logEntry);

  } catch (error) {
    console.error('Failed to save intruder image:', error);
  }
});
ipcMain.handle('get-security-logs', async () => {
  const logs = [];
  try {
       const files = fs.readdirSync(securityLogsPath);
    const imageFiles = files
      .filter(file => file.endsWith('.jpeg'))
      .sort()
      .reverse();
    for (const file of imageFiles) {
      const filePath = path.join(securityLogsPath, file);
   const fileBuffer = fs.readFileSync(filePath);
      const nonStandardTimestamp = path.basename(file, '.jpeg').replace('intruder-', '');
      const datePart = nonStandardTimestamp.substring(0, 10);
      const timePart = nonStandardTimestamp.substring(11).replace(/-/g, ':');
      const validTimestampISO = `${datePart}T${timePart}`;
      
      logs.push({
        timestamp: validTimestampISO, 
        imageData: fileBuffer.toString('base64'),
           filename: file
      });
    }
  } catch (error) {
    console.error('Could not read security logs:', error);
  }
  return logs;
});
// TO DELETE THE SECUIRT LOG IMAGES 
ipcMain.handle('delete-security-log', async (event, filename) => {
  try {
    if (!filename || filename.includes('..')) {
      throw new Error('Invalid filename.');
    }
    const filePath = path.join(securityLogsPath, filename);
    fs.unlinkSync(filePath);
    console.log(`Deleted security log: ${filename}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete log ${filename}:`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.on('clear-session-password', () => {
  sessionPassword = null;
  console.log("Session password has been cleared (logout).");
});

ipcMain.on('set-session-password', (event, password) => {
  sessionPassword = password;
  console.log("Session password has been set.");
});

ipcMain.on('save-password', (event, data) => {
  // Purani vault files ko clear karein
  try {
    const files = fs.readdirSync(vaultStoragePath);
    for (const file of files) {
      fs.unlinkSync(path.join(vaultStoragePath, file));
    }
  } catch (err) {
    console.error('Could not clear old vault files:', err);
  }

  // Purane security logs ko clear 
  try {
    const logFiles = fs.readdirSync(securityLogsPath);
    for (const file of logFiles) {
      fs.unlinkSync(path.join(securityLogsPath, file));
    }
    console.log('Old security logs cleared successfully.');
  } catch (err) {
    console.error('Could not clear security logs:', err);
  }

  // Vault data file ko reset 
  const emptyData = { Photos: [], PDFs: [], Audio: [], Video: [], "Other Files": [] };
  writeVaultData(emptyData);

  // Naya password aur config save 
  const hashedPassword = bcrypt.hashSync(data.password, 10);
  const answerHash = bcrypt.hashSync(data.securityAnswer, 10);

  const configData = {
    password: hashedPassword,
    security: {
      question: data.securityQuestion,
      answer: answerHash,
    }
  };

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

ipcMain.handle('upload-file', async (event, { parentId, category }) => {
  if (!sessionPassword) {
    return { success: false, message: "Security Error: No session password." };
  }
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  });

  if (canceled || filePaths.length === 0) {
    return { success: false, message: "No files selected." };
  }

  const vaultData = readVaultData();
  let addedCount = 0;
  let skippedCount = 0;

  const specificCategories = ['Photos', 'PDFs', 'Audio', 'Video'];
  const targetCategory = category.trim();

  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const determinedCategory = getCategoryFromFile(fileName);
    
    let isMismatch = false;
    let errorMessage = "Cannot upload here. File type mismatch.";

  
    if (specificCategories.includes(targetCategory) && targetCategory !== determinedCategory) {
        isMismatch = true;
        errorMessage = `Cannot upload a ${determinedCategory.toLowerCase().replace(/s$/, '')} file to the ${targetCategory} folder.`;
    }
    
    else if (targetCategory === 'Other Files' && specificCategories.includes(determinedCategory)) {
        isMismatch = true;
        errorMessage = `File type not allowed in 'Other Files'. Please use the dedicated ${determinedCategory} category for this file.`;
    }

    if (isMismatch) {
        return { success: false, message: errorMessage };
    }

    // Duplicate check
    const destinationPath = path.join(vaultStoragePath, fileName + ".enc");
    if (fs.existsSync(destinationPath)) {
      skippedCount++;
      continue;
    }

    // FILE ENCRYPT & SAVE
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const encryptedBuffer = encryptFile(fileBuffer, sessionPassword);
        fs.writeFileSync(destinationPath, encryptedBuffer);
        fs.unlinkSync(filePath); // Original file delete ho jayegi
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
    
        // Determined category ke hisaab se data mein push karein
        if (!vaultData[determinedCategory]) {
          vaultData[determinedCategory] = [];
        }
        vaultData[determinedCategory].push(fileDetails);
    } catch (error) {
        console.error("File processing failed:", error);
        return { success: false, message: `Failed to process file ${fileName}: ${error.message}` };
    }
  }


  writeVaultData(vaultData);

  let message = "";
  if (addedCount > 0) message += `${addedCount} file(s) added successfully.`;
  if (skippedCount > 0) message += ` ${skippedCount} file(s) were skipped as duplicates.`;

  return { success: addedCount > 0, message: message.trim() };
});
ipcMain.handle('open-file', async (event, filePath) => {
  if (!sessionPassword) return { success: false, message: "Security Error." };
  if (!filePath || !filePath.startsWith(vaultStoragePath)) return { success: false, message: "Invalid file path." };

  const encryptedBuffer = fs.readFileSync(filePath);
  const decryptedBuffer = decryptFile(encryptedBuffer, sessionPassword);

  if (!decryptedBuffer) {
    return { success: false, message: "Decryption failed. Incorrect password?" };
  }

  const tempDir = path.join(app.getPath('temp'), 'FileRakshak');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const originalName = path.basename(filePath, '.enc');
  const tempFilePath = path.join(tempDir, originalName);

  fs.writeFileSync(tempFilePath, decryptedBuffer);

  const error = await shell.openPath(tempFilePath);
  if (error) return { success: false, message: error };
  return { success: true };
});

ipcMain.handle('get-file-as-data-url', async (event, filePath) => {
  if (!sessionPassword) return null;
  try {
    const encryptedBuffer = fs.readFileSync(filePath);
    const decryptedBuffer = decryptFile(encryptedBuffer, sessionPassword);
    if (!decryptedBuffer) return null;

    const fileExtension = path.extname(path.basename(filePath, '.enc')).substring(1).toLowerCase();
    let mimeType = 'application/octet-stream';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExtension)) {
      mimeType = `image/${fileExtension}`;
    } else if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(fileExtension)) {
      mimeType = `audio/${fileExtension === 'mp3' ? 'mpeg' : fileExtension}`;
    } else if (['mp4', 'webm', 'mov', 'ogg'].includes(fileExtension)) {
      mimeType = `video/${fileExtension}`;
    }

    return `data:${mimeType};base64,${decryptedBuffer.toString('base64')}`;
  } catch (error) {
    console.error("Error creating data URL:", error);
    return null;
  }
});

ipcMain.handle('rename-file', async (event, itemToRename, newName) => {
  const vaultData = readVaultData();
  for (const cat in vaultData) {
    const item = vaultData[cat].find(i => i.id === itemToRename.id);
    if (item) {

      if (item.type === 'folder') {
        item.name = newName;
      }

      else if (item.type === 'file') {
        const oldPath = item.path;
        const originalExtension = path.extname(item.name); // e.g., ".pdf"
        let finalNewName = newName;


        if (path.extname(newName) === '' && originalExtension) {
          finalNewName += originalExtension;
        }

        const newPath = path.join(path.dirname(oldPath), finalNewName + ".enc");

        try {
          fs.renameSync(oldPath, newPath);
          item.path = newPath;
          item.name = finalNewName;
        } catch (error) {
          console.error("File rename failed:", error);
          return { success: false, message: 'Failed to rename file on disk.' };
        }
      }

      writeVaultData(vaultData);
      return { success: true };
    }
  }
  return { success: false, message: 'Item not found.' };
});

ipcMain.handle('export-file', async (event, file) => {
  if (!sessionPassword) return { success: false, message: "Security Error." };
  const { filePath } = await dialog.showSaveDialog({ title: 'Export File', defaultPath: file.name });
  if (filePath) {
    try {
      const encryptedBuffer = fs.readFileSync(file.path);
      const decryptedBuffer = decryptFile(encryptedBuffer, sessionPassword);
      if (!decryptedBuffer) return { success: false, message: 'Decryption failed.' };

      fs.writeFileSync(filePath, decryptedBuffer);
      fs.unlinkSync(file.path);

      const vaultData = readVaultData();
      Object.keys(vaultData).forEach(cat => {
        vaultData[cat] = vaultData[cat].filter(f => f.id !== file.id);
      });
      writeVaultData(vaultData);
      return { success: true };
    } catch (error) {
      console.error('File export failed:', error);
      return { success: false, message: 'Failed to export file.' };
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

ipcMain.handle('verify-answer', (event, userAnswer) => {
  const savedConfig = JSON.parse(fs.readFileSync(vaultConfigPath, 'utf-8'));
  const answerHash = savedConfig.security.answer;
  return { success: bcrypt.compareSync(userAnswer, answerHash) };
});


ipcMain.handle('reset-password', (event, newPassword) => {
  try {

    // 1. Clear all encrypted files from the storage directory
    const files = fs.readdirSync(vaultStoragePath);
    for (const file of files) {
      fs.unlinkSync(path.join(vaultStoragePath, file));
    }
    console.log('Old encrypted files have been wiped.');

    // 2. Reset the vault data JSON to be empty
    const emptyData = { Photos: [], PDFs: [], Audio: [], Video: [], "Other Files": [] };
    writeVaultData(emptyData);
    console.log('Vault data has been reset.');


    // 3. Save the new password hash
    const savedConfig = JSON.parse(fs.readFileSync(vaultConfigPath, 'utf-8'));
    savedConfig.password = bcrypt.hashSync(newPassword, 10);
    fs.writeFileSync(vaultConfigPath, JSON.stringify(savedConfig, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error("Password reset and data wipe failed:", error);
    return { success: false, message: "Could not reset password and clear old data." };
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

