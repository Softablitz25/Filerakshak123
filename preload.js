const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Session management functions
  setSessionPassword: (password) => ipcRenderer.send("set-session-password", password),
  clearSessionPassword: () => ipcRenderer.send("clear-session-password"),
  // Password wale functions
  savePassword: (data) => ipcRenderer.send("save-password", data),
  vaultExists: () => ipcRenderer.invoke("vault-exists"),
  checkPassword: (password) => ipcRenderer.invoke("check-password", password),
  
  // Files wale saare functions
  getVaultData: () => ipcRenderer.invoke('get-vault-data'),
  uploadFile: (uploadData) => ipcRenderer.invoke('upload-file', uploadData),
  createFolder: (folderData) => ipcRenderer.invoke('create-folder', folderData),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  exportFile: (file) => ipcRenderer.invoke('export-file', file),
  renameFile: (file, newName) => ipcRenderer.invoke('rename-file', file, newName),
  
  // File preview ke liye function
  getFileAsDataUrl: (filePath) => ipcRenderer.invoke('get-file-as-data-url', filePath),

   // --- PASSWORD RECOVERY FUNCTIONS ---
  getSecurityQuestion: () => ipcRenderer.invoke('get-security-question'),
  verifyAnswer: (answer) => ipcRenderer.invoke('verify-answer', answer),
  resetPassword: (newPassword) => ipcRenderer.invoke('reset-password', newPassword),


  setSessionPassword: (password) => ipcRenderer.send("set-session-password", password),
   saveIntruderImage: (imageDataUrl) => ipcRenderer.send('save-intruder-image', imageDataUrl),

});