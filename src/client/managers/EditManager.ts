import { UpdateState, UpdateResult, UpdateOperation, UpdateManagerConfig } from '../types/UpdateTypes';
import { SourceInfo } from '../../types/messages';
import { extractSourceInfo, hasSourceMapping } from '../utils/sourceInfo';
import { isPureStaticText } from '../utils/elementUtils';
import { AttributeNames } from '../utils/attributeNames';
import { resolveSourceInfo } from '../utils/sourceInfoResolver';

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
    // 使用 resolveSourceInfo 来获取正确的源位置
    // 对于pass-through组件（有static-content属性），会向上查找使用位置
    const sourceInfo = resolveSourceInfo(element);
    if (!sourceInfo) return;

    // 检查元素是否有 static-content 属性
    // 只有在使用位置（有 static-content）的元素才能编辑
    // 组件定义中的元素不应该被编辑
    const hasStaticContent = element.hasAttribute(AttributeNames.staticContent);
    if (!hasStaticContent) {
      console.warn('[EditManager] Cannot edit: element does not have static-content attribute. This might be a component definition, not a usage site.');
      return;
    }

    // 保存原始文本和状态
    const originalText = element.innerText;
    const originalContentEditable = element.contentEditable;

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
      document.removeEventListener('mousedown', handleClickOutside, true);

      // 如果内容有变化，更新 DOM 并发送最终消息
      if (newText !== originalText.trim()) {
        element.innerText = newText;

        // 同步更新所有相同列表项的内容（使用 element-id 查找）
        const relatedElements = this.findAllElementsWithSameSource(element, sourceInfo);
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
      document.removeEventListener('mousedown', handleClickOutside, true);
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

      // 实时同步更新所有相同列表项的内容（使用 element-id 查找）
      const relatedElements = this.findAllElementsWithSameSource(element, sourceInfo);
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
          // Don't prevent default - let the browser insert the newline
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
   * @param element - 要更新的元素
   * @param newValue - 新值
   * @param sourceInfo - 源代码信息（如果未提供，则从元素中提取）
   * @param oldValue - 旧值（如果未提供，则从元素中获取）
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

    // 如果没有提供 oldValue，从元素中获取（注意：此时元素可能已经更新）
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
    // 使用 element-id 来查找相同的元素（特别是列表项）
    const relatedElements = this.findAllElementsWithSameSource(element, finalSourceInfo);
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
    // 使用 element-id 来查找相同的元素（特别是列表项）
    const relatedElements = this.findAllElementsWithSameSource(element, finalSourceInfo);
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
    // console.log('[EditManager] Opening style editor for:', element);
    // This is where we would trigger the UI
    // For now, we can just log it or maybe trigger a class update if we had a UI
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
    // 使用 element-id 来查找相同的元素（特别是列表项）
    const relatedElements = this.findAllElementsWithSameSource(element, sourceInfo);
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
    // Opening attribute editor
  }

  /**
   * 生成唯一更新ID
   */
  private generateUpdateId(): string {
    return `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 通知内容变化（不保存到源文件，只发送消息）
   */
  private notifyContentChanged(
    element: HTMLElement,
    newValue: string,
    sourceInfo?: SourceInfo,
    oldValue?: string
  ): void {
    // 使用 resolveSourceInfo 来获取正确的源位置（如果未提供）
    const finalSourceInfo = sourceInfo || resolveSourceInfo(element);
    if (!finalSourceInfo) {
      console.warn('[EditManager] Cannot notify: no source info available');
      return;
    }

    // 发送消息到父窗口（如果在 iframe 中）
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
    }
  }

  private lastRealtimeNotify: number = 0;
  private readonly REALTIME_THROTTLE_MS = 300; // 节流间隔

  /**
   * 实时通知内容变化（带节流）
   */
  private notifyContentChangedRealtime(
    element: HTMLElement,
    newValue: string,
    sourceInfo?: SourceInfo,
    oldValue?: string
  ): void {
    const now = Date.now();

    // 节流：如果距离上次通知不足 300ms，则跳过
    if (now - this.lastRealtimeNotify < this.REALTIME_THROTTLE_MS) {
      return;
    }

    this.lastRealtimeNotify = now;

    // 使用 resolveSourceInfo 来获取正确的源位置（如果未提供）
    const finalSourceInfo = sourceInfo || resolveSourceInfo(element);
    if (!finalSourceInfo) {
      return;
    }

    // 发送实时消息到父窗口
    if (window.self !== window.top) {
      window.parent.postMessage({
        type: 'CONTENT_UPDATED',
        payload: {
          sourceInfo: finalSourceInfo,
          oldValue: oldValue || '',
          newValue: newValue,
          realtime: true, // 标记为实时更新
        },
        timestamp: Date.now(),
      }, '*');
    }
  }

  /**
   * Find all elements with the same source info
   * 更严格的匹配规则：
   * 1. 相同的 element-id
   * 2. 相同的 static-content 属性状态（都有或都没有）
   * 3. 来自相同的文件位置
   * 这样可以确保只更新在源码中相同嵌套位置的元素，避免误更新组件定义
   * 
   * @param element - 要查找相同元素的参考元素
   * @param sourceInfo - 源代码信息（可选，已废弃，保留用于兼容性）
   */
  private findAllElementsWithSameSource(element: HTMLElement, sourceInfo?: SourceInfo): HTMLElement[] {
    // 获取参考元素的关键属性
    const elementId = element.getAttribute(AttributeNames.elementId);
    const hasStaticContent = element.hasAttribute(AttributeNames.staticContent);
    const refSourceInfo = extractSourceInfo(element);
    const refFileName = refSourceInfo?.fileName;

    if (!elementId) {
      console.warn('[EditManager] Element missing element-id attribute:', element);
      return [element]; // 如果没有 element-id，只返回当前元素
    }

    // 获取所有具有相同 element-id 的元素
    const allElementsWithId = Array.from(
      document.querySelectorAll(`[${AttributeNames.elementId}]`)
    ) as HTMLElement[];

    // 严格匹配：element-id + static-content 状态 + 文件位置
    return allElementsWithId.filter(el => {
      const elId = el.getAttribute(AttributeNames.elementId);
      const elHasStaticContent = el.hasAttribute(AttributeNames.staticContent);
      const elSourceInfo = extractSourceInfo(el);
      const elFileName = elSourceInfo?.fileName;

      // 1. element-id 必须相同
      if (elId !== elementId) return false;

      // 2. static-content 属性状态必须相同
      // 这确保了只匹配使用位置的元素，不会匹配组件定义
      if (elHasStaticContent !== hasStaticContent) return false;

      // 3. 文件位置必须相同
      // 这进一步确保只匹配同一个文件中的元素
      if (elFileName !== refFileName) return false;

      return true;
    });
  }
}

