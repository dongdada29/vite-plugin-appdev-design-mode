import { SourceInfo } from '../../types/messages';
import { AttributeNames } from './attributeNames';
import { extractSourceInfo } from './sourceInfo';

/**
 * 获取元素的完整组件嵌套路径（用于判断嵌套关系）
 * 返回从根到当前元素的完整组件嵌套路径，格式：file1:component1 > file2:component2 > ...
 * 这样可以区分不同嵌套层级中的相同元素
 * 
 * 改进：包含页面组件（page-content）的上下文，以便更好地区分不同位置的相同组件
 */
function getComponentNestingPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;
  const maxDepth = 20; // 限制遍历深度，避免无限循环
  let depth = 0;
  let lastPageContext: string | null = null;

  // 向上遍历 DOM 树，收集所有组件上下文
  while (current && depth < maxDepth) {
    const fileType = current.getAttribute(AttributeNames.fileType);
    const component = current.getAttribute(AttributeNames.component);
    const fileName = current.getAttribute(AttributeNames.file);
    const elementId = current.getAttribute(AttributeNames.elementId);

    // 如果找到页面内容（page-content），记录页面上下文
    // 这对于区分列表中的不同项很重要
    if (fileType === 'page-content' && component && fileName) {
      const pageContext = `${fileName}:${component}`;
      // 只记录最近的页面上下文
      if (!lastPageContext) {
        lastPageContext = pageContext;
      }
    }

    // 如果找到组件定义文件中的元素，添加到路径
    if (fileType === 'component-definition' && component && fileName) {
      const context = `${fileName}:${component}`;
      // 避免重复添加相同的上下文
      if (path.length === 0 || path[path.length - 1] !== context) {
        path.unshift(context);
      }
    }

    // 如果找到组件使用的地方，也添加到路径
    if (fileType === 'component-usage' && component && fileName) {
      const context = `${fileName}:${component}`;
      // 避免重复添加相同的上下文
      if (path.length === 0 || path[path.length - 1] !== context) {
        path.unshift(context);
      }
    }

    current = current.parentElement;
    depth++;
  }

  // 如果有页面上下文，添加到路径的开头
  // 这样可以更好地区分不同位置的相同组件（例如列表中的不同项）
  if (lastPageContext && (path.length === 0 || path[0] !== lastPageContext)) {
    path.unshift(lastPageContext);
  }

  return path.join(' > ');
}

/**
 * 获取元素的组件上下文（用于判断嵌套关系）
 * 返回最近的组件定义文件的路径和组件名称（向后兼容）
 */
function getComponentContext(element: HTMLElement): string | null {
  const path = getComponentNestingPath(element);
  if (!path) return null;

  // 返回路径中的最后一个组件（最近的组件上下文）
  const parts = path.split(' > ');
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

/**
 * 严格查找所有具有相同源信息的元素
 * 考虑源文件、组件上下文和嵌套关系
 * @param element - 要查找相同元素的参考元素
 * @param sourceInfo - 源代码信息（可选）
 * @returns 匹配的元素数组
 */
export function findAllElementsWithSameSource(
  element: HTMLElement,
  sourceInfo?: SourceInfo
): HTMLElement[] {
  // 提取参考元素的完整源码信息
  const referenceSourceInfo = sourceInfo || extractSourceInfo(element);
  if (!referenceSourceInfo) {
    console.warn('[elementMatching] Element missing source info:', element);
    return [element]; // 如果没有源码信息，只返回当前元素
  }

  // 获取参考元素的完整信息（从 info 属性）
  const referenceInfoStr = element.getAttribute(AttributeNames.info);
  let referenceInfo: any = null;
  if (referenceInfoStr) {
    try {
      referenceInfo = JSON.parse(referenceInfoStr);
    } catch (e) {
      console.warn('[elementMatching] Failed to parse element info:', e);
    }
  }

  // 获取参考元素的文件类型和组件信息
  const referenceFileType = element.getAttribute(AttributeNames.fileType);
  const referenceComponent = referenceInfo?.componentName || element.getAttribute(AttributeNames.component);
  const referenceFunction = referenceInfo?.functionName || element.getAttribute(AttributeNames.function);

  // 获取参考元素的 element-id（用于精确匹配）
  const elementId = element.getAttribute(AttributeNames.elementId);

  if (!elementId) {
    console.warn('[elementMatching] Element missing element-id attribute:', element);
    return [element]; // 如果没有 element-id，只返回当前元素
  }

  // 获取参考元素的完整组件嵌套路径（关键改进：考虑完整的嵌套层级）
  const referenceNestingPath = getComponentNestingPath(element);

  // 获取参考元素的 static-content 属性值（关键：只有相同 static-content 的元素才能一起更新）
  const referenceStaticContent = element.getAttribute(AttributeNames.staticContent);

  // 查找所有具有相同 element-id 的元素
  const allElementsWithId = Array.from(
    document.querySelectorAll(`[${AttributeNames.elementId}]`)
  ) as HTMLElement[];

  // 严格过滤：必须满足以下所有条件
  const matchedElements = allElementsWithId.filter(el => {
    // 1. element-id 必须完全相同（但不能仅依赖这个）
    const elId = el.getAttribute(AttributeNames.elementId);
    if (elId !== elementId) return false;

    // 2. 源文件必须相同
    const elSourceInfo = extractSourceInfo(el);
    if (!elSourceInfo || elSourceInfo.fileName !== referenceSourceInfo.fileName) {
      return false;
    }

    // 3. 文件类型必须相同（确保不会跨组件定义和页面文件匹配）
    const elFileType = el.getAttribute(AttributeNames.fileType);
    if (elFileType !== referenceFileType) {
      return false;
    }

    // 4. 如果在组件内，组件上下文必须相同
    if (referenceComponent) {
      const elInfoStr = el.getAttribute(AttributeNames.info);
      let elInfo: any = null;
      if (elInfoStr) {
        try {
          elInfo = JSON.parse(elInfoStr);
        } catch (e) {
          // 忽略解析错误
        }
      }
      const elComponent = elInfo?.componentName || el.getAttribute(AttributeNames.component);
      const elFunction = elInfo?.functionName || el.getAttribute(AttributeNames.function);

      // 组件名称必须匹配
      if (elComponent !== referenceComponent) {
        return false;
      }

      // 函数名称也应该匹配（更严格的检查）
      if (referenceFunction && elFunction !== referenceFunction) {
        return false;
      }
    }

    // 5. 关键改进：检查完整的组件嵌套路径，而不仅仅是最近的组件上下文
    // 这样可以区分不同嵌套层级中的相同元素（例如列表中的不同项）
    const elNestingPath = getComponentNestingPath(el);

    // 嵌套路径必须完全匹配
    if (referenceNestingPath !== elNestingPath) {
      return false;
    }

    // 6. static-content check removed to allow style updates to propagate to all instances
    // Content updates should handle filtering separately if needed

    return true;
  });

  return matchedElements;
}

