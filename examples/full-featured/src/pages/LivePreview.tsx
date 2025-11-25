/**
 * @fileoverview 实时预览页面
 * @description 展示组件的实时预览效果，支持不同设备和主题切换
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Maximize, 
  Smartphone, 
  Tablet, 
  Monitor,
  Moon,
  Sun,
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button, IconButton } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDesignModeStore } from '../main';

// 设备类型
type DeviceType = 'desktop' | 'tablet' | 'mobile';

// 主题类型
type ThemeType = 'light' | 'dark' | 'system';

// 预览模式
type PreviewMode = 'component' | 'page' | 'interaction';

// 示例组件数据
const PREVIEW_COMPONENTS = [
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Landing page hero with call-to-action',
    category: 'Layout',
    component: (
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20 px-8 text-center">
        <h1 className="text-5xl font-bold mb-6">Design System Studio</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Build consistent and beautiful user interfaces with our comprehensive design system toolkit.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    description: 'Grid of features with icons and descriptions',
    category: 'Content',
    component: (
      <div className="py-16 px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to build and maintain a consistent design system.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: '🎨', title: 'Design Tokens', desc: 'Centralized design decisions' },
            { icon: '🔧', title: 'Component Library', desc: 'Reusable UI components' },
            { icon: '📱', title: 'Responsive Design', desc: 'Mobile-first approach' },
            { icon: '⚡', title: 'Fast Performance', desc: 'Optimized for speed' },
            { icon: '🎯', title: 'Accessibility', desc: 'WCAG compliant design' },
            { icon: '🔄', title: 'Real-time Sync', desc: 'Instant updates across team' }
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'form-example',
    name: 'Contact Form',
    description: 'Complete contact form with validation',
    category: 'Form',
    component: (
      <div className="max-w-2xl mx-auto py-16 px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">We'd love to hear from you. Send us a message!</p>
        </div>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Tell us more about your project..."
            />
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
          <button 
            type="submit"
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    )
  }
];

// 设备预览组件
const DevicePreview: React.FC<{
  component: React.ReactNode;
  deviceType: DeviceType;
  theme: ThemeType;
  isLoading?: boolean;
}> = ({ component, deviceType, theme, isLoading = false }) => {
  const getDeviceStyles = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          maxWidth: '100%',
          borderRadius: '25px',
          border: '1px solid #e5e5e5'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '100%',
          borderRadius: '15px',
          border: '1px solid #e5e5e5'
        };
      default:
        return {
          width: '100%',
          height: '600px',
          borderRadius: '8px',
          border: '1px solid #e5e5e5'
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  return (
    <div 
      className="device-preview flex justify-center items-center bg-gray-100 dark:bg-gray-900 p-8"
      data-component="DevicePreview"
      data-element="preview-container"
      data-device={deviceType}
      data-theme={theme}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="device-frame bg-white dark:bg-gray-800 overflow-hidden shadow-2xl"
        style={deviceStyles}
        data-element="device-frame"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div 
            className="preview-content h-full overflow-auto"
            data-element="preview-content"
          >
            {component}
          </div>
        )}
      </motion.div>
    </div>
  );
};

/**
 * 实时预览主页面
 */
const LivePreview: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState(PREVIEW_COMPONENTS[0]);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('component');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { isDesignModeEnabled } = useDesignModeStore();
  const previewRef = useRef<HTMLDivElement>(null);

  // 刷新预览
  const refreshPreview = useCallback(async () => {
    setIsLoading(true);
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    setLastUpdate(new Date());
  }, []);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      previewRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 应用主题
  const applyTheme = useCallback((newTheme: ThemeType) => {
    setTheme(newTheme);
    const root = document.documentElement;
    
    switch (newTheme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'light':
        root.classList.remove('dark');
        break;
      case 'system':
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
        break;
    }
  }, []);

  // 初始化主题
  React.useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // 设备切换时刷新
  React.useEffect(() => {
    if (isAutoRefresh) {
      refreshPreview();
    }
  }, [deviceType, selectedComponent, isAutoRefresh, refreshPreview]);

  return (
    <div 
      ref={previewRef}
      className="live-preview h-full flex flex-col"
      data-component="LivePreview"
      data-design-mode={isDesignModeEnabled ? 'true' : 'false'}
      data-preview-mode={previewMode}
      data-device={deviceType}
      data-theme={theme}
    >
      {/* 预览控制栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="preview-toolbar border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
        data-element="toolbar"
      >
        <div className="flex items-center justify-between">
          {/* 左侧：组件选择和模式 */}
          <div className="flex items-center space-x-4" data-element="left-controls">
            {/* 组件选择 */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Preview:
              </label>
              <select
                value={selectedComponent.id}
                onChange={(e) => {
                  const component = PREVIEW_COMPONENTS.find(c => c.id === e.target.value);
                  if (component) setSelectedComponent(component);
                }}
                className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                data-component="Select"
                data-element="component-select"
              >
                {PREVIEW_COMPONENTS.map((component) => (
                  <option key={component.id} value={component.id}>
                    {component.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 预览模式切换 */}
            <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-md overflow-hidden">
              {[
                { mode: 'component' as PreviewMode, icon: Settings, label: 'Component' },
                { mode: 'page' as PreviewMode, icon: Monitor, label: 'Page' },
                { mode: 'interaction' as PreviewMode, icon: Play, label: 'Interaction' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`
                    px-3 py-1.5 text-sm transition-colors flex items-center space-x-1
                    ${previewMode === mode 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }
                  `}
                  data-component="ModeButton"
                  data-element="mode-button"
                  data-mode={mode}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：控制按钮 */}
          <div className="flex items-center space-x-3" data-element="right-controls">
            {/* 设备切换 */}
            <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-md overflow-hidden" data-element="device-toggle">
              {[
                { type: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' },
                { type: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
                { type: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setDeviceType(type)}
                  className={`
                    px-3 py-1.5 text-sm transition-colors flex items-center space-x-1
                    ${deviceType === type 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }
                  `}
                  data-component="DeviceButton"
                  data-element="device-button"
                  data-device={type}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* 主题切换 */}
            <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-md overflow-hidden">
              {[
                { type: 'light' as ThemeType, icon: Sun, label: 'Light' },
                { type: 'dark' as ThemeType, icon: Moon, label: 'Dark' },
                { type: 'system' as ThemeType, icon: Settings, label: 'System' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => applyTheme(type)}
                  className={`
                    px-3 py-1.5 text-sm transition-colors flex items-center space-x-1
                    ${theme === type 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }
                  `}
                  data-component="ThemeButton"
                  data-element="theme-button"
                  data-theme={type}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* 自动刷新切换 */}
            <IconButton
              variant={isAutoRefresh ? 'primary' : 'ghost'}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              title="Auto Refresh"
              data-component="IconButton"
              data-element="auto-refresh-toggle"
              data-action="toggle-auto-refresh"
            >
              {isAutoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </IconButton>

            {/* 刷新按钮 */}
            <IconButton
              variant="ghost"
              onClick={refreshPreview}
              disabled={isLoading}
              title="Refresh Preview"
              data-component="IconButton"
              data-element="refresh-button"
              data-action="refresh-preview"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </IconButton>

            {/* 全屏按钮 */}
            <IconButton
              variant="ghost"
              onClick={toggleFullscreen}
              title="Fullscreen"
              data-component="IconButton"
              data-element="fullscreen-button"
              data-action="toggle-fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </motion.div>

      {/* 预览信息栏 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="preview-info bg-neutral-50 dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700"
        data-element="info-bar"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4" data-element="preview-info-left">
            <span data-element="component-name">
              {selectedComponent.name} • {selectedComponent.category}
            </span>
            <span data-element="device-info">
              {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} • {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
            </span>
          </div>
          <div className="flex items-center space-x-4" data-element="preview-info-right">
            <span data-element="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
            {isAutoRefresh && (
              <span className="text-success-600 dark:text-success-400" data-element="auto-refresh-status">
                ● Auto-refresh ON
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* 主要预览区域 */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedComponent.id}-${deviceType}-${theme}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="preview-area h-full"
            data-element="preview-area"
          >
            <DevicePreview
              component={selectedComponent.component}
              deviceType={deviceType}
              theme={theme}
              isLoading={isLoading}
            />
          </motion.div>
        </AnimatePresence>

        {/* 覆盖层指示器 */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {selectedComponent.description}
        </div>
      </div>

      {/* 操作栏 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="preview-actions border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
        data-element="actions-bar"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3" data-element="left-actions">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              data-component="Button"
              data-element="download-button"
              data-action="download-preview"
            >
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Share2 className="w-4 h-4" />}
              data-component="Button"
              data-element="share-button"
              data-action="share-preview"
            >
              Share
            </Button>
          </div>
          
          <div className="flex items-center space-x-3" data-element="right-actions">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Preview Mode: {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)}
            </div>
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LivePreview;