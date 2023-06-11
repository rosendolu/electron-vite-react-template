const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const glob = require('glob');
const path = require('path');
const logger = require('../helper/logger');

try {
  const middleware = glob.sync('./**/*.middleware.js', { cwd: getPath() }).map(url => require(getPath(url)));
  for (const item of middleware) {
    const { channel, type, handler } = item;
    // logger.debug('ipc middleware', item);
    if (type == 'on') {
      ipcMain.on(channel, (event, payload = {}) => {
        const ctx = { event, payload, res: null };
        // logger.debug('channel', payload);
        handler(ctx)
          .then(() => {
            logger.debug('on', channel, payload, ctx.res);
            return ctx.res || null;
          })
          .catch(err => logger.error(channel, err));
      });
      continue;
    }
    if (type == 'handle') {
      ipcMain.handle(channel, (event, payload) => {
        const ctx = { event, payload, res: null };
        return handler(ctx)
          .then(() => {
            logger.debug('handle', channel, payload, ctx.res);
            return ctx.res;
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

function getPath(url = '') {
  return path.resolve(__dirname, url);
}
