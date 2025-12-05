import { SourceInfo } from '../../types/messages';
import { AttributeNames } from './attributeNames';

/**
 * 检查元素是否有源码映射
 * @param element HTML元素
 * @returns 是否有源码映射
 */
/**
 * 检查元素是否有源码映射
 * @param element HTML元素
 * @returns 是否有源码映射
 */
export function hasSourceMapping(element: HTMLElement): boolean {
  return element.hasAttribute(AttributeNames.info);
}

/**
 * 从元素中提取源码信息
 * @param element HTML元素
 * @returns 源码信息对象，如果没有则返回null
 */
export function extractSourceInfo(element: HTMLElement): SourceInfo | null {
  // 尝试从 info 属性（JSON格式）获取完整信息
  const sourceInfoStr = element.getAttribute(AttributeNames.info);
  if (sourceInfoStr) {
    try {
      return JSON.parse(sourceInfoStr) as SourceInfo;
    } catch (e) {
      console.warn(`[sourceInfo] Failed to parse ${AttributeNames.info}:`, e);
    }
  }

  return null;
}
