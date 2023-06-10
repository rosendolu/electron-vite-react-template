const path = require('path');
const { app, BrowserWindow, session } = require('electron');
const logger = require('../helper/logger');
const NODE_ENV = process.env.NODE_ENV;
async function createWindow() {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload/common.js'),
    },
  });

  // logger.debug('path.join', path.join(__dirname, '../preload/common.js'));
  if (NODE_ENV == 'development') {
    mainWindow.loadURL('http://localhost:5173/');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // 加载 index.html
    mainWindow.loadFile('../web/dist/index.html');
  }

  // 打开开发工具
  // mainWindow.webContents.openDevTools()
}

module.exports = { createWindow };
