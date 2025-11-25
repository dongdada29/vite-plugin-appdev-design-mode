# 可自定义属性面板配置指南

## 概述

本文档详细介绍了如何使用和配置可自定义的属性面板系统，该系统支持用户自定义配置，提供完整的双向同步设计模式架构。

## 功能特性

### 🎨 样式自定义
- **颜色方案**: 自定义颜色库，支持导入导出
- **样式预设**: 保存和管理常用样式组合
- **主题切换**: 浅色/深色/跟随系统主题
- **响应式布局**: 自适应不同屏幕尺寸

### 📝 内容自定义
- **富文本编辑**: 支持格式化文本编辑
- **历史记录**: 自动保存编辑历史，支持回溯
- **模板系统**: 自定义内容模板和占位符
- **快捷操作**: 支持快捷键和批量操作

### ⚙️ 高级配置
- **面板布局**: 水平和垂直布局切换
- **快捷键自定义**: 用户可自定义键盘快捷键
- **自动保存**: 配置自动保存间隔和策略
- **数据管理**: 支持配置的导入导出和重置

## 安装和配置

### 1. 基础安装

```bash
# 安装依赖
npm install antd @ant-design/icons

# 或使用 yarn
yarn add antd @ant-design/icons
```

### 2. 配置文件

创建 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from '@xagi/vite-plugin-design-mode';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode({
      enabled: true,
      iframeMode: {
        enabled: true,
        hideUI: true,
        enableSelection: true,
        enableDirectEdit: true,
      },
      batchUpdate: {
        enabled: true,
        debounceMs: 300,
      },
      bridge: {
        timeout: 10000,
        retryAttempts: 3,
        heartbeatInterval: 30000,
        debug: true,
      }
    })
  ]
});
```

### 3. 基础组件使用

```tsx
import React, { useState } from 'react';
import { PropertyPanel } from '@xagi/design-mode';
import type { PropertyPanelConfig } from '@xagi/design-mode';

function MyApp() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [currentStyle, setCurrentStyle] = useState('');
  const [currentContent, setCurrentContent] = useState('');

  const handleStyleUpdate = (data) => {
    console.log('Style updated:', data);
  };

  const handleContentUpdate = (data) => {
    console.log('Content updated:', data);
  };

  return (
    <div className="app-layout">
      <PropertyPanel
        selectedElement={selectedElement}
        currentStyle={currentStyle}
        currentContent={currentContent}
        onStyleUpdate={handleStyleUpdate}
        onContentUpdate={handleContentUpdate}
        onStyleChange={setCurrentStyle}
        onContentChange={setCurrentContent}
        config={{
          theme: 'light',
          autoSave: true,
          autoSaveInterval: 3000,
          showElementInfo: true,
          enableKeyboardShortcuts: true,
          defaultPanel: 'style'
        }}
        onConfigChange={(config) => {
          console.log('Config changed:', config);
        }}
      />
    </div>
  );
}
```

## 高级配置

### 自定义配置接口

```typescript
export interface PropertyPanelConfig {
  // 主题配置
  theme: 'light' | 'dark' | 'auto';
  
  // 自动保存设置
  autoSave: boolean;
  autoSaveInterval: number;
  
  // 显示选项
  showElementInfo: boolean;
  showTooltips: boolean;
  
  // 交互设置
  enableKeyboardShortcuts: boolean;
  defaultPanel: 'style' | 'content' | 'settings';
  panelLayout: 'horizontal' | 'vertical';
  
  // 自定义颜色库
  colorPalette: string[];
  
  // 自定义预设
  customPresets: CustomPreset[];
  
  // 快捷键配置
  shortcuts: ShortcutConfig;
}
```

### 快捷键配置

```typescript
const shortcuts = {
  save: 'Ctrl+S',           // 保存当前设置
  undo: 'Ctrl+Z',           // 撤销操作
  redo: 'Ctrl+Y',           // 重做操作
  togglePanel: 'F2',        // 切换面板
  clearAll: 'Ctrl+Delete',  // 清除所有
  custom1: 'Ctrl+1',        // 自定义快捷键1
  custom2: 'Ctrl+2',        // 自定义快捷键2
  custom3: 'Ctrl+3'         // 自定义快捷键3
};
```

### 自定义预设管理

```typescript
interface CustomPreset {
  id: string;
  name: string;           // 预设名称
  type: 'style' | 'content'; // 预设类型
  value: string;          // 预设值
  description: string;    // 预设描述
  tags: string[];         // 标签数组
  favorite: boolean;      // 是否收藏
  createdAt: number;      // 创建时间
}

// 创建自定义预设
const myPreset: CustomPreset = {
  id: 'preset_001',
  name: '主要按钮样式',
  type: 'style',
  value: 'bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600',
  description: '常用的主要按钮样式',
  tags: ['按钮', '主要', '蓝色'],
  favorite: true,
  createdAt: Date.now()
};
```

## API 接口

### 组件属性

| 属性名 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| `selectedElement` | `ElementInfo \| null` | 当前选中的元素信息 | `null` |
| `currentStyle` | `string` | 当前样式类名 | `''` |
| `currentContent` | `string` | 当前内容 | `''` |
| `onStyleUpdate` | `(data) => void` | 样式更新回调 | 必填 |
| `onContentUpdate` | `(data) => void` | 内容更新回调 | 必填 |
| `onStyleChange` | `(style) => void` | 样式变化回调 | 必填 |
| `onContentChange` | `(content) => void` | 内容变化回调 | 必填 |
| `config` | `Partial<PropertyPanelConfig>` | 面板配置 | `undefined` |
| `onConfigChange` | `(config) => void` | 配置变化回调 | `undefined` |

### 回调函数参数

#### onStyleUpdate
```typescript
{
  sourceInfo: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  };
  newClass: string;
}
```

#### onContentUpdate
```typescript
{
  sourceInfo: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  };
  newContent: string;
}
```

## 事件处理

### 键盘事件

组件支持以下键盘事件：

- **Ctrl+S**: 保存当前设置
- **Ctrl+Z**: 撤销操作
- **Ctrl+Y**: 重做操作
- **F2**: 切换面板
- **Ctrl+Delete**: 清除所有

### 鼠标事件

- **单击**: 选择元素
- **双击**: 进入编辑模式
- **右键**: 显示上下文菜单
- **悬停**: 显示工具提示

## 样式定制

### 主题定制

```typescript
import { ConfigProvider } from 'antd';

// 自定义主题
const customTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#your-primary-color',
    borderRadius: 8,
    // 更多主题配置...
  }
};

<ConfigProvider theme={customTheme}>
  <PropertyPanel {...props} />
</ConfigProvider>
```

### 自定义样式类

```css
/* 自定义面板样式 */
.custom-property-panel {
  --panel-bg: #f8f9fa;
  --panel-border: #e9ecef;
  --panel-text: #212529;
}

.custom-property-panel .ant-card {
  background: var(--panel-bg);
  border-color: var(--panel-border);
}

.custom-property-panel .ant-tabs-tab {
  color: var(--panel-text);
}
```

## 数据存储

### LocalStorage 键值

- `appdev_property_panel_config`: 面板配置
- `appdev_property_panel_presets`: 自定义预设

### 数据格式

#### 配置数据格式
```json
{
  "theme": "light",
  "autoSave": true,
  "autoSaveInterval": 3000,
  "showElementInfo": true,
  "showTooltips": true,
  "enableKeyboardShortcuts": true,
  "defaultPanel": "style",
  "panelLayout": "horizontal",
  "colorPalette": ["#000000", "#ffffff", "#3b82f6"],
  "customPresets": [],
  "shortcuts": {
    "save": "Ctrl+S",
    "undo": "Ctrl+Z",
    "redo": "Ctrl+Y",
    "togglePanel": "F2",
    "clearAll": "Ctrl+Delete"
  }
}
```

#### 预设数据格式
```json
[
  {
    "id": "preset_001",
    "name": "主要按钮样式",
    "type": "style",
    "value": "bg-blue-500 text-white px-4 py-2 rounded-lg",
    "description": "常用的主要按钮样式",
    "tags": ["按钮", "主要", "蓝色"],
    "favorite": true,
    "createdAt": 1640995200000
  }
]
```

## 错误处理

### 常见错误

#### 1. 导入配置失败
```typescript
try {
  const config = JSON.parse(configString);
  // 验证配置格式
  if (!config.theme || !config.shortcuts) {
    throw new Error('配置格式不完整');
  }
} catch (error) {
  console.error('导入配置失败:', error);
  message.error('配置格式错误，请检查文件格式');
}
```

#### 2. 预设保存失败
```typescript
const savePreset = (preset) => {
  try {
    // 验证预设格式
    if (!preset.name || !preset.value) {
      throw new Error('预设名称和值不能为空');
    }
    
    // 保存预设
    presetManager.savePreset(preset);
    message.success('预设保存成功');
  } catch (error) {
    console.error('保存预设失败:', error);
    message.error('保存失败: ' + error.message);
  }
};
```

### 错误边界

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div className="error-boundary">
      <h3>配置面板出现错误</h3>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>
        重新加载
      </button>
    </div>
  );
}

// 使用错误边界包装组件
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <PropertyPanel {...props} />
</ErrorBoundary>
```

## 性能优化

### 1. 组件优化

```typescript
// 使用 React.memo 优化重渲染
const PropertyPanel = React.memo<PropertyPanelProps>(({ 
  selectedElement, 
  currentStyle, 
  currentContent, 
  onStyleUpdate, 
  onContentUpdate,
  onStyleChange,
  onContentChange,
  config,
  onConfigChange
}) => {
  // 组件实现...
});

// 使用 useMemo 缓存计算结果
const processedPresets = useMemo(() => {
  return presets.filter(preset => preset.favorite);
}, [presets]);

// 使用 useCallback 缓存回调函数
const handleStyleUpdate = useCallback((data) => {
  onStyleUpdate(data);
}, [onStyleUpdate]);
```

### 2. 内存管理

```typescript
// 清理副作用
useEffect(() => {
  const handleKeydown = (event) => {
    // 处理键盘事件
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
}, []);

// 清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    // 自动保存逻辑
  }, config.autoSaveInterval);
  
  return () => {
    clearInterval(timer);
  };
}, [config.autoSaveInterval]);
```

## 最佳实践

### 1. 配置管理
- 合理设置自动保存间隔，避免过于频繁的保存操作
- 为不同用户角色设置不同的默认配置
- 定期清理无用的自定义预设

### 2. 性能优化
- 大量预设数据时分页加载
- 使用虚拟滚动优化长列表显示
- 合理使用防抖和节流

### 3. 用户体验
- 提供清晰的错误提示和恢复机制
- 支持快捷键组合，满足熟练用户需求
- 保持界面的响应性和直观性

### 4. 数据安全
- 定期备份用户配置
- 验证导入数据的格式和安全性
- 提供配置恢复功能

## 故障排除

### 常见问题

#### Q: 面板不显示或加载失败
**A**: 检查以下项目：
1. 确认所有依赖包已正确安装
2. 检查网络连接是否正常
3. 查看浏览器控制台是否有错误信息
4. 验证配置格式是否正确

#### Q: 自定义预设无法保存
**A**: 可能原因：
1. LocalStorage 存储已满，尝试清理无用数据
2. 预设数据格式不正确，检查数据结构
3. 浏览器隐私设置阻止了本地存储

#### Q: 快捷键不生效
**A**: 检查项目：
1. 确认键盘事件监听器正确注册
2. 检查是否有其他组件占用了相同的快捷键
3. 验证快捷键格式是否符合系统要求

#### Q: 配置导入导出失败
**A**: 可能的问题：
1. JSON 格式错误，使用在线工具验证
2. 文件权限问题，检查文件读写权限
3. 数据大小超限，压缩或分批导入

### 调试技巧

#### 1. 启用调试模式
```typescript
const config = {
  debug: true,
  // 其他配置...
};
```

#### 2. 监控配置变化
```typescript
useEffect(() => {
  console.log('Config changed:', config);
}, [config]);
```

#### 3. 检查存储状态
```typescript
const checkStorage = () => {
  const config = localStorage.getItem('appdev_property_panel_config');
  const presets = localStorage.getItem('appdev_property_panel_presets');
  console.log('Stored config:', config);
  console.log('Stored presets:', presets);
};
```

## 更新日志

### v2.0.0 (当前版本)
- ✨ 新增完整的可自定义属性面板
- ✨ 支持主题切换和个性化配置
- ✨ 新增预设管理系统
- ✨ 支持配置导入导出
- ✨ 增强键盘快捷键支持
- ✨ 改进错误处理和恢复机制

### v1.0.0
- 🎉 初始版本发布
- ✨ 基础的样式和内容编辑功能
- ✨ 简单的面板配置选项

## 技术支持

如果您在使用过程中遇到问题，请通过以下方式获取帮助：

1. **查看文档**: 详细阅读本文档和使用指南
2. **检查示例**: 参考 examples/demo 目录中的示例代码
3. **调试模式**: 启用 debug 模式查看详细日志
4. **社区支持**: 在 GitHub 上提交 Issue
5. **联系支持**: 发送邮件到 support@example.com

## 贡献指南

我们欢迎社区贡献！请查看 CONTRIBUTING.md 了解如何参与项目开发。

### 贡献方式
- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 完善文档
- 💻 提交代码改进
- 🧪 编写测试用例

感谢您对项目的关注和支持！🎉
