/**
 * @fileoverview 组件编辑器页面
 * @description 提供可视化的组件编辑功能，支持拖拽、属性编辑和实时预览
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Eye, 
  EyeOff,
  Settings,
  Layers,
  Code,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button, IconButton } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDesignModeStore } from '../main';

// 编辑模式类型
type EditMode = 'design' | 'code' | 'preview';

// 设备类型
type DeviceType = 'desktop' | 'tablet' | 'mobile';

// 组件库数据
const COMPONENT_LIBRARY = [
  {
    id: 'button',
    name: 'Button',
    category: 'Input',
    icon: '🔘',
    description: 'Interactive button component',
    props: {
      variant: 'primary',
      size: 'md',
      disabled: false,
      loading: false
    },
    variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    sizes: ['sm', 'md', 'lg', 'xl']
  },
  {
    id: 'card',
    name: 'Card',
    category: 'Layout',
    icon: '🃏',
    description: 'Container component with header, body, and footer',
    props: {
      variant: 'default',
      size: 'md',
      hover: false,
      interactive: false
    },
    variants: ['default', 'elevated', 'outlined', 'ghost', 'filled'],
    sizes: ['sm', 'md', 'lg', 'xl']
  },
  {
    id: 'input',
    name: 'Input',
    category: 'Form',
    icon: '📝',
    description: 'Text input field component',
    props: {
      type: 'text',
      placeholder: 'Enter text...',
      disabled: false,
      required: false,
      error: false
    },
    variants: ['default', 'filled', 'underlined'],
    sizes: ['sm', 'md', 'lg']
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'Overlay',
    icon: '🪟',
    description: 'Overlay modal dialog',
    props: {
      open: false,
      size: 'md',
      closable: true,
      maskClosable: true
    },
    variants: ['default', 'fullscreen', 'drawer'],
    sizes: ['sm', 'md', 'lg', 'xl']
  }
];

// 组件预览组件
const ComponentPreview: React.FC<{
  component: any;
  deviceType: DeviceType;
  isPlaying: boolean;
}> = ({ component, deviceType, isPlaying }) => {
  const renderComponent = () => {
    switch (component.id) {
      case 'button':
        return (
          <button 
            className={`
              px-4 py-2 rounded-md font-medium transition-colors
              ${component.props.variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700' :
                component.props.variant === 'secondary' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' :
                component.props.variant === 'outline' ? 'border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white' :
                component.props.variant === 'danger' ? 'bg-error-600 text-white hover:bg-error-700' :
                'bg-transparent text-neutral-700 hover:bg-neutral-100'
              }
              ${component.props.size === 'sm' ? 'px-3 py-1.5 text-sm' :
                component.props.size === 'lg' ? 'px-6 py-3 text-lg' :
                component.props.size === 'xl' ? 'px-8 py-4 text-xl' :
                'px-4 py-2 text-sm'
              }
              ${component.props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={component.props.disabled}
            data-component="Button"
            data-element="preview-button"
            data-variant={component.props.variant}
            data-size={component.props.size}
          >
            {isPlaying ? 'Loading...' : 'Button Component'}
          </button>
        );
        
      case 'card':
        return (
          <div 
            className={`
              bg-white dark:bg-neutral-900 rounded-lg overflow-hidden
              ${component.props.variant === 'elevated' ? 'shadow-lg' :
                component.props.variant === 'outlined' ? 'border-2 border-primary-200 dark:border-primary-800' :
                component.props.variant === 'filled' ? 'bg-neutral-50 dark:bg-neutral-800' :
                'border border-neutral-200 dark:border-neutral-800'
              }
              ${component.props.hover ? 'hover:shadow-md transition-shadow' : ''}
              ${component.props.size === 'sm' ? 'p-3' :
                component.props.size === 'lg' ? 'p-6' :
                component.props.size === 'xl' ? 'p-8' :
                'p-4'
              }
            `}
            data-component="Card"
            data-element="preview-card"
            data-variant={component.props.variant}
            data-size={component.props.size}
          >
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Card Header
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              This is a preview of the {component.name} component.
            </div>
            <div className="text-xs text-neutral-500">
              Card content goes here...
            </div>
          </div>
        );
        
      case 'input':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Input Label
            </label>
            <input
              type={component.props.type}
              placeholder={component.props.placeholder}
              disabled={component.props.disabled}
              required={component.props.required}
              className={`
                w-full px-3 py-2 border rounded-md transition-colors
                ${component.props.error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' :
                  'border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500'
                }
                ${component.props.variant === 'filled' ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              data-component="Input"
              data-element="preview-input"
              data-variant={component.props.variant}
              data-error={component.props.error ? 'true' : 'false'}
            />
          </div>
        );
        
      case 'modal':
        return (
          <div className="relative">
            <div className="p-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600">
              <div className="text-center text-neutral-500 dark:text-neutral-400">
                <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  🪟
                </div>
                <p className="text-sm">
                  {component.props.open ? 'Modal is open' : 'Click to open modal'}
                </p>
                <p className="text-xs mt-2">
                  Size: {component.props.size} • Closable: {component.props.closable ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-center">
            <p className="text-neutral-500 dark:text-neutral-400">
              Component preview not available
            </p>
          </div>
        );
    }
  };

  const getDeviceClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  return (
    <div 
      className={`component-preview ${getDeviceClasses()}`}
      data-component="ComponentPreview"
      data-element="preview"
      data-device={deviceType}
      data-component-id={component.id}
    >
      {renderComponent()}
    </div>
  );
};

// 属性面板组件
const PropertyPanel: React.FC<{
  component: any;
  onUpdate: (props: any) => void;
}> = ({ component, onUpdate }) => {
  const updateProp = (key: string, value: any) => {
    onUpdate({
      ...component.props,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader 
        title={`${component.name} Properties`}
        subtitle={`${component.category} • ${component.id}`}
      />
      <CardBody className="space-y-6">
        {/* 变体选择 */}
        {component.variants && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Variant
            </label>
            <select
              value={component.props.variant}
              onChange={(e) => updateProp('variant', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-component="Select"
              data-element="variant-select"
              data-component-prop="variant"
            >
              {component.variants.map((variant: string) => (
                <option key={variant} value={variant}>
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 尺寸选择 */}
        {component.sizes && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Size
            </label>
            <select
              value={component.props.size}
              onChange={(e) => updateProp('size', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-component="Select"
              data-element="size-select"
              data-component-prop="size"
            >
              {component.sizes.map((size: string) => (
                <option key={size} value={size}>
                  {size.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 布尔属性 */}
        {['disabled', 'loading', 'hover', 'interactive', 'required', 'error'].map((prop) => {
          if (!(prop in component.props)) return null;
          
          return (
            <div key={prop} className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {prop.charAt(0).toUpperCase() + prop.slice(1)}
              </label>
              <button
                onClick={() => updateProp(prop, !component.props[prop])}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${component.props[prop] ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'}
                `}
                data-component="Toggle"
                data-element="boolean-toggle"
                data-prop={prop}
                data-value={component.props[prop] ? 'true' : 'false'}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${component.props[prop] ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          );
        })}

        {/* 文本属性 */}
        {['placeholder', 'type'].map((prop) => {
          if (!(prop in component.props)) return null;
          
          return (
            <div key={prop} className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {prop.charAt(0).toUpperCase() + prop.slice(1)}
              </label>
              <input
                type="text"
                value={component.props[prop]}
                onChange={(e) => updateProp(prop, e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                data-component="Input"
                data-element="text-input"
                data-component-prop={prop}
              />
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
};

/**
 * 组件编辑器主页面
 */
const ComponentEditor: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState(COMPONENT_LIBRARY[0]);
  const [editMode, setEditMode] = useState<EditMode>('design');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isPlaying, setIsPlaying] = useState(false);
  const [code, setCode] = useState('');
  const { isDesignModeEnabled } = useDesignModeStore();

  // 组件属性更新处理
  const handleComponentUpdate = useCallback((newProps: any) => {
    setSelectedComponent((prev: any) => ({
      ...prev,
      props: newProps
    }));
  }, []);

  // 开始/停止播放状态
  const togglePlayState = () => {
    setIsPlaying(!isPlaying);
  };

  // 生成代码
  const generateCode = () => {
    const propsString = Object.entries(selectedComponent.props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    const codeString = `<${selectedComponent.id}${propsString ? ' ' + propsString : ''} />`;
    setCode(codeString);
    setEditMode('code');
  };

  // 复制代码
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // 可以添加成功提示
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div 
      className="component-editor h-full flex flex-col"
      data-component="ComponentEditor"
      data-design-mode={isDesignModeEnabled ? 'true' : 'false'}
      data-edit-mode={editMode}
      data-device={deviceType}
    >
      {/* 编辑器工具栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="editor-toolbar border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
        data-element="toolbar"
      >
        <div className="flex items-center justify-between">
          {/* 左侧：组件库和模式切换 */}
          <div className="flex items-center space-x-4" data-element="left-controls">
            {/* 组件库选择 */}
            <div className="flex items-center space-x-2" data-element="component-selector">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Component:
              </label>
              <select
                value={selectedComponent.id}
                onChange={(e) => {
                  const component = COMPONENT_LIBRARY.find(c => c.id === e.target.value);
                  if (component) setSelectedComponent(component);
                }}
                className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                data-component="Select"
                data-element="component-select"
              >
                {COMPONENT_LIBRARY.map((component) => (
                  <option key={component.id} value={component.id}>
                    {component.icon} {component.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 模式切换 */}
            <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-md overflow-hidden" data-element="mode-toggle">
              {(['design', 'code', 'preview'] as EditMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEditMode(mode)}
                  className={`
                    px-3 py-1.5 text-sm transition-colors flex items-center space-x-1
                    ${editMode === mode 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }
                  `}
                  data-component="ModeButton"
                  data-element="mode-button"
                  data-mode={mode}
                >
                  {mode === 'design' && <Settings className="w-4 h-4" />}
                  {mode === 'code' && <Code className="w-4 h-4" />}
                  {mode === 'preview' && <Eye className="w-4 h-4" />}
                  <span className="capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-3" data-element="right-controls">
            {/* 设备切换 */}
            {editMode === 'preview' && (
              <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-md overflow-hidden" data-element="device-toggle">
                {[
                  { type: 'desktop', icon: Monitor, label: 'Desktop' },
                  { type: 'tablet', icon: Tablet, label: 'Tablet' },
                  { type: 'mobile', icon: Smartphone, label: 'Mobile' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setDeviceType(type as DeviceType)}
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
            )}

            {/* 播放按钮 */}
            {selectedComponent.props.hasOwnProperty('loading') && (
              <IconButton
                variant={isPlaying ? 'primary' : 'ghost'}
                onClick={togglePlayState}
                data-component="IconButton"
                data-element="play-button"
                data-action="toggle-play-state"
              >
                {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </IconButton>
            )}

            {/* 生成代码 */}
            <Button
              variant="outline"
              onClick={generateCode}
              data-component="Button"
              data-element="generate-code-button"
              data-action="generate-code"
            >
              <Code className="w-4 h-4 mr-2" />
              Generate Code
            </Button>

            {/* 保存 */}
            <IconButton
              variant="ghost"
              data-component="IconButton"
              data-element="save-button"
              data-action="save-component"
            >
              <Save className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </motion.div>

      {/* 编辑器主要内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 组件库面板 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="component-library w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 overflow-y-auto"
          data-element="library-panel"
        >
          <div className="p-4" data-element="library-content">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              Component Library
            </h3>
            
            <div className="space-y-2">
              {COMPONENT_LIBRARY.map((component) => (
                <button
                  key={component.id}
                  onClick={() => setSelectedComponent(component)}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-colors
                    ${selectedComponent.id === component.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' 
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }
                  `}
                  data-component="LibraryItem"
                  data-element="library-item"
                  data-component-id={component.id}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{component.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {component.name}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">
                        {component.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 主编辑区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {editMode === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex"
                data-element="design-mode"
              >
                {/* 设计画布 */}
                <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 p-8 overflow-auto">
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 min-h-96">
                      <ComponentPreview
                        component={selectedComponent}
                        deviceType={deviceType}
                        isPlaying={isPlaying}
                      />
                    </div>
                  </div>
                </div>

                {/* 属性面板 */}
                <div className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-y-auto">
                  <div className="p-4">
                    <PropertyPanel
                      component={selectedComponent}
                      onUpdate={handleComponentUpdate}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {editMode === 'code' && (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
                data-element="code-mode"
              >
                {/* 代码编辑器 */}
                <div className="flex-1 p-6 bg-neutral-900 text-green-400 font-mono text-sm overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Generated Code</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyCode}
                      data-component="Button"
                      data-element="copy-code-button"
                      data-action="copy-code"
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-neutral-800 p-4 rounded-lg overflow-x-auto">
                    <code data-element="code-content">
                      {code || '// Click "Generate Code" to create component code'}
                    </code>
                  </pre>
                </div>

                {/* 代码预览 */}
                <div className="h-64 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
                  <ComponentPreview
                    component={selectedComponent}
                    deviceType={deviceType}
                    isPlaying={isPlaying}
                  />
                </div>
              </motion.div>
            )}

            {editMode === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 bg-neutral-100 dark:bg-neutral-900 overflow-auto"
                data-element="preview-mode"
              >
                <div className="min-h-full p-8">
                  <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-8">
                        <ComponentPreview
                          component={selectedComponent}
                          deviceType={deviceType}
                          isPlaying={isPlaying}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ComponentEditor;