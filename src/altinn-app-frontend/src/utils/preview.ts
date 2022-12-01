import { AxiosRequestConfig, AxiosResponse } from "axios";

let requestId = 0;
const listeners:any = {};

window.addEventListener('message', (msg) => {
  const data = msg.data;
  if (data.type === 'response') {
    listeners[data.id](data.reply);
  }
});

export async function previewRequest(method, url, options?: AxiosRequestConfig, data?: any): Promise<AxiosResponse> {
  const id = requestId++;
  window.top?.postMessage({
    type: 'request',
    id,
    method,
    url,
    options,
    data,
  });

  let innerResolve:any = undefined;
  const ret = new Promise((resolve) => {
    innerResolve = resolve;
  });
  listeners[id] = (reply) => innerResolve(reply);

  return {
    config: {},
    data: ret,
    headers: {},
    request: {},
    status: 200,
    statusText: 'OK',
  };
}
