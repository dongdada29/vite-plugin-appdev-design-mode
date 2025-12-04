import { SourceInfo } from '../../types/messages';
import { AttributeNames } from './attributeNames';

/**
 * 检查元素是否有源码映射
 * @param element HTML元素
 * @returns 是否有源码映射
 */
export function hasSourceMapping(element: HTMLElement): boolean {
  return !!(
    element.getAttribute(AttributeNames.file) ||
    element.getAttribute(AttributeNames.info)
  );
}

/**
 * 查找最近的组件使用位置的源码信息
 * 当组件定义文件中的元素接收 children 作为 props 时，需要找到使用位置的源码信息
 * @param element HTML元素
 * @returns 组件使用位置的源码信息，如果没有则返回null
 */
function findComponentUsageSourceInfo(element: HTMLElement): SourceInfo | null {
  // 向上遍历 DOM 树，查找最近的组件使用位置
  let current: HTMLElement | null = element.parentElement;
  const maxDepth = 20; // 限制遍历深度
  let depth = 0;

  while (current && depth < maxDepth) {
    const fileType = current.getAttribute(AttributeNames.fileType);

    // 如果找到组件使用位置（component-usage），提取其源码信息
    if (fileType === 'component-usage') {
      const sourceInfoStr = current.getAttribute(AttributeNames.info);
      if (sourceInfoStr) {
        try {
          const sourceInfo = JSON.parse(sourceInfoStr);
          return {
            fileName: sourceInfo.fileName,
            lineNumber: sourceInfo.lineNumber,
            columnNumber: sourceInfo.columnNumber,
          };
        } catch (e) {
          console.warn(`[sourceInfo] Failed to parse component usage source info:`, e);
        }
      }

      // 降级方案：从单独属性提取
      const fileName = current.getAttribute(AttributeNames.file);
      const lineStr = current.getAttribute(AttributeNames.line);
      const columnStr = current.getAttribute(AttributeNames.column);

      if (fileName && lineStr) {
        const result = {
          fileName,
          lineNumber: parseInt(lineStr, 10),
          columnNumber: columnStr ? parseInt(columnStr, 10) : 0,
        };
        return result;
      }
    }

    current = current.parentElement;
    depth++;
  }

  return null;
}

/**
 * 从元素中提取源码信息
 * 如果元素在组件定义文件中且接收 children 作为 props，会查找组件使用位置的源码信息
 * @param element HTML元素
 * @returns 源码信息对象，如果没有则返回null
 */
export function extractSourceInfo(element: HTMLElement): SourceInfo | null {
  // 检查元素是否在组件定义文件中，且接收 children 作为 props
  const childrenSource = element.getAttribute(AttributeNames.childrenSource);
  const fileType = element.getAttribute(AttributeNames.fileType);

  // 如果元素标记为 children-source="usage"，且是组件定义文件中的元素
  // 则尝试查找组件使用位置的源码信息
  if (childrenSource === 'usage' && fileType === 'component-definition') {
    const usageSourceInfo = findComponentUsageSourceInfo(element);
    if (usageSourceInfo) {
      return usageSourceInfo;
    }
  }

  // 优先尝试从 info 属性（JSON格式）获取完整信息
  const sourceInfoStr = element.getAttribute(AttributeNames.info);
  if (sourceInfoStr) {
    try {
      return JSON.parse(sourceInfoStr) as SourceInfo;
    } catch (e) {
      console.warn(`[sourceInfo] Failed to parse ${AttributeNames.info}:`, e);
    }
  }

  // 降级方案：尝试从单独的属性提取
  const fileName = element.getAttribute(AttributeNames.file);
  const lineStr = element.getAttribute(AttributeNames.line);
  const columnStr = element.getAttribute(AttributeNames.column);

  if (fileName && lineStr) {
    return {
      fileName,
      lineNumber: parseInt(lineStr, 10),
      columnNumber: columnStr ? parseInt(columnStr, 10) : 0,
    };
  }

  return null;
}
