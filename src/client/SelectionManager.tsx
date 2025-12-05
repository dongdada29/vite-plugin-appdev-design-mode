import React, { useEffect, useCallback, useRef } from 'react';
import { useDesignMode } from './DesignModeContext';
import { ElementInfo, SourceInfo } from '../types/messages';
import { AttributeNames, isSourceMappingAttribute } from './utils/attributeNames';
import { isPureStaticText } from './utils/elementUtils';

/**
 * 元素选择管理器
 * 负责监听元素点击、提取信息、发送选中事件
 */
export class SelectionManager {
  private selectedElement: HTMLElement | null = null;
  private selectionListeners: Set<(element: HTMLElement | null) => void> = new Set();
  private hoverElement: HTMLElement | null = null;
  private isSelecting = false;
  private selectionStartTime = 0;
  private preventNextClick = false;

  constructor(
    private container: HTMLElement,
    private config: {
      enableSelection: boolean;
      enableHover: boolean;
      selectionDelay: number;
      excludeSelectors: string[];
      includeOnlyElements: boolean;
    } = {
        enableSelection: true,
        enableHover: true,
        selectionDelay: 0,
        excludeSelectors: [
          'script',
          'style',
          'meta',
          'link',
          'head',
          'title',
          'html',
          'body',
          '[data-selection-exclude="true"]',
          '.no-selection'
        ],
        includeOnlyElements: false
      }
  ) {
    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners() {
    if (!this.config.enableSelection) return;

    // 使用事件委托来处理动态元素
    this.container.addEventListener('click', this.handleClick.bind(this), true);
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this), true);

    if (this.config.enableHover) {
      this.container.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
      this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
    }

    // 键盘事件处理（仅在 enableSelection 为 true 时注册）
    if (this.config.enableSelection) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }

  /**
   * 处理鼠标点击事件
   */
  private handleClick(event: MouseEvent) {
    if (!this.config.enableSelection) return;
    if (this.preventNextClick) {
      event.preventDefault();
      event.stopPropagation();
      this.preventNextClick = false;
      return;
    }

    const target = event.target as HTMLElement;
    if (!this.isValidElement(target)) return;

    // 应用选择延迟（如果配置了）
    if (this.config.selectionDelay > 0) {
      setTimeout(() => {
        this.selectElement(target);
      }, this.config.selectionDelay);
    } else {
      this.selectElement(target);
    }
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.isValidElement(target)) return;

    this.isSelecting = true;
    this.selectionStartTime = Date.now();
    this.preventNextClick = false;
  }

  /**
   * 处理鼠标释放事件
   */
  private handleMouseUp(event: MouseEvent) {
    if (!this.isSelecting) return;

    const target = event.target as HTMLElement;
    const duration = Date.now() - this.selectionStartTime;

    // 如果是长时间按住（超过500ms），则取消选择
    if (duration > 500) {
      this.preventNextClick = true;
    }

    this.isSelecting = false;
  }

  /**
   * 处理鼠标进入事件
   */
  private handleMouseEnter(event: MouseEvent) {
    if (!this.config.enableHover) return;

    const target = event.target as HTMLElement;
    if (!this.isValidElement(target)) return;

    this.hoverElement = target;
    this.onHoverElement(target);
  }

  /**
   * 处理鼠标离开事件
   */
  private handleMouseLeave(event: MouseEvent) {
    if (!this.config.enableHover) return;

    const target = event.target as HTMLElement;
    if (this.hoverElement === target) {
      this.hoverElement = null;
      this.onHoverElement(null);
    }
  }

  /**
   * 处理键盘按键事件
   */
  private handleKeyDown(event: KeyboardEvent) {
    // ESC键取消选择
    if (event.key === 'Escape') {
      this.clearSelection();
    }

    // Ctrl/Cmd + A 全选
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      this.selectAll();
    }

    // Ctrl/Cmd + D 取消选择
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      this.clearSelection();
    }
  }

  /**
   * 处理键盘释放事件
   */
  private handleKeyUp(event: KeyboardEvent) {
    // 释放按键时的处理
  }

  /**
   * 检查元素是否有效可选择
   * 只有具有静态文本或静态 className 的元素才能被选中
   */
  private isValidElement(element: HTMLElement): boolean {
    if (!element || !element.tagName) return false;

    // Exclude context menu
    if (element.closest(`[${AttributeNames.contextMenu}="true"]`)) return false;

    // 检查是否在排除列表中
    for (const selector of this.config.excludeSelectors) {
      if (element.matches(selector) || element.closest(selector)) {
        return false;
      }
    }

    // 如果设置了只包含元素类型限制
    if (this.config.includeOnlyElements) {
      const validElements = ['DIV', 'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BUTTON', 'A'];
      if (!validElements.includes(element.tagName)) {
        return false;
      }
    }

    // 检查元素是否有源码映射信息
    if (!element.hasAttribute(AttributeNames.info)) {
      return false;
    }

    // 只有具有静态文本或静态 className 的元素才能被选中
    // 如果元素既没有 static-content 也没有 static-class 属性，则不可选中
    const hasStaticContent = element.hasAttribute(AttributeNames.staticContent);
    const hasStaticClass = element.hasAttribute(AttributeNames.staticClass);

    console.log('hasStaticContent', element, hasStaticContent);
    console.log('hasStaticClass', element, hasStaticClass);

    if (!hasStaticContent && !hasStaticClass) {
      // 该元素的内容和样式都是动态的，不可选中
      return false;
    }

    return true;
  }

  /**
   * 选择元素
   */
  private selectElement(element: HTMLElement) {
    if (this.selectedElement === element) return;

    // 清除之前的选择高亮
    if (this.selectedElement) {
      this.clearElementHighlighting(this.selectedElement);
    }

    this.selectedElement = element;

    // 添加新的选择高亮
    this.highlightElement(element);

    // 通知监听器
    this.selectionListeners.forEach(listener => listener(element));
  }

  /**
   * 清除选择
   */
  public clearSelection() {
    if (this.selectedElement) {
      this.clearElementHighlighting(this.selectedElement);
      this.selectedElement = null;
      this.selectionListeners.forEach(listener => listener(null));
    }
  }

  /**
   * 高亮显示元素
   */
  private highlightElement(element: HTMLElement) {
    // 移除之前的高亮样式
    const existingHighlight = element.getAttribute('data-selection-highlight');
    if (existingHighlight) {
      const existingStyles = JSON.parse(existingHighlight);
      Object.entries(existingStyles).forEach(([property, value]) => {
        (element.style as any)[property] = value;
      });
    }

    // 保存原始样式
    const originalStyles = {
      outline: element.style.outline,
      boxShadow: element.style.boxShadow,
      backgroundColor: element.style.backgroundColor,
      cursor: element.style.cursor
    };

    // 设置高亮样式
    element.style.outline = '2px solid #007acc';
    element.style.boxShadow = '0 0 0 2px rgba(0, 122, 204, 0.3)';
    element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
    element.style.cursor = 'pointer';

    // 保存高亮样式到元素上
    element.setAttribute('data-selection-highlight', JSON.stringify(originalStyles));
  }

  /**
   * 清除元素高亮
   */
  private clearElementHighlighting(element: HTMLElement) {
    const highlightData = element.getAttribute('data-selection-highlight');
    if (highlightData) {
      try {
        const originalStyles = JSON.parse(highlightData);
        Object.entries(originalStyles).forEach(([property, value]) => {
          (element.style as any)[property] = value;
        });
        element.removeAttribute('data-selection-highlight');
      } catch (e) {
        console.warn('[SelectionManager] Failed to restore original styles:', e);
      }
    }
  }

  /**
   * 处理悬停元素变化
   */
  private onHoverElement(element: HTMLElement | null) {
    // 可以在这里添加悬停效果的逻辑
  }

  /**
   * 全选功能
   */
  private selectAll() {
    const selectableElements = Array.from(
      this.container.querySelectorAll('*')
    ).filter(el => this.isValidElement(el as HTMLElement));

    // 暂时只选择第一个元素，后续可以扩展为多选模式
    if (selectableElements.length > 0) {
      this.selectElement(selectableElements[0] as HTMLElement);
    }
  }

  /**
   * 添加选择监听器
   */
  public addSelectionListener(listener: (element: HTMLElement | null) => void) {
    this.selectionListeners.add(listener);
    return () => this.selectionListeners.delete(listener);
  }

  /**
   * 获取当前选中的元素
   */
  public getSelectedElement(): HTMLElement | null {
    return this.selectedElement;
  }

  /**
   * 获取悬停元素
   */
  public getHoverElement(): HTMLElement | null {
    return this.hoverElement;
  }

  /**
   * 提取元素的源码信息
   */
  private extractSourceInfo(element: HTMLElement): SourceInfo | null {
    // 优先尝试从 info JSON 属性获取
    const sourceInfoStr = element.getAttribute(AttributeNames.info);
    if (sourceInfoStr) {
      try {
        const sourceInfo = JSON.parse(sourceInfoStr);
        return {
          fileName: sourceInfo.fileName,
          lineNumber: sourceInfo.lineNumber,
          columnNumber: sourceInfo.columnNumber,
          componentName: sourceInfo.componentName,
          elementType: sourceInfo.elementType,
          importPath: sourceInfo.importPath
        };
      } catch (e) {
        console.warn('[SelectionManager] Failed to parse source info:', e);
      }
    }

    // 备用方案：从个别属性获取
    const fileName = element.getAttribute(AttributeNames.file);
    const lineStr = element.getAttribute(AttributeNames.line);
    const columnStr = element.getAttribute(AttributeNames.column);
    const componentName = element.getAttribute(AttributeNames.component) || undefined;
    const importPath = element.getAttribute(AttributeNames.import) || undefined;

    if (fileName && lineStr && columnStr) {
      return {
        fileName,
        lineNumber: parseInt(lineStr, 10),
        columnNumber: parseInt(columnStr, 10),
        componentName,
        importPath
      };
    }

    return null;
  }

  /**
   * 查找组件根元素
   * 如果当前元素属于某个组件库组件（如 src/components/ui），则向上查找该组件的根元素
   */
  private findComponentRoot(element: HTMLElement): HTMLElement {
    const sourceInfo = this.extractSourceInfo(element);
    if (!sourceInfo || !sourceInfo.fileName) return element;

    // 检查是否是组件库文件
    const isLibraryComponent = sourceInfo.fileName.includes('/components/ui/') ||
      sourceInfo.fileName.includes('/components/common/'); // 可配置

    if (!isLibraryComponent) return element;

    // 向上查找，直到找到一个元素，其文件路径与当前元素不同，或者没有源码信息
    // 该元素的子元素（即当前遍历到的元素）就是组件的根
    let current = element;
    let componentRoot = element;

    while (current.parentElement) {
      const parent = current.parentElement;
      const parentSourceInfo = this.extractSourceInfo(parent);

      // 如果父元素没有源码信息，或者父元素在不同的文件中，那么当前元素就是组件根
      if (!parentSourceInfo || parentSourceInfo.fileName !== sourceInfo.fileName) {
        componentRoot = current;
        break;
      }

      current = parent;
    }

    return componentRoot;
  }

  /**
   * 提取元素的完整信息
   */
  public extractElementInfo(element: HTMLElement): ElementInfo | null {
    if (!element) return null;

    // 优先选择组件根元素
    const targetElement = this.findComponentRoot(element);
    const sourceInfo = this.extractSourceInfo(targetElement);

    if (!sourceInfo) {
      console.warn('[SelectionManager] Element has no source mapping:', targetElement);
      return null;
    }

    // 计算元素的边界框信息
    const rect = targetElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(targetElement);

    // 判断是否为静态文本
    const hasStaticContentAttr = targetElement.hasAttribute(AttributeNames.staticContent);
    const isActuallyPureText = isPureStaticText(targetElement);
    const isStaticText = hasStaticContentAttr && isActuallyPureText;

    // 判断是否为静态 className
    const isStaticClass = targetElement.hasAttribute(AttributeNames.staticClass);

    // 获取文本内容
    let textContent = '';
    if (isStaticText) {
      textContent = this.getElementTextContent(targetElement);
    } else {
      textContent = targetElement.innerText || targetElement.textContent || '';
    }

    // 提取组件层级
    const hierarchy: { tagName: string; componentName?: string; fileName?: string }[] = [];
    let current: HTMLElement | null = targetElement;
    while (current && current !== document.body) {
      const info = this.extractSourceInfo(current);
      if (info) {
        hierarchy.push({
          tagName: current.tagName.toLowerCase(),
          componentName: info.componentName,
          fileName: info.fileName
        });
      }
      current = current.parentElement;
    }

    // 提取属性（作为 props 的近似）
    const props = this.getElementAttributes(targetElement);

    return {
      tagName: targetElement.tagName.toLowerCase(),
      className: targetElement.className || '',
      textContent: textContent,
      sourceInfo,
      isStaticText: isStaticText || false,
      isStaticClass: isStaticClass, // 标记 className 是否可编辑
      componentName: sourceInfo.componentName,
      componentPath: sourceInfo.fileName,
      props,
      hierarchy
    };
  }

  /**
   * 获取元素的文本内容（递归获取所有文本）
   */
  private getElementTextContent(element: HTMLElement): string {
    // 优先使用 textContent，它包含所有文本
    let textContent = element.textContent || '';

    // 如果文本内容太长，截取前100个字符
    if (textContent.length > 100) {
      textContent = textContent.substring(0, 100) + '...';
    }

    return textContent.trim();
  }

  /**
   * 获取元素的所有属性
   */
  private getElementAttributes(element: HTMLElement): Record<string, string> {
    const attributes: Record<string, string> = {};
    const elementAttributes = Array.from(element.attributes);

    elementAttributes.forEach(attr => {
      // 过滤掉源码映射属性和选择相关的属性
      if (!isSourceMappingAttribute(attr.name) &&
        !attr.name.startsWith('data-selection-')) {
        attributes[attr.name] = attr.value;
      }
    });

    return attributes;
  }

  /**
   * 获取元素的DOM路径
   */
  private getElementDomPath(element: HTMLElement): string {
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== this.container) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }

      if (current.className) {
        const classes = Array.from(current.classList).slice(0, 3); // 只取前3个类名
        selector += `.${classes.join('.')}`;
      }

      // 计算兄弟元素索引
      const siblings = Array.from(current.parentNode?.children || []);
      const sameTagSiblings = siblings.filter(sibling =>
        sibling.tagName === current!.tagName
      );

      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current);
        selector += `:nth-of-type(${index + 1})`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    // 清除选择
    this.clearSelection();

    // 移除事件监听器
    this.container.removeEventListener('click', this.handleClick.bind(this), true);
    this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this), true);
    this.container.removeEventListener('mouseup', this.handleMouseUp.bind(this), true);
    this.container.removeEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));

    // 清除监听器
    this.selectionListeners.clear();
  }
}

/**
 * SelectionManager React Hook
 */
export const useSelectionManager = (config?: {
  enableSelection?: boolean;
  enableHover?: boolean;
  selectionDelay?: number;
  excludeSelectors?: string[];
  includeOnlyElements?: boolean;
}) => {
  const selectionManagerRef = useRef<SelectionManager | null>(null);
  const { selectElement, config: designModeConfig } = useDesignMode();

  useEffect(() => {
    const container = document.body; // 或者可以传入特定的容器
    selectionManagerRef.current = new SelectionManager(container, {
      enableSelection: designModeConfig.iframeMode?.enableSelection ?? true,
      enableHover: true,
      selectionDelay: 0,
      excludeSelectors: [
        'script', 'style', 'meta', 'link', 'head', 'title', 'html', 'body',
        '[data-selection-exclude="true"]', '.no-selection'
      ],
      includeOnlyElements: false,
      ...config
    });

    // 监听选择变化并调用DesignModeContext的selectElement
    const unsubscribe = selectionManagerRef.current.addSelectionListener((element) => {
      if (element && designModeConfig.iframeMode?.enabled) {
        // 提取元素信息并发送到父窗口
        const elementInfo = selectionManagerRef.current?.extractElementInfo(element);
        if (elementInfo) {
          selectElement(element);
        }
      } else if (!element) {
        selectElement(null);
      }
    });

    return () => {
      unsubscribe();
      selectionManagerRef.current?.destroy();
      selectionManagerRef.current = null;
    };
  }, [selectElement, designModeConfig]);

  return {
    selectionManager: selectionManagerRef.current
  };
};

export default SelectionManager;
