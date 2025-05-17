const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openTodoWindow: () => ipcRenderer.invoke('open-todo-window'),
  launchApp: (path) => ipcRenderer.invoke('launch-app', path),
  showAppPicker: () => ipcRenderer.invoke('show-app-picker')
})