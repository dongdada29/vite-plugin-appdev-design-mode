# Vite Plugin AppDev Design Mode

一个为AppDev启用设计模式功能的Vite插件，为React组件提供源码映射和可视化编辑功能。

## 特性

- **源码映射**: 在编译时自动向DOM元素注入源码位置信息
- **可视化编辑**: 提供直观的设计模式UI，支持实时样式编辑
- **实时修改**: 支持实时编辑样式和内容，并自动持久化到源码文件
- **Tailwind CSS集成**: 内置Tailwind CSS预设，提供快速样式编辑
- **桥接通信**: 提供消息桥接机制，支持与外部工具和设计系统集成
- **开发服务器集成**: 无缝集成Vite开发服务器，支持热重载
- **零配置**: 开箱即用，无需复杂配置即可开始使用

## Installation

### 一键安装（推荐）

使用 CLI 工具一键安装插件并自动配置 `vite.config.ts`：

```bash
npx @xagi/vite-plugin-design-mode install
```

这个命令会：
- 自动检测项目使用的包管理器（npm/pnpm/yarn）
- 安装或升级插件到最新版本
- 自动在 `vite.config.ts` 中添加插件配置
- 使用默认配置，无需手动传参

### 一键卸载

使用 CLI 工具一键卸载插件并清理配置：

```bash
npx @xagi/vite-plugin-design-mode uninstall
```

这个命令会：
- 从 `package.json` 中移除插件依赖
- 从 `vite.config.ts` 中移除 import 和插件配置
- 自动清理所有相关配置

### 手动安装

如果需要手动安装：

```bash
npm install @xagi/vite-plugin-design-mode --save-dev
# or
yarn add @xagi/vite-plugin-design-mode --dev
# or
pnpm add @xagi/vite-plugin-design-mode -D
```

## Basic Usage

使用一键安装后，插件已自动配置，`vite.config.ts` 中会包含：

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from '@xagi/vite-plugin-design-mode';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode()  // 使用默认配置，无需传参
  ]
});
```

**默认配置说明：**
- `enabled: true` - 启用插件
- `enableInProduction: false` - 仅在开发环境生效，生产构建时自动禁用
- `verbose: true` - 启用详细日志
- `include: ['src/**/*.{ts,tsx}']` - 处理 src 目录下的 TypeScript/TSX 文件
- `exclude: ['node_modules', 'dist', 'src/components/ui']` - 排除指定目录

## Advanced Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from '@xagi/vite-plugin-design-mode';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode({
      enabled: true,
      enableInProduction: false,
      attributePrefix: 'data-appdev',
      verbose: true,
      exclude: ['node_modules', '.git'],
      include: ['**/*.{js,jsx,ts,tsx}']
    })
  ]
});
```

## 工作原理

1. **编译时转换**: 插件在编译时使用Babel AST转换JSX/TSX文件
2. **抽象语法树分析**: 分析AST识别React组件和DOM元素
3. **源码映射数据注入**: 将源码位置信息作为`data-*`属性注入到DOM元素
4. **运行时通信**: 设计模式UI通过桥接系统与外部工具通信，支持实时编辑
5. **源码持久化**: 修改的样式和内容通过API端点实时写入源码文件

## API 端点

插件提供以下API端点：

- `GET /__appdev_design_mode/get-source?elementId=xxx` - 获取指定元素的源码信息和文件内容
- `POST /__appdev_design_mode/modify-source` - 修改源码文件中的样式或内容
- `GET /__appdev_design_mode/health` - 健康检查，返回插件运行状态
- `POST /__appdev_design_mode/update` - 更新源码，支持样式类和内容修改

## 生成属性

插件处理的元素将具有以下属性（默认前缀为 `data-source`，可通过 `attributePrefix` 配置项自定义）：

- `{prefix}-file`: 源码文件路径
- `{prefix}-line`: 源码行号
- `{prefix}-column`: 源码列号
- `{prefix}-info`: 包含完整源码映射信息的JSON字符串
- `{prefix}-element-id`: 唯一元素标识符，格式为`文件路径:行号:列号_标签名_类名或ID`
- `{prefix}-component`: 组件名称（如果适用）
- `{prefix}-function`: 函数名称（如果适用）
- `{prefix}-position`: 位置信息，格式为`行号:列号`
- `{prefix}-static-content`: 标记元素是否包含纯静态内容（值为 `'true'`），用于判断元素是否可以直接编辑

**注意**：这些属性使用可配置的前缀，默认值为 `data-source`。通过设置 `attributePrefix` 选项，可以避免与用户自定义的 `data-*` 属性冲突。例如，设置 `attributePrefix: 'data-appdev'` 后，属性名将变为 `data-appdev-file`、`data-appdev-line`、`data-appdev-static-content` 等。

## 浏览器集成

### 直接DOM访问

在浏览器开发者工具或外部应用中：

```javascript
// 获取元素源码信息
const element = document.querySelector('.my-element');
const sourceInfo = element.getAttribute('data-source-info');
const sourceData = JSON.parse(sourceInfo);

console.log(sourceData);
// {
//   fileName: 'src/App.tsx',
//   lineNumber: 10,
//   columnNumber: 5,
//   elementType: 'div',
//   componentName: 'App',
//   elementId: 'src/App.tsx:10:5_div_my-class'
// }
```

### 桥接通信

使用内置桥接系统与设计模式UI交互：

```javascript
// 监听元素选择变化
window.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  if (type === 'SELECTION_CHANGED') {
    console.log('选中的元素:', payload);
    // payload 包含: tagName, id, className, innerText, source
  }
});

// 发送样式更新命令
window.parent.postMessage({
  type: 'UPDATE_STYLE',
  payload: {
    newClass: 'bg-blue-500 text-white p-4 rounded-lg'
  }
}, '*');

// 发送内容更新命令
window.parent.postMessage({
  type: 'UPDATE_CONTENT',
  payload: {
    newContent: '更新后的文本内容'
  }
}, '*');
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enabled` | boolean | `true` | 是否启用设计模式插件 |
| `enableInProduction` | boolean | `false` | 是否在生产环境启用，通常保持false |
| `attributePrefix` | string | `'data-source'` | 自定义源码映射属性的前缀 |
| `verbose` | boolean | `true` | 是否启用详细日志输出，便于调试 |
| `exclude` | string[] | `['node_modules', 'dist', 'src/components/ui']` | 排除处理的文件模式和目录 |
| `include` | string[] | `['src/**/*.{ts,tsx}']` | 包含处理的文件模式，支持glob语法 |

### 配置示例

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode({
      enabled: true,
      enableInProduction: false,
      attributePrefix: 'data-appdev',
      verbose: true,
      exclude: ['node_modules', '.git', 'dist'],
      include: ['src/**/*.{ts,tsx}', 'pages/**/*.{ts,tsx}']
    })
  ]
});
```

## 使用场景

### 1. 设计与开发协作
- 设计师可以直接在浏览器中调整组件样式
- 实时预览设计效果，所见即所得
- 自动生成样式代码，无需手动编写

### 2. 组件库开发
- 快速迭代组件样式和变体
- 可视化调整组件参数和样式
- 生成一致的设计语言

### 3. 原型开发
- 快速构建和调整页面布局
- 实时验证设计想法
- 加速从原型到代码的转换

### 4. 团队协作
- 统一设计系统和代码规范
- 减少设计师和开发者的沟通成本
- 提高开发效率和代码质量

## Tailwind CSS 预设

插件内置了常用的Tailwind CSS类预设：

### 背景颜色预设
- `bg-white` - 白色背景
- `bg-slate-50` - 浅灰色背景
- `bg-blue-50` - 浅蓝色背景
- `bg-blue-100` - 中浅蓝色背景
- `bg-blue-600` - 深蓝色背景
- `bg-red-50` - 浅红色背景
- `bg-green-50` - 浅绿色背景

### 文字颜色预设
- `text-slate-900` - 深灰色文字
- `text-slate-600` - 中灰色文字
- `text-blue-600` - 蓝色文字
- `text-white` - 白色文字
- `text-red-600` - 红色文字

### 间距预设
- `p-0` - 无内边距
- `p-2` - 小内边距
- `p-4` - 中等内边距
- `p-6` - 大内边距
- `p-8` - 特大内边距
- `p-12` - 超大内边距

### 圆角预设
- `rounded-none` - 无圆角
- `rounded-sm` - 小圆角
- `rounded-md` - 中等圆角
- `rounded-lg` - 大圆角
- `rounded-full` - 完全圆角

## 设计模式UI使用指南

### 启动设计模式
1. 在页面右下角找到设计模式开关
2. 点击开关启用设计模式
3. 开始选择和编辑页面元素

### 编辑元素样式
1. 点击页面中的任意元素
2. 在右侧编辑面板中选择预设样式
3. 实时预览样式效果
4. 修改会自动保存到源码文件

### 重置修改
- 点击“重置所有修改”按钮撤销所有更改
- 页面将重新加载并恢复原始状态

## 故障排除

### 常见问题

**Q: 设计模式UI没有显示**
A: 检查插件是否正确配置，确保在开发模式下运行

**Q: 点击元素没有反应**
A: 确认已经启用设计模式，检查浏览器控制台是否有错误信息

**Q: 样式修改没有保存**
A: 检查文件权限，确保有写入权限，或者检查开发服务器状态

**Q: 源码映射不准确**
A: 检查是否正确配置了include模式，确保源文件被正确处理

### 调试技巧

1. 启用verbose模式查看详细日志
2. 检查浏览器开发者工具的网络面板，确认API请求状态
3. 查看元素是否正确生成了源码映射属性
4. 使用健康检查端点验证插件运行状态

```bash
# 检查插件状态
curl http://localhost:3000/__appdev_design_mode/health
```

## 开发指南

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd vite-plugin-design-mode

# 安装依赖
npm install

# 运行示例
cd examples/advanced
npm install
npm run dev
```

### 自定义预设

如需自定义样式预设，可以修改客户端配置：

```typescript
// 在 DesignModeUI.tsx 中自定义预设
const CUSTOM_PRESETS = {
  bgColors: [
    { label: 'Primary', value: 'bg-blue-600' },
    { label: 'Secondary', value: 'bg-gray-600' },
    // 添加更多自定义颜色
  ]
};
```

## 贡献指南

欢迎提交Issue和Pull Request来改进这个插件！

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

### 代码规范
- 使用TypeScript
- 遵循ESLint规则
- 添加适当的测试
- 更新相关文档

## 更新日志

### v1.0.0
- 初始版本发布
- 实现基本的源码映射功能
- 添加可视化设计模式UI
- 支持实时样式编辑和源码修改
- 集成Tailwind CSS预设

## License

MIT
