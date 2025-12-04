import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}
interface ApiError {
  success: boolean;
  message: string;
}
class ApiClient {
  private instance: AxiosInstance;
  constructor(baseURL: string = '') {
    this.instance = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error: AxiosError<ApiError>) => {
        return Promise.reject(error);
      }
    );
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { success, data, message } = response.data;
        // success仅代表接口调用是否成功，业务状态请关注data中的实际数据定义
        if (!success) {
          const error: ApiError = { success, message };
          return Promise.reject(error);
        }
        return data;
      },
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          // 服务器返回错误状态码
          const { status, data } = error.response;
          console.error('API Error:', status, data?.message || error.message);
        } else if (error.request) {
          // 请求已经发出，但没有收到响应
          console.error('Network Error:', error.message);
        } else {
          // 在设置请求时发生错误
          console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.post(url, data, config);
  }
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.put(url, data, config);
  }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.patch(url, data, config);
  }
}
// 创建默认实例
export const apiClient = new ApiClient();
// 类型定义
export type { ApiResponse, ApiError };
// 便捷方法
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),
};
export default ApiClient;