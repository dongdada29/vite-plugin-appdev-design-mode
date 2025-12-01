import type { Plugin } from 'vite';
import { createServerMiddleware } from './core/serverMiddleware';
import { transformSourceCode } from './core/transformers/ASTTransformer';
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

function appdevDesignModePlugin(userOptions: DesignModeOptions = {}): Plugin {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  // 保存 base 配置，用于构建正确的客户端代码路径
  let basePath = '/';

  return {
    name: '@xagi/vite-plugin-design-mode',
    enforce: 'pre',

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
        server: {
          fs: {
            allow: [
              // 允许访问插件的 dist 目录
              resolve(__dirname, '..'),
            ],
          },
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

      // Register update middleware
      server.middlewares.use(async (req, res, next) => {
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

      // 构建使用 @fs 协议的客户端代码 URL
      // @fs 允许访问文件系统中的任意文件
      const clientEntryPath = resolveClientEntryPath();
      const clientScriptPath = `/@fs/${clientEntryPath}`;

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

