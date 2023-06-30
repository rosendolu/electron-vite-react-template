// const { contextBridge, ipcRenderer, dialog } = require('electron');
const glob = require('glob');
const path = require('path');
const logger = require('../helper/logger');
const { writeFile, writeFileSync, readFileSync } = require('fs');

// WARNNING

/**
 *
 * Preload 脚本 不支持 require() 其他commonjs 模块，需要用bundle 方案实现
 */

// https://www.electronjs.org/zh/docs/latest/tutorial/sandbox

const list = [];
const middleware = glob.sync('./**/*.middleware.js', { cwd: getPath('../ipc') }).map(url => require(getPath('../ipc/' + url)));
for (const item of middleware) {
  delete item.handler;
  list.push(item);
}

logger.debug(list);
try {
  const preloadJs = readFileSync(getPath('./common.js')).toString();
  const updatedContent = preloadJs.replace(/const ipcList = \[[\s\S]*?\];/g, `const ipcList = ${JSON.stringify(list)};`);
  writeFileSync(getPath('./common.js'), updatedContent);
  // logger.fatal('updatedContent', updatedContent);
} catch (error) {
  logger.error(error);
}

function getPath(url = '') {
  return path.resolve(__dirname, url);
}
