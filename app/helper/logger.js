const path = require('path');
const log4js = require('log4js');
const dayjs = require('dayjs');
const { isProd } = require('./utils');
// const { app, BrowserWindow } = require('electron');

const timeStamp = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
log4js.configure({
  appenders: {
    default: {
      type: 'dateFile',
      pattern: 'hh',
      filename: isProd ? path.resolve(process.env.HOME, '.zb-tool/logs/log') : path.resolve(__dirname, '../logs/log'),
      maxLogSize: 5242880, // 5M
      numBackups: 7,
      // compress: true,
      keepFileExt: true,
      layout: {
        type: 'pattern',
        pattern: '[%x{time}] [%p] %m',
        tokens: {
          time: function (logEvent) {
            // eslint-disable-next-line no-unused-vars
            const { startTime, categoryName, data } = logEvent;
            return timeStamp();
          },
        },
      },
    },
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%x{time}] [%p] %m',
        tokens: {
          time: function (logEvent) {
            // eslint-disable-next-line no-unused-vars
            const { startTime, categoryName, data } = logEvent;
            return timeStamp();
          },
        },
      },
    },
  },
  categories: {
    default: { appenders: ['console', 'default'], level: 'all' },
  },
});
process.on('exit', () => {
  log4js.shutdown();
});
process.on('uncaughtException', () => {
  log4js.shutdown();
});

const logger = log4js.getLogger('default');
module.exports = logger;

function getPath(url = '') {
  return path.resolve(__dirname, url);
}
