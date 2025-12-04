// React Hook 封装示例
import { useState, useEffect } from 'react';
import { fetchEventSource, EventSourceMessage } from '@microsoft/fetch-event-source';

/**
 * 通用 API 请求 Hook
 * 主要用于处理 GET 请求等需要获取数据的场景，自动处理 loading 和 error 状态。
 * 
 * 特性：
 * 1. 自动处理 loading 状态
 * 2. 统一错误处理：将各种错误（包括 ApiError）标准化为 Error 对象
 * 3. 支持依赖刷新
 * 
 * @param apiCall - 返回 Promise 的 API 调用函数
 * @param deps - 依赖数组，类似 useEffect 的 deps。默认 []，即组件挂载时调用一次。
 * 
 * @example
 * const { data, loading, error } = useApi(() => userApi.getUserInfo());
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      // 统一错误处理：如果是 ApiError (plain object) 则转换为 Error 对象
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Unknown error');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 流式响应数据结构
 */
export interface StreamResponse<T = any> {
  /** 接口调用状态，success为true仅代表接口调用成功，业务执行逻辑请关注data中的数据定义 */
  success: boolean;
  /** 业务数据 */
  data: T;
  /** 接口调用失败时的错误信息，比如服务器内部错误 */
  message: string;
  /** 是否执行完成，没有特殊要求时只需要关注complete=true时的结果 */
  complete: boolean;
}



/**
 * 流式接口调用示例
 * @param url 请求地址
 * @param data 请求数据
 * @param onData 接收到数据时的回调
 * @param onError 发生错误时的回调
 */
export async function streamRequest<T>(
  url: string,
  data: any,
  onData: (response: StreamResponse<T>) => void,
  onError?: (error: Error) => void
) {
  try {
    await fetchEventSource(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      onmessage(msg: EventSourceMessage) {
        if (msg.event === 'FatalError') {
          throw new Error(msg.data);
        }
        try {
          const parsed: StreamResponse<T> = JSON.parse(msg.data);
          onData(parsed);
          // If the stream is complete, we might want to stop listening.
          // fetchEventSource will automatically close the connection if the server sends an 'end' event or closes the connection.
          // If `parsed.complete` should explicitly stop the client-side processing,
          // you might need to throw an error here to terminate the fetchEventSource,
          // or rely on the server to close the connection.
          // For now, we'll follow the provided example which doesn't explicitly stop on `parsed.complete` in onmessage.
        } catch (e) {
          console.warn('Failed to parse stream chunk:', msg.data);
        }
      },
      onerror(err: any) {
        if (onError) {
          onError(err as Error);
        } else {
          console.error('Stream request failed:', err);
        }
        // 抛出错误以停止重试
        throw err;
      }
    });
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
  }
}

/*
// 示例 数据列表API
import { api } from './api';
export const exampleApi = {
  // 获取列表数据
  getList: (params: ListParams) => api.get<ListResult<any>>('/example/list', { params }),

  // 创建项目
  create: (data: any) => api.post<any>('/example/create', data),

  // 更新项目
  update: (id: number, data: any) => api.put<any>(`/example/update/${id}`, data),

  // 删除项目
  delete: (id: number) => api.delete<any>(`/example/delete/${id}`),

  // 获取详情
  getDetail: (id: number) => api.get<any>(`/example/detail/${id}`),
};

// 接口返回数据类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface ListParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

export interface ListResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户相关API
export const userApi = {
  // 登录
  login: (params: LoginParams) => api.post<LoginResult>('/auth/login', params),

  // 获取用户信息
  getUserInfo: () => api.get<User>('/user/info'),

  // 更新用户信息
  updateUserInfo: (data: Partial<User>) => api.put<User>('/user/info', data),
};
// 示例 使用方式：
// 1. 获取列表
// const { data: listData, loading, error, refetch } = useApi(() => exampleApi.getList({ page: 1, pageSize: 10 }));

// 2. 用户登录
// const { run: login, loading: loginLoading } = useRequest(userApi.login, { manual: true });
// 注意：useApi 主要用于获取数据（GET），如果是提交数据（POST/PUT/DELETE），通常建议使用 ahooks 的 useRequest 
// 或者直接在事件处理函数中调用：
// const handleLogin = async () => {
//   try {
//     const res = await userApi.login({ username: '...', password: '...' });
//     console.log(res.token);
//   } catch (err) {
//     console.error(err);
//   }
// };
*/