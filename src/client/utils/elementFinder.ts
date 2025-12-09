import { extractSourceInfo } from "./sourceInfo";

/**
 * 查找元素的源码映射（向上查找祖先元素）
 */
export const findElementWithSourceMapping = (
  element: HTMLElement,
): HTMLElement | null => {
  let current: HTMLElement | null = element;
  const maxDepth = 10; // 限制查找深度，避免无限循环
  let depth = 0;

  while (current && current !== document.body && depth < maxDepth) {
    // 检查是否有源码映射信息
    if (extractSourceInfo(current)) {
      return current;
    }
    current = current.parentElement;
    depth++;
  }

  return null;
};
