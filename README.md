# Vite Plugin AppDev Design Mode

A Vite plugin that enables design mode functionality for AppDev, providing source mapping and visual editing capabilities for React components.

## Features

- **Source Mapping**: Automatically injects source location information into DOM elements
- **Element Selection**: Enables precise element selection with source code mapping
- **Hot Reload Integration**: Works seamlessly with Vite's HMR system
- **Developer Experience**: Zero configuration needed, works out of the box

## Installation

```bash
npm install vite-plugin-appdev-design-mode --save-dev
# or
yarn add vite-plugin-appdev-design-mode --dev
```

## Basic Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from 'vite-plugin-appdev-design-mode';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode()
  ]
});
```

## Advanced Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from 'vite-plugin-appdev-design-mode';

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

## How It Works

1. **Compilation Time**: The plugin transforms JSX/TSX files during compilation
2. **AST Analysis**: Analyzes the abstract syntax tree to identify React components
3. **Source Mapping**: Injects source location data as `data-*` attributes
4. **Runtime**: Dev tools can read these attributes to map DOM elements to source code

## API Endpoints

The plugin exposes several API endpoints:

- `GET /__appdev_design_mode/get-source?elementId=xxx` - Get source info for an element
- `POST /__appdev_design_mode/modify-source` - Modify source code
- `GET /__appdev_design_mode/health` - Health check

## Generated Attributes

Elements processed by the plugin will have these attributes:

- `data-source-info`: JSON containing full source mapping information
- `data-source-position`: Simple position string (line:column)
- `data-source-element-id`: Unique element identifier

## Browser Integration

In your browser dev tools or external applications:

```javascript
// Get element source info
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

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | 是否启用设计模式 |
| `enableInProduction` | boolean | `false` | 是否在生产环境启用 |
| `attributePrefix` | string | `'data-source'` | 自定义源码映射属性前缀 |
| `verbose` | boolean | `false` | 是否启用详细的日志输出 |
| `exclude` | string[] | `['node_modules', '.git']` | 排除的文件模式 |
| `include` | string[] | `['**/*.{js,jsx,ts,tsx}']` | 包含的文件模式 |

## License

MIT
