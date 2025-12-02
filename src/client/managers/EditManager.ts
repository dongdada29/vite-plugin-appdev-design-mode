import { UpdateState, UpdateResult, UpdateOperation, UpdateManagerConfig } from '../types/UpdateTypes';
import { SourceInfo } from '../../types/messages';
import { extractSourceInfo, hasSourceMapping } from '../utils/sourceInfo';
import { isPureStaticText } from '../utils/elementUtils';

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
    const originalContentEditable = element.contentEditable;
    const originalUserSelect = element.style.userSelect;
    const originalOutline = element.style.outline;
    const originalOutlineOffset = element.style.outlineOffset;

    // 设置 contentEditable 为 true
    element.contentEditable = 'true';
    element.style.userSelect = 'text';
    element.style.outline = '2px solid #007acc';
    element.style.outlineOffset = '2px';

    // 选中所有文本
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // 处理保存
    const handleSave = () => {
      const newText = element.innerText.trim();
      
      // 恢复原始状态
      element.contentEditable = originalContentEditable || 'inherit';
      element.style.userSelect = originalUserSelect || '';
      element.style.outline = originalOutline || '';
      element.style.outlineOffset = originalOutlineOffset || '';

      // 清理事件监听器
      element.removeEventListener('blur', handleSave);
      element.removeEventListener('keydown', handleKeyDown);

      // 如果内容有变化，更新内容
      if (newText !== originalText.trim()) {
        element.innerText = newText;
        this.updateContent(element, newText, sourceInfo, originalText);
      }
    };

    // 处理取消
    const handleCancel = () => {
      // 恢复原始文本
      element.innerText = originalText;
      
      // 恢复原始状态
      element.contentEditable = originalContentEditable || 'inherit';
      element.style.userSelect = originalUserSelect || '';
      element.style.outline = originalOutline || '';
      element.style.outlineOffset = originalOutlineOffset || '';

      // 清理事件监听器
      element.removeEventListener('blur', handleSave);
      element.removeEventListener('keydown', handleKeyDown);
    };

    // 处理键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        element.blur(); // 触发 blur 事件，从而触发保存
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    // 添加事件监听器
    element.addEventListener('blur', handleSave);
    element.addEventListener('keydown', handleKeyDown);

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
    };

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
    };

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
    };

    return this.processUpdate(update);
  }

  /**
   * Edit attributes (trigger UI)
   */
  public editAttributes(element: HTMLElement) {
    console.log('[EditManager] Opening attribute editor for:', element);
  }

  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
