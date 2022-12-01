import { AxiosRequestConfig } from "axios";

window.addEventListener('message', (msg) => {
  // TODO: Get responses
});

export async function previewRequest(method, url, options?: AxiosRequestConfig, data?:any):any {
  window.top?.postMessage({
    method,
    url,
    options,
    data,
  });
}
