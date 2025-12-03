import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { twMerge } from 'tailwind-merge';
import {
  DesignModeMessage,
  ParentToIframeMessage,
  IframeToParentMessage,
  BridgeConfig,
  ElementInfo,
  SourceInfo,
  ToggleDesignModeMessage,
  UpdateStyleMessage,
  UpdateContentMessage,
  BatchUpdateMessage,
  HeartbeatMessage,
  HealthCheckMessage,
  HealthCheckResponseMessage,
} from '../types/messages';
import { bridge, messageValidator } from './bridge';
import { AttributeNames } from './utils/attributeNames';
import {
  findElementBySourceInfo,
  findAllElementsWithSameSource,
  extractSourceInfo,
  extractElementInfo
} from './utils/domUtils';
import { DesignModeApi } from './services/DesignModeApi';

export interface Modification {
  id: string;
  element: string;
  type: 'class' | 'style';
  oldValue: string;
  newValue: string;
  timestamp: number;
}

export interface DesignModeConfig {
  enabled?: boolean;
  iframeMode?: {
    enabled: boolean;
    hideUI: boolean;
    enableSelection: boolean;
    enableDirectEdit: boolean;
  };
  batchUpdate?: {
    enabled: boolean;
    debounceMs: number;
  };
  bridge?: Partial<BridgeConfig>;
}

interface DesignModeContextType {
  // 状态
  isDesignMode: boolean;
  selectedElement: HTMLElement | null;
  modifications: Modification[];
  isConnected: boolean;
  bridgeStatus: 'connected' | 'disconnected' | 'connecting' | 'error';

  // 配置
  config: DesignModeConfig;

  // 操作方法
  toggleDesignMode: () => void;
  selectElement: (element: HTMLElement | null) => void;
  modifyElementClass: (element: HTMLElement, newClass: string) => Promise<void>;
  updateElementContent: (
    element: HTMLElement,
    newContent: string
  ) => Promise<void>;
  batchUpdateElements: (
    updates: Array<{
      element: HTMLElement;
      type: 'style' | 'content';
      newValue: string;
      originalValue?: string;
    }>
  ) => Promise<void>;
  resetModifications: () => void;

  // 桥接器方法
  sendMessage: <T extends DesignModeMessage>(message: T) => Promise<void>;
  sendMessageWithResponse: <
    T extends DesignModeMessage,
    R extends DesignModeMessage,
  >(
    message: T,
    responseType: R['type']
  ) => Promise<R>;
  healthCheck: () => Promise<any>;
}

const DesignModeContext = createContext<DesignModeContextType | undefined>(
  undefined
);

export const DesignModeProvider: React.FC<{
  children: React.ReactNode;
  config?: DesignModeConfig;
}> = ({ children, config: userConfig = {} }) => {
  // 默认配置
  const defaultConfig: DesignModeConfig = {
    enabled: true,
    iframeMode: {
      enabled: true,
      hideUI: false,
      enableSelection: true,
      enableDirectEdit: true,
    },
    batchUpdate: {
      enabled: true,
      debounceMs: 300,
    },
    bridge: {
      timeout: 10000,
      retryAttempts: 3,
      heartbeatInterval: 30000,
      debug: process.env.NODE_ENV === 'development',
    },
    ...userConfig,
  };

  // 状态
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<
    'connected' | 'disconnected' | 'connecting' | 'error'
  >('connecting');
  const [config] = useState<DesignModeConfig>(defaultConfig);

  // 批量更新防抖
  const [batchUpdateTimer, setBatchUpdateTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [pendingBatchUpdates, setPendingBatchUpdates] = useState<
    Array<{
      element: HTMLElement;
      type: 'style' | 'content';
      newValue: string;
      originalValue?: string;
    }>
  >([]);

  /**
   * 初始化桥接器连接和消息监听
   */
  useEffect(() => {
    // 初始化桥接器
    if (config.iframeMode?.enabled) {
      setBridgeStatus('connecting');

      // 监听桥接器连接状态
      const connectionCheck = setInterval(() => {
        const connected = bridge.isConnected();
        setIsConnected(connected);
        setBridgeStatus(connected ? 'connected' : 'disconnected');
      }, 1000);

      // 设置消息监听器
      const unsubscribeHandlers: (() => void)[] = [];

      // 监听设计模式切换
      unsubscribeHandlers.push(
        bridge.on<ToggleDesignModeMessage>('TOGGLE_DESIGN_MODE', message => {
          const newState = message.enabled;
          setIsDesignMode(newState);

          // 确认状态变化
          if (window.self !== window.top) {
            sendToParent({
              type: 'DESIGN_MODE_CHANGED',
              enabled: newState,
              timestamp: Date.now(),
            });
          }
        })
      );

      // 监听样式更新
      unsubscribeHandlers.push(
        bridge.on<UpdateStyleMessage>('UPDATE_STYLE', async message => {
          await handleExternalStyleUpdate(message);
        })
      );

      // 监听内容更新
      unsubscribeHandlers.push(
        bridge.on<UpdateContentMessage>('UPDATE_CONTENT', async message => {
          await handleExternalContentUpdate(message);
        })
      );

      // 监听批量更新
      unsubscribeHandlers.push(
        bridge.on<BatchUpdateMessage>('BATCH_UPDATE', async message => {
          await handleExternalBatchUpdate(message);
        })
      );

      // 监听心跳
      unsubscribeHandlers.push(
        bridge.on<HeartbeatMessage>('HEARTBEAT', _ => {
          // 回复心跳
          bridge.send({
            type: 'HEARTBEAT',
            payload: { timestamp: Date.now() },
            timestamp: Date.now(),
          });
        })
      );

      // 监听健康检查
      unsubscribeHandlers.push(
        bridge.on<HealthCheckMessage>('HEALTH_CHECK', async message => {
          const healthStatus = await bridge.healthCheck();
          // Use a type assertion or construct the object carefully to match HealthCheckResponseMessage
          const response: HealthCheckResponseMessage = {
            type: 'HEALTH_CHECK_RESPONSE',
            payload: {
              status: healthStatus.status === 'healthy' ? 'healthy' : 'unhealthy',
              version: '2.0.0',
              uptime: Date.now() - ((window as any).__startTime || 0),
            },
            requestId: message.requestId || '', // Provide requestId
            timestamp: Date.now(),
          };
          bridge.send(response);
        })
      );

      // 初始健康检查
      const initialHealthCheck = setTimeout(async () => {
        try {
          const health = await bridge.healthCheck();
          setBridgeStatus(health.status === 'healthy' ? 'connected' : 'error');
        } catch (error) {
          setBridgeStatus('error');
        }
      }, 1000);

      return () => {
        clearInterval(connectionCheck);
        clearTimeout(initialHealthCheck);
        unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
      };
    }
  }, [config]);

  /**
   * 发送消息到父窗口
   */
  const sendToParent = useCallback(
    (message: IframeToParentMessage) => {
      if (config.iframeMode?.enabled && bridge.isConnected()) {
        bridge.send(message).catch(error => {
          console.error(
            '[DesignMode] Failed to send message to parent:',
            error
          );
        });
      }
    },
    [config.iframeMode?.enabled]
  );

  /**
   * 处理外部样式更新
   */
  const handleExternalStyleUpdate = useCallback(
    async (message: UpdateStyleMessage) => {
      if (!config.iframeMode?.enabled) return;

      const updateMessage = message;
      const { sourceInfo, newClass } = updateMessage.payload;

      try {
        // 验证消息
        const validation = messageValidator.validate(updateMessage);
        if (!validation.isValid) {
          console.error(
            '[DesignMode] Invalid style update message:',
            validation.errors
          );
          return;
        }

        // 根据 sourceInfo 查找元素
        const element = findElementBySourceInfo(sourceInfo);

        if (!element) {
          console.error(
            '[DesignMode] Element not found for sourceInfo:',
            sourceInfo
          );

          sendToParent({
            type: 'ERROR',
            payload: {
              code: 'ELEMENT_NOT_FOUND',
              message: `Element not found: ${sourceInfo.fileName}:${sourceInfo.lineNumber}:${sourceInfo.columnNumber}`,
              details: { sourceInfo },
            },
            timestamp: Date.now(),
          });
          return;
        }

        const oldClass = element.className;
        console.log(
          '[DesignMode] Found element:',
          element,
          'Old class:',
          oldClass,
          'New class:',
          newClass
        );

        // 查找所有具有相同 element-id 的元素（列表项同步）
        const relatedElements = findAllElementsWithSameSource(element);

        console.log(
          '[DesignMode] Found',
          relatedElements.length,
          'related elements to update'
        );

        // 应用样式更新到所有相关元素（列表项同步）
        relatedElements.forEach(el => {
          el.setAttribute('data-ignore-mutation', 'true');
          el.className = newClass;
          // Use setTimeout to ensure MutationObserver sees the attribute
          setTimeout(() => {
            el.removeAttribute('data-ignore-mutation');
          }, 0);
        });

        console.log(
          '[DesignMode] Applied new class to',
          relatedElements.length,
          'element(s):',
          element.className
        );

        // 更新选中的元素状态（如果当前选中的是这个元素）
        if (selectedElement === element) {
          setSelectedElement(element);
        }

        // 更新源码 - 使用 DesignModeApi
        try {
          await DesignModeApi.updateSource({
            filePath: sourceInfo.fileName,
            line: sourceInfo.lineNumber,
            column: sourceInfo.columnNumber,
            newValue: newClass,
            type: 'style',
            originalValue: oldClass,
          });
        } catch (error) {
          console.error('[DesignMode] Error updating source:', error);
          throw error;
        }

        // 发送更新完成消息
        sendToParent({
          type: 'STYLE_UPDATED',
          payload: {
            sourceInfo,
            oldClass,
            newClass,
          },
          timestamp: Date.now(),
        });

        console.log('[DesignMode] Style updated from external panel');
      } catch (error) {
        console.error(
          '[DesignMode] Error handling external style update:',
          error
        );

        // 发送错误消息
        sendToParent({
          type: 'ERROR',
          payload: {
            code: 'STYLE_UPDATE_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: { sourceInfo: updateMessage.payload.sourceInfo },
          },
          timestamp: Date.now(),
        });
      }
    },
    [
      selectedElement,
      config.iframeMode?.enabled,
      sendToParent,
      setSelectedElement,
    ]
  );

  /**
   * 处理外部内容更新
   */
  const handleExternalContentUpdate = useCallback(
    async (message: UpdateContentMessage) => {
      if (!config.iframeMode?.enabled) return;

      const updateMessage = message;
      const { sourceInfo, newContent } = updateMessage.payload;

      try {
        // 验证消息
        const validation = messageValidator.validate(updateMessage);
        if (!validation.isValid) {
          console.error(
            '[DesignMode] Invalid content update message:',
            validation.errors
          );
          return;
        }

        // 根据 sourceInfo 查找元素
        const element = findElementBySourceInfo(sourceInfo);

        if (!element) {
          console.error(
            '[DesignMode] Element not found for sourceInfo:',
            sourceInfo
          );

          sendToParent({
            type: 'ERROR',
            payload: {
              code: 'ELEMENT_NOT_FOUND',
              message: `Element not found: ${sourceInfo.fileName}:${sourceInfo.lineNumber}:${sourceInfo.columnNumber}`,
              details: { sourceInfo },
            },
            timestamp: Date.now(),
          });
          return;
        }

        const originalContent = element.innerText || element.textContent || '';
        console.log(
          '[DesignMode] Found element:',
          element,
          'Old content:',
          originalContent,
          'New content:',
          newContent
        );

        // 查找所有具有相同 element-id 的元素（列表项同步）
        const relatedElements = findAllElementsWithSameSource(element);

        console.log(
          '[DesignMode] Found',
          relatedElements.length,
          'related elements to update'
        );

        // 应用内容更新到所有相关元素（列表项同步）
        relatedElements.forEach(el => {
          el.setAttribute('data-ignore-mutation', 'true');
          el.innerText = newContent;
          // Use setTimeout to ensure MutationObserver sees the attribute
          setTimeout(() => {
            el.removeAttribute('data-ignore-mutation');
          }, 0);
        });

        console.log(
          '[DesignMode] Applied new content to',
          relatedElements.length,
          'element(s)',
          element.innerText
        );

        // 更新选中的元素状态（如果当前选中的是这个元素）
        if (selectedElement === element) {
          setSelectedElement(element);
        }

        // 只有在 persist 为 true (默认) 时才更新源码
        if (updateMessage.payload.persist !== false) {
          // 更新源码 - 使用 extractSourceInfo 获取源码信息
          const elementSourceInfo = extractSourceInfo(element);
          if (elementSourceInfo) {
            try {
              await DesignModeApi.updateSource({
                filePath: elementSourceInfo.fileName,
                line: elementSourceInfo.lineNumber,
                column: elementSourceInfo.columnNumber,
                newValue: newContent,
                type: 'content',
                originalValue: originalContent,
              });
            } catch (error) {
              console.error('[DesignMode] Error updating source:', error);
              throw error;
            }
          }
        }

        // 发送更新完成消息
        sendToParent({
          type: 'CONTENT_UPDATED',
          payload: {
            sourceInfo,
            oldValue: originalContent,
            newValue: newContent,
          },
          timestamp: Date.now(),
        });

        console.log('[DesignMode] Content updated from external panel');
      } catch (error) {
        console.error(
          '[DesignMode] Error handling external content update:',
          error
        );

        // 发送错误消息
        sendToParent({
          type: 'ERROR',
          payload: {
            code: 'CONTENT_UPDATE_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: { sourceInfo: updateMessage.payload.sourceInfo },
          },
          timestamp: Date.now(),
        });
      }
    },
    [
      selectedElement,
      config.iframeMode?.enabled,
      sendToParent,
      setSelectedElement,
    ]
  );

  /**
   * 处理外部批量更新
   */
  const handleExternalBatchUpdate = useCallback(
    async (message: BatchUpdateMessage) => {
      const updateMessage = message;
      const { updates } = updateMessage.payload;

      try {
        // 验证消息
        const validation = messageValidator.validate(updateMessage);
        if (!validation.isValid) {
          console.error(
            '[DesignMode] Invalid batch update message:',
            validation.errors
          );
          return;
        }

        // 批量处理更新
        const results = await Promise.allSettled(
          updates.map(async (update: any) => {
            const element = findElementBySourceInfo(update.sourceInfo);
            if (!element) {
              throw new Error(
                `Element not found: ${update.sourceInfo.fileName}:${update.sourceInfo.lineNumber}`
              );
            }

            if (update.type === 'style') {
              element.setAttribute('data-ignore-mutation', 'true');
              element.className = update.newValue;
              setTimeout(() => element.removeAttribute('data-ignore-mutation'), 0);
            } else if (update.type === 'content') {
              element.setAttribute('data-ignore-mutation', 'true');
              element.innerText = update.newValue;
              setTimeout(() => element.removeAttribute('data-ignore-mutation'), 0);
            }

            await DesignModeApi.updateSource({
              filePath: update.sourceInfo.fileName,
              line: update.sourceInfo.lineNumber,
              column: update.sourceInfo.columnNumber,
              newValue: update.newValue,
              type: update.type,
              originalValue: update.originalValue,
            });

            return { success: true, sourceInfo: update.sourceInfo };
          })
        );

        console.log('[DesignMode] Batch update completed:', results);
      } catch (error) {
        console.error('[DesignMode] Error handling batch update:', error);

        // 发送错误消息
        sendToParent({
          type: 'ERROR',
          payload: {
            code: 'BATCH_UPDATE_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: { updatesCount: updates?.length || 0 },
          },
          timestamp: Date.now(),
        });
      }
    },
    []
  );

  /**
   * 元素选择处理
   */
  const selectElement = useCallback(
    async (element: HTMLElement | null) => {
      setSelectedElement(element);

      // 发送选择信息到父窗口（仅在iframe环境下）
      if (element && config.iframeMode?.enabled) {
        // Use extractElementInfo from domUtils
        const elementInfo = extractElementInfo(element);

        if (elementInfo) {
          sendToParent({
            type: 'ELEMENT_SELECTED',
            payload: { elementInfo },
            timestamp: Date.now(),
          });

          console.log('[DesignMode] Sent ELEMENT_SELECTED to parent', elementInfo);
        } else {
          console.warn(
            `[DesignMode] Element selected but missing source info or invalid:`,
            element
          );
        }
      } else if (!element && config.iframeMode?.enabled) {
        sendToParent({
          type: 'ELEMENT_DESELECTED',
          timestamp: Date.now(),
        });
      }
    },
    [config.iframeMode?.enabled]
  );

  /**
   * 切换设计模式
   */
  const toggleDesignMode = useCallback(() => {
    setIsDesignMode(prev => {
      const next = !prev;

      if (window.self !== window.top) {
        sendToParent({
          type: 'DESIGN_MODE_CHANGED',
          enabled: next,
          timestamp: Date.now(),
        });
      }

      return next;
    });
  }, [sendToParent]);

  /**
   * 修改元素类名
   */
  const modifyElementClass = useCallback(
    async (element: HTMLElement, newClass: string) => {
      const sourceInfo = extractSourceInfo(element);
      if (!sourceInfo) {
        console.error('[DesignMode] Cannot modify class: no source info');
        return;
      }

      const oldClass = element.className;

      // Update DOM
      element.className = newClass;

      // Update source
      await DesignModeApi.updateSource({
        filePath: sourceInfo.fileName,
        line: sourceInfo.lineNumber,
        column: sourceInfo.columnNumber,
        newValue: newClass,
        type: 'style',
        originalValue: oldClass,
      });
    },
    []
  );

  /**
   * 更新元素内容
   */
  const updateElementContent = useCallback(
    async (element: HTMLElement, newContent: string) => {
      const sourceInfo = extractSourceInfo(element);
      if (!sourceInfo) {
        console.error('[DesignMode] Cannot update content: no source info');
        return;
      }

      const originalContent = element.innerText;

      // Update DOM
      element.innerText = newContent;

      // Update source
      await DesignModeApi.updateSource({
        filePath: sourceInfo.fileName,
        line: sourceInfo.lineNumber,
        column: sourceInfo.columnNumber,
        newValue: newContent,
        type: 'content',
        originalValue: originalContent,
      });
    },
    []
  );

  /**
   * 批量更新元素
   */
  const batchUpdateElements = useCallback(
    async (updates: Array<{
      element: HTMLElement;
      type: 'style' | 'content';
      newValue: string;
      originalValue?: string;
    }>) => {
      // Implement batch update using DesignModeApi if needed, or loop
      // For now, simple loop
      for (const update of updates) {
        if (update.type === 'style') {
          await modifyElementClass(update.element, update.newValue);
        } else {
          await updateElementContent(update.element, update.newValue);
        }
      }
    },
    [modifyElementClass, updateElementContent]
  );

  /**
   * 重置修改
   */
  const resetModifications = useCallback(() => {
    setModifications([]);
  }, []);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async <T extends DesignModeMessage>(message: T) => {
      if (config.iframeMode?.enabled) {
        await bridge.send(message);
      }
    },
    [config.iframeMode?.enabled]
  );

  /**
   * 发送消息并等待响应
   */
  const sendMessageWithResponse = useCallback(
    async <T extends DesignModeMessage, R extends DesignModeMessage>(
      message: T,
      responseType: R['type']
    ) => {
      if (config.iframeMode?.enabled) {
        return await bridge.sendWithResponse<T, R>(message, responseType);
      }
      throw new Error('Bridge not enabled');
    },
    [config.iframeMode?.enabled]
  );

  /**
   * 健康检查
   */
  const healthCheck = useCallback(async () => {
    if (config.iframeMode?.enabled) {
      return await bridge.healthCheck();
    }
    return { status: 'disabled' };
  }, [config.iframeMode?.enabled]);

  const value: DesignModeContextType = {
    isDesignMode,
    selectedElement,
    modifications,
    isConnected,
    bridgeStatus,
    config,
    toggleDesignMode,
    selectElement,
    modifyElementClass,
    updateElementContent,
    batchUpdateElements,
    resetModifications,
    sendMessage,
    sendMessageWithResponse,
    healthCheck,
  };

  return (
    <DesignModeContext.Provider value={value}>
      {children}
    </DesignModeContext.Provider>
  );
};

export const useDesignMode = () => {
  const context = useContext(DesignModeContext);
  if (context === undefined) {
    throw new Error('useDesignMode must be used within a DesignModeProvider');
  }
  return context;
};
