import React, { useRef, useState } from 'react';
import { useDesignMode } from './DesignModeContext';
import { SourceInfo, AddToChatMessage, CopyElementMessage } from '../types/messages';
import { extractSourceInfo, hasSourceMapping } from './utils/sourceInfo';
import { isPureStaticText } from './utils/elementUtils';
import { AttributeNames } from './utils/attributeNames';
import { showContextMenu, MenuItem } from './ui/ContextMenu';
import { UpdateOperation, UpdateState, UpdateResult, BatchUpdateItem, UpdateManagerConfig } from './types/UpdateTypes';
import { HistoryManager } from './managers/HistoryManager';
import { ObserverManager } from './managers/ObserverManager';
import { EditManager } from './managers/EditManager';
import { UpdateService } from './services/UpdateService';
import { bridge } from './bridge';





/**
 * 更新管理器
 * 负责处理所有类型的更新操作，包括样式、内容、属性的修改
 */
export class UpdateManager {
  private updateQueue: UpdateState[] = [];
  private historyManager: HistoryManager;
  private observerManager: ObserverManager;
  private editManager: EditManager;
  private updateService: UpdateService;
  private callbacks: Map<UpdateOperation, Set<(update: UpdateState) => void>> =
    new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private saveTimer: NodeJS.Timeout | null = null;

  // Design mode state
  private isDesignMode: boolean = false;
  private selectedElement: HTMLElement | null = null;
  private selectElementCallback: ((element: HTMLElement | null) => void) | null = null;

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
    this.historyManager = new HistoryManager();
    this.observerManager = new ObserverManager(
      (target, type) => this.editManager.handleDirectEdit(target, type),
      (node) => this.setupElementEditHandlers(node)
    );
    this.editManager = new EditManager(
      (update) => this.updateService.processUpdate(update),
      this.config
    );
    this.updateService = new UpdateService(
      this.config,
      (update) => {
        this.historyManager.add(update);
        this.notifyCallbacks(update.operation, update);
        if (this.config.autoSave) {
          this.triggerAutoSave();
        }
      },
      (update) => {
        // onFail callback - could log or notify
      }
    );

    if (this.config.enableDirectEdit) {
      this.observerManager.enable();
    }

    this.initializeEventListeners();
  }

  /**
   * 初始化DOM变化观察器
   */


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
    // document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }



  /**
   * 处理双击事件
   * 注意：只有在 design 模式开启后才能双击进入编辑
   */
  private handleDblClick(event: MouseEvent) {
    // 检查 design 模式是否开启（必须条件）
    if (!this.isDesignMode) return;

    const target = event.target as HTMLElement;

    // 检查元素是否有源码映射（可编辑的前提条件）
    if (!hasSourceMapping(target)) return;

    // 排除设计模式 UI 元素
    if (target.closest('#__vite_plugin_design_mode__')) return;

    // 排除右键菜单
    if (target.closest(`[${AttributeNames.contextMenu}="true"]`)) return;

    // 检查元素是否有 static-content 属性且值为 'true'（必须条件）
    // 使用 AttributeNames.staticContent 来获取正确的属性名（支持可配置前缀，如 data-xagi-static-content）
    const staticContentAttr = target.getAttribute(AttributeNames.staticContent);
    if (staticContentAttr !== 'true') {
      // 如果 static-content 属性不存在或值不为 'true'，不允许编辑
      return;
    }

    // 文件级别保护：阻止编辑组件库文件
    const sourceInfo = extractSourceInfo(target);
    if (sourceInfo) {
      const fileName = sourceInfo.fileName;
      const isComponentFile = fileName.includes('/components/') ||
        fileName.includes('/ui/') ||
        fileName.endsWith('card.tsx') ||
        fileName.endsWith('button.tsx');

      if (isComponentFile) {
        console.warn('[UpdateManager] Cannot edit component library files. Source:', fileName);
        console.warn('[UpdateManager] React does not preserve usage site information in the DOM.');
        return;
      }
    }

    // 防止默认行为
    event.preventDefault();
    event.stopPropagation();

    // Check if it's pure static text - REMOVED to let EditManager handle validation
    // if (!isPureStaticText(target)) {
    //   console.log('[UpdateManager] Ignored dblclick on non-static text element');
    //   return;
    // }

    // 进入编辑模式（仅在 design 模式下）
    this.editManager.handleDirectEdit(target, 'content');
  }

  /**
   * 处理右键菜单
   */
  private handleContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Only show context menu if design mode is enabled
    if (!this.isDesignMode) return;

    // Exclude context menu
    if (target.closest(`[${AttributeNames.contextMenu}="true"]`)) return;

    // 检查元素是否有源码映射（可被选中）
    if (!hasSourceMapping(target)) return;

    // 检查是否是已选中元素
    const isSelected = !!(this.selectedElement && target === this.selectedElement);

    // 如果元素有 hover 状态，在显示菜单前保持它（防止 mouseout 事件移除）
    const hadHoverState = target.hasAttribute('data-design-hover');
    if (hadHoverState) {
      // 添加标记，表示这是右键菜单保持的 hover 状态
      target.setAttribute(AttributeNames.contextMenuHover, 'true');
      // 确保 hover 状态保持
      target.setAttribute('data-design-hover', 'true');
    }

    event.preventDefault();

    // 显示自定义上下文菜单（已选中元素或可被选中的元素都可以显示）
    this.showContextMenu(target, event.clientX, event.clientY, isSelected);
  }

  /**
   * Update design mode state
   */
  public setDesignModeState(
    isDesignMode: boolean,
    selectedElement: HTMLElement | null = null,
    selectElementCallback?: (element: HTMLElement | null) => void
  ) {
    this.isDesignMode = isDesignMode;
    this.selectedElement = selectedElement;
    if (selectElementCallback) {
      this.selectElementCallback = selectElementCallback;
    }
  }

  /**
   * 获取当前 design 模式是否开启
   * @returns true 如果 design 模式已开启，否则返回 false
   */
  public getDesignModeState(): boolean {
    return this.isDesignMode;
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
        this.editManager.handleDirectEdit(selectedElement, 'content');
        // if (isPureStaticText(selectedElement)) {
        //   this.editManager.handleDirectEdit(selectedElement, 'content');
        // } else {
        //   console.log('[UpdateManager] Cannot edit non-static text element');
        // }
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
        this.editManager.handleDirectEdit(element, 'content');
        break;
      case 'style':
        this.editManager.editStyle(element);
        break;
      case 'attribute':
        this.editManager.editAttributes(element);
        break;
    }
  }



  /**
   * 退出编辑模式
   */


  /**
   * 显示上下文菜单
   */
  private showContextMenu(element: HTMLElement, x: number, y: number, isSelected: boolean) {
    const menuItems: MenuItem[] = [];

    // 添加其他菜单项（移除了选中/取消选中逻辑）
    menuItems.push(
      {
        label: '添加到会话',
        action: () => this.addToChat(element),
      },
      {
        label: '复制元素',
        action: () => this.copyElement(element)
      }
    );

    showContextMenu(element, x, y, menuItems);
  }

  /**
   * 设置右键菜单的关闭处理器（支持 clickoutside 和 ESC 键）
   */


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
      sourceInfo: sourceInfo ?? undefined // 将 null 转换为 undefined
    };

    const textToCopy = JSON.stringify(elementInfo, null, 2);

    // 发送拷贝消息的辅助函数
    const sendCopyMessage = (success: boolean, error?: string) => {
      const message: CopyElementMessage = {
        type: 'COPY_ELEMENT',
        payload: {
          elementInfo: {
            tagName: elementInfo.tagName,
            className: elementInfo.className,
            content: elementInfo.content,
            sourceInfo: elementInfo.sourceInfo
          },
          textContent: textToCopy, // 用于剪贴板的 JSON 字符串
          success, // 是否拷贝成功
          error // 如果失败，错误信息
        },
        timestamp: Date.now()
      };

      // 如果在 iframe 环境中，通过 bridge 发送消息到父窗口
      // 否则直接使用 window.postMessage（主窗口环境）
      if (typeof window !== 'undefined' && window.self !== window.top) {
        // iframe 环境：通过 bridge 发送到父窗口
        bridge.send(message).catch(error => {
          console.error('[UpdateManager] Failed to send COPY_ELEMENT via bridge:', error);
          // 如果 bridge 发送失败，回退到直接使用 postMessage
          window.parent.postMessage(message, '*');
        });
      } else {
        // 主窗口环境：直接使用 postMessage
        window.postMessage(message, '*');
      }
    };

    // Try to copy to clipboard (本地也尝试复制)
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

        // 拷贝成功，发送成功消息
        sendCopyMessage(true);
      }).catch(err => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[UpdateManager] Failed to copy to clipboard:', err);

        // 拷贝失败，发送失败消息
        sendCopyMessage(false, errorMessage);
      });
    } else {
      // 浏览器不支持剪贴板 API，发送失败消息
      sendCopyMessage(false, '浏览器不支持剪贴板 API');
    }
  }

  /**
   * Add element content to chat
   */
  private addToChat(element: HTMLElement) {
    const sourceInfo = extractSourceInfo(element);
    const content = element.innerText || element.textContent || '';

    // console.log('[UpdateManager] Adding to chat:', { content, sourceInfo });

    // 构建 ADD_TO_CHAT 消息
    // 将 null 转换为 undefined，因为 AddToChatMessage 期望 undefined 而不是 null
    const contextSourceInfo = sourceInfo ?? undefined;

    // 如果 sourceInfo 存在，构建完整的 elementInfo（包含必需的 sourceInfo 和 isStaticText）
    // 如果 sourceInfo 不存在，则不提供 elementInfo
    const elementInfo = sourceInfo ? {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      textContent: content,
      sourceInfo, // ElementInfo 要求 sourceInfo 是必需的
      isStaticText: isPureStaticText(element)
    } : undefined;

    const message: AddToChatMessage = {
      type: 'ADD_TO_CHAT',
      payload: {
        content,
        context: {
          sourceInfo: contextSourceInfo,
          elementInfo
        }
      },
      timestamp: Date.now()
    };

    // 如果在 iframe 环境中，通过 bridge 发送消息到父窗口
    // 否则直接使用 window.postMessage（主窗口环境）
    if (typeof window !== 'undefined' && window.self !== window.top) {
      // iframe 环境：通过 bridge 发送到父窗口
      bridge.send(message).catch(error => {
        console.error('[UpdateManager] Failed to send ADD_TO_CHAT via bridge:', error);
        // 如果 bridge 发送失败，回退到直接使用 postMessage
        window.parent.postMessage(message, '*');
      });
    } else {
      // 主窗口环境：直接使用 postMessage
      window.postMessage(message, '*');
    }

    // Format alert message with source info
    let alertMessage = '已添加到聊天:\n\n';
    if (sourceInfo) {
      alertMessage += `文件: ${sourceInfo.fileName}\n`;
      alertMessage += `位置: L${sourceInfo.lineNumber}\n`;
      alertMessage += `\n`;
    }
    alertMessage += `内容:\n${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
  }

  /**
   * 删除元素
   */
  private deleteElement(element: HTMLElement) {
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
    return this.editManager.updateStyle(element, newClass, sourceInfo);
  }

  /**
   * 更新内容
   */
  public updateContent(
    element: HTMLElement,
    newContent: string,
    sourceInfo?: SourceInfo,
    oldValue?: string
  ): Promise<UpdateResult> {
    return this.editManager.updateContent(element, newContent, sourceInfo, oldValue);
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
    return this.editManager.updateAttribute(element, attributeName, newValue, sourceInfo);
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
    return this.updateService.processUpdate(update);
  }

  /**
   * 处理批量更新
   */
  private async processBatchUpdate(
    updates: UpdateState[]
  ): Promise<UpdateResult[]> {
    return this.updateService.processBatchUpdate(updates);
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
    } catch (error) {
      console.error('[UpdateManager] Failed to save changes:', error);
    }
  }

  /**
   * 撤销上一次更新
   */
  public undoLastUpdate(): boolean {
    const lastUpdate = this.historyManager.undo();
    if (!lastUpdate) return false;

    // 恢复DOM
    lastUpdate.element.innerText = lastUpdate.oldValue;
    lastUpdate.element.className = lastUpdate.oldValue;

    return true;
  }

  /**
   * 重做上一次更新
   */
  public redoLastUpdate(): boolean {
    const lastReverted = this.historyManager.redo();
    if (!lastReverted) return false;

    // 重新应用更新
    lastReverted.element.innerText = lastReverted.newValue;
    lastReverted.element.className = lastReverted.newValue;

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
    return this.historyManager.getHistory();
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    // 停止观察器
    this.observerManager.disable();

    // 清除定时器
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // 清除队列
    this.updateQueue = [];
    this.historyManager.clear();
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
    // 确保在非 design 模式下也能启用双击编辑功能
    // enableDirectEdit 默认为 true，允许在非 design 模式下也能双击编辑
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
  const { selectElement } = useDesignMode();
  React.useEffect(() => {
    if (updateManagerRef.current) {
      updateManagerRef.current.setDesignModeState(isDesignMode, selectedElement, selectElement);
    }
  }, [isDesignMode, selectedElement, selectElement]);


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
