const { Level } = require('level');
const { app } = require('electron');
const path = require('path');
const { isProd } = require('../helper/utils');

// logger.info('dbPath', app.getPath('userData'));
// // Create a database
// const dbPath = path.resolve(app.getPath('userData'), 'db/sqlite');
const dbPath = isProd
  ? path.resolve(app.getPath('userData'), 'db/sqlite')
  : path.resolve(__dirname, '../../log/sqlite');
const db = new Level(dbPath, { keyEncoding: 'utf8', valueEncoding: 'json' });

// (async () => {
//   try {
//     if (!isProd) {
//       // for await (const [key, value] of db.iterator()) {
//       //   console.log(key, value);
//       // }
//       await db.put('1', { a: 1, b: 2 });
//       const data = await db.get('1');

//       logger.debug(data, typeof data);
//     }
//   } catch (err) {
//     console.error(err);
//   }
// })();
module.exports = db;
