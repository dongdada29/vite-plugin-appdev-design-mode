import { UpdateState, UpdateResult, UpdateManagerConfig } from '../types/UpdateTypes';
import { SourceInfo } from '../../types/messages';
import { extractSourceInfo, findAllElementsWithSameSource } from '../utils/domUtils';
import { AttributeNames } from '../utils/attributeNames';

export class EditManager {
  constructor(
    private processUpdate: (update: UpdateState) => Promise<UpdateResult>,
    private config: UpdateManagerConfig
  ) { }

  /**
   * Handle direct edit (double click or mutation)
   */
  public handleDirectEdit(element: HTMLElement, type: 'content' | 'style') {
    if (type === 'content') {
      this.editTextContent(element);
    } else {
      this.editStyle(element);
    }
  }

  /**
   * Edit text content using contentEditable
   */
  public async editTextContent(element: HTMLElement) {
    const sourceInfo = extractSourceInfo(element);
    if (!sourceInfo) return;

    // 保存原始文本和状态
    const originalText = element.innerText;

    // 设置 contentEditable 为 true（不修改其他样式）
    element.contentEditable = 'true';

    // 防止 ObserverManager 干扰
    element.setAttribute('data-ignore-mutation', 'true');

    // 选中所有文本
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // 处理保存
    const handleSave = () => {
      const newText = element.innerText.trim();

      // 恢复原始状态（还原 contentEditable）
      element.contentEditable = 'false';

      // 移除忽略标记
      element.removeAttribute('data-ignore-mutation');

      // 清理事件监听器
      element.removeEventListener('blur', handleSave);
      element.removeEventListener('input', handleInput);
      element.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);

      // 如果内容有变化，更新 DOM 并发送最终消息
      if (newText !== originalText.trim()) {
        element.innerText = newText;

        // 同步更新所有相同列表项的内容
        const relatedElements = findAllElementsWithSameSource(element);
        relatedElements.forEach(el => {
          if (el !== element) {
            el.innerText = newText;
          }
        });

        // 发送最终内容变化消息
        this.notifyContentChanged(element, newText, sourceInfo, originalText);
      }
    };

    // 处理取消
    const handleCancel = () => {
      // 恢复原始文本
      element.innerText = originalText;

      // 恢复原始状态（还原 contentEditable）
      element.contentEditable = 'false';

      // 移除忽略标记
      element.removeAttribute('data-ignore-mutation');

      // 清理事件监听器
      element.removeEventListener('blur', handleSave);
      element.removeEventListener('input', handleInput);
      element.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };

    // 处理点击外部
    const handleClickOutside = (e: MouseEvent) => {
      if (!element.contains(e.target as Node)) {
        handleSave();
      }
    };

    // 处理实时输入（同步到外部）
    const handleInput = () => {
      const currentText = element.innerText.trim();

      // 实时同步更新所有相同列表项的内容
      const relatedElements = findAllElementsWithSameSource(element);
      relatedElements.forEach(el => {
        if (el !== element) {
          el.innerText = currentText;
        }
      });

      // 实时发送内容变化消息（不终止编辑）
      this.notifyContentChangedRealtime(element, currentText, sourceInfo, originalText);
    };

    // 处理键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Enter or Cmd+Enter: insert newline (allow default behavior)
          return;
        } else {
          // Plain Enter: save and exit
          e.preventDefault();
          element.blur(); // 触发 blur 事件，从而触发保存
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    // 添加事件监听器
    element.addEventListener('blur', handleSave);
    element.addEventListener('input', handleInput); // 实时同步
    element.addEventListener('keydown', handleKeyDown);
    // 使用 capture 阶段确保在其他点击事件之前捕获
    document.addEventListener('mousedown', handleClickOutside, true);

    // 聚焦元素
    element.focus();
  }

  /**
   * Update content
   */
  public async updateContent(
    element: HTMLElement,
    newValue: string,
    sourceInfo?: SourceInfo,
    oldValue?: string
  ): Promise<UpdateResult> {
    // 如果没有提供 sourceInfo，尝试从元素中提取
    const finalSourceInfo = sourceInfo || extractSourceInfo(element);
    if (!finalSourceInfo) {
      throw new Error('Cannot update content: no source info available');
    }

    // 如果没有提供 oldValue，从元素中获取
    const finalOldValue = oldValue ?? element.innerText;

    const update: UpdateState = {
      id: this.generateUpdateId(),
      operation: 'content_update',
      sourceInfo: finalSourceInfo,
      element,
      oldValue: finalOldValue,
      newValue,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
      persist: false, // Default to preview only
    };

    // Find all elements with the same source and update them (for preview)
    const relatedElements = findAllElementsWithSameSource(element);
    relatedElements.forEach(el => {
      if (el !== element) {
        el.innerText = newValue;
      }
    });

    return this.processUpdate(update);
  }

  /**
   * Update style (class)
   */
  public async updateStyle(
    element: HTMLElement,
    newClass: string,
    sourceInfo: SourceInfo
  ): Promise<UpdateResult> {
    const oldClass = element.className;
    // Ensure sourceInfo is available for finding related elements
    const finalSourceInfo = sourceInfo || extractSourceInfo(element);
    if (!finalSourceInfo) {
      throw new Error('Cannot update style: no source info available');
    }

    const update: UpdateState = {
      id: this.generateUpdateId(),
      operation: 'class_update',
      sourceInfo,
      element,
      oldValue: oldClass,
      newValue: newClass,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
      persist: false, // Default to preview only
    };

    // Find all elements with the same source and update them (for preview)
    const relatedElements = findAllElementsWithSameSource(element);
    relatedElements.forEach(el => {
      if (el !== element) {
        el.className = newClass;
      }
    });

    return this.processUpdate(update);
  }

  /**
   * Edit style (trigger UI)
   */
  public editStyle(element: HTMLElement) {
    // Placeholder for UI trigger
  }

  /**
   * Update attribute
   */
  public async updateAttribute(
    element: HTMLElement,
    attributeName: string,
    newValue: string,
    sourceInfo: SourceInfo
  ): Promise<UpdateResult> {
    const oldValue = element.getAttribute(attributeName) || '';

    const update: UpdateState = {
      id: this.generateUpdateId(),
      operation: 'attribute_update',
      sourceInfo,
      element,
      oldValue,
      newValue,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
      persist: false, // Default to preview only
    };

    // Find all elements with the same source and update them (for preview)
    const relatedElements = findAllElementsWithSameSource(element);
    relatedElements.forEach(el => {
      if (el !== element) {
        el.setAttribute(attributeName, newValue);
      }
    });

    return this.processUpdate(update);
  }

  /**
   * Edit attributes (trigger UI)
   */
  public editAttributes(element: HTMLElement) {
    console.log('[EditManager] Opening attribute editor for:', element);
  }

  /**
   * Generate unique update ID
   */
  private generateUpdateId(): string {
    return `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notify content changed (no save to source, just message)
   */
  private notifyContentChanged(
    element: HTMLElement,
    newValue: string,
    sourceInfo?: SourceInfo,
    oldValue?: string
  ): void {
    const finalSourceInfo = sourceInfo || extractSourceInfo(element);
    if (!finalSourceInfo) {
      console.warn('[EditManager] Cannot notify: no source info available');
      return;
    }

    if (window.self !== window.top) {
      window.parent.postMessage({
        type: 'CONTENT_UPDATED',
        payload: {
          sourceInfo: finalSourceInfo,
          oldValue: oldValue || '',
          newValue: newValue,
        },
        timestamp: Date.now(),
      }, '*');

      console.log('[EditManager] Content updated (preview only):', {
        sourceInfo: finalSourceInfo,
        old: oldValue,
        new: newValue
      });
    }
  }

  private lastRealtimeNotify: number = 0;
  private readonly REALTIME_THROTTLE_MS = 300;

  /**
   * Realtime notify content changed (throttled)
   */
  private notifyContentChangedRealtime(
    element: HTMLElement,
    newValue: string,
    sourceInfo?: SourceInfo,
    oldValue?: string
  ): void {
    const now = Date.now();

    if (now - this.lastRealtimeNotify < this.REALTIME_THROTTLE_MS) {
      return;
    }

    this.lastRealtimeNotify = now;

    const finalSourceInfo = sourceInfo || extractSourceInfo(element);
    if (!finalSourceInfo) {
      return;
    }

    if (window.self !== window.top) {
      window.parent.postMessage({
        type: 'CONTENT_UPDATED',
        payload: {
          sourceInfo: finalSourceInfo,
          oldValue: oldValue || '',
          newValue: newValue,
          realtime: true,
        },
        timestamp: Date.now(),
      }, '*');
    }
  }
}


