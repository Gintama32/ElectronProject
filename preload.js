const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openTodoWindow: () => ipcRenderer.invoke('open-todo-window')
});