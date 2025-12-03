import { AttributeNames } from './attributeNames';
import { SourceInfo, ElementInfo } from '../../types/messages';
import { isPureStaticText } from './elementUtils';

/**
 * DOM Utility functions for Design Mode
 */

/**
 * Find an element by its source info
 */
export function findElementBySourceInfo(sourceInfo: SourceInfo): HTMLElement | null {
    const selector = `[${AttributeNames.file}="${sourceInfo.fileName}"][${AttributeNames.line}="${sourceInfo.lineNumber}"][${AttributeNames.column}="${sourceInfo.columnNumber}"]`;
    return document.querySelector(selector) as HTMLElement;
}

/**
 * Find all elements that share the same source (e.g., list items)
 * Uses element-id attribute for identification
 */
export function findAllElementsWithSameSource(element: HTMLElement): HTMLElement[] {
    const elementId = element.getAttribute(AttributeNames.elementId);

    if (!elementId) {
        return [element];
    }

    const allElementsWithId = Array.from(
        document.querySelectorAll(`[${AttributeNames.elementId}]`)
    ) as HTMLElement[];

    return allElementsWithId.filter(el => {
        const elId = el.getAttribute(AttributeNames.elementId);
        return elId === elementId;
    });
}

/**
 * Extract source info from an element
 */
export function extractSourceInfo(element: HTMLElement): SourceInfo | null {
    // Try to get from info attribute first
    const sourceInfoStr = element.getAttribute(AttributeNames.info);
    if (sourceInfoStr) {
        try {
            const sourceInfo = JSON.parse(sourceInfoStr);
            return {
                fileName: sourceInfo.fileName,
                lineNumber: sourceInfo.lineNumber,
                columnNumber: sourceInfo.columnNumber
            };
        } catch (e) {
            console.warn('[domUtils] Failed to parse source info:', e);
        }
    }

    // Fallback to individual attributes
    const fileName = element.getAttribute(AttributeNames.file);
    const lineStr = element.getAttribute(AttributeNames.line);
    const columnStr = element.getAttribute(AttributeNames.column);

    if (fileName && lineStr && columnStr) {
        return {
            fileName,
            lineNumber: parseInt(lineStr, 10),
            columnNumber: parseInt(columnStr, 10)
        };
    }

    return null;
}

/**
 * Extract detailed element info
 */
export function extractElementInfo(element: HTMLElement): ElementInfo | null {
    if (!element) return null;

    const sourceInfo = extractSourceInfo(element);
    if (!sourceInfo) {
        return null;
    }

    const hasStaticContentAttr = element.hasAttribute(AttributeNames.staticContent);
    const isActuallyPureText = isPureStaticText(element);
    const isStaticText = hasStaticContentAttr && isActuallyPureText;

    let textContent = '';
    if (isStaticText) {
        textContent = element.textContent || element.innerText || '';
        if (textContent.length > 100) {
            textContent = textContent.substring(0, 100) + '...';
        }
    } else {
        textContent = element.innerText || element.textContent || '';
    }

    return {
        tagName: element.tagName.toLowerCase(),
        className: element.className || '',
        textContent: textContent.trim(),
        sourceInfo,
        isStaticText: isStaticText || false,
    };
}

/**
 * Highlight an element
 */
export function highlightElement(element: HTMLElement): void {
    // Remove existing highlight if any
    const existingHighlight = element.getAttribute('data-selection-highlight');
    if (existingHighlight) {
        clearElementHighlighting(element);
    }

    // Save original styles
    const originalStyles = {
        outline: element.style.outline,
        boxShadow: element.style.boxShadow,
        backgroundColor: element.style.backgroundColor,
        cursor: element.style.cursor
    };

    // Apply highlight styles
    element.style.outline = '2px solid #007acc';
    element.style.boxShadow = '0 0 0 2px rgba(0, 122, 204, 0.3)';
    element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
    element.style.cursor = 'pointer';

    // Save original styles to attribute
    element.setAttribute('data-selection-highlight', JSON.stringify(originalStyles));
}

/**
 * Clear element highlight
 */
export function clearElementHighlighting(element: HTMLElement): void {
    const highlightData = element.getAttribute('data-selection-highlight');
    if (highlightData) {
        try {
            const originalStyles = JSON.parse(highlightData);
            Object.entries(originalStyles).forEach(([property, value]) => {
                (element.style as any)[property] = value;
            });
            element.removeAttribute('data-selection-highlight');
        } catch (e) {
            console.warn('[domUtils] Failed to restore original styles:', e);
        }
    }
}

/**
 * Check if element is valid for selection
 */
export function isValidElement(element: HTMLElement, excludeSelectors: string[] = []): boolean {
    if (!element || !element.tagName) return false;

    if (element.closest('[data-context-menu="true"]')) return false;

    for (const selector of excludeSelectors) {
        if (element.matches(selector) || element.closest(selector)) {
            return false;
        }
    }

    return true;
}
