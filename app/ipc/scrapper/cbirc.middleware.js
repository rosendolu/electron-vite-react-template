const compose = require('koa-compose');
const logger = require('../../helper/logger');
const db = require('../../service/sqlite');
const dayjs = require('dayjs');
const createChannelName = str => `scrapper/${str}`;
const channel = createChannelName('cbirc');

module.exports = {
  channel,
  type: 'handle',
  handler: compose([getList]),
};
const $db = db.sublevel('cbirc', { keyEncoding: 'utf8', valueEncoding: 'json' });

async function getList(ctx, next) {
  const { event, payload } = ctx;
  let { queryText = '', count = 50, subTarget, target, date } = payload;
  logger.debug('payload', payload);
  //

  for (const target of subTarget) {
    const { label, value } = target;
    const currentDB = $db.sublevel(String(value), { keyEncoding: 'utf8', valueEncoding: 'json' });
    target.data = [];
    target.total = 0;
    try {
      for await (const [, _doc] of currentDB.iterator()) {
        const doc = typeof _doc == 'string' ? JSON.parse(doc) : _doc;

        target.total += 1;
        if (!queryText || new RegExp(queryText, 'i').test(doc.textContent)) {
          const publishTime = dayjs(doc.publishDate);
          if (!date.length || (publishTime.isBefore(date[0]) && publishTime.isAfter(date[1]))) {
            target.data.push(doc);
          }
        }
      }
    } catch (err) {
      logger.error('cbirc list', err);
    }
    // 倒序
    target.data.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }
  ctx.res = subTarget;
}

async function getData(ctx, next) {
  const { event, payload } = ctx;
  logger.debug('payload', payload);
  let { queryText = '', count = 50, subTarget, target } = payload;
  count = parseInt(count);
  const pageSize = 18,
    pageIndex = 1,
    requestCount = Math.min(count, 1000);
  // 貌似链接是会变动的
  // const moreListURL = (itemId, pageIndex) =>
  //   `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=${itemId},pageIndex=${pageIndex},pageSize=18.json`;

  // // 超过3 页的要用这个查
  const moreListURL = (itemId, pageIndex) =>
    `http://www.cbirc.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild?itemId=${itemId}&pageSize=${pageSize}&pageIndex=${pageIndex}`;

  // `http://www.cbirc.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild?itemId=4110&pageSize=18&pageIndex=4`;
  // const moreListURL =
  //   "http://www.cbirc.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild";

  let list = subTarget.map(item => {
    const { value, label } = item;

    return Promise.all(
      new Array(((requestCount / pageSize) >> 0) + 1).fill(0).map((_, i) => {
        // if (1 > 0) {
        //   return `${moreListURL(itemId, i + 1)}`;
        // }
        return fetch(`${moreListURL(value, i + 1)}`)
          .then(res => res.json())
          .then(data => {
            data.data.rows.map(item => {
              item.itemId = value;
              return item;
            });
            return data;
          })
          .catch(err => null);
      })
    );
  });

  // if (2 > 1) {
  //   ctx.res = list;
  //   next();
  //   return;
  // }
  list = await Promise.all(list);
  logger.debug('list', list);
  // 请求到所有的 list 列表
  list = list.map(arr =>
    arr
      .filter(data => data !== null)
      .map(data => data.data.rows)
      .flat()
  );
  const detailURL = docId => `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectByDocId/data_docId=${docId}.json`;
  const pageURL = (docId, itemId) => `http://www.cbirc.gov.cn/cn/view/pages/ItemDetail.html?docId=${docId}&itemId=${itemId}&generaltype=9`;

  list = await Promise.all(
    list.map(arr =>
      Promise.all(
        arr.map(item => {
          const url = detailURL(item.docId);
          return fetch(url)
            .then(res => res.json())
            .then(data => {
              data.data.url = pageURL(item.docId, item.itemId);
              return data;
            })
            .catch(() => null);
        })
      )
    )
  );
  list = list.map(arr =>
    arr
      .filter(data => data !== null)
      .map(data => data.data)
      .flat()
  );

  ctx.res = list.map(arr =>
    arr.filter(item => {
      const $ = cheerio.load(item.docClob);
      // 删除文档中的<style>标签
      $('style').remove();
      // 删除文档中的内联样式
      $('[style]').removeAttr('style');
      const text = $('body').text().toString().replace(/\s+/g, '');
      item.docClob = text;
      if (queryText) {
        item.contents = text.split(new RegExp(`(${queryText})`, 'ig'));
      } else {
        item.contents = [text];
      }
      // if (new RegExp(queryText, 'i').test(text)) {
      //   return true;
      // }
      // return false;
      return true;
    })
  );
  next();
}
