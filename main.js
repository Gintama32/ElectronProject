const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')

let mainWindow
let todoWindow = null

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true
    }
  })

  mainWindow.loadFile('index.html')

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
}

function createTodoWindow() {
  if (todoWindow) {
    todoWindow.focus()
    return
  }

  todoWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  todoWindow.loadFile('todo.html')
  todoWindow.on('closed', () => { todoWindow = null })
}

app.whenReady().then(() => {
  createMainWindow()

  // IPC Handlers
  ipcMain.handle('open-todo-window', createTodoWindow)
  
  ipcMain.handle('launch-app', async (_, appPath) => {
    try {
      await shell.openPath(appPath)
      return { success: true }
    } catch (error) {
      console.error('Failed to launch app:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('show-app-picker', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Applications', extensions: ['exe', 'app', 'lnk'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      title: 'Select Application to Add'
    })
    return result.canceled ? null : result.filePaths[0]
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})