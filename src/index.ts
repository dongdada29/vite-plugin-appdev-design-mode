import type { Plugin } from 'vite';
import { createServerMiddleware } from './core/serverMiddleware';
import { transformSourceCode } from './core/astTransformer';


export interface DesignModeOptions {
  /**
   * 是否启用设计模式
   * @default true
   */
  enabled?: boolean;

  /**
   * 是否在生产环境启用（通常为false）
   * @default false
   */
  enableInProduction?: boolean;

  /**
   * 自定义源码映射属性前缀
   * @default 'data-source'
   */
  attributePrefix?: string;

  /**
   * 是否启用详细的日志输出
   * @default false
   */
  verbose?: boolean;

  /**
   * 排除的文件模式
   */
  exclude?: string[];

  /**
   * 包含的文件模式
   */
  include?: string[];

  /**
   * 是否启用备份功能
   * @default false
   */
  enableBackup?: boolean;

  /**
   * 是否启用历史记录功能
   * @default false
   */
  enableHistory?: boolean;
}

const DEFAULT_OPTIONS: Required<DesignModeOptions> = {
  enabled: true,
  enableInProduction: false,
  attributePrefix: 'data-__xagi',
  verbose: true,
  exclude: ['node_modules', 'dist'],
  include: ['src/**/*.{ts,js,tsx,jsx}'],
  enableBackup: false,
  enableHistory: false,
};

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 虚拟模块 ID，用于在 Vite 中加载客户端代码
const VIRTUAL_CLIENT_MODULE_ID = 'virtual:appdev-design-mode-client';
const RESOLVED_VIRTUAL_CLIENT_MODULE_ID = '\0' + VIRTUAL_CLIENT_MODULE_ID + '.tsx';

function appdevDesignModePlugin(userOptions: DesignModeOptions = {}): Plugin {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  // 保存 base 配置，用于构建正确的客户端代码路径
  let basePath = '/';
  // 保存当前命令（serve 或 build），用于判断是否为开发环境
  let currentCommand: 'serve' | 'build' = 'serve';

  // 检查插件是否应该生效
  // 仅在开发环境（serve）或明确启用生产环境时生效
  const isPluginEnabled = () => {
    if (!options.enabled) {
      return false;
    }
    // 如果是构建模式且未启用生产环境支持，则禁用插件
    if (currentCommand === 'build' && !options.enableInProduction) {
      return false;
    }
    return true;
  };

  return {
    name: '@xagi/vite-plugin-design-mode',
    enforce: 'pre',

    // 解析虚拟模块 ID
    resolveId(id) {
      // 如果插件未启用，不处理虚拟模块
      if (!isPluginEnabled()) {
        return null;
      }
      if (id === VIRTUAL_CLIENT_MODULE_ID) {
        return RESOLVED_VIRTUAL_CLIENT_MODULE_ID;
      }
      return null;
    },

    // 加载虚拟模块内容
    load(id) {
      // 如果插件未启用，不加载虚拟模块
      if (!isPluginEnabled()) {
        return null;
      }
      if (id === RESOLVED_VIRTUAL_CLIENT_MODULE_ID) {
        const clientEntryPath = resolveClientEntryPath();
        if (!existsSync(clientEntryPath)) {
          throw new Error(
            `[appdev-design-mode] 客户端入口文件不存在: ${clientEntryPath}`
          );
        }
        // 读取文件内容并重写相对导入为绝对路径
        // 这样虚拟模块可以正确解析依赖
        const code = readFileSync(clientEntryPath, 'utf-8');
        const clientDir = dirname(clientEntryPath);

        // 重写相对导入为绝对路径 imports
        const rewrittenCode = code.replace(
          /from ['"]\.\/([^'"]+)['"]/g,
          (match, moduleName) => {
            const absolutePath = resolve(clientDir, moduleName);
            return `from '${absolutePath}'`;
          }
        );

        return rewrittenCode;
      }
      return null;
    },

    config(config, { command }) {
      // 保存当前命令，用于后续判断
      currentCommand = command;
      
      // 保存 base 配置，确保路径正确
      basePath = config.base || '/';
      // 规范化 base 路径：确保以 / 开头和结尾（除非是根路径）
      if (!basePath.startsWith('/')) {
        basePath = '/' + basePath;
      }
      if (basePath !== '/' && !basePath.endsWith('/')) {
        basePath = basePath + '/';
      }

      // 只在开发模式启用
      if (!isPluginEnabled()) {
        return {};
      }

      // 获取项目根目录（Vite 默认是 process.cwd()）
      const projectRoot = config.root ?? process.cwd();
      
      // 合并用户已有的 fs.allow 配置
      const existingAllow = config.server?.fs?.allow || [];
      const pluginDistPath = resolve(__dirname, '..');
      
      // 构建允许访问的目录列表（使用 Set 自动去重）
      const allowedPaths = new Set<string>();
      
      // 添加用户已有的配置（保留用户自定义的路径）
      existingAllow.forEach((path: string) => {
        // 规范化路径，确保使用绝对路径
        const normalizedPath = resolve(path);
        allowedPaths.add(normalizedPath);
      });
      
      // 添加项目根目录（必需，用于访问项目源码）
      allowedPaths.add(resolve(projectRoot));
      
      // 添加 node_modules 目录（通常也需要访问）
      const nodeModulesPath = resolve(projectRoot, 'node_modules');
      allowedPaths.add(nodeModulesPath);
      
      // 添加插件的 dist 目录（用于加载客户端代码）
      allowedPaths.add(pluginDistPath);

      return {
        define: {
          __APPDEV_DESIGN_MODE__: true,
          __APPDEV_DESIGN_MODE_VERBOSE__: options.verbose,
        },
        esbuild: {
          logOverride: { 'this-is-undefined-in-esm': 'silent' },
        },
        optimizeDeps: {
          // 确保 React 和 ReactDOM 被正确预构建
          include: ['react', 'react-dom'],
        },
        server: {
          fs: {
            // 合并用户配置和插件必需的路径
            allow: Array.from(allowedPaths),
          },
        },
      };
    },

    configureServer(server) {
      // 如果插件未启用，不配置服务器中间件
      if (!isPluginEnabled()) {
        return;
      }

      // Register client code middleware
      server.middlewares.use(async (req, res, next) => {
        // 匹配客户端代码请求（支持带或不带 base 路径）
        // Vite 的中间件 URL 可能已经处理了 base 路径，所以使用灵活的匹配
        const url = req.url || '';
        const isClientRequest =
          url === '/@appdev-design-mode/client.js' ||
          url.endsWith('/@appdev-design-mode/client.js') ||
          url.includes('@appdev-design-mode/client.js');

        if (isClientRequest) {
          try {
            // 使用虚拟模块 ID 来加载已打包的客户端代码
            // 虚拟模块的 load hook 会使用 esbuild 打包所有依赖
            // 通过 ssr: false 确保使用浏览器环境，React 会从项目的 node_modules 解析
            // Vite 会自动从项目的依赖中解析 React 和 ReactDOM（因为它们现在是 peerDependencies）
            const result = await server.transformRequest(
              VIRTUAL_CLIENT_MODULE_ID,
              { ssr: false }
            );

            if (result && result.code) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/javascript');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(result.code);
            } else {
              throw new Error('transformRequest returned no code');
            }
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end(
              `[appdev-design-mode] 加载客户端代码失败: ${error.message}`
            );
            if (options.verbose) {
              console.error(
                '[appdev-design-mode] 客户端代码加载错误:',
                error
              );
            }
          }
          return;
        }

        next();
      });

      // Register the main API middleware - this handles all /__appdev_design_mode/* endpoints
      server.middlewares.use(
        '/__appdev_design_mode',
        createServerMiddleware(options, server.config.root)
      );
    },

    transformIndexHtml(html, ctx) {
      // 如果插件未启用，不注入客户端脚本
      if (!isPluginEnabled()) {
        return html;
      }

      // 构建基于 base 路径的客户端代码 URL
      // 确保路径相对于 base 配置，支持子路径部署
      const clientScriptPath = `${basePath}@appdev-design-mode/client.js`.replace(/\/+/g, '/');

      // 使用 HTTP 端点来加载客户端代码，而不是虚拟模块或 /@fs 协议
      // 这样可以避免 node_modules 访问限制和 CORS 问题
      return {
        html,
        tags: [
          // 注入配置到全局变量，供客户端代码使用
          {
            tag: 'script',
            attrs: {
              type: 'text/javascript',
            },
            injectTo: 'head',
            children: `window.__APPDEV_DESIGN_MODE_CONFIG__ = ${JSON.stringify({
              attributePrefix: options.attributePrefix,
            })};`,
          },
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: clientScriptPath,
            },
            injectTo: 'body',
          },
        ],
      };
    },

    async transform(code, id, transformOptions) {
      // 如果插件未启用，不执行任何代码转换
      if (!isPluginEnabled()) {
        return code;
      }

      // 特殊处理虚拟模块：使用 transformWithEsbuild 转换 JSX
      if (id === RESOLVED_VIRTUAL_CLIENT_MODULE_ID) {
        const { transformWithEsbuild } = await import('vite');
        const result = await transformWithEsbuild(code, id, {
          loader: 'tsx',
          jsx: 'automatic',
          // 确保 React 和 ReactDOM 被正确解析
          format: 'esm',
        });
        return result.code;
      }

      // 检查文件是否应该被处理
      const shouldProcess = shouldProcessFile(id, options);
      if (options.verbose) {
        console.log(`[appdev-design-mode] Processing ${id}: ${shouldProcess}`);
      }

      if (!shouldProcess) {
        return code;
      }

      try {
        return transformSourceCode(code, id, options);
      } catch (error) {
        if (options.verbose) {
          console.warn(
            `[appdev-design-mode] Failed to transform ${id}:`,
            error
          );
        }
        return code;
      }
    },

    buildStart() {
      if (options.verbose) {
        console.log('[appdev-design-mode] Plugin started');
      }
    },

    buildEnd() {
      if (options.verbose) {
        console.log('[appdev-design-mode] Plugin ended');
      }
    },
  };
}

// 检查文件是否应该被处理
// 检查文件是否应该被处理
function shouldProcessFile(
  filePath: string,
  options: Required<DesignModeOptions>
): boolean {
  // 检查是否在排除列表中
  if (options.exclude.some(pattern => filePath.includes(pattern))) {
    return false;
  }

  // 检查是否在包含列表中
  const isIncluded = options.include.some(pattern => {
    // Ignore negation patterns in include (rely on exclude option)
    if (pattern.startsWith('!')) {
      return false;
    }

    // Convert glob to regex using placeholders to avoid escaping issues
    let regex = pattern;

    // 1. Replace glob syntax with placeholders
    regex = regex.replace(/\*\*/g, '%%GLOBSTAR%%');
    regex = regex.replace(/\*/g, '%%WILDCARD%%');
    regex = regex.replace(/\{([^}]+)\}/g, (_, group) =>
      `%%BRACE_START%%${group.replace(/,/g, '%%COMMA%%')}%%BRACE_END%%`
    );

    // 2. Escape special regex characters
    regex = regex.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

    // 3. Restore placeholders with regex equivalents
    regex = regex.replace(/%%GLOBSTAR%%/g, '.*');
    regex = regex.replace(/%%WILDCARD%%/g, '[^/]*');
    regex = regex.replace(/%%BRACE_START%%/g, '(');
    regex = regex.replace(/%%BRACE_END%%/g, ')');
    regex = regex.replace(/%%COMMA%%/g, '|');

    // 4. Create RegExp
    // Allow partial match for absolute paths by prepending .* if not already there
    // and not anchored
    if (!regex.startsWith('.*') && !regex.startsWith('^')) {
      regex = '.*' + regex;
    }

    const re = new RegExp(regex + '$'); // Anchor to end

    return re.test(filePath);
  });

  return isIncluded;
}

export default appdevDesignModePlugin;

function resolveClientEntryPath(): string {
  const distClientPath = resolve(__dirname, 'client/index.tsx');
  const sourceClientPath = resolve(__dirname, '../src/client/index.tsx');

  if (existsSync(distClientPath)) {
    return distClientPath;
  }

  if (existsSync(sourceClientPath)) {
    return sourceClientPath;
  }

  throw new Error(
    '[appdev-design-mode] 无法定位客户端入口文件 client/index.tsx'
  );
}

