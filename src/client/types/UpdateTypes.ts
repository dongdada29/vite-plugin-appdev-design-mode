import { SourceInfo } from '../../types/messages';

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
