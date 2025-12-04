import { AttributeNames } from './attributeNames';
import { SourceInfo } from '../../types/messages';

/**
 * 检查元素是否只包含纯静态文本（没有子元素）
 * 严格检查：只能包含文本节点，不能包含任何子元素标签
 * @param element HTML元素
 * @returns 是否为纯静态文本
 */
export function isPureStaticText(element: HTMLElement): boolean {
  // 首先检查是否有子元素（HTMLElement），如果有则不是纯文本
  if (element.children.length > 0) {
    return false;
  }

  // 检查所有子节点，确保只包含文本节点
  // 遍历所有子节点，排除注释节点、CDATA节点等
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    // 只允许文本节点（Node.TEXT_NODE = 3）
    // 不允许元素节点（Node.ELEMENT_NODE = 1）、注释节点（Node.COMMENT_NODE = 8）等
    if (node.nodeType !== Node.TEXT_NODE) {
      return false;
    }
  }

  return true;
}

/**
 * 检查元素是否允许内容更新
 * 对于有 children-source="usage" 的元素，需要检查其父级组件使用位置的 static-content 属性
 * @param element HTML元素
 * @returns 是否允许内容更新
 */
export function isContentEditable(element: HTMLElement): boolean {
  const childrenSource = element.getAttribute(AttributeNames.childrenSource);
  const fileType = element.getAttribute(AttributeNames.fileType);

  // 如果元素标记为 children-source="usage"，且是组件定义文件中的元素
  // 则需要检查组件使用位置的 static-content 属性
  if (childrenSource === 'usage' && fileType === 'component-definition') {
    // 向上遍历 DOM 树，查找最近的组件使用位置
    let current: HTMLElement | null = element.parentElement;
    const maxDepth = 20;
    let depth = 0;

    while (current && depth < maxDepth) {
      const parentFileType = current.getAttribute(AttributeNames.fileType);

      // 如果找到组件使用位置（component-usage），检查其 static-content 属性
      if (parentFileType === 'component-usage') {
        const staticContentAttr = current.getAttribute(AttributeNames.staticContent);
        return staticContentAttr === 'true';
      }

      current = current.parentElement;
      depth++;
    }

    // 如果没有找到组件使用位置，fallback 到检查元素自己的 static-content 属性
    // 这种情况发生在 React 组件被渲染为单个元素时（没有额外的包装元素）
    // 如果元素本身有 static-content="true"，说明使用位置确实有静态内容
    const staticContentAttr = element.getAttribute(AttributeNames.staticContent);
    if (staticContentAttr === 'true') {
      return true;
    }

    return false;
  }

  // 对于普通元素，直接检查其 static-content 属性
  const staticContentAttr = element.getAttribute(AttributeNames.staticContent);
  return staticContentAttr === 'true';
}

/**
 * 根据源信息查找元素
 * 处理 children-source="usage" 的特殊情况
 * @param sourceInfo 源信息（可能是使用位置的信息）
 * @returns 找到的元素，如果没找到则返回 null
 */
export function findElementBySourceInfo(sourceInfo: SourceInfo): HTMLElement | null {
  // 首先尝试直接查找（适用于普通元素）
  const directSelector = `[${AttributeNames.file}="${sourceInfo.fileName}"][${AttributeNames.line}="${sourceInfo.lineNumber}"][${AttributeNames.column}="${sourceInfo.columnNumber}"]`;
  const directElement = document.querySelector(directSelector) as HTMLElement;

  if (directElement) {
    return directElement;
  }

  // 如果直接查找失败，可能是因为这是一个 component-usage 的情况
  // 需要查找：
  // 1. 父元素是 file-type="component-usage"（使用位置）
  // 2. 父元素的源信息匹配 sourceInfo
  // 3. 子元素有 children-source="usage"

  // 查找所有可能的 component-usage 元素
  const usageElements = document.querySelectorAll(`[${AttributeNames.fileType}="component-usage"]`);

  for (const usageElement of Array.from(usageElements)) {
    const el = usageElement as HTMLElement;

    // 检查这个 usage 元素的源信息是否匹配
    const file = el.getAttribute(AttributeNames.file);
    const line = el.getAttribute(AttributeNames.line);
    const column = el.getAttribute(AttributeNames.column);

    if (
      file === sourceInfo.fileName &&
      line === String(sourceInfo.lineNumber) &&
      column === String(sourceInfo.columnNumber)
    ) {
      // 找到了使用位置的元素，现在查找其子元素中有 children-source="usage" 的
      const childWithUsageSource = el.querySelector(`[${AttributeNames.childrenSource}="usage"]`) as HTMLElement;

      if (childWithUsageSource) {
        return childWithUsageSource;
      }

      // 如果没找到子元素，可能元素本身就是目标（虽然这种情况不太常见）
      return el;
    }
  }

  return null;
}
