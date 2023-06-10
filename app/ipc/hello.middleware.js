const compose = require('koa-compose');
const logger = require('../helper/logger');
const { electron } = require('process');
const { dialog } = require('electron');

const createChannelName = str => `msg/${str}`;
const hi = createChannelName('hi');

async function sayHello(ctx, next) {
  // logger.debug('sayHello', ctx);
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled) {
    logger.debug(filePaths[0]);
    return filePaths[0];
  }
  // ctx.res = 'hi from ipc';
}

module.exports = {
  channel: hi,
  type: 'on',
  handler: compose([sayHello]),
};
