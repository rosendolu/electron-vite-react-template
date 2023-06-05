import { toast } from 'react-hot-toast';
const baseURL = import.meta.env.__APP__baseURL;

export default async function $fetch(url: RequestInfo, options: RequestInit, timeout = 1e4) {
  let response: [boolean, any] = [true, null];
  try {
    options.headers = new Headers(options.headers || {});
    options.headers.has('Content-Type') || options.headers.set('Content-Type', 'application/json');
    const contentType = options.headers.get('Content-Type');

    if (options.method == 'post' && contentType == 'application/json') {
      options.body = JSON.stringify(options.body);
    }

    const controller = new AbortController();
    const signal = controller.signal;

    response = (await Promise.race([
      fetch(`${baseURL}${url}`, { ...options, signal })
        .then(async res => {
          let data = await res.json();
          const responseHeader = res.headers;
          // 兼容处理返回 json string 的
          if (typeof data == 'string' && responseHeader.get('Content-Type') == 'application/json') {
            data = JSON.parse(data);
          }
          // 业务状态码
          const { success, code, result, message } = data;
          if (code !== 200 || success === 'false' || !success) {
            const msg = message;
            msg && toast.error(msg);
            return [true, data];
          } else {
            return [false, result];
          }
        })
        .catch(err => [true, err]),
      new Promise(resolve =>
        setTimeout(() => {
          // abort request
          controller.abort();
          return resolve([true, { message: '请求超时！' }]);
        }, timeout)
      ),
    ])) as [boolean, any];
  } catch (error) {
    console.error('Error:', error);
    response = [true, error];
  } finally {
    //
  }

  return response;
}

export async function $query(url: RequestInfo, options: RequestInit) {
  return new Promise((resolve, reject) => {
    return $fetch(url, options)
      .then(([err, data]) => {
        if (err) {
          reject(data);
        } else {
          resolve(data);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}
