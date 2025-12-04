/**
 * 属性名工具函数
 * 用于统一管理源码映射相关的 DOM 属性名，支持可配置的前缀
 * 这样可以避免与用户自定义的 data-* 属性冲突
 */

// 默认前缀（如果配置未注入，使用此默认值）
const DEFAULT_PREFIX = 'data-source';

// 从全局配置或 meta 标签获取属性前缀
function getAttributePrefix(): string {
  // 尝试从全局变量获取
  if (typeof window !== 'undefined') {
    const globalConfig = (window as any).__APPDEV_DESIGN_MODE_CONFIG__;
    if (globalConfig?.attributePrefix) {
      return globalConfig.attributePrefix;
    }

    // 尝试从 meta 标签获取
    const metaTag = document.querySelector('meta[name="appdev-design-mode:attribute-prefix"]');
    if (metaTag) {
      const prefix = metaTag.getAttribute('content');
      if (prefix) {
        return prefix;
      }
    }
  }

  return DEFAULT_PREFIX;
}

// 缓存前缀值，避免重复查询
let cachedPrefix: string | null = null;

/**
 * 获取属性前缀
 * @returns 属性前缀字符串
 */
export function getPrefix(): string {
  if (cachedPrefix === null) {
    cachedPrefix = getAttributePrefix();
  }
  return cachedPrefix;
}

/**
 * 重置缓存的前缀（用于测试或配置更新）
 */
export function resetPrefixCache(): void {
  cachedPrefix = null;
}

/**
 * 获取完整的属性名
 * @param suffix 属性后缀（如 'file', 'line', 'info' 等）
 * @returns 完整的属性名（如 'data-source-file'）
 */
export function getAttributeName(suffix: string): string {
  const prefix = getPrefix();
  return `${prefix}-${suffix}`;
}

/**
 * 属性名常量（使用函数确保使用最新配置）
 */
export const AttributeNames = {
  get file() {
    return getAttributeName('file');
  },
  get line() {
    return getAttributeName('line');
  },
  get column() {
    return getAttributeName('column');
  },
  get info() {
    return getAttributeName('info');
  },
  get elementId() {
    return getAttributeName('element-id');
  },
  get component() {
    return getAttributeName('component');
  },
  get function() {
    return getAttributeName('function');
  },
  get position() {
    return getAttributeName('position');
  },
  get staticContent() {
    return getAttributeName('static-content');
  },
  get contextMenu() {
    return getAttributeName('context-menu');
  },
  get contextMenuHover() {
    return getAttributeName('context-menu-hover');
  },
} as const;

/**
 * 检查属性名是否属于源码映射属性
 * @param attributeName 属性名
 * @returns 是否为源码映射属性
 */
export function isSourceMappingAttribute(attributeName: string): boolean {
  const prefix = getPrefix();
  return attributeName.startsWith(`${prefix}-`);
}

