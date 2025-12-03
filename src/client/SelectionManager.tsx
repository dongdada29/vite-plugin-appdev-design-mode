import React, { useEffect, useCallback, useRef } from 'react';
import { useDesignMode } from './DesignModeContext';
import { ElementInfo, SourceInfo } from '../types/messages';
import { AttributeNames, isSourceMappingAttribute } from './utils/attributeNames';
import {
  highlightElement,
  clearElementHighlighting,
  extractElementInfo,
  isValidElement
} from './utils/domUtils';

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

    // 键盘事件处理
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
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
    if (!this.checkIsValidElement(target)) return;

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
    if (!this.checkIsValidElement(target)) return;

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
    if (!this.checkIsValidElement(target)) return;

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
   */
  private checkIsValidElement(element: HTMLElement): boolean {
    if (!isValidElement(element, this.config.excludeSelectors)) {
      return false;
    }

    // 如果设置了只包含元素类型限制
    if (this.config.includeOnlyElements) {
      const validElements = ['DIV', 'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BUTTON', 'A'];
      return validElements.includes(element.tagName);
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
      clearElementHighlighting(this.selectedElement);
    }

    this.selectedElement = element;

    // 添加新的选择高亮
    highlightElement(element);

    // 通知监听器
    this.selectionListeners.forEach(listener => listener(element));

    console.log('[SelectionManager] Element selected:', element);
  }

  /**
   * 清除选择
   */
  public clearSelection() {
    if (this.selectedElement) {
      clearElementHighlighting(this.selectedElement);
      this.selectedElement = null;
      this.selectionListeners.forEach(listener => listener(null));
      console.log('[SelectionManager] Selection cleared');
    }
  }

  /**
   * 处理悬停元素变化
   */
  private onHoverElement(element: HTMLElement | null) {
    // 可以在这里添加悬停效果的逻辑
    console.log('[SelectionManager] Hover element:', element);
  }

  /**
   * 全选功能
   */
  private selectAll() {
    const selectableElements = Array.from(
      this.container.querySelectorAll('*')
    ).filter(el => this.checkIsValidElement(el as HTMLElement));

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
   * 提取元素的完整信息 (Delegates to domUtils)
   */
  public extractElementInfo(element: HTMLElement): ElementInfo | null {
    return extractElementInfo(element);
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
