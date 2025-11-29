import type { Plugin } from 'vite';
import { createServerMiddleware } from './core/serverMiddleware';
import { transformSourceCode } from './core/astTransformer';
import { handleUpdate } from './core/codeUpdater';
import { handleBatchUpdate } from './core/batchUpdater';

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
}

const DEFAULT_OPTIONS: Required<DesignModeOptions> = {
  enabled: true,
  enableInProduction: false,
  attributePrefix: 'data-source',
  verbose: false,
  exclude: ['node_modules', '.git'],
  include: ['**/*.{js,jsx,ts,tsx}'],
};

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 虚拟模块 ID，用于在 Vite 中加载客户端代码
const VIRTUAL_CLIENT_MODULE_ID = 'virtual:appdev-design-mode-client';
const RESOLVED_VIRTUAL_CLIENT_MODULE_ID = '\0' + VIRTUAL_CLIENT_MODULE_ID;

function appdevDesignModePlugin(userOptions: DesignModeOptions = {}): Plugin {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  // 保存 base 配置，用于构建正确的客户端代码路径
  let basePath = '/';

  return {
    name: '@xagi/vite-plugin-design-mode',
    enforce: 'pre',

    // 解析虚拟模块 ID
    resolveId(id) {
      if (id === VIRTUAL_CLIENT_MODULE_ID) {
        return RESOLVED_VIRTUAL_CLIENT_MODULE_ID;
      }
      return null;
    },

    // 加载虚拟模块内容
    load(id) {
      if (id === RESOLVED_VIRTUAL_CLIENT_MODULE_ID) {
        const clientEntryPath = resolveClientEntryPath();
        if (!existsSync(clientEntryPath)) {
          throw new Error(
            `[appdev-design-mode] 客户端入口文件不存在: ${clientEntryPath}`
          );
        }
        // 读取客户端代码，Vite 会根据项目配置自动处理 TSX 转换
        return readFileSync(clientEntryPath, 'utf-8');
      }
      return null;
    },

    config(config, { command }) {
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
      if (
        !options.enabled ||
        (command === 'build' && !options.enableInProduction)
      ) {
        return {};
      }

      return {
        define: {
          __APPDEV_DESIGN_MODE__: true,
          __APPDEV_DESIGN_MODE_VERBOSE__: options.verbose,
        },
        esbuild: {
          logOverride: { 'this-is-undefined-in-esm': 'silent' },
        },
      };
    },

    configureServer(server) {
      if (
        !options.enabled ||
        (server.config.command === 'build' && !options.enableInProduction)
      ) {
        return;
      }

      // 提供客户端代码的 HTTP 端点
      // 使用 Vite 的转换管道来处理 TSX 文件
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
            const clientEntryPath = resolveClientEntryPath();
            if (!existsSync(clientEntryPath)) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.end(
                `[appdev-design-mode] 客户端入口文件不存在: ${clientEntryPath}`
              );
              return;
            }

            // 尝试使用 Vite 的 transformRequest 来转换客户端代码
            // 如果文件在 node_modules 中，可能需要使用虚拟模块路径
            let result;
            try {
              // 首先尝试直接转换文件路径
              result = await server.transformRequest(clientEntryPath, {
                ssr: false,
              });
            } catch (transformError) {
              // 如果直接转换失败，尝试使用虚拟模块
              if (options.verbose) {
                console.log(
                  `[appdev-design-mode] transformRequest 失败，尝试使用虚拟模块:`,
                  transformError
                );
              }
              // 使用虚拟模块 ID 来加载
              result = await server.transformRequest(
                VIRTUAL_CLIENT_MODULE_ID,
                { ssr: false }
              );
            }

            if (result && result.code) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/javascript');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(result.code);
            } else {
              // 如果转换失败，直接读取文件内容（不推荐，但作为后备方案）
              const code = readFileSync(clientEntryPath, 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/javascript');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(code);
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

        // Register update middleware
        if (req.url === '/__appdev_design_mode/update') {
          handleUpdate(req, res, server.config.root);
        } else if (req.url === '/__appdev_design_mode/batch-update') {
          handleBatchUpdate(req, res, server.config.root);
        } else {
          next();
        }
      });

      // Then register the base middleware
      server.middlewares.use(
        '/__appdev_design_mode',
        createServerMiddleware(options, server.config.root)
      );
    },

    transformIndexHtml(html, ctx) {
      if (!options.enabled) return html;

      // 构建基于 base 路径的客户端代码 URL
      // 确保路径相对于 base 配置，支持子路径部署
      const clientScriptPath = `${basePath}@appdev-design-mode/client.js`.replace(/\/+/g, '/');

      // 使用 HTTP 端点来加载客户端代码，而不是虚拟模块或 /@fs 协议
      // 这样可以避免 node_modules 访问限制和 CORS 问题
      return {
        html,
        tags: [
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

    transform(code, id, transformOptions) {
      if (!options.enabled) {
        return code;
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

