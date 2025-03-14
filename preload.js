const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('Electron', {
    openCheckWindow: () => ipcRenderer.send('open-checkWindow'),
    sendFocusScore: (score) => ipcRenderer.send('focus-score-submitted', score),
});