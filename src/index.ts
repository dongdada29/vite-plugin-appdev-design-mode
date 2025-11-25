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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function appdevDesignModePlugin(userOptions: DesignModeOptions = {}): Plugin {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };

  return {
    name: 'vite-plugin-appdev-design-mode',
    enforce: 'pre',

    config(config, { command }) {
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

      // 添加开发服务器中间件
      server.middlewares.use(
        '/__appdev_design_mode',
        createServerMiddleware(options, server.config.root)
      );
    },

    transformIndexHtml(html) {
      if (!options.enabled) return html;

      const clientEntryPath = resolve(__dirname, 'client/index.tsx');

      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: `/@fs${clientEntryPath}`,
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

