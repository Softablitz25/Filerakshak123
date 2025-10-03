const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Save password along with security question/answer
  savePassword: (data) => ipcRenderer.send("save-password", data),

  // Check if vault exists
  vaultExists: () => ipcRenderer.invoke("vault-exists"),

  // Verify password
  checkPassword: (password) =>
    new Promise((resolve) => {
      ipcRenderer.once("password-check-result", (event, isMatch) => {
        resolve(isMatch); // returns true if password matches, else false
      });
      ipcRenderer.send("check-password", password);
    }),
});
