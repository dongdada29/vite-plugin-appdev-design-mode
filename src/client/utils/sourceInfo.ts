import { SourceInfo } from '../../types/messages';

/**
 * 检查元素是否有源码映射
 * @param element HTML元素
 * @returns 是否有源码映射
 */
export function hasSourceMapping(element: HTMLElement): boolean {
  return !!(
    element.getAttribute('data-source-file') ||
    element.getAttribute('data-source-info')
  );
}

/**
 * 从元素中提取源码信息
 * @param element HTML元素
 * @returns 源码信息对象，如果没有则返回null
 */
export function extractSourceInfo(element: HTMLElement): SourceInfo | null {
  // Try to extract from data-source-info attribute
  const sourceInfoStr = element.getAttribute('data-source-info');
  if (sourceInfoStr) {
    try {
      return JSON.parse(sourceInfoStr) as SourceInfo;
    } catch (e) {
      console.warn('[sourceInfo] Failed to parse data-source-info:', e);
    }
  }

  // Fallback: try to extract from individual attributes
  const fileName = element.getAttribute('data-source-file');
  const lineStr = element.getAttribute('data-source-line');
  const columnStr = element.getAttribute('data-source-column');

  if (fileName && lineStr) {
    return {
      fileName,
      lineNumber: parseInt(lineStr, 10),
      columnNumber: columnStr ? parseInt(columnStr, 10) : 0,
    };
  }

  return null;
}
