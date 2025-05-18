const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')

let mainWindow
let todoWindow = null
let leetcodeWindow = null
let isInFocusMode = false

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true
    },
    // Prevent minimize/maximize
    minimizable: false,
    maximizable: false,
    closable: true,
    frame: false,  // Remove window frame
    kiosk: true    // Force fullscreen
  })

  mainWindow.loadFile('index.html')

  // Prevent Alt+Tab and other app switching shortcuts only in focus mode
  mainWindow.setAlwaysOnTop(false)  // Start without always on top
  
  // Prevent closing with Alt+F4
  mainWindow.on('close', (e) => {
    if (isInFocusMode) {
      e.preventDefault()
      mainWindow.webContents.send('show-focus-warning')
    }
  })

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
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

function createLeetcodeWindow() {
  if (leetcodeWindow) {
    leetcodeWindow.focus()
    return
  }

  leetcodeWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'leetcode-preload.js')
    }
  })

  // Load LeetCode
  leetcodeWindow.loadURL('https://leetcode.com/problemset/')

  // Inject custom CSS to hide distracting elements
  leetcodeWindow.webContents.on('did-finish-load', () => {
    leetcodeWindow.webContents.insertCSS(`
      /* Hide distracting elements */
      .navbar-right-container, 
      .social-links,
      .footer,
      .ads-container,
      .discussion-container { 
        display: none !important; 
      }
      /* Focus on the main content */
      .content-wrapper {
        margin: 0 auto;
        max-width: 1200px;
        padding: 20px;
      }
      /* Enhance the coding workspace */
      .monaco-editor {
        font-size: 16px !important;
      }
    `)
  })

  leetcodeWindow.on('closed', () => {
    leetcodeWindow = null
  })
}

app.whenReady().then(() => {
  createMainWindow()

  // IPC Handlers
  ipcMain.handle('open-todo-window', createTodoWindow)
  ipcMain.handle('open-leetcode', createLeetcodeWindow)
  
  ipcMain.handle('launch-app', async (_, appPath) => {
    if (isInFocusMode) {
      return { success: false, error: 'Cannot launch apps during Focus Mode' }
    }
    try {
      await shell.openPath(appPath)
      return { success: true }
    } catch (error) {
      console.error('Failed to launch app:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('show-app-picker', async () => {
    if (isInFocusMode) {
      return null
    }
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

  // Focus Mode handlers
  ipcMain.handle('toggle-focus-mode', (_, enabled) => {
    isInFocusMode = enabled
    if (enabled) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver')
      mainWindow.setSkipTaskbar(true)
      mainWindow.setMinimizable(false)
      mainWindow.setMaximizable(false)
    } else {
      mainWindow.setAlwaysOnTop(false)
      mainWindow.setSkipTaskbar(false)
      mainWindow.setMinimizable(false)  // Keep minimization disabled
      mainWindow.setMaximizable(false)  // Keep maximization disabled
    }
    return isInFocusMode
  })

  // Close app handler
  ipcMain.handle('close-app', () => {
    if (!isInFocusMode) {
      app.quit()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})