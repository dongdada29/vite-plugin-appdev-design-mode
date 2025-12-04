# React + Vite + TypeScript 模板

一个现代化的 React 18 + Vite + TypeScript 项目模板，专为 AI 自动化开发优化。

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (强制要求)

### 安装 pnpm

如果还没有安装 pnpm，请先安装：

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 或使用其他方式安装
# curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 项目设置

```bash
# 1. 安装依赖 (必须使用 pnpm)
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 构建生产版本
pnpm build

# 4. 预览生产版本
pnpm preview
```

## 📦 包管理要求

**⚠️ 重要：本项目强制要求使用 pnpm 作为包管理器**

- ❌ **禁止使用** `npm` 或 `yarn` 进行依赖管理
- ✅ **必须使用** `pnpm` 进行所有包管理操作
- 🔒 项目配置已针对 pnpm 优化

### 为什么使用 pnpm？

- **更快的安装速度** - 比 npm 快 2-3 倍
- **节省磁盘空间** - 使用硬链接共享依赖
- **更严格的依赖管理** - 避免幽灵依赖问题
- **更好的 monorepo 支持** - 原生支持 workspace

## 🛠️ 可用脚本

```bash
# 开发相关
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm preview          # 预览生产版本

# 代码质量
pnpm lint             # 运行 ESLint 检查
pnpm lint:fix         # 自动修复 ESLint 问题
pnpm type-check       # TypeScript 类型检查
pnpm format           # 格式化代码
pnpm format:check     # 检查代码格式

# 工具
pnpm clean            # 清理构建文件
```

## 🏗️ 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Radix UI (27个组件)
- **表单管理**: React Hook Form + Zod
- **HTTP客户端**: Axios
- **包管理**: pnpm

## 📁 项目结构

```
src/
├── components/        # 组件目录
│   └── ui/           # Radix UI 基础组件
├── lib/              # 工具库和配置
│   ├── api.ts        # HTTP客户端配置
│   ├── services.ts   # API接口定义
│   └── utils.ts      # 工具函数
├── App.tsx           # 根组件
├── main.tsx          # 应用入口
└── index.css         # 全局样式
```

## 🎨 UI 组件

项目包含完整的 Radix UI 组件库（27个组件）：

### 布局和导航
- Accordion, Collapsible, Navigation Menu, Menubar, Tabs, Separator

### 数据显示
- Avatar, Card, Progress, Scroll Area, Aspect Ratio

### 表单控件
- Button, Checkbox, Input, Label, Radio Group, Select, Slider, Switch, Textarea, Toggle, Toggle Group

### 覆盖层和对话框
- Alert Dialog, Dialog, Dropdown Menu, Popover, Tooltip

### 表单系统
- Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage

## 🔧 开发指南

### 组件开发

```typescript
// 创建新组件时的标准模式
interface ComponentProps {
  title: string;
  items: Item[];
  onAction?: (id: string) => void;
}

export const Component: React.FC<ComponentProps> = ({ title, items, onAction }) => {
  return (
    <div className="component">
      <h2>{title}</h2>
      {/* 组件内容 */}
    </div>
  );
};
```

### API 集成

```typescript
// 在 services.ts 中定义新 API
export const exampleApi = {
  getData: (params: ListParams) => 
    api.get<ListResult<Data>>('/api/data', { params }),
  
  createItem: (data: CreateData) => 
    api.post<Data>('/api/data', data),
};

// 1. 使用 useApi 获取数据 (自动处理 loading/error)
const { data, loading, error } = useApi(() => exampleApi.getData(params));

// 2. 使用 streamRequest 处理流式响应 (SSE)
await streamRequest('/api/chat', { prompt: 'hello' }, (res) => {
  console.log(res.data); // 实时接收数据
});
```

### 表单开发

```typescript
// 使用 React Hook Form + Zod
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email("无效的邮箱地址"),
  password: z.string().min(8, "密码至少需要8个字符"),
})

export function UserForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* 表单字段 */}
      </form>
    </Form>
  )
}
```

## 📝 代码规范

- 使用 TypeScript 严格模式
- 遵循 React 函数组件最佳实践
- 使用 Tailwind CSS 进行样式设计
- 组件文件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

## 🚀 部署

```bash
# 构建生产版本
pnpm build

# 构建文件将生成在 dist/ 目录
# 可以部署到任何静态文件服务器
```

## 🤖 AI 开发提示

本项目专为 AI 代码开发助手优化：

- 优先考虑代码可读性和维护性
- 遵循项目现有架构和设计模式
- 适当添加代码注释
- 考虑性能和安全性
- 保持代码风格一致

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**记住：始终使用 pnpm 进行包管理操作！** 🎯
