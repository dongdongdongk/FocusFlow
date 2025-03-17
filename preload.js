const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('Electron', {
    openCheckWindow: () => ipcRenderer.send('open-checkWindow'),
    sendFocusScore: (score) => ipcRenderer.send('focus-score-submitted', score),

    startTimer: () => ipcRenderer.invoke('start-timer'),
    stopTimer: () => ipcRenderer.invoke('stop-timer'),
    resetTimer: () => ipcRenderer.invoke('reset-timer'),
    setTime: (time) => ipcRenderer.invoke('set-time', time),
    addSession: (session) => ipcRenderer.invoke('add-session', session),
    deleteSession: (index) => ipcRenderer.invoke('delete-session', index),
    startSession: (index) => ipcRenderer.invoke('start-session', index),
    onUpdateTimer: (callback) => ipcRenderer.on('update-timer', (event, time) => callback(time)),
    onUpdateSessions: (callback) => ipcRenderer.on('update-sessions', (event, sessions) => callback(sessions)),
    onUpdateTitle: (callback) => ipcRenderer.on('update-title', (event, title) => callback(title)),
    onAllSessionsCompleted: (callback) => ipcRenderer.on('all-sessions-completed', callback),
});