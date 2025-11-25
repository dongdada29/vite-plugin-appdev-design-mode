/**
 * @fileoverview 主应用组件
 * @description 负责应用的路由配置、布局和设计模式集成
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesignModeStore } from './main';

// 页面组件（懒加载）
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ComponentEditor = React.lazy(() => import('./pages/ComponentEditor'));
const DesignSystem = React.lazy(() => import('./pages/DesignSystem'));
const LivePreview = React.lazy(() => import('./pages/LivePreview'));

// 布局组件
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// 页面过渡动画配置
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

/**
 * 页面容器组件 - 提供统一的页面布局和动画
 */
const PageContainer: React.FC<{
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}> = ({ children, title, description, className = '' }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className={`page-container ${className}`}
    data-page="main-content"
    data-component="page-container"
    data-element="content-wrapper"
  >
    <div 
      className="page-header mb-6" 
      data-element="page-header"
    >
      <h1 
        className="text-3xl font-bold text-neutral-900 dark:text-neutral-100"
        data-element="page-title"
        data-design-mode-component="PageTitle"
      >
        {title}
      </h1>
      {description && (
        <p 
          className="mt-2 text-neutral-600 dark:text-neutral-400"
          data-element="page-description"
        >
          {description}
        </p>
      )}
    </div>
    <div 
      className="page-content"
      data-element="page-content"
    >
      {children}
    </div>
  </motion.div>
);

/**
 * 页面路由配置组件
 */
const AppRoutes: React.FC = () => {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* 默认重定向到仪表盘 */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to="/dashboard" 
                replace 
                data-nav="/dashboard"
                data-component="Navigation"
              />
            } 
          />
          
          {/* 仪表盘页面 */}
          <Route 
            path="/dashboard" 
            element={
              <PageContainer 
                title="Dashboard"
                description="Overview of design mode features and system status"
              >
                <Dashboard />
              </PageContainer>
            } 
          />
          
          {/* 组件编辑器页面 */}
          <Route 
            path="/editor" 
            element={
              <PageContainer 
                title="Component Editor"
                description="Visual editor for building and customizing components"
                className="h-full"
              >
                <ComponentEditor />
              </PageContainer>
            } 
          />
          
          {/* 设计系统页面 */}
          <Route 
            path="/design-system" 
            element={
              <PageContainer 
                title="Design System"
                description="Manage colors, typography, spacing, and component variants"
              >
                <DesignSystem />
              </PageContainer>
            } 
          />
          
          {/* 实时预览页面 */}
          <Route 
            path="/preview" 
            element={
              <PageContainer 
                title="Live Preview"
                description="Real-time preview of components and design changes"
                className="h-full"
              >
                <LivePreview />
              </PageContainer>
            } 
          />
          
          {/* 404 页面 */}
          <Route 
            path="*" 
            element={
              <PageContainer title="404 - Page Not Found">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                    Page Not Found
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    data-action="navigate"
                    data-component="Button"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </PageContainer>
            } 
          />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

/**
 * 设计模式集成组件
 */
const DesignModeIntegration: React.FC = () => {
  const { isDesignModeEnabled, selectedComponent, hoveredComponent } = useDesignModeStore();

  // 为组件添加设计模式属性
  React.useEffect(() => {
    if (!isDesignModeEnabled) return;

    const addDesignModeAttributes = () => {
      const components = document.querySelectorAll('[data-component]');
      components.forEach((element, index) => {
        const componentName = element.getAttribute('data-component');
        const elementName = element.getAttribute('data-element');
        const action = element.getAttribute('data-action');
        
        // 添加设计模式属性
        element.setAttribute('data-design-mode', 'true');
        element.setAttribute('data-design-mode-component', componentName || 'Unknown');
        if (elementName) {
          element.setAttribute('data-design-mode-element', elementName);
        }
        if (action) {
          element.setAttribute('data-design-mode-action', action);
        }
      });
    };

    // 监听 DOM 变化
    const observer = new MutationObserver(addDesignModeAttributes);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // 初始调用
    addDesignModeAttributes();

    return () => {
      observer.disconnect();
    };
  }, [isDesignModeEnabled]);

  // 添加全局样式
  React.useEffect(() => {
    if (isDesignModeEnabled) {
      const style = document.createElement('style');
      style.id = 'design-mode-styles';
      style.textContent = `
        [data-design-mode="true"] {
          cursor: crosshair;
        }
        
        [data-design-mode="true"]:hover {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          background-color: rgba(59, 130, 246, 0.05) !important;
        }
        
        [data-design-mode-active="true"] {
          outline: 3px solid #ef4444 !important;
          outline-offset: 2px !important;
          background-color: rgba(239, 68, 68, 0.1) !important;
        }
        
        [data-design-mode-hover="true"] {
          outline: 2px solid #f59e0b !important;
          outline-offset: 2px !important;
          background-color: rgba(245, 158, 11, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.getElementById('design-mode-styles')?.remove();
      };
    }
  }, [isDesignModeEnabled]);

  return null;
};

/**
 * 主应用组件
 */
const App: React.FC = () => {
  const { isDesignModeEnabled } = useDesignModeStore();

  return (
    <div 
      className={`app ${isDesignModeEnabled ? 'design-mode-enabled' : ''}`}
      data-app="full-featured-showcase"
      data-component="App"
      data-design-mode={isDesignModeEnabled ? 'true' : 'false'}
    >
      {/* 设计模式集成 */}
      <DesignModeIntegration />
      
      {/* 主要内容 */}
      <AnimatePresence mode="wait">
        <AppRoutes />
      </AnimatePresence>
      
      {/* 开发模式信息 */}
      {import.meta.env.DEV && (
        <div 
          className="fixed bottom-4 right-4 bg-neutral-800 text-white p-3 rounded-lg text-xs z-50"
          data-component="DevInfo"
          data-element="debug-panel"
        >
          <div>Design Mode: {isDesignModeEnabled ? 'Enabled' : 'Disabled'}</div>
          <div>React: {React.version}</div>
          <div>Vite: {import.meta.env.MODE}</div>
        </div>
      )}
    </div>
  );
};

export default App;