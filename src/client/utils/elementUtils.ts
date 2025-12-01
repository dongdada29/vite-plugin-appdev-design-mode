/**
 * 检查元素是否只包含纯静态文本（没有子元素）
 * @param element HTML元素
 * @returns 是否为纯静态文本
 */
export function isPureStaticText(element: HTMLElement): boolean {
  return element.children.length === 0;
}
