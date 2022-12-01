import { AxiosRequestConfig } from "axios";

let requestId = 0;
const listeners:any = {};

window.addEventListener('message', (msg) => {
  console.log('Got reply back from index.html', msg);

  // TODO: Trigger listener
});

export async function previewRequest(method, url, options?: AxiosRequestConfig, data?: any): Promise<any> {
  const id = requestId++;
  window.top?.postMessage({
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

  return ret;
}
