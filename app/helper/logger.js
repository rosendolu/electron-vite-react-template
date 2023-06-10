const path = require('path');
const log4js = require('log4js');
const dayjs = require('dayjs');
const NODE_ENV = process.env.NODE_ENV;

const timeStamp = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
log4js.configure({
  appenders: {
    // FIXME： 打包后该日志会导致应用程序崩溃
    // default: {
    //   type: 'dateFile',
    //   pattern: 'hh',
    //   filename: NODE_ENV == 'production' ? path.resolve(process.env.HOME, 'zhoubinToolkit/logs/log') : path.resolve('./logs/log'),
    //   maxLogSize: 5242880, // 5M
    //   numBackups: 7,
    //   // compress: true,
    //   keepFileExt: true,
    //   layout: {
    //     type: 'pattern',
    //     pattern: '[%x{time}] [%p] %m',
    //     tokens: {
    //       time: function (logEvent) {
    //         // eslint-disable-next-line no-unused-vars
    //         const { startTime, categoryName, data } = logEvent;
    //         return timeStamp();
    //       },
    //     },
    //   },
    // },
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
    default: { appenders: ['console'], level: 'all' },
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
