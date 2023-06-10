const compose = require('koa-compose');
const logger = require('../helper/logger');
const { dialog } = require('electron');

const createChannelName = str => `msg/${str}`;
const hello = createChannelName('hello');

async function sayHello(ctx, next) {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled) {
    logger.debug(filePaths[0]);
    ctx.res = filePaths[0];
    return filePaths[0];
  }
}

module.exports = {
  channel: hello,
  type: 'handle',
  handler: compose([sayHello]),
};
