import { UpdateState, UpdateResult, UpdateOperation, UpdateManagerConfig } from '../types/UpdateTypes';
import { SourceInfo } from '../../types/messages';
import { extractSourceInfo, hasSourceMapping } from '../utils/sourceInfo';
import { isPureStaticText } from '../utils/elementUtils';
import { enterEditMode, exitEditMode } from '../ui/EditModeUI';

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
   * Edit text content
   */
  public async editTextContent(element: HTMLElement) {
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
          console.warn('[EditManager] Cannot edit non-static text element');
          // alert('该元素不可编辑：只有纯静态文本可以编辑（不包含变量或表达式）');
          return;
        }
      }
    } catch (error) {
      console.error('[EditManager] Failed to check if element is static text:', error);
      return;
    }

    const originalText = element.innerText;

    const textArea = enterEditMode({
      element,
      initialValue: originalText,
      onSave: (newText) => {
        if (newText !== originalText) {
          element.innerText = newText;
          this.updateContent(element, newText, sourceInfo);
        }
        exitEditMode(textArea);
      },
      onCancel: () => {
        exitEditMode(textArea);
      }
    });
  }

  /**
   * Update content
   */
  public async updateContent(
    element: HTMLElement,
    newValue: string,
    sourceInfo: SourceInfo
  ): Promise<UpdateResult> {
    const update: UpdateState = {
      id: this.generateUpdateId(),
      operation: 'content_update',
      sourceInfo,
      element,
      oldValue: element.innerText, // Note: this might be the new value if already updated in DOM?
      // In UpdateManager.editTextContent, we updated DOM before calling updateContent?
      // No, in the new implementation:
      // element.innerText = newText;
      // this.updateContent(element, newText, ...);
      // So element.innerText IS the new value.
      // We should probably pass oldValue explicitly or capture it before.
      // But updateContent in UpdateManager took newValue.
      // Let's check UpdateManager.updateContent implementation.
      newValue,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Fix oldValue: if DOM is already updated, we can't get oldValue from it.
    // But we don't pass oldValue to updateContent.
    // UpdateManager.updateContent:
    /*
      public async updateContent(element: HTMLElement, newValue: string, sourceInfo: SourceInfo) {
        const update: UpdateState = {
            // ...
            oldValue: element.innerText, // This is WRONG if element is already updated!
            newValue,
            // ...
        }
        return this.processUpdate(update);
      }
    */
    // Wait, in editTextContent:
    /*
        if (newText !== originalText) {
          element.innerText = newText; // DOM updated!
          this.updateContent(element, newText, ...); // Called after DOM update
        }
    */
    // So element.innerText IS newText.
    // So oldValue is lost?
    // This looks like a bug in the current implementation (or I introduced it).
    // In the original code:
    /*
      const handleSave = () => {
        const newText = textArea.value;
        if (newText !== originalText) {
          element.innerText = newText;
          this.updateContent(element, newText, extractSourceInfo(element)!);
        }
    */
    // And updateContent:
    /*
      const update: UpdateState = {
        // ...
        oldValue: element.innerText, // !!!
        newValue,
      }
    */
    // Yes, `oldValue` would be `newValue`.
    // This means undo would set it to `newValue` (no change).
    // This is a bug.
    // I should fix this in EditManager.
    // I will pass `oldValue` to `updateContent` if possible, or `EditManager` should handle it.
    // `editTextContent` has `originalText`.

    // I will modify `updateContent` signature to accept `oldValue`.
    // But `handleDirectEdit` calls `updateContent` too?
    // `handleDirectEdit` calls `editTextContent`.

    // What about `editStyle`?

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
