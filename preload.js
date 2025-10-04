// preload.js (FINAL CODE)

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
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
  deleteFile: (file) => ipcRenderer.invoke('delete-file', file),
  renameFile: (file, newName) => ipcRenderer.invoke('rename-file', file, newName)
});