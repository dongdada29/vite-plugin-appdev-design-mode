import { SourceInfo } from "../../types/messages";
import { AttributeNames } from "./attributeNames";

/**
 * 检查元素是否有源码映射
 * @param element HTML元素
 * @returns 是否有源码映射
 */
export function hasSourceMapping(element: HTMLElement): boolean {
  return !!(
    element.getAttribute("data-react-inspector") ||
    element.getAttribute(AttributeNames.info)
  );
}

/**
 * 从元素中提取源码信息
 * @param element HTML元素
 * @returns 源码信息对象，如果没有则返回null
 */
export function extractSourceInfo(element: HTMLElement): SourceInfo | null {
  // 优先尝试从 info 属性（JSON格式）获取完整信息
  const sourceInfoStr = element.getAttribute(AttributeNames.info);
  if (sourceInfoStr) {
    try {
      return JSON.parse(sourceInfoStr) as SourceInfo;
    } catch (e) {
      console.warn(`[sourceInfo] Failed to parse ${AttributeNames.info}:`, e);
    }
  }

  // 尝试从 vite-plugin-react-inspector 的 data-react-inspector 属性提取
  // 格式: "/path/to/file.tsx:line:column"
  const inspectorValue = element.getAttribute("data-react-inspector");
  if (inspectorValue) {
    // 解析格式: path:line:column
    // 使用正则表达式匹配最后一个冒号分隔的数字（列号）
    // 格式可能是: /path/to/file.tsx:line:column 或 relative/path.tsx:line
    const parts = inspectorValue.split(":");

    if (parts.length >= 2) {
      // 提取列号（最后一部分）
      const columnPart = parts.pop();
      const linePart = parts.pop();

      if (linePart) {
        const fileName = parts.join(":"); // 重新组合剩余部分作为文件路径
        const lineNumber = parseInt(linePart, 10);
        const columnNumber = columnPart ? parseInt(columnPart, 10) : 0;

        // Construct a basic elementId if not present
        // Format: fileName:line:column
        const elementId = `${fileName}:${lineNumber}:${columnNumber}`;

        return {
          fileName,
          lineNumber,
          columnNumber,
          elementId,
          elementType: element.tagName.toLowerCase(),
        };
      }
    }
  }

  return null;
}
