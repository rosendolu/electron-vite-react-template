const { contextBridge, ipcRenderer, dialog } = require('electron');
const glob = require('glob');
const path = require('path');
const logger = require('../helper/logger');

// WARNNING
// 仅当 nodejs integration  开启之后才有效
// nodeIntegration: true,

const middleware = glob.sync('./**/*.middleware.js', { cwd: path.resolve('./ipc') });
const exposeObj = {
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  msg: {
    hi() {
      ipcRenderer.send('msg/hi', 'hi from renderer');
    },
  },
};
for (const filePath of middleware) {
  const item = require(path.resolve('./ipc', filePath));
  const { channel, type } = item;
  const keys = channel.split('/').filter(key => key !== '');
  let pre = exposeObj;
  for (const key of keys.slice(0, keys.length - 1)) {
    if (!pre[key]) {
      pre[key] = {};
    }
    pre = pre[key];
  }

  switch (type) {
    // render => main 单向通讯
    case 'on':
      // logger.debug('pre', channel, keys, JSON.stringify(pre), [keys[keys.length - 1]]);
      pre[keys[keys.length - 1]] = function handler(...args) {
        if (args.length > 1) {
          logger.error('只接受一个参数，多个参数请用对象包裹');
        }
        ipcRenderer.send(channel, args[0]);
      };
      break;

    // render => main 双向通讯
    case 'handle':
      // logger.debug('pre', channel, keys, JSON.stringify(pre), [keys[keys.length - 1]]);
      pre[keys[keys.length - 1]] = function handler(...args) {
        if (args.length > 1) {
          logger.error('只接受一个参数，多个参数请用对象包裹');
        }
        return ipcRenderer.invoke(channel, args[0]).then(res => res);
      };
      break;
  }
}
logger.debug(exposeObj);
//
contextBridge.exposeInMainWorld('$bridge', exposeObj);
