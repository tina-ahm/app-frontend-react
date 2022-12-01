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

  const response = await new Promise((resolve) => {
    listeners[id] = (reply) => resolve(reply);
  });

  return {
    config: {},
    data: response,
    headers: {},
    request: {},
    status: 200,
    statusText: 'OK',
  };
}
