import React, { useCallback, useRef, useState } from 'react';
import { useDesignMode } from './DesignModeContext';
import { SourceInfo, ElementInfo } from '../types/messages';
import { extractSourceInfo, hasSourceMapping } from './utils/sourceInfo';
import { isPureStaticText } from './utils/elementUtils';
import { showContextMenu, closeContextMenu, MenuItem } from './ui/ContextMenu';

/**
 * 更新操作类型
 */
export type UpdateOperation =
  | 'style_update'
  | 'content_update'
  | 'attribute_update'
  | 'class_update'
  | 'batch_update';

/**
 * 更新状态
 */
export interface UpdateState {
  id: string;
  operation: UpdateOperation;
  sourceInfo: SourceInfo;
  element: HTMLElement;
  oldValue: string;
  newValue: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reverted';
  timestamp: number;
  error?: string;
  retryCount: number;
}

/**
 * 更新结果
 */
export interface UpdateResult {
  success: boolean;
  element: HTMLElement;
  updateId: string;
  error?: string;
  serverResponse?: any;
}

/**
 * 批量更新项
 */
export interface BatchUpdateItem {
  element: HTMLElement;
  type: 'style' | 'content' | 'attribute';
  sourceInfo: SourceInfo;
  newValue: string;
  originalValue?: string;
  selector?: string;
}

/**
 * 更新管理器配置
 */
export interface UpdateManagerConfig {
  enableDirectEdit: boolean;
  enableBatching: boolean;
  batchDebounceMs: number;
  maxRetries: number;
  autoSave: boolean;
  saveDelay: number;
  validation: {
    validateSource: boolean;
    validateValue: boolean;
    maxLength: number;
  };
}

/**
 * 更新管理器
 * 负责处理所有类型的更新操作，包括样式、内容、属性的修改
 */
export class UpdateManager {
  private updateQueue: UpdateState[] = [];
  private processingUpdates = new Set<string>();
  private updateHistory: UpdateState[] = [];
  private callbacks: Map<UpdateOperation, Set<(update: UpdateState) => void>> =
    new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private saveTimer: NodeJS.Timeout | null = null;
  private observer: MutationObserver | null = null;

  // Design mode state
  private isDesignMode: boolean = false;
  private selectedElement: HTMLElement | null = null;

  constructor(
    private config: UpdateManagerConfig = {
      enableDirectEdit: true,
      enableBatching: true,
      batchDebounceMs: 300,
      maxRetries: 3,
      autoSave: true,
      saveDelay: 1000,
      validation: {
        validateSource: true,
        validateValue: true,
        maxLength: 10000,
      },
    }
  ) {
    this.initializeObserver();
    this.initializeEventListeners();
  }

  /**
   * 初始化DOM变化观察器
   */
  private initializeObserver() {
    if (!this.config.enableDirectEdit) return;

    this.observer = new MutationObserver(mutations => {
      // 处理直接编辑的DOM变化
      mutations.forEach(mutation => {
        // Check if the mutation should be ignored
        const targetNode = mutation.target;
        const targetElement = targetNode.nodeType === Node.ELEMENT_NODE
          ? targetNode as HTMLElement
          : targetNode.parentElement;

        if (targetElement && targetElement.hasAttribute('data-ignore-mutation')) {
          console.log('[UpdateManager] Ignoring mutation due to data-ignore-mutation', {
            type: mutation.type,
            target: targetElement
          });
          return;
        }

        if (mutation.type === 'childList') {
          // 处理元素添加/删除
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.setupElementEditHandlers(node as HTMLElement);
            }
          });
        } else if (mutation.type === 'characterData') {
          // 处理文本内容变化
          const target = mutation.target.parentElement as HTMLElement;
          if (target && hasSourceMapping(target)) {
            // Double check ignore attribute for text node parent
            if (target.hasAttribute('data-ignore-mutation')) {
                console.log('[UpdateManager] Ignoring characterData mutation', target);
                return;
            }
            console.log('[UpdateManager] Processing characterData mutation', target);
            this.handleDirectEdit(target, 'content');
          }
        } else if (mutation.type === 'attributes') {
          // 处理属性变化（样式、class等）
          const target = mutation.target as HTMLElement;
          if (target && hasSourceMapping(target)) {
            const attributeName = mutation.attributeName;
            const newValue = target.getAttribute(attributeName!);
            const oldValue = mutation.oldValue;

            if (newValue === oldValue) {
                console.log('[UpdateManager] Ignoring attribute mutation with same value', { attributeName, value: newValue });
                return;
            }

            if (attributeName === 'class') {
              console.log('[UpdateManager] Processing class mutation', {
                target,
                oldValue,
                newValue,
                diff: oldValue !== newValue
              });
              this.handleDirectEdit(target, 'style');
            } else if (attributeName?.startsWith('style')) {
              console.log('[UpdateManager] Processing style mutation', {
                target,
                oldValue,
                newValue
              });
              this.handleDirectEdit(target, 'style');
            }
          }
        }
      });
    });

    // 开始观察DOM变化
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class', 'style'],
    });
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners() {
    if (!this.config.enableDirectEdit) return;

    // 双击编辑
    document.addEventListener('dblclick', this.handleDblClick.bind(this));

    // 右键菜单
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this));

    // 键盘快捷键
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }



  /**
   * 处理双击事件
   */
  private handleDblClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!hasSourceMapping(target)) return;

    // 防止默认行为
    event.preventDefault();
    event.stopPropagation();

    // Check if it's pure static text
    if (!isPureStaticText(target)) {
      console.log('[UpdateManager] Ignored dblclick on non-static text element');
      return;
    }

    // 进入编辑模式
    this.enterEditMode(target, 'content');
  }

  /**
   * 处理右键菜单
   */
  private handleContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Only show context menu if design mode is enabled
    if (!this.isDesignMode) return;

    // Only show context menu if the target is the currently selected element
    if (!this.selectedElement || target !== this.selectedElement) return;

    if (!hasSourceMapping(target)) return;

    event.preventDefault();

    // 显示自定义上下文菜单或触发编辑
    this.showContextMenu(target, event.clientX, event.clientY);
  }

  /**
   * Update design mode state
   */
  public setDesignModeState(isDesignMode: boolean, selectedElement: HTMLElement | null = null) {
    this.isDesignMode = isDesignMode;
    this.selectedElement = selectedElement;
  }


  /**
   * 处理键盘按键
   */
  private handleKeyDown(event: KeyboardEvent) {
    // F2键进入编辑模式
    if (event.key === 'F2') {
      const selectedElement = document.activeElement as HTMLElement;
      if (selectedElement && hasSourceMapping(selectedElement)) {
        event.preventDefault();
        if (isPureStaticText(selectedElement)) {
          this.enterEditMode(selectedElement, 'content');
        } else {
          console.log('[UpdateManager] Cannot edit non-static text element');
        }
      }
    }

    // Ctrl/Cmd+S 保存所有更改
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveAllChanges();
    }

    // Ctrl/Cmd+Z 撤销操作
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === 'z' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      this.undoLastUpdate();
    }

    // Ctrl/Cmd+Y 或 Ctrl/Cmd+Shift+Z 重做操作
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'y' || (event.key === 'z' && event.shiftKey))
    ) {
      event.preventDefault();
      this.redoLastUpdate();
    }
  }

  /**
   * 设置元素的编辑处理器
   */
  private setupElementEditHandlers(element: HTMLElement) {
    if (!hasSourceMapping(element)) return;

    // 为元素添加可编辑指示器
    element.setAttribute('data-edit-enabled', 'true');

    // 添加悬停效果
    element.addEventListener('mouseenter', () => {
      if (this.config.enableDirectEdit) {
        element.style.outline = '1px dashed #007acc';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (!element.hasAttribute('data-selected')) {
        element.style.outline = '';
      }
    });
  }



  /**
   * 处理直接编辑
   */
  private handleDirectEdit(
    element: HTMLElement,
    type: 'style' | 'content' | 'attribute'
  ) {
    if (!this.config.enableDirectEdit) return;

    const sourceInfo = extractSourceInfo(element);
    if (!sourceInfo) return;

    switch (type) {
      case 'content':
        this.updateContent(element, element.innerText, sourceInfo);
        break;
      case 'style':
        this.updateStyle(element, element.className, sourceInfo);
        break;
    }
  }

  /**
   * 进入编辑模式
   */
  public enterEditMode(
    element: HTMLElement,
    type: 'style' | 'content' | 'attribute'
  ) {
    const sourceInfo = extractSourceInfo(element);
    if (!sourceInfo) {
      console.warn('[UpdateManager] Element has no source mapping');
      return;
    }

    switch (type) {
      case 'content':
        this.editTextContent(element);
        break;
      case 'style':
        this.editStyle(element);
        break;
      case 'attribute':
        this.editAttributes(element);
        break;
    }
  }

  /**
   * 编辑文本内容
   */
  private async editTextContent(element: HTMLElement) {
    const sourceInfo = extractSourceInfo(element);
    if (!sourceInfo) return;

    // Check if element has static text
    try {
      const response = await fetch('/__appdev_design_mode/get-element-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceInfo }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.elementState?.isStaticText) {
          console.warn('[UpdateManager] Cannot edit non-static text element');
          alert('该元素不可编辑：只有纯静态文本可以编辑（不包含变量或表达式）');
          return;
        }
      }
    } catch (error) {
      console.error('[UpdateManager] Failed to check if element is static text:', error);
      return;
    }

    const originalText = element.innerText;
    const textArea = document.createElement('textarea');

    // 设置textarea样式
    textArea.value = originalText;
    textArea.style.position = 'absolute';
    textArea.style.zIndex = '9999';
    textArea.style.width = element.offsetWidth + 'px';
    textArea.style.height = element.offsetHeight + 'px';
    textArea.style.fontSize = window.getComputedStyle(element).fontSize;
    textArea.style.fontFamily = window.getComputedStyle(element).fontFamily;
    textArea.style.color = window.getComputedStyle(element).color;
    textArea.style.background = 'rgba(255, 255, 255, 0.9)';
    textArea.style.border = '2px solid #007acc';
    textArea.style.padding = '4px';
    textArea.style.margin = '0';
    textArea.style.resize = 'none';
    textArea.style.outline = 'none';

    // 获取元素的边界矩形
    const rect = element.getBoundingClientRect();
    textArea.style.left = rect.left + 'px';
    textArea.style.top = rect.top + 'px';

    // 添加到页面
    document.body.appendChild(textArea);
    textArea.focus();

    // 处理保存和取消
    const handleSave = () => {
      const newText = textArea.value;
      if (newText !== originalText) {
        element.innerText = newText;
        this.updateContent(element, newText, extractSourceInfo(element)!);
      }
      this.exitEditMode(textArea);
    };

    const handleCancel = () => {
      this.exitEditMode(textArea);
    };

    // 事件监听
    textArea.addEventListener('blur', handleSave);
    textArea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    });
  }

  /**
   * 编辑样式
   */
  private editStyle(element: HTMLElement) {
    // 打开样式编辑器（这里可以集成外部样式面板）
    console.log('[UpdateManager] Opening style editor for:', element);

    // 触发样式编辑事件
    this.notifyCallbacks('class_update', {
      id: this.generateUpdateId(),
      operation: 'class_update' as UpdateOperation,
      sourceInfo: extractSourceInfo(element)!,
      element,
      oldValue: element.className,
      newValue: element.className,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
    });
  }

  /**
   * 编辑属性
   */
  private editAttributes(element: HTMLElement) {
    // 打开属性编辑器
    console.log('[UpdateManager] Opening attribute editor for:', element);
  }

  /**
   * 退出编辑模式
   */
  private exitEditMode(editor: HTMLElement) {
    if (editor.parentNode) {
      editor.parentNode.removeChild(editor);
    }
  }

  /**
   * 显示上下文菜单
   */
  private showContextMenu(element: HTMLElement, x: number, y: number) {
    const menuItems: MenuItem[] = [
      {
        label: 'Add to Chat',
        action: () => this.addToChat(element),
      },
      { label: '复制元素', action: () => this.copyElement(element) },
    ];

    showContextMenu(element, x, y, menuItems);
  }

  /**
   * 设置右键菜单的关闭处理器（支持 clickoutside 和 ESC 键）
   */
  private setupContextMenuCloseHandlers(menu: HTMLElement) {
    // 关闭菜单的函数
    const closeMenu = () => {
      this.closeContextMenu(menu);
    };

    // 点击外部区域关闭菜单
    const handleClickOutside = (e: MouseEvent) => {
      // 检查点击是否在菜单外部
      if (!menu.contains(e.target as Node)) {
        // Prevent event from bubbling to avoid deselecting element
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      }
    };

    // 右键点击外部区域也关闭菜单
    const handleContextMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        closeMenu();
      }
    };

    // ESC 键关闭菜单
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    // 滚动时关闭菜单
    const handleScroll = () => {
      closeMenu();
    };

    // 使用捕获阶段确保能捕获到所有点击事件
    // 延迟添加监听器，避免立即触发（因为右键事件会冒泡）
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('contextmenu', handleContextMenu, true);
      document.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll, true);
    }, 0);

    // 将清理函数存储在菜单元素上，以便在关闭时调用
    (menu as any).__cleanupHandlers = () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll, true);
    };
  }

  /**
   * 关闭右键菜单
   */
  private closeContextMenu(menu: HTMLElement) {
    // 执行清理函数
    if ((menu as any).__cleanupHandlers) {
      (menu as any).__cleanupHandlers();
      delete (menu as any).__cleanupHandlers;
    }

    // 移除菜单元素
    if (menu.parentNode) {
      menu.parentNode.removeChild(menu);
    }
  }

  /**
   * 复制元素
   */
  private copyElement(element: HTMLElement) {
    const sourceInfo = extractSourceInfo(element);
    const content = element.innerText || element.textContent || '';

    // Copy element to clipboard (if possible)
    const elementInfo = {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      content: content,
      sourceInfo: sourceInfo
    };

    const textToCopy = JSON.stringify(elementInfo, null, 2);

    // Try to copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        let alertMessage = '已复制元素信息到剪贴板:\n\n';
        if (sourceInfo) {
          alertMessage += `文件: ${sourceInfo.fileName}\n`;
          alertMessage += `位置: L${sourceInfo.lineNumber}\n`;
          alertMessage += `\n`;
        }
        alertMessage += `标签: <${elementInfo.tagName}>\n`;
        alertMessage += `类名: ${elementInfo.className}\n`;
        alertMessage += `内容: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`;

        alert(alertMessage);
      }).catch(err => {
        console.error('[UpdateManager] Failed to copy to clipboard:', err);
        alert('复制失败，请查看控制台');
      });
    } else {
      console.log('[UpdateManager] Element info:', elementInfo);
      alert('浏览器不支持剪贴板 API，信息已输出到控制台');
    }
  }

  /**
   * Add element content to chat
   */
  private addToChat(element: HTMLElement) {
    const sourceInfo = extractSourceInfo(element);
    const content = element.innerText || element.textContent || '';

    console.log('[UpdateManager] Adding to chat:', { content, sourceInfo });

    // Send ADD_TO_CHAT message via window postMessage
    window.postMessage({
      type: 'ADD_TO_CHAT',
      payload: {
        content,
        context: {
          sourceInfo,
          elementInfo: {
            tagName: element.tagName.toLowerCase(),
            className: element.className,
            textContent: content
          }
        }
      },
      timestamp: Date.now()
    }, '*');

    // Format alert message with source info
    let alertMessage = '已添加到聊天:\n\n';
    if (sourceInfo) {
      alertMessage += `文件: ${sourceInfo.fileName}\n`;
      alertMessage += `位置: L${sourceInfo.lineNumber}\n`;
      alertMessage += `\n`;
    }
    alertMessage += `内容:\n${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;

    alert(alertMessage);
  }

  /**
   * 删除元素
   */
  private deleteElement(element: HTMLElement) {
    console.log('[UpdateManager] Deleting element:', element);
    // 这里可以实现删除逻辑，但需要谨慎处理
  }

  /**
   * 更新样式
   */
  public updateStyle(
    element: HTMLElement,
    newClass: string,
    sourceInfo: SourceInfo
  ): Promise<UpdateResult> {
    const oldClass = element.className;
    const updateId = this.generateUpdateId();

    const update: UpdateState = {
      id: updateId,
      operation: 'class_update',
      sourceInfo,
      element,
      oldValue: oldClass,
      newValue: newClass,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
    };

    return this.processUpdate(update);
  }

  /**
   * 更新内容
   */
  public updateContent(
    element: HTMLElement,
    newContent: string,
    sourceInfo: SourceInfo
  ): Promise<UpdateResult> {
    const oldContent = element.innerText;
    const updateId = this.generateUpdateId();

    const update: UpdateState = {
      id: updateId,
      operation: 'content_update',
      sourceInfo,
      element,
      oldValue: oldContent,
      newValue: newContent,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
    };

    return this.processUpdate(update);
  }

  /**
   * 更新属性
   */
  public updateAttribute(
    element: HTMLElement,
    attributeName: string,
    newValue: string,
    sourceInfo: SourceInfo
  ): Promise<UpdateResult> {
    const oldValue = element.getAttribute(attributeName) || '';
    const updateId = this.generateUpdateId();

    const update: UpdateState = {
      id: updateId,
      operation: 'attribute_update',
      sourceInfo,
      element,
      oldValue,
      newValue,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
    };

    return this.processUpdate(update);
  }

  /**
   * 批量更新
   */
  public batchUpdate(updates: BatchUpdateItem[]): Promise<UpdateResult[]> {
    if (!this.config.enableBatching) {
      // 如果不支持批量更新，逐个处理
      return Promise.all(
        updates.map(item => {
          if (item.type === 'style') {
            return this.updateStyle(
              item.element,
              item.newValue,
              item.sourceInfo
            );
          } else if (item.type === 'content') {
            return this.updateContent(
              item.element,
              item.newValue,
              item.sourceInfo
            );
          } else {
            return this.updateAttribute(
              item.element,
              'data-test',
              item.newValue,
              item.sourceInfo
            );
          }
        })
      );
    }

    // 批量更新处理
    return new Promise(resolve => {
      // 将更新项转换为UpdateState格式
      const updateStates: UpdateState[] = updates.map(item => ({
        id: this.generateUpdateId(),
        operation: item.type === 'style' ? 'style_update' : 'content_update',
        sourceInfo: item.sourceInfo,
        element: item.element,
        oldValue: item.originalValue || '',
        newValue: item.newValue,
        status: 'pending' as const,
        timestamp: Date.now(),
        retryCount: 0,
      }));

      // 添加到队列
      this.updateQueue.push(...updateStates);

      // 设置防抖定时器
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }

      this.batchTimer = setTimeout(async () => {
        const results = await this.processBatchUpdate(updateStates);
        resolve(results);
      }, this.config.batchDebounceMs);
    });
  }

  /**
   * 处理更新操作
   */
  private async processUpdate(update: UpdateState): Promise<UpdateResult> {
    // 验证更新
    if (!this.validateUpdate(update)) {
      return {
        success: false,
        element: update.element,
        updateId: update.id,
        error: 'Update validation failed',
      };
    }

    // 标记为处理中
    update.status = 'processing';
    this.processingUpdates.add(update.id);

    try {
      // 应用DOM更新
      this.applyUpdateToDOM(update);

      // 调用API保存到源码
      const serverResponse = await this.saveToSource(update);

      // 标记为完成
      update.status = 'completed';

      // 添加到历史记录
      this.updateHistory.push(update);

      // 触发回调
      this.notifyCallbacks(update.operation, update);

      // 如果启用了自动保存，触发保存
      if (this.config.autoSave) {
        this.triggerAutoSave();
      }

      return {
        success: true,
        element: update.element,
        updateId: update.id,
        serverResponse,
      };
    } catch (error) {
      update.status = 'failed';
      update.error = error instanceof Error ? error.message : 'Unknown error';

      // 重试机制
      if (update.retryCount < this.config.maxRetries) {
        update.retryCount++;
        return this.processUpdate(update);
      }

      return {
        success: false,
        element: update.element,
        updateId: update.id,
        error: update.error,
      };
    } finally {
      this.processingUpdates.delete(update.id);
    }
  }

  /**
   * 处理批量更新
   */
  private async processBatchUpdate(
    updates: UpdateState[]
  ): Promise<UpdateResult[]> {
    try {
      // 构建批量API请求
      const batchRequest = {
        updates: updates.map(update => ({
          filePath: update.sourceInfo.fileName,
          line: update.sourceInfo.lineNumber,
          column: update.sourceInfo.columnNumber,
          type: update.operation === 'style_update' ? 'style' : 'content',
          newValue: update.newValue,
          originalValue: update.oldValue,
        })),
      };

      // 调用批量API
      const response = await fetch('/__appdev_design_mode/batch-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchRequest),
      });

      if (!response.ok) {
        throw new Error(`Batch update failed: ${response.statusText}`);
      }

      const results = await response.json();

      // 标记所有更新为完成
      updates.forEach(update => {
        update.status = 'completed';
        this.updateHistory.push(update);
        this.notifyCallbacks(update.operation, update);
      });

      return results.map((result: any, index: number) => ({
        success: result.success,
        element: updates[index].element,
        updateId: updates[index].id,
        serverResponse: result,
      }));
    } catch (error) {
      // 标记所有更新为失败
      updates.forEach(update => {
        update.status = 'failed';
        update.error = error instanceof Error ? error.message : 'Unknown error';
      });

      return updates.map(update => ({
        success: false,
        element: update.element,
        updateId: update.id,
        error: update.error,
      }));
    }
  }

  /**
   * 应用更新到DOM
   */
  private applyUpdateToDOM(update: UpdateState) {
    const { element, operation, newValue, oldValue } = update;

    switch (operation) {
      case 'style_update':
      case 'class_update':
        element.className = newValue;
        break;
      case 'content_update':
        element.innerText = newValue;
        break;
      case 'attribute_update':
        // 这里需要从sourceInfo中获取属性名
        // 目前简化为设置data-attribute
        element.setAttribute('data-updated-value', newValue);
        break;
    }
  }

  /**
   * 保存到源码
   */
  private async saveToSource(update: UpdateState): Promise<any> {
    const response = await fetch('/__appdev_design_mode/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: update.sourceInfo.fileName,
        line: update.sourceInfo.lineNumber,
        column: update.sourceInfo.columnNumber,
        newValue: update.newValue,
        originalValue: update.oldValue,
        type: update.operation === 'style_update' ? 'style' : 'content',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save source: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 验证更新
   */
  private validateUpdate(update: UpdateState): boolean {
    // 验证源码映射
    if (this.config.validation.validateSource) {
      if (
        !update.sourceInfo.fileName ||
        update.sourceInfo.lineNumber === null ||
        update.sourceInfo.columnNumber === null
      ) {
        return false;
      }
    }

    // 验证值
    if (this.config.validation.validateValue) {
      if (update.newValue.length > this.config.validation.maxLength) {
        return false;
      }
    }

    return true;
  }

  /**
   * 提取源码信息
   */


  /**
   * 生成更新ID
   */
  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 触发自动保存
   */
  private triggerAutoSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.saveAllChanges();
    }, this.config.saveDelay);
  }

  /**
   * 保存所有更改
   */
  public async saveAllChanges(): Promise<void> {
    const pendingUpdates = this.updateQueue.filter(u => u.status === 'pending');
    if (pendingUpdates.length === 0) return;

    try {
      const results = await this.processBatchUpdate(pendingUpdates);
      console.log('[UpdateManager] All changes saved:', results);
    } catch (error) {
      console.error('[UpdateManager] Failed to save changes:', error);
    }
  }

  /**
   * 撤销上一次更新
   */
  public undoLastUpdate(): boolean {
    const lastUpdate = this.updateHistory.pop();
    if (!lastUpdate) return false;

    // 恢复DOM
    lastUpdate.element.innerText = lastUpdate.oldValue;
    lastUpdate.element.className = lastUpdate.oldValue;
    lastUpdate.status = 'reverted';

    console.log('[UpdateManager] Undone update:', lastUpdate.id);
    return true;
  }

  /**
   * 重做上一次更新
   */
  public redoLastUpdate(): boolean {
    const revertedUpdates = this.updateHistory.filter(
      u => u.status === 'reverted'
    );
    if (revertedUpdates.length === 0) return false;

    const lastReverted = revertedUpdates[revertedUpdates.length - 1];

    // 重新应用更新
    lastReverted.element.innerText = lastReverted.newValue;
    lastReverted.element.className = lastReverted.newValue;
    lastReverted.status = 'completed';

    console.log('[UpdateManager] Redid update:', lastReverted.id);
    return true;
  }

  /**
   * 添加更新回调
   */
  public addUpdateCallback(
    operation: UpdateOperation,
    callback: (update: UpdateState) => void
  ) {
    if (!this.callbacks.has(operation)) {
      this.callbacks.set(operation, new Set());
    }
    this.callbacks.get(operation)!.add(callback);

    // 返回取消监听的函数
    return () => {
      this.callbacks.get(operation)?.delete(callback);
    };
  }

  /**
   * 通知回调
   */
  private notifyCallbacks(operation: UpdateOperation, update: UpdateState) {
    const callbacks = this.callbacks.get(operation);
    if (callbacks) {
      callbacks.forEach(callback => callback(update));
    }
  }

  /**
   * 获取更新状态
   */
  public getUpdateStates(): UpdateState[] {
    return [...this.updateQueue];
  }

  /**
   * 获取更新历史
   */
  public getUpdateHistory(): UpdateState[] {
    return [...this.updateHistory];
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    // 停止观察器
    if (this.observer) {
      this.observer.disconnect();
    }

    // 清除定时器
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // 清除队列
    this.updateQueue = [];
    this.updateHistory = [];
    this.callbacks.clear();
  }
}

/**
 * UpdateManager React Hook
 */
export const useUpdateManager = (config?: Partial<UpdateManagerConfig>) => {
  const updateManagerRef = useRef<UpdateManager | null>(null);
  const [updateStates, setUpdateStates] = useState<UpdateState[]>([]);
  const { config: designModeConfig, isDesignMode, selectedElement } = useDesignMode();

  React.useEffect(() => {
    updateManagerRef.current = new UpdateManager({
      enableDirectEdit: designModeConfig.iframeMode?.enableDirectEdit ?? true,
      enableBatching: designModeConfig.batchUpdate?.enabled ?? true,
      batchDebounceMs: designModeConfig.batchUpdate?.debounceMs ?? 300,
      maxRetries: 3,
      autoSave: true,
      saveDelay: 1000,
      validation: {
        validateSource: true,
        validateValue: true,
        maxLength: 10000,
      },
      ...config,
    });

    // 监听更新状态变化
    const unsubscribe = updateManagerRef.current.addUpdateCallback(
      'content_update',
      update => {
        setUpdateStates(prev => [...prev, update]);
      }
    );

    return () => {
      unsubscribe();
      updateManagerRef.current?.destroy();
      updateManagerRef.current = null;
    };
  }, [designModeConfig]);

  // Sync design mode state and selected element with UpdateManager
  React.useEffect(() => {
    if (updateManagerRef.current) {
      updateManagerRef.current.setDesignModeState(isDesignMode, selectedElement);
    }
  }, [isDesignMode, selectedElement]);


  return {
    updateManager: updateManagerRef.current,
    updateStates,
    updateStyle: (
      element: HTMLElement,
      newClass: string,
      sourceInfo: SourceInfo
    ) => updateManagerRef.current?.updateStyle(element, newClass, sourceInfo),
    updateContent: (
      element: HTMLElement,
      newContent: string,
      sourceInfo: SourceInfo
    ) =>
      updateManagerRef.current?.updateContent(element, newContent, sourceInfo),
    batchUpdate: (updates: BatchUpdateItem[]) =>
      updateManagerRef.current?.batchUpdate(updates),
    saveAllChanges: () => updateManagerRef.current?.saveAllChanges(),
    undoLastUpdate: () => updateManagerRef.current?.undoLastUpdate(),
    redoLastUpdate: () => updateManagerRef.current?.redoLastUpdate(),
  };
};

export default UpdateManager;
