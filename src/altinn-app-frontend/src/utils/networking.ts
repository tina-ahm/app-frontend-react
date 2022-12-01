import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { previewRequest } from "src/utils/preview";

export enum HttpStatusCodes {
  Ok = 200,
  BadRequest = 400,
  Forbidden = 403,
}

export const isPreview = (window as any)?.isPreview;

export async function get(url: string, options?: AxiosRequestConfig): Promise<any> {
  const _options:AxiosRequestConfig = {
    ...options,
    headers: { Pragma: 'no-cache', ...options?.headers },
  };
  const response: AxiosResponse = isPreview ? await previewRequest('get', url, _options) : await axios.get(url, _options);
  return response.data ? response.data : null;
}

export async function post(url: string, options?: AxiosRequestConfig, data?: any): Promise<AxiosResponse> {
  return isPreview ? await previewRequest('post', url, options, data) : await axios.post(url, data, options);
}

export async function put(
  url: string,
  apiMode: string,
  data: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse> {
  const _url = `${url}/${apiMode}`;
  const response: AxiosResponse = isPreview
    ? await previewRequest('put', _url, config, data)
    : await axios.put(_url, data, config);
  return response.data ? response.data : null;
}

export async function httpDelete(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse> {
  return await axios.delete(url, options);
}

export async function putWithoutConfig<ReturnType>(url: string): Promise<AxiosResponse<ReturnType>> {
  try {
    const response = await axios.put(url);
    return response.data ? response.data : null;
  } catch (err) {
    throw new Error(`HTTP Call failed: ${err.message}`);
  }
}

export function checkIfAxiosError(error: Error | null | undefined): boolean {
  return (error as AxiosError)?.config !== undefined;
}
