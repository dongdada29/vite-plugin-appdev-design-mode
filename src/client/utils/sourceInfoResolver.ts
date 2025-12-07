import { SourceInfo } from '../../types/messages';
import { AttributeNames } from './attributeNames';
import { extractSourceInfo } from './sourceInfo';

/**
 * 解析元素的正确源代码位置
 * 
 * 向上遍历DOM树，直到找到带有源码映射信息的元素
 * 
 * @param element 要解析源位置的元素
 * @returns 正确的源代码信息，如果无法确定则返回null
 */
export function resolveSourceInfo(element: HTMLElement): SourceInfo | null {
    let currentElement: HTMLElement | null = element;
    let depth = 0;

    // 向上遍历DOM树查找带有源码信息的元素
    while (currentElement && depth < 20) {
        const sourceInfo = extractSourceInfo(currentElement);
        if (sourceInfo) {
            return sourceInfo;
        }

        currentElement = currentElement.parentElement;
        depth++;
    }

    return null;
}

/**
 * 检查元素是否在组件定义中（而不是使用位置）
 * @param element 要检查的元素
 * @returns 如果元素在组件定义中返回true
 */
export function isInComponentDefinition(element: HTMLElement): boolean {
    // With vite-plugin-react-inspector, we don't have enough info to distinguish
    // definition vs usage easily without extra metadata.
    // For now, assume false or implement heuristic if needed.
    return false;
}
