'use strict';

const { contextBridge, ipcRenderer, dialog } = require('electron');

// WARNNING

/**
 *
 * Preload 脚本 不支持 require() 其他commonjs 模块，需要用bundle 方案实现
 */

// https://www.electronjs.org/zh/docs/latest/tutorial/sandbox

// const glob = require('glob');
// const path = require('path');
// const logger = require('../helper/logger');

// const middleware = glob.sync('./**/*common.middleware.js', { cwd: path.resolve('./ipc') });
// const exposeObj = {};
// for (const filePath of middleware) {
//   const item = require(path.resolve('./ipc', filePath));
//   const { channel, type } = item;
//   const keys = channel.split('/').filter(key => key !== '');
//   let pre = exposeObj;
//   for (const key of keys.slice(0, keys.length - 1)) {
//     if (!pre[key]) {
//       pre[key] = {};
//     }
//     pre = pre[key];
//   }
//   pre[keys[keys.length - 1]] = (...args) => {
//     if (args.length > 1) {
//       logger.error('只接受一个参数，多个参数请用对象包裹');
//     }
//     console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }));
//     ipcRenderer.invoke(channel, args[0]);
//   };
// }

// logger.debug(exposeObj);
// contextBridge.exposeInMainWorld('myAPI', exposeObj);
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  hello: () => ipcRenderer.send('msg/hello'),
  // we can also expose variables, not just functions
});
