# 测试文档

本目录包含 `@xagi/vite-plugin-design-mode` 插件的单元测试。

## 测试结构

```
test/
├── index.test.ts                    # 主插件入口测试
├── core/
│   ├── serverMiddleware.test.ts      # 服务器中间件测试
│   ├── astTransformer.test.ts       # AST转换器测试
│   ├── codeUpdater.test.ts          # 代码更新器测试
│   └── sourceMapper.test.ts         # 源码映射器测试
└── utils/
    └── babelHelpers.test.ts         # Babel辅助函数测试
```

## 运行测试

### 运行所有测试

```bash
npm test
# 或
pnpm test
```

### 运行测试（单次运行，不监听）

```bash
npm run test:run
```

### 运行测试并生成覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录中。

### 使用UI界面运行测试

```bash
npm run test:ui
```

这将打开一个交互式的测试UI界面。

## 测试覆盖范围

### 核心功能测试

1. **主插件入口 (`index.test.ts`)**
   - 插件初始化
   - 配置选项处理
   - Vite hooks 集成
   - 文件过滤逻辑

2. **服务器中间件 (`serverMiddleware.test.ts`)**
   - 健康检查端点
   - 获取源码端点
   - 修改源码端点
   - 错误处理

3. **AST转换器 (`astTransformer.test.ts`)**
   - JSX代码转换
   - 源码映射属性注入
   - TypeScript支持
   - 嵌套元素处理

4. **代码更新器 (`codeUpdater.test.ts`)**
   - 样式更新
   - 内容更新
   - 文件路径处理
   - 错误处理

5. **源码映射器 (`sourceMapper.test.ts`)**
   - Babel插件创建
   - 元素ID生成
   - 位置信息注入
   - 自定义属性前缀

6. **Babel辅助函数 (`babelHelpers.test.ts`)**
   - React组件名识别
   - JSX元素名称提取
   - 属性值提取
   - 位置字符串处理

## 编写新测试

### 测试文件命名

- 测试文件应以 `.test.ts` 或 `.spec.ts` 结尾
- 测试文件应放在与被测试文件相同的目录结构中

### 测试结构

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { functionToTest } from '../../src/module';

describe('模块名称', () => {
  beforeEach(() => {
    // 每个测试前的设置
    vi.clearAllMocks();
  });

  describe('功能描述', () => {
    it('应该执行预期行为', () => {
      // 测试代码
      expect(result).toBe(expected);
    });
  });
});
```

### Mock使用

使用 Vitest 的 `vi.mock()` 来模拟依赖：

```typescript
vi.mock('fs', () => {
  return {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});
```

### 异步测试

使用 `async/await` 处理异步操作：

```typescript
it('应该处理异步操作', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## 测试最佳实践

1. **测试隔离**: 每个测试应该独立运行，不依赖其他测试的状态
2. **清晰命名**: 测试描述应该清楚地说明测试的目的
3. **覆盖边界情况**: 测试正常流程、错误情况和边界条件
4. **Mock外部依赖**: 使用Mock来隔离被测试的代码
5. **保持测试简单**: 每个测试应该只测试一个功能点
6. **使用描述性的断言**: 使用有意义的错误消息

## 持续集成

测试可以在CI/CD流程中自动运行：

```yaml
# GitHub Actions 示例
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

## 故障排除

### 测试失败

1. 检查测试环境是否正确配置
2. 确认所有依赖已安装
3. 查看测试输出中的错误信息
4. 检查Mock是否正确设置

### 覆盖率低

1. 检查是否有未测试的代码路径
2. 添加更多边界情况测试
3. 确保所有公共API都有测试覆盖

## 相关资源

- [Vitest 文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest 迁移指南](https://vitest.dev/guide/migration.html)

