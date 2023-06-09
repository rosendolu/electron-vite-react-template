const path = require('path');
const { app, BrowserWindow } = require('electron');
const logger = require('../helper/logger');
const NODE_ENV = process.env.NODE_ENV;
function createWindow() {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload/common.js'),
    },
  });
  // logger.debug('path.join', path.join(__dirname, '../preload/common.js'));
  if (NODE_ENV == 'development') {
    mainWindow.loadURL('http://localhost:5173/');
  } else {
    // 加载 index.html
    mainWindow.loadFile('../web/dist/index.html');
  }

  // 打开开发工具
  // mainWindow.webContents.openDevTools()
}

module.exports = { createWindow };
