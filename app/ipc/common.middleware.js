const compose = require('koa-compose');
const logger = require('../helper/logger');

const createChannelName = str => `msg/${str}`;
const hello = createChannelName('hello');

async function sayHello(ctx, next) {
  logger.debug('sayHello ctx', ctx);
}

module.exports = {
  channel: hello,
  type: 'on',
  handler: compose([sayHello]),
};
