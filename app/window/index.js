const path = require('path');
const { app, BrowserWindow } = require('electron');
const NODE_ENV = process.env.NODE_ENV;
function createWindow() {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'app/preload/index.js'),
    },
  });

  if (NODE_ENV == 'development') {
    mainWindow.loadURL('http://192.168.20.222:5173/');
  } else {
    // 加载 index.html
    mainWindow.loadFile('../web/dist/index.html');
  }

  // 打开开发工具
  // mainWindow.webContents.openDevTools()
}

module.exports = { createWindow };
