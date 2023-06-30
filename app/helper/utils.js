const fs = require('fs');
const readline = require('readline');

exports.readline = function (filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  rl.on('line', line => {
    const jsonData = JSON.parse(line);
    // 在这里对每一行的 JSON 数据进行处理
    console.log(jsonData);
  });

  rl.on('close', () => {
    console.log('JSON 文件读取完成');
  });
};

exports.isProd = true;
// exports.isProd = process.env.NODE_ENV === 'production';
exports.promiseResult = fn => fn.then(res => [false, res]).catch(err => [true, err]);
