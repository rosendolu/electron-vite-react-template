const compose = require('koa-compose');
const logger = require('../helper/logger');
const createChannelName = str => `msg/${str}`;
const hello = createChannelName('hello');

async function sayHello(ctx, next) {
  logger.debug('sayHello ctx', ctx);
  // const { dialog } = require('electron');
  // console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }));
  return 'hi';
}

module.exports = {
  channel: hello,
  type: 'on',
  handler: compose([sayHello]),
};
