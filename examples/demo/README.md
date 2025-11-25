# Design Mode Demo

这是一个完整的示例项目，展示了 `@xagi/vite-plugin-design-mode` 的所有功能。

## 功能演示

### 1. 样式编辑
- 点击任意元素查看编辑面板
- 实时修改 Tailwind CSS 类
- 自动保存到源文件

### 2. 内容编辑
- 双击文本元素进入编辑模式
- 修改后自动更新源代码
- 支持纯文本内容

### 3. Iframe 支持
- 在 iframe 中自动隐藏 UI
- 通过 postMessage 通信
- 支持外部设计面板控制

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5175` 查看演示。

## 使用说明

1. **启用设计模式**：点击右下角的 "Design Mode" 开关
2. **选择元素**：点击页面上的任意元素
3. **修改样式**：使用右侧面板修改背景、文字颜色、内边距等
4. **编辑内容**：双击文本元素直接编辑
5. **查看源码**：所有修改会自动保存到对应的 `.tsx` 文件

## 页面说明

- **Home**: 主页，展示核心功能卡片和可编辑示例
- **Features**: 详细功能展示，包含各种可编辑元素
- **Iframe Demo**: 演示 iframe 集成和通信机制

## 技术栈

- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Radix UI
- @xagi/vite-plugin-design-mode

## 注意事项

- 仅支持静态字符串 className 的修改
- 内容编辑仅支持纯文本节点
- 所有修改会直接写入源文件，建议使用版本控制
