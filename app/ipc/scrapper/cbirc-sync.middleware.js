const compose = require('koa-compose');
const logger = require('../../helper/logger');
const cheerio = require('cheerio');
const { app } = require('electron');
const path = require('path');
const { syncDir, administrativePermit, administrativePunishment } = require('./constant');
const makeDir = require('make-dir');
const sqlite = require('../../service/sqlite');
const { promiseResult } = require('../../helper/utils');
const createChannelName = str => `scrapper/${str}`;
const channel = createChannelName('syncData');

const dbName = 'cbirc';
const $db = sqlite.sublevel(dbName, { keyEncoding: 'utf8', valueEncoding: 'json' });
// 同步文件到指定目录下
const pageSize = 18,
  requestCount = 5e3;

module.exports = {
  channel,
  type: 'handle',
  handler: compose([checkPayload, startSync]),
};

let syncPending = false;
async function checkPayload(ctx, next) {
  const { event, payload } = ctx;
  let { type } = payload;
  switch (type) {
    case 'progress':
      ctx.res = await getProgress();
      break;
    case 'sync':
      // 0默认值， 1 同步中 ｜ 2 暂停 ｜ 3 同步完成
      // const [err, status] = await promiseResult($db.get('syncStatus'));
      // if (err || status !== 3) {
      await $db.put('syncStatus', 1);
      if (!syncPending) {
        syncPending = true;
        next().finally(() => {
          $db.put('syncStatus', 3);
          syncPending = false;
        });
      }
      // }
      ctx.res = await promiseResult($db.get('syncStatus'));

      break;
  }
}
async function getProgress() {
  const res = [];
  for (const scope of [administrativePermit, administrativePunishment]) {
    const { label, value } = scope.target;

    for (const item of scope.subTarget) {
      const [err, state] = await promiseResult($db.get(String(item.value)));
      let data = null,
        total = (requestCount / pageSize) >> 0;
      if (err || !state) {
        data = {
          progress: 0,
          total,
        };
      } else {
        state.total = total;
        data = state;
      }
      // if (state.progress == total) {
      // }
      state.label = `${label}-${item.label}`;
      res.push(data);
    }
  }
  return res;
}

async function startSync(ctx, next) {
  // 貌似链接是会变动的
  // const moreListURL = (itemId, pageIndex) =>
  //   `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=${itemId},pageIndex=${pageIndex},pageSize=18.json`;
  // // 超过3 页的要用这个查
  const moreListURL = (itemId, pageIndex, pageSize = 18) =>
    `http://www.cbirc.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild?itemId=${itemId}&pageSize=${pageSize}&pageIndex=${pageIndex}`;

  const subTargetList = administrativePermit.subTarget.concat(administrativePunishment.subTarget);

  // 遍历所有subTarget
  for (const scope of subTargetList) {
    const totalPageCount = (requestCount / pageSize) >> 0;

    const [err, state] = await promiseResult($db.get(String(scope.value)));
    if (state?.progress === totalPageCount) {
      continue;
    }
    // 遍历所有页面
    for (let index = 1; index <= totalPageCount; index++) {
      const page = {
        url: moreListURL(scope.value, index),
        itemId: scope.value,
        label: scope.label,
        pageIndex: index,
      };
      const stopSync = await syncPages(page, totalPageCount);
      // @ts-ignore
      $db.put(String(page.itemId), {
        progress: page.pageIndex,
        total: totalPageCount,
      });
      // 同步完了，同步下一个
      if (stopSync) {
        break;
      }
    }
    // @ts-ignore
    await $db.put(String(scope.itemId), {
      progress: totalPageCount,
      total: totalPageCount,
    });
  }
}

async function syncPages(page, totalPageCount) {
  const pageURL = (docId, itemId) => `http://www.cbirc.gov.cn/cn/view/pages/ItemDetail.html?docId=${docId}&itemId=${itemId}&generaltype=9`;
  const detailURL = docId => `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectByDocId/data_docId=${docId}.json`;
  const db = $db.sublevel(String(page.itemId), { keyEncoding: 'utf8', valueEncoding: 'json' });

  return await new Promise(resolve => {
    setTimeout(async () => {
      try {
        logger.info(page);
        const list = await fetch(page.url)
          .then(res => res.json())
          .then(data => {
            return data.data.rows.map(item => {
              item.itemId = page.itemId;
              item.label = page.label;
              return item;
            });
          });
        for (const doc of list) {
          // 如果这个分页中查询到已经存了的数据，说明缓存完成了，不需要再存了
          // 如果缓存中已经存储了这个docId 则说明后面的id 都已经同步好了，
          const [err, data] = await promiseResult(db.get(doc.docId));
          // 没有缓存改数据
          if (err || !data) {
            // await new Promise(resolve2 => {
            //   setTimeout(async () => {
            const url = detailURL(doc.docId);
            try {
              const detail = await fetch(url)
                .then(res => res.json())
                .then(data => {
                  data.data.url = pageURL(doc.docId, doc.itemId);
                  return data.data;
                });
              const $ = cheerio.load(detail.docClob);
              // 删除文档中的<style>标签
              $('style').remove();
              // 删除文档中的内联样式
              $('[style]').removeAttr('style');
              const text = $('body').text().toString().replace(/\s+/g, '');
              detail.textContent = text;
              await db.put(doc.docId, detail);
            } catch (error) {
              logger.error('获取详情失败', error);
            } finally {
              // resolve2();
            }
            //   }, Math.random() * (6e3 - 2e3) + 2e3);
            // });
          } else {
            // 如果已经备份完成过一次了 当前这个 itemID 就不需要再存了
            const [err, status] = await promiseResult($db.get('syncStatus'));
            if (status === 3) {
              resolve(true);
              return;
            }
          }
        }
      } catch (error) {
        logger.error('同步数据失败', error);
      } finally {
        resolve(false);
      }
    }, Math.random() * (5e3 - 1e3) + 1e3);
  });
}

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
  next();
}

async function beforeStartSync(payload) {
  // logger.debug('payload', payload);
  // let { type } = payload;
  try {
    const cacheDir = await Promise.all([
      makeDir(path.resolve(syncDir, administrativePermit.target.label)),
      makeDir(path.resolve(syncDir, administrativePunishment.target.label)),
    ]);
    return [false, cacheDir];
  } catch (error) {
    return [true, error];
  }
}
