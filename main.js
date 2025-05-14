const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let todoWindow = null;

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
  });

  mainWindow.loadFile('index.html');
}

function createTodoWindow() {
  if (todoWindow) {
    todoWindow.focus();
    return;
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
  });

  todoWindow.loadFile('todo.html');
  todoWindow.on('closed', () => { todoWindow = null; });
}

app.whenReady().then(() => {
  createMainWindow();
  ipcMain.handle('open-todo-window', createTodoWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});