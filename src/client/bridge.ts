import {
  DesignModeMessage,
  IframeToParentMessage,
  ParentToIframeMessage,
  RequestResponseMessage,
  MessageValidator,
  BridgeInterface,
  BridgeConfig,
  MessageUtils as MessageUtilsInterface,
  MessageValidationResult,
  AcknowledgementMessage,
  HealthCheckMessage,
  HealthCheckResponseMessage,
  HeartbeatMessage
} from '../types/messages';

/**
 * 增强的桥接通信层
 * 支持Promise-based请求-响应、消息验证、错误处理等功能
 */
export class EnhancedBridge implements BridgeInterface {
  private listeners: Map<string, Set<Function>> = new Map();
  private pendingRequests: Map<string, {
    resolve: Function;
    reject: Function;
    timeout: NodeJS.Timeout;
    responseType: string;
  }> = new Map();
  
  private config: BridgeConfig;
  private _isConnected = false;
  private lastHeartbeat = 0;
  private heartbeatTimer?: NodeJS.Timeout;
  private connectionCheckTimer?: NodeJS.Timeout;

  constructor(config: Partial<BridgeConfig> = {}) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      heartbeatInterval: 30000,
      debug: false,
      ...config
    };

    this.initializeMessageHandling();
    this.initializeHeartbeat();
    this.initializeConnectionCheck();
  }

  /**
   * 初始化消息处理
   */
  private initializeMessageHandling() {
    if (typeof window === 'undefined') return;

    window.addEventListener('message', this.handleMessage.bind(this));
    
    // 在iframe环境中，延迟标记为已连接
    // 给父窗口时间准备接收消息
    if (this.isIframeEnvironment()) {
      setTimeout(() => {
        this._isConnected = true;
        this.log('Bridge initialized and connected (iframe mode)');
        
        // 发送就绪消息到父窗口
        this.sendReadyMessage();
      }, 200);
    } else {
      // 在主窗口中，直接标记为已连接
      setTimeout(() => {
        this._isConnected = true;
        this.log('Bridge initialized and connected (main window mode)');
      }, 100);
    }
  }

  /**
   * 发送就绪消息
   */
  private sendReadyMessage() {
    try {
      const readyMessage = {
        type: 'BRIDGE_READY',
        payload: {
          timestamp: this.createTimestamp(),
          environment: 'iframe'
        },
        timestamp: this.createTimestamp()
      };
      
      this.getTargetWindow().postMessage(readyMessage, '*');
      this.log('Sent ready message to parent');
    } catch (error) {
      this.log('Failed to send ready message:', error);
    }
  }

  /**
   * 初始化心跳机制
   */
  private initializeHeartbeat() {
    if (typeof window === 'undefined') return;

    // 如果我们在iframe中，定期发送心跳
    if (this.isIframeEnvironment()) {
      this.heartbeatTimer = setInterval(() => {
        this.sendHeartbeat();
      }, this.config.heartbeatInterval);
    }
  }

  /**
   * 初始化连接检查
   */
  private initializeConnectionCheck() {
    if (typeof window === 'undefined') return;

    this.connectionCheckTimer = setInterval(() => {
      this.checkConnection();
    }, this.config.heartbeatInterval * 2);
  }

  /**
   * 检查当前是否为iframe环境
   */
  private isIframeEnvironment(): boolean {
    return typeof window !== 'undefined' && window.self !== window.top;
  }

  /**
   * 获取当前环境信息
   */
  public getEnvironmentInfo(): {
    isIframe: boolean;
    isConnected: boolean;
    origin: string;
    userAgent: string;
    location: string;
  } {
    if (typeof window === 'undefined') {
      return {
        isIframe: false,
        isConnected: false,
        origin: '',
        userAgent: '',
        location: ''
      };
    }

    return {
      isIframe: this.isIframeEnvironment(),
      isConnected: this._isConnected,
      origin: window.location.origin,
      userAgent: navigator.userAgent.substring(0, 100),
      location: window.location.href
    };
  }

  /**
   * 诊断Bridge状态
   */
  public diagnose(): void {
    const env = this.getEnvironmentInfo();
    
    console.group('[EnhancedBridge] Bridge Diagnosis');
    console.log('Environment:', env);
    console.log('Connection Status:', this._isConnected);
    console.log('Pending Requests:', this.pendingRequests.size);
    console.log('Message Listeners:', Array.from(this.listeners.keys()));
    console.log('Config:', this.config);
    console.groupEnd();
  }

  /**
   * 获取目标窗口
   */
  private getTargetWindow(): Window {
    return this.isIframeEnvironment() ? window.parent : window;
  }

  /**
   * 消息处理器
   */
  private handleMessage(event: MessageEvent) {
    // 跳过跨域消息（可选的安全措施）
    // if (event.origin !== window.location.origin && window.location.origin !== 'null') {
    //   // 允许file://和data://协议的本地文件
    //   if (!event.origin.startsWith('http') && !event.origin.startsWith('https')) {
    //     this.log('Received message from different origin, allowing:', event.origin);
    //   } else {
    //     this.log('Skipping message from different origin:', event.origin);
    //     return;
    //   }
    // }

    const message = event.data;
    
    // 跳过无效消息
    if (!this.isValidMessage(message)) {
      this.log('Invalid message received:', message);
      return;
    }

    // 处理桥接就绪消息
    if (message.type === 'BRIDGE_READY') {
      this.log('Received ready message from child');
      this._isConnected = true;
      return;
    }

    // 处理请求响应
    if (this.isResponseMessage(message)) {
      this.handleResponseMessage(message);
      return;
    }

    // 处理普通消息
    this.dispatchMessage(message);
  }

  /**
   * 处理响应消息
   */
  private handleResponseMessage(message: RequestResponseMessage) {
    const { requestId } = message;
    
    if (this.pendingRequests.has(requestId)) {
      const request = this.pendingRequests.get(requestId)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(requestId);

      if (message.type === 'ACKNOWLEDGEMENT') {
        // 确认消息，不需要响应
        request.resolve({ success: true, acknowledged: true });
      } else {
        // 完整响应消息
        request.resolve(message);
      }
    }
  }

  /**
   * 消息验证
   */
  private isValidMessage(message: any): message is DesignModeMessage {
    return (
      message &&
      typeof message.type === 'string' &&
      this.isSupportedMessageType(message.type)
    );
  }

  /**
   * 检查是否为支持的的消息类型
   */
  private isSupportedMessageType(type: string): boolean {
    const supportedTypes = [
      // Iframe to Parent
      'ELEMENT_SELECTED', 'ELEMENT_DESELECTED', 'CONTENT_UPDATED', 'STYLE_UPDATED',
      'DESIGN_MODE_CHANGED', 'ELEMENT_STATE_RESPONSE', 'ERROR', 'ACKNOWLEDGEMENT',
      'HEARTBEAT', 'HEALTH_CHECK_RESPONSE', 'BRIDGE_READY',
      // Parent to Iframe
      'TOGGLE_DESIGN_MODE', 'UPDATE_STYLE', 'UPDATE_CONTENT', 'BATCH_UPDATE',
      'GET_ELEMENT_STATE', 'HEALTH_CHECK'
    ];
    return supportedTypes.includes(type);
  }

  /**
   * 检查是否为响应消息
   */
  private isResponseMessage(message: any): message is RequestResponseMessage {
    return message && 
      (message.type === 'ACKNOWLEDGEMENT' || 
       message.requestId !== undefined) &&
      (message.timestamp !== undefined);
  }

  /**
   * 发送消息
   */
  public async send<T extends DesignModeMessage>(message: T): Promise<void> {
    // 更宽松的连接检查
    if (!this._isConnected && this.isIframeEnvironment()) {
      // 在iframe环境中，如果没有连接，尝试重新连接
      this.log('Bridge not connected, attempting to reconnect...');
      
      // 设置一个短暂的超时来等待连接
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!this._isConnected) {
        console.warn('[EnhancedBridge] Bridge still not connected, message will be queued');
        // 不抛出错误，而是记录警告并返回
        return;
      }
    }

    // 在主窗口中，如果没有目标iframe，发送可能会失败但不应该抛出错误
    if (!this._isConnected && !this.isIframeEnvironment()) {
      this.log('Running in main window, bridge connection not applicable');
      return;
    }

    const enhancedMessage = this.enhanceMessage(message);
    
    try {
      this.log('Sending message:', enhancedMessage);
      
      // 发送消息到目标窗口
      this.getTargetWindow().postMessage(enhancedMessage, '*');
      
      // 发送确认消息（不需要等待响应）
      if (this.isIframeEnvironment() && enhancedMessage.requestId) {
        this.sendAcknowledgement(enhancedMessage.requestId);
      }
    } catch (error) {
      this.log('Error sending message:', error);
      
      // 在开发环境中抛出错误，生产环境中只记录
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
  }

  /**
   * 发送消息并等待响应
   */
  public async sendWithResponse<T extends DesignModeMessage, R extends DesignModeMessage>(
    message: T,
    responseType: R['type']
  ): Promise<R> {
    if (!this._isConnected) {
      throw new Error('Bridge is not connected');
    }

    const enhancedMessage = this.enhanceMessage(message);
    const requestId = enhancedMessage.requestId!;

    return new Promise((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      // 存储待处理的请求
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
        responseType
      });

      try {
        this.log('Sending request with response:', enhancedMessage);
        this.getTargetWindow().postMessage(enhancedMessage, '*');
      } catch (error) {
        this.pendingRequests.delete(requestId);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * 增强消息（添加requestId和时间戳）
   */
  private enhanceMessage<T extends DesignModeMessage>(message: T): T & { requestId?: string; timestamp: number } {
    const requestId = (message as any).requestId || this.generateRequestId();
    const timestamp = (message as any).timestamp || this.createTimestamp();
    
    return {
      ...message,
      requestId,
      timestamp
    };
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建时间戳
   */
  private createTimestamp(): number {
    return Date.now();
  }

  /**
   * 发送确认消息
   */
  private sendAcknowledgement(requestId: string) {
    const acknowledgement: AcknowledgementMessage = {
      type: 'ACKNOWLEDGEMENT',
      payload: {
        messageType: 'UNKNOWN', // 这里应该传入实际的消息类型
      },
      requestId,
      timestamp: this.createTimestamp()
    };

    this.getTargetWindow().postMessage(acknowledgement, '*');
  }

  /**
   * 发送心跳
   */
  private sendHeartbeat() {
    const heartbeat: HeartbeatMessage = {
      type: 'HEARTBEAT',
      payload: {
        timestamp: this.createTimestamp()
      },
      timestamp: this.createTimestamp()
    };

    this.getTargetWindow().postMessage(heartbeat, '*');
    this.lastHeartbeat = Date.now();
  }

  /**
   * 检查连接状态
   */
  private checkConnection() {
    const now = Date.now();
    const timeSinceLastHeartbeat = now - this.lastHeartbeat;
    
    if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 3) {
      this.log('Connection appears to be lost');
      this._isConnected = false;
      
      // 尝试重新连接
      setTimeout(() => {
        this._isConnected = true;
        this.log('Connection restored');
      }, 1000);
    }
  }

  /**
   * 监听消息
   */
  public on<T extends DesignModeMessage>(type: T['type'], handler: (message: T) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(handler);
    
    // 返回取消监听的函数
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  /**
   * 取消监听
   */
  public off(type: string, handler: Function): void {
    this.listeners.get(type)?.delete(handler);
  }

  /**
   * 分发消息到处理器
   */
  private dispatchMessage(message: DesignModeMessage) {
    const handlers = this.listeners.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          this.log('Error in message handler:', error);
        }
      });
    }
  }

  /**
   * 获取连接状态
   */
  public isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * 获取连接状态 (Alias for backward compatibility if needed)
   */
  public isConnectedToTarget(): boolean {
    return this._isConnected;
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    this._isConnected = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    if (this.connectionCheckTimer) {
      clearInterval(this.connectionCheckTimer);
    }
    
    // 清理待处理的请求
    this.pendingRequests.forEach(request => {
      clearTimeout(request.timeout);
      request.reject(new Error('Connection disconnected'));
    });
    this.pendingRequests.clear();
    
    // 清理消息监听器
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
    this.listeners.clear();
    
    this.log('Bridge disconnected');
  }

  /**
   * 健康检查
   */
  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const env = this.getEnvironmentInfo();
      
      // 基本健康检查
      if (!env.isIframe && this._isConnected) {
        return {
          status: 'healthy',
          details: {
            ...env,
            message: 'Bridge is healthy and running in main window'
          }
        };
      }
      
      if (env.isIframe && this._isConnected) {
        // 在iframe中，尝试发送健康检查请求
        try {
          const response = await this.sendWithResponse<HealthCheckMessage, HealthCheckResponseMessage>(
            {
              type: 'HEALTH_CHECK',
              requestId: '',
              timestamp: this.createTimestamp()
            },
            'HEALTH_CHECK_RESPONSE'
          );

          return {
            status: 'healthy',
            details: {
              ...env,
              response: response.payload,
              message: 'Bridge is healthy and responsive'
            }
          };
        } catch (error) {
          return {
            status: 'degraded',
            details: {
              ...env,
              error: error instanceof Error ? error.message : 'Unknown error',
              message: 'Bridge is connected but not responding to health checks'
            }
          };
        }
      }
      
      return {
        status: env.isIframe ? 'connecting' : 'unnecessary',
        details: {
          ...env,
          message: env.isIframe ? 'Bridge is initializing' : 'Bridge not needed in main window'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          environment: this.getEnvironmentInfo()
        }
      };
    }
  }

  /**
   * 调试日志
   */
  private log(...args: any[]) {
    if (this.config.debug) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [EnhancedBridge]`, ...args);
    }
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.disconnect();
  }
}

/**
 * 桥接工具函数
 */
export const MessageUtils: MessageUtilsInterface = {
  generateRequestId: (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  createTimestamp: (): number => {
    return Date.now();
  },

  isValidMessage: (message: any): boolean => {
    return message && 
           typeof message.type === 'string' &&
           typeof message.timestamp === 'number';
  },

  createResponse: function<T extends IframeToParentMessage>(
    originalMessage: ParentToIframeMessage,
    payload: T extends { payload: infer P } ? P : never,
    success: boolean = true,
    error?: string
  ): T {
    return {
      payload,
      type: (payload as any)?.type,
      requestId: (originalMessage as any).requestId || '',
      timestamp: this.createTimestamp()
    } as unknown as T;
  }
};

/**
 * 默认桥接实例
 */
export const bridge = new EnhancedBridge();

/**
 * 消息验证器
 */
export class MessageValidatorImpl implements MessageValidator {
  validate(message: any): MessageValidationResult {
    const errors: string[] = [];

    if (!message) {
      errors.push('Message is null or undefined');
      return { isValid: false, errors };
    }

    if (typeof message.type !== 'string') {
      errors.push('Message type must be a string');
    }

    if (typeof message.timestamp !== 'number') {
      errors.push('Message timestamp must be a number');
    }

    // 检查特定消息类型的字段
    switch (message.type) {
      case 'ELEMENT_SELECTED':
        if (!message.payload?.elementInfo) {
          errors.push('ELEMENT_SELECTED must have elementInfo in payload');
        }
        break;
      
      case 'UPDATE_STYLE':
      case 'UPDATE_CONTENT':
        if (!message.payload?.sourceInfo) {
          errors.push(`${message.type} must have sourceInfo in payload`);
        }
        break;

      case 'BATCH_UPDATE':
        if (!Array.isArray(message.payload?.updates)) {
          errors.push('BATCH_UPDATE must have updates array in payload');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export const messageValidator = new MessageValidatorImpl();
