// Message types for iframe ↔ parent window communication

export interface SourceInfo {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

export interface ElementInfo {
  tagName: string;
  className: string;
  textContent: string;
  sourceInfo: SourceInfo;
}

// 消息验证相关类型
export interface MessageValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface MessageValidator {
  validate: (message: any) => MessageValidationResult;
}

// Promise-based 请求响应相关类型
export interface RequestMessage extends ParentToIframeMessage {
  requestId: string;
  timestamp: number;
}

export interface ResponseMessage extends IframeToParentMessage {
  requestId: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

// iframe → Parent messages
export interface ElementSelectedMessage {
  type: 'ELEMENT_SELECTED';
  payload: {
    elementInfo: ElementInfo;
  };
  requestId?: string;
  timestamp?: number;
}

export interface ElementDeselectedMessage {
  type: 'ELEMENT_DESELECTED';
  requestId?: string;
  timestamp?: number;
}

export interface ContentUpdatedMessage {
  type: 'CONTENT_UPDATED';
  payload: {
    sourceInfo: SourceInfo;
    oldValue: string;
    newValue: string;
  };
  requestId?: string;
  timestamp?: number;
}

export interface StyleUpdatedMessage {
  type: 'STYLE_UPDATED';
  payload: {
    sourceInfo: SourceInfo;
    oldClass: string;
    newClass: string;
  };
  requestId?: string;
  timestamp?: number;
}

export interface DesignModeChangedMessage {
  type: 'DESIGN_MODE_CHANGED';
  enabled: boolean;
  requestId?: string;
  timestamp?: number;
}

// Parent → iframe messages
export interface ToggleDesignModeMessage {
  type: 'TOGGLE_DESIGN_MODE';
  enabled: boolean;
  requestId?: string;
  timestamp?: number;
}

export interface UpdateStyleMessage {
  type: 'UPDATE_STYLE';
  payload: {
    sourceInfo: SourceInfo;
    newClass: string;
  };
  requestId?: string;
  timestamp?: number;
}

export interface UpdateContentMessage {
  type: 'UPDATE_CONTENT';
  payload: {
    sourceInfo: SourceInfo;
    newContent: string;
  };
  requestId?: string;
  timestamp?: number;
}

export interface BatchUpdateItem {
  type: 'style' | 'content';
  sourceInfo: SourceInfo;
  newValue: string;
  originalValue?: string;
}

export interface BatchUpdateMessage {
  type: 'BATCH_UPDATE';
  payload: {
    updates: BatchUpdateItem[];
  };
  requestId?: string;
  timestamp?: number;
}

// 新增：状态查询和响应消息
export interface GetElementStateMessage {
  type: 'GET_ELEMENT_STATE';
  payload: {
    sourceInfo: SourceInfo;
  };
  requestId: string;
  timestamp: number;
}

export interface ElementStateResponseMessage {
  type: 'ELEMENT_STATE_RESPONSE';
  payload: {
    sourceInfo: SourceInfo;
    elementInfo: ElementInfo;
    modifications: Array<{
      type: 'style' | 'content';
      oldValue: string;
      newValue: string;
      timestamp: number;
    }>;
  };
  requestId: string;
  timestamp: number;
}

// 新增：错误处理消息
export interface ErrorMessage {
  type: 'ERROR';
  payload: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
  timestamp: number;
}

// 新增：确认消息
export interface AcknowledgementMessage {
  type: 'ACKNOWLEDGEMENT';
  payload: {
    messageType: string;
    requestId?: string;
  };
  timestamp: number;
}

// 新增：心跳和健康检查消息
export interface HeartbeatMessage {
  type: 'HEARTBEAT';
  payload?: {
    timestamp: number;
  };
  timestamp: number;
}

export interface HealthCheckMessage {
  type: 'HEALTH_CHECK';
  requestId: string;
  timestamp: number;
}

export interface HealthCheckResponseMessage {
  type: 'HEALTH_CHECK_RESPONSE';
  payload: {
    status: 'healthy' | 'unhealthy';
    version: string;
    uptime: number;
  };
  requestId: string;
  timestamp: number;
}

// Union types
export type IframeToParentMessage =
  | ElementSelectedMessage
  | ElementDeselectedMessage
  | ContentUpdatedMessage
  | StyleUpdatedMessage
  | DesignModeChangedMessage
  | ElementStateResponseMessage
  | ErrorMessage
  | AcknowledgementMessage
  | HeartbeatMessage
  | HealthCheckResponseMessage;

export type ParentToIframeMessage =
  | ToggleDesignModeMessage
  | UpdateStyleMessage
  | UpdateContentMessage
  | BatchUpdateMessage
  | GetElementStateMessage
  | HealthCheckMessage;

export type DesignModeMessage = IframeToParentMessage | ParentToIframeMessage;

// Promise-based 请求响应类型
export type RequestResponseMessage = RequestMessage | ResponseMessage | AcknowledgementMessage;

// 消息处理器类型
export interface MessageHandler<T extends DesignModeMessage = DesignModeMessage> {
  type: T['type'];
  handler: (message: T) => Promise<any> | any;
  validator?: MessageValidator;
}

// 配置相关类型
export interface IframeModeConfig {
  enabled: boolean;
  hideUI: boolean;
  enableSelection: boolean;
  enableDirectEdit: boolean;
}

export interface BatchUpdateConfig {
  enabled: boolean;
  debounceMs: number;
}

export interface BridgeConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  heartbeatInterval: number;
  debug: boolean;
}

// 工具函数类型
export interface MessageUtils {
  generateRequestId: () => string;
  createTimestamp: () => number;
  isValidMessage: (message: any) => boolean;
  createResponse: <T extends IframeToParentMessage>(
    originalMessage: ParentToIframeMessage,
    payload: T['payload'],
    success?: boolean,
    error?: string
  ) => T;
}

// 桥接器接口
export interface BridgeInterface {
  send: <T extends ParentToIframeMessage>(message: T) => Promise<void>;
  sendWithResponse: <T extends ParentToIframeMessage, R extends IframeToParentMessage>(
    message: T,
    responseType: R['type']
  ) => Promise<R>;
  on: <T extends DesignModeMessage>(type: T['type'], handler: (message: T) => void) => void;
  off: (type: string, handler: Function) => void;
  isConnected: () => boolean;
  disconnect: () => void;
}
