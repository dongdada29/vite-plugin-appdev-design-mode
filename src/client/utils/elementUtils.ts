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
