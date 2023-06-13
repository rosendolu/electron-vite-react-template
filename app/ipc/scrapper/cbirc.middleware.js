const compose = require('koa-compose');
const logger = require('../../helper/logger');
const cheerio = require('cheerio');

const createChannelName = str => `scrapper/${str}`;
const channel = createChannelName('cbirc');

module.exports = {
  channel,
  type: 'handle',
  handler: compose([getData, formatRes]),
};

function formatRes(ctx, next) {
  const { event, payload } = ctx;
  let { queryText = '', count = 50, subTarget } = payload;
  const res = ctx.res;
  ctx.res = res.map((arr, i) => {
    const { key, itemID, label } = subTarget[i];
    return {
      label,
      data: arr,
    };
  });
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
      if (new RegExp(queryText, 'i').test(text)) {
        return true;
      }
      return false;
    })
  );
  next();
}
