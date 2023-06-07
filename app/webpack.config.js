const { glob } = require('glob');
const path = require('path');
const logger = require('./helper/logger');
const preloads = glob.sync('./preload/*.js', { cwd: path.resolve('./') }).map(url => path.resolve(url));

logger.debug(preloads);
module.exports = {
  mode: 'development',
  entry: './preload/common.js',
  output: {
    assetModuleFilename: '[name].bungle.js',
    chunkFormat: 'commonjs',
    path: path.resolve(__dirname, './preload/build'),
  },
};
