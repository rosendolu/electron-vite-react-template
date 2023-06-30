const path = require('path');
const { app, BrowserWindow, session } = require('electron');
const logger = require('../helper/logger');
const { isProd } = require('../helper/utils');
async function createWindow() {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 800,
    webPreferences: {
      devTools: true,
      sandbox: true,
      // webSecurity: true,
      // allowRunningInsecureContent: false,
      // nodeIntegration: true,
      preload: path.join(__dirname, '../preload/common.js'),
    },
  });

  // logger.debug('path.join', path.join(__dirname, '../preload/common.js'));
  if (isProd) {
    // 加载 index.html
    // mainWindow.loadURL('http://localhost:3000');
    mainWindow.loadFile(path.join(app.getAppPath(), './web/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173/');
    // Open the DevTools.
    setTimeout(() => {
      mainWindow.webContents.openDevTools();
    }, 1e3);
  }

  // 打开开发工具
  // mainWindow.webContents.openDevTools();
}

module.exports = { createWindow };
