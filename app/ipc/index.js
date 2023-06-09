const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const glob = require('glob');
const path = require('path');
const logger = require('../helper/logger');

try {
  // { cwd: path.resolve('./ipc') }
  const middleware = glob.sync('./**/*.middleware.js', { cwd: path.resolve('./ipc') });
  // logger.debug('middleware', middleware);
  for (const filePath of middleware) {
    const item = require(path.resolve('./ipc', filePath));
    const { channel, type, handler } = item;
    if (type == 'on') {
      ipcMain.on(channel, (event, payloads = {}) => {
        const ctx = { event, payloads };
        logger.debug('channel', payloads);
        const { dialog } = require('electron');
        console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }));

        handler(ctx).catch(err => logger.error(channel, err));
      });
      continue;
    }
    if (type == 'handle') {
      ipcMain.handle(channel, (event, payloads) => {
        const ctx = { event, payloads };
        return handler(ctx)
          .then(res => res)
          .catch(err => {
            logger.error(channel, err);
            return null;
          });
      });
      continue;
    }
  }
} catch (error) {
  logger.error(error);
}
