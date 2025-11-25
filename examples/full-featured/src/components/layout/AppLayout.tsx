/**
 * @fileoverview 应用布局组件
 * @description 提供侧边栏导航、顶部栏和主内容区域的布局结构
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesignModeStore } from '../../main';

// 导航项目类型定义
interface NavItem {
  path: string;
  label: string;
  icon: string;
  description: string;
  badge?: string | number;
}

/**
 * 应用布局主组件
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDesignModeEnabled, toggleDesignMode } = useDesignModeStore();

  // 导航菜单配置
  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '🏠',
      description: 'Overview and system status',
      badge: 'Main'
    },
    {
      path: '/editor',
      label: 'Component Editor',
      icon: '🎨',
      description: 'Visual component builder',
      badge: 'Pro'
    },
    {
      path: '/design-system',
      label: 'Design System',
      icon: '🎯',
      description: 'Design tokens and guidelines',
      badge: 'Core'
    },
    {
      path: '/preview',
      label: 'Live Preview',
      icon: '⚡',
      description: 'Real-time component preview'
    }
  ];

  // 导航项目组件
  const NavItemComponent: React.FC<{ item: NavItem; isActive: boolean }> = ({ item, isActive }) => (
    <Link
      to={item.path}
      className={`
        nav-item group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg
        transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800
        ${isActive 
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' 
          : 'text-neutral-700 dark:text-neutral-300'
        }
      `}
      data-component="NavItem"
      data-element="nav-link"
      data-nav-item={item.path.replace('/', '')}
      onClick={() => setSidebarOpen(false)}
    >
      <span className="nav-item-icon text-lg mr-3" data-element="icon">
        {item.icon}
      </span>
      <div className="nav-item-content flex-1 min-w-0" data-element="content">
        <div className="nav-item-label font-medium" data-element="label">
          {item.label}
        </div>
        <div className="nav-item-description text-xs text-neutral-500 dark:text-neutral-400 mt-0.5" data-element="description">
          {item.description}
        </div>
      </div>
      {item.badge && (
        <span 
          className="nav-item-badge ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
          data-element="badge"
        >
          {item.badge}
        </span>
      )}
      
      {/* 设计模式属性 */}
      <div 
        className="design-mode-indicator absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        data-design-mode={isDesignModeEnabled ? 'true' : 'false'}
      >
        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
      </div>
    </Link>
  );

  return (
    <div 
      className="app-layout layout-container"
      data-component="AppLayout"
      data-design-mode={isDesignModeEnabled ? 'true' : 'false'}
    >
      {/* 移动端遮罩层 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            data-component="MobileOverlay"
            data-element="overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          layout-sidebar fixed inset-y-0 left-0 z-40 flex flex-col
          bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800
          lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        data-component="Sidebar"
        data-element="sidebar"
      >
        {/* 侧边栏头部 */}
        <div className="sidebar-header flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-800" data-element="header">
          <div className="sidebar-brand flex items-center" data-element="brand">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <div className="brand-content">
              <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Design Mode
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Full Featured Showcase
              </p>
            </div>
          </div>
          
          {/* 移动端关闭按钮 */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            data-component="IconButton"
            data-element="close-button"
            data-action="close-sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="sidebar-nav flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar" data-element="nav">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </nav>

        {/* 侧边栏底部 */}
        <div className="sidebar-footer p-4 border-t border-neutral-200 dark:border-neutral-800" data-element="footer">
          <div className="sidebar-actions space-y-2" data-element="actions">
            <button
              onClick={toggleDesignMode}
              className={`
                w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md
                transition-colors duration-200
                ${isDesignModeEnabled
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                }
              `}
              data-component="ToggleButton"
              data-element="design-mode-toggle"
              data-action="toggle-design-mode"
            >
              <span className="mr-2">{isDesignModeEnabled ? '🎯' : '👁️'}</span>
              {isDesignModeEnabled ? 'Design Mode ON' : 'Design Mode OFF'}
            </button>
            
            <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
              Version 1.0.0
            </div>
          </div>
        </div>
      </motion.aside>

      {/* 主内容区域 */}
      <div className="layout-main flex flex-col min-h-screen">
        {/* 顶部导航栏 */}
        <header className="layout-header h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 relative z-10" data-component="Header" data-element="header">
          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            data-component="IconButton"
            data-element="mobile-menu-button"
            data-action="toggle-sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* 页面标题和面包屑 */}
          <div className="header-content flex-1" data-element="content">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {navItems.find(item => item.path === location.pathname)?.label || 'Unknown Page'}
            </h2>
          </div>

          {/* 顶部操作区域 */}
          <div className="header-actions flex items-center space-x-4" data-element="actions">
            {/* 设计模式状态指示器 */}
            <div 
              className={`
                header-status-indicator flex items-center px-3 py-1 rounded-full text-xs font-medium
                ${isDesignModeEnabled
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                }
              `}
              data-element="status-indicator"
            >
              <div className={`
                w-2 h-2 rounded-full mr-2
                ${isDesignModeEnabled ? 'bg-primary-500' : 'bg-neutral-400'}
              `}></div>
              {isDesignModeEnabled ? 'Design Mode' : 'Preview Mode'}
            </div>

            {/* 用户头像/设置 */}
            <button
              className="header-user-button p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              data-component="AvatarButton"
              data-element="user-avatar"
              data-action="open-user-menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
            </button>
          </div>
        </header>

        {/* 主内容 */}
        <main 
          className="layout-content flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-800"
          data-component="Main"
          data-element="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;