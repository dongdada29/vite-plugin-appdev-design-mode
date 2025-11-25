/**
 * @fileoverview 应用程序入口文件
 * @description 负责初始化 React 应用、路由、状态管理和设计模式桥接
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { AnimatePresence } from 'framer-motion';

// 导入应用样式
import './index.css';

// 导入主要组件
import App from './App';

// 创建设计模式状态存储
const useDesignModeStore = create<{
  isDesignModeEnabled: boolean;
  selectedComponent: any;
  hoveredComponent: any;
  componentTree: any[];
  toggleDesignMode: () => void;
  setSelectedComponent: (component: any) => void;
  setHoveredComponent: (component: any) => void;
  setComponentTree: (tree: any[]) => void;
  clearSelection: () => void;
}>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // 设计模式状态
      isDesignModeEnabled: true,
      selectedComponent: null,
      hoveredComponent: null,
      componentTree: [],
      
      // 操作方法
      toggleDesignMode: () => set((state) => ({ 
        isDesignModeEnabled: !state.isDesignModeEnabled 
      })),
      
      setSelectedComponent: (component) => set({ selectedComponent: component }),
      setHoveredComponent: (component) => set({ hoveredComponent: component }),
      setComponentTree: (tree) => set({ componentTree: tree }),
      
      // 清除选择
      clearSelection: () => set({ 
        selectedComponent: null, 
        hoveredComponent: null 
      }),
    })),
    {
      name: 'design-mode-store',
    }
  )
);

// 创建 React Query 客户端配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟
      gcTime: 1000 * 60 * 30, // 30分钟
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// 错误处理组件
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error caught:', error);
      setHasError(true);
      setError(error.error || new Error(error.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-error-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-error-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Application Error</h2>
          </div>
          
          <p className="text-neutral-600 mb-4">
            Something went wrong while loading the application. Please try refreshing the page.
          </p>
          
          {error && (
            <details className="mb-4 p-3 bg-neutral-50 rounded border">
              <summary className="cursor-pointer text-sm font-medium text-neutral-700 mb-2">
                Error Details
              </summary>
              <pre className="text-xs text-neutral-600 overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                setHasError(false);
                setError(null);
              }}
              className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// 主应用组件
const RootApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <App />
          </AnimatePresence>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// 渲染应用
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(<RootApp />);

// 开发环境下的热模块替换
if (import.meta.hot) {
  import.meta.hot.accept();
}

// 设计模式桥接（如果存在）
declare global {
  interface Window {
    __APPDEV_DESIGN_MODE__?: {
      store: typeof useDesignModeStore;
      toggleDesignMode: () => void;
      selectComponent: (component: any) => void;
      highlightComponent: (component: any) => void;
    };
  }
}

// 初始化设计模式桥接
if (typeof window !== 'undefined') {
  window.__APPDEV_DESIGN_MODE__ = {
    store: useDesignModeStore,
    toggleDesignMode: () => useDesignModeStore.getState().toggleDesignMode(),
    selectComponent: (component) => useDesignModeStore.getState().setSelectedComponent(component),
    highlightComponent: (component) => useDesignModeStore.getState().setHoveredComponent(component),
  };
}

export { useDesignModeStore };
export default RootApp;