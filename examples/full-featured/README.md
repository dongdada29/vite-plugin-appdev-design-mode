# AppDev Design Mode - Full Featured Showcase

这是一个完整展示 `@vite-plugin-appdev-design-mode` 插件最新功能的示例项目。该项目构建了一个现代化的设计系统管理平台，展示了插件在可视化编辑、实时预览、源码调试等方面的强大功能。

## 🚀 功能特性

### 核心功能

1. **组件可视化编辑器**
   - 拖拽式组件编辑
   - 实时属性编辑面板
   - 多设备预览支持
   - 组件变体管理

2. **设计系统管理**
   - 完整的令牌管理系统
   - 颜色调色板管理
   - 字体和排版令牌
   - 间距和阴影令牌
   - 动画和时间令牌

3. **实时预览系统**
   - 多设备响应式预览
   - 主题切换支持
   - 实时组件更新
   - 全屏预览模式

4. **源码调试增强**
   - 自动源码映射
   - 组件层次可视化
   - 调试信息展示
   - 设计模式指示器

### 技术亮点

- **React 19** 最新特性支持
- **Vite 6** 高性能构建
- **TailwindCSS 4** 现代化样式方案
- **Radix UI** 无障碍组件库
- **TypeScript** 完整类型支持
- **Framer Motion** 流畅动画效果
- **Zustand** 轻量级状态管理

## 🛠️ 技术栈

### 前端框架
- **React 19.2.0** - 最新的 React 版本，支持并发特性
- **TypeScript 5.6** - 严格的类型检查
- **Vite 6.0** - 极速的开发服务器和构建工具

### UI 组件
- **Radix UI** - 无障碍的底层组件
- **TailwindCSS 4.1** - 实用优先的 CSS 框架
- **Framer Motion 10.18** - 高性能动画库

### 开发工具
- **AntV X6** - 图形可视化（可选）
- **React Hook Form** - 表单管理
- **Zustand** - 状态管理
- **React Query** - 服务器状态管理

### 构建配置
- **PostCSS** - CSS 后处理器
- **Autoprefixer** - 自动添加浏览器前缀
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

## 📦 安装和运行

### 环境要求

- Node.js 18.0.0 或更高版本
- pnpm 8.0.0 或更高版本
- 现代浏览器支持

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd vite-plugin-appdev-design-mode/examples/full-featured

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:5175
```

### 构建生产版本

```bash
# 构建项目
pnpm build

# 预览生产版本
pnpm preview
```

### 代码检查

```bash
# 类型检查
pnpm type-check

# 代码规范检查
pnpm lint
```

## 📁 项目结构

```
examples/full-featured/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── ui/             # 基础 UI 组件
│   │   ├── layout/         # 布局组件
│   │   ├── editor/         # 编辑器组件
│   │   ├── design-system/  # 设计系统组件
│   │   └── showcase/       # 展示组件
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘页面
│   │   ├── DesignSystem.tsx # 设计系统页面
│   │   ├── ComponentEditor.tsx # 组件编辑器页面
│   │   └── LivePreview.tsx # 实时预览页面
│   ├── hooks/              # 自定义 Hooks
│   ├── store/              # 状态管理
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── public/                 # 静态资源
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # TailwindCSS 配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目文档
```

## 🎨 设计系统令牌

### 颜色令牌

项目定义了完整的颜色系统：

```css
/* 主色调 */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-900: #1e3a8a;

/* 次要色调 */
--color-secondary-50: #faf5ff;
--color-secondary-500: #a855f7;

/* 功能色彩 */
--color-success-500: #22c55e;
--color-warning-500: #eab308;
--color-error-500: #ef4444;
```

### 字体令牌

```css
/* 字体家族 */
--font-family-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', ui-monospace, monospace;

/* 字体大小 */
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
```

### 间距令牌

```css
/* 基础间距 */
--spacing-1: 0.25rem;   /* 4px */
--spacing-4: 1rem;      /* 16px */
--spacing-8: 2rem;      /* 32px */
```

## 🔧 插件配置

### 基础配置

```typescript
// vite.config.ts
appdevDesignMode({
  enabled: true,
  enableInProduction: false,
  attributePrefix: 'design-mode',
  verbose: true,
  exclude: [
    'node_modules',
    'dist',
    '**/*.test.{ts,tsx,js,jsx}'
  ],
  include: [
    'src/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'pages/**/*.{ts,tsx,js,jsx}'
  ]
})
```

### 高级配置选项

- **enabled**: 启用/禁用设计模式
- **enableInProduction**: 生产环境是否启用
- **attributePrefix**: 自定义属性前缀
- **verbose**: 详细日志输出
- **exclude/include**: 文件过滤规则

## 🎯 功能演示

### 1. 组件可视化编辑

访问 `/editor` 页面体验：

- 拖拽式组件编辑
- 实时属性面板编辑
- 多设备预览切换
- 组件代码生成

### 2. 设计系统管理

访问 `/design-system` 页面体验：

- 完整的令牌管理系统
- 颜色调色板可视化
- 字体和排版管理
- 间距和阴影令牌

### 3. 实时预览

访问 `/preview` 页面体验：

- 多设备响应式预览
- 主题切换（Light/Dark/System）
- 实时组件更新
- 全屏预览模式

### 4. 源码调试

在开发模式下：

- 自动源码映射
- 组件层次可视化
- 设计模式指示器
- 调试信息展示

## 🚀 性能优化

### 代码分割

项目使用 React.lazy() 实现路由级别的代码分割：

```typescript
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ComponentEditor = React.lazy(() => import('./pages/ComponentEditor'));
```

### 资源优化

- 图片懒加载
- CSS 压缩和优化
- JavaScript 代码分割
- 浏览器缓存策略

### 响应式设计

项目完全支持响应式设计：

- 移动端优先设计
- 断点适配
- 触摸友好交互
- 性能优化

## 🎨 主题系统

### 暗色模式支持

项目支持完整的暗色模式：

```css
/* CSS 变量定义 */
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #171717;
}

.dark {
  --color-bg-primary: #0a0a0a;
  --color-text-primary: #fafafa;
}
```

### 自定义主题

用户可以通过设计系统页面自定义主题：

- 颜色调色板
- 字体设置
- 间距调整
- 动画效果

## ♿ 无障碍支持

项目注重无障碍访问：

- 语义化 HTML 结构
- ARIA 属性支持
- 键盘导航
- 屏幕阅读器兼容
- 高对比度模式

## 🔍 调试功能

### 开发模式特性

- 组件调试面板
- 状态检查工具
- 性能监控
- 错误边界

### 生产模式优化

- 错误处理
- 性能监控
- 用户体验优化
- 日志记录

## 📱 响应式设计

### 断点系统

```css
/* TailwindCSS 断点 */
sm: 640px   /* 小型设备 */
md: 768px   /* 中型设备 */
lg: 1024px  /* 大型设备 */
xl: 1280px  /* 超大设备 */
2xl: 1536px /* 2K 显示器 */
```

### 移动端优化

- 触摸手势支持
- 移动端菜单
- 响应式图片
- 性能优化

## 🧪 测试策略

### 单元测试

```bash
# 运行单元测试
pnpm test

# 生成覆盖率报告
pnpm test:coverage
```

### 集成测试

- 组件测试
- 页面测试
- 用户流程测试

### E2E 测试

- 浏览器自动化测试
- 用户交互测试
- 跨浏览器兼容性

## 📚 最佳实践

### 代码规范

- ESLint 配置
- Prettier 格式化
- TypeScript 严格模式
- 组件命名约定

### 性能最佳实践

- React.memo 优化
- useMemo 和 useCallback
- 虚拟滚动
- 懒加载策略

### 安全最佳实践

- XSS 防护
- CSRF 保护
- 内容安全策略
- 依赖安全管理

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 提交代码更改
4. 创建 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加必要的注释
- 编写测试用例

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢以下开源项目的支持：

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 创建 [Issue](../../issues)
- 发送邮件至 [team@xagi.dev](mailto:team@xagi.dev)
- 访问我们的 [官网](https://vite-plugin-appdev-design-mode.dev/)

---

**© 2024 XAGI Team. All rights reserved.**