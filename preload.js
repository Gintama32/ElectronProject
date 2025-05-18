const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openTodoWindow: () => ipcRenderer.invoke('open-todo-window'),
  launchApp: (path) => ipcRenderer.invoke('launch-app', path),
  showAppPicker: () => ipcRenderer.invoke('show-app-picker'),
  closeApp: () => ipcRenderer.invoke('close-app'),
  toggleFocusMode: (enabled) => ipcRenderer.invoke('toggle-focus-mode', enabled),
  // Website blocking functions
  addBlockedSite: (site) => ipcRenderer.invoke('add-blocked-site', site),
  removeBlockedSite: (site) => ipcRenderer.invoke('remove-blocked-site', site),
  getBlockedSites: () => ipcRenderer.invoke('get-blocked-sites'),
  openLeetcode: () => ipcRenderer.invoke('open-leetcode')
})