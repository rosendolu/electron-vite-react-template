const { app, BrowserWindow } = require('electron');
const { createWindow } = require('./window/index');
// const appIcon = new Tray(path.resolve('./assets/icon/'));
(async () => {
  await app.whenReady();
  createWindow();
  app.on('activate', () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
  // 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
  // 直到用户使用 Cmd + Q 明确退出
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  // ipc 通讯
  require('./ipc/index');
})();
