import { SourceInfo } from '../../types/messages';
import { AttributeNames } from './attributeNames';
import { extractSourceInfo } from './sourceInfo';

/**
 * 解析元素的正确源代码位置
 * 
 * 对于pass-through组件（有static-content属性的元素），需要找到使用位置而不是组件定义位置
 * 
 * 规则：
 * 1. 如果元素有static-content属性，说明它的内容是静态的，来自使用位置
 * 2. 我们需要向上查找父元素，找到第一个：
 *    - 没有static-content属性的元素（说明它是组件使用位置）
 *    - 或者文件路径与当前元素不同的元素（说明跨越了组件边界）
 * 
 * @param element 要解析源位置的元素
 * @returns 正确的源代码信息，如果无法确定则返回null
 */
export function resolveSourceInfo(element: HTMLElement): SourceInfo | null {
    const hasStaticContent = element.hasAttribute(AttributeNames.staticContent);

    // 优先检查 children-source 属性
    // 这个属性记录了静态文本children的真实来源位置
    // 尝试多种可能的前缀，以防配置不一致
    const candidates = [
        'data-xagi-children-source',
        'data-source-children-source',
        AttributeNames.childrenSource
    ];

    let childrenSource: string | null = null;
    for (const attr of candidates) {
        const val = element.getAttribute(attr);
        if (val) {
            childrenSource = val;
            break;
        }
    }

    if (childrenSource) {
        // 解析 children-source: "fileName:line:column"
        const parts = childrenSource.split(':');
        if (parts.length >= 3) {
            const fileName = parts.slice(0, -2).join(':'); // 支持文件路径中包含冒号
            const lineNumber = parseInt(parts[parts.length - 2], 10);
            const columnNumber = parseInt(parts[parts.length - 1], 10);

            if (!isNaN(lineNumber) && !isNaN(columnNumber)) {
                return {
                    fileName,
                    lineNumber,
                    columnNumber,
                    elementType: element.tagName?.toLowerCase() || 'unknown',
                    componentName: element.getAttribute(AttributeNames.component) || undefined,
                    functionName: element.getAttribute(AttributeNames.function) || undefined
                };
            }
        }
    }

    if (!hasStaticContent) {
        // 如果没有static-content属性，直接使用元素自己的源信息
        return extractSourceInfo(element);
    }

    // 有static-content属性，说明这是组件内部的元素，需要找到使用位置
    const currentFile = element.getAttribute(AttributeNames.file);
    let currentElement: HTMLElement | null = element;
    let depth = 0;

    // 向上遍历DOM树查找使用位置
    while (currentElement && depth < 20) { // Add depth limit to prevent infinite loops
        const parent: HTMLElement | null = currentElement.parentElement;
        if (!parent) {
            break;
        }

        const parentFile = parent.getAttribute(AttributeNames.file);
        const parentHasStaticContent = parent.hasAttribute(AttributeNames.staticContent);

        // 检查是否找到了使用位置：
        // 1. 父元素有源映射信息
        // 2. 并且满足以下任一条件：
        //    a) 父元素没有static-content属性（说明是组件使用位置）
        //    b) 父元素的文件与当前文件不同（跨越了组件边界）
        if (parentFile && (!parentHasStaticContent || parentFile !== currentFile)) {
            // 找到了使用位置，返回父元素的源信息
            return extractSourceInfo(parent);
        }

        currentElement = parent;
        depth++;
    }

    // 如果没有找到合适的父元素，返回元素自己的源信息（降级方案）
    return extractSourceInfo(element);
}

/**
 * 检查元素是否在组件定义中（而不是使用位置）
 * @param element 要检查的元素
 * @returns 如果元素在组件定义中返回true
 */
export function isInComponentDefinition(element: HTMLElement): boolean {
    const hasStaticContent = element.hasAttribute(AttributeNames.staticContent);
    const sourceFile = element.getAttribute(AttributeNames.file);

    if (!hasStaticContent || !sourceFile) {
        return false;
    }

    // 检查父元素
    const parent = element.parentElement;
    if (!parent) {
        return false;
    }

    const parentFile = parent.getAttribute(AttributeNames.file);
    const parentHasStaticContent = parent.hasAttribute(AttributeNames.staticContent);

    // 如果父元素也有static-content且文件相同，说明在组件定义内部
    return parentHasStaticContent && parentFile === sourceFile;
}
