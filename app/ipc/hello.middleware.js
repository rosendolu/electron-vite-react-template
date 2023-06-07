const compose = require('koa-compose');
const logger = require('../helper/logger');

const createChannelName = str => `msg/${str}`;
const hi = createChannelName('hi');

async function sayHello(ctx, next) {
  logger.debug('sayHello', ctx);
}

module.exports = {
  channel: hi,
  type: 'on',
  handler: compose([sayHello]),
};
