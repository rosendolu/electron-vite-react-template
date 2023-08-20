import { toast } from 'react-hot-toast';
const baseURL = import.meta.env.__APP__baseURL;

/**
 *
 * @param url
 * @param options
 * @param timeout
 * @returns [boolean,res]
 */
export default async function $fetch(url: RequestInfo, options: RequestInit, timeout = 5e3) {
  composeOptions(options);
  const signal = options.signal || AbortSignal.timeout(timeout);
  // @ts-ignore
  return fetch(`${baseURL}${url}`, { ...options, signal })
    .then(async res => {
      let data = await res.json();
      const responseHeader = res.headers;
      // 兼容处理返回 json string 的
      if (typeof data == 'string' && responseHeader.get('Content-Type') == 'application/json') {
        data = JSON.parse(data);
      }
      // 业务状态码
      const { code, result, message } = data;
      if (code !== 200) {
        const msg = message;
        msg && toast.error(msg);
        return [true, data];
      } else {
        return [false, result];
      }
    })
    .catch((err: Error) => {
      // DOMException: The user aborted a request.
      const reg = new RegExp('aborted', 'g');
      if (typeof err.message == 'string' && reg.test(err.message)) return;
      toast.error('请求超时，请稍后再试！');
      return [true, err];
    }) as Promise<[boolean, any]>;
}

function composeOptions(options: RequestInit) {
  options.headers = new Headers(options.headers || {});
  // 设置默认 content-type  json
  options.headers.has('Content-Type') || options.headers.set('Content-Type', 'application/json');
  const contentType = options.headers.get('Content-Type') ?? '';
  if (/post/gi.test(options?.method || '')) {
    if (contentType == 'application/json') {
      // form-data 格式 content-type 由浏览器自动计算 Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
      if (options.body instanceof FormData) {
        options.headers.delete('Content-Type');
      } else {
        // @ts-ignore
        options.body = JSON.stringify(options.body);
      }
    } else if (contentType == 'application/x-www-form-urlencoded' && typeof options.body == 'object') {
      const keys = Object.keys(options?.body || {});
      // @ts-ignore
      options.body = keys.reduce((acc, key, i) => {
        acc += `${key}=${options?.body?.[key] || ''}${i == keys.length - 1 ? '' : '&'}`;
        return acc;
      }, '');
    }
  }
}
