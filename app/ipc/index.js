const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const glob = require('glob');
const path = require('path');
const logger = require('../helper/logger');

try {
  // { cwd: path.resolve('./ipc') }
  const middleware = glob.sync('./**/*.middleware.js', { cwd: path.resolve('./ipc') });
  for (const filePath of middleware) {
    const item = require(path.resolve('./ipc', filePath));
    const { channel, type, handler } = item;
    logger.debug('ipc middleware', item);
    if (type == 'on') {
      ipcMain.on(channel, (event, payloads = {}) => {
        const ctx = { event, payloads };
        logger.debug('channel', payloads);
        handler(ctx).catch(err => logger.error(channel, err));
      });
      continue;
    }
    if (type == 'handle') {
      ipcMain.handle(channel, (event, payloads) => {
        const ctx = { event, payloads };
        logger.debug('channel', payloads);
        return handler(ctx)
          .then(res => {
            logger.debug('res', res);
            return res;
          })
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
