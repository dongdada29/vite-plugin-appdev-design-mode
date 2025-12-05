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
import { isPureStaticText } from './utils/elementUtils';
import { extractSourceInfo } from './utils/sourceInfo';
import { resolveSourceInfo } from './utils/sourceInfoResolver';

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
   * 根据源码信息查找元素
   */
  const findElementBySourceInfo = useCallback(
    (sourceInfo: SourceInfo): HTMLElement | null => {
      // 1. 尝试通过 elementId 查找 (最快)
      if (sourceInfo.elementId) {
        const element = document.querySelector(`[${AttributeNames.elementId}="${sourceInfo.elementId}"]`);
        if (element) return element as HTMLElement;
      }

      // 2. 尝试通过 file/line/column 属性查找 (如果存在)
      const selector = `[${AttributeNames.file}="${sourceInfo.fileName}"][${AttributeNames.line}="${sourceInfo.lineNumber}"][${AttributeNames.column}="${sourceInfo.columnNumber}"]`;
      const element = document.querySelector(selector);
      if (element) return element as HTMLElement;

      // 3. 尝试通过 children-source 查找 (用于查找 pass-through 内容的宿主元素)
      const childrenSourceValue = `${sourceInfo.fileName}:${sourceInfo.lineNumber}:${sourceInfo.columnNumber}`;
      const elementByChildrenSource = document.querySelector(`[${AttributeNames.childrenSource}="${childrenSourceValue}"]`);
      if (elementByChildrenSource) return elementByChildrenSource as HTMLElement;

      // 4. 扫描所有带有 info 属性的元素 (最慢，但作为后备方案)
      const allElements = document.querySelectorAll(`[${AttributeNames.info}]`);
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i] as HTMLElement;
        try {
          const infoStr = el.getAttribute(AttributeNames.info);
          if (infoStr) {
            const info = JSON.parse(infoStr);
            if (
              info.fileName === sourceInfo.fileName &&
              info.lineNumber === sourceInfo.lineNumber &&
              info.columnNumber === sourceInfo.columnNumber
            ) {
              return el;
            }
          }
        } catch (e) {
          // ignore parse error
        }
      }

      return null;
    },
    []
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

        // 查找所有具有相同 element-id 的元素（列表项同步）
        const elementId = element.getAttribute(AttributeNames.elementId);
        let relatedElements: HTMLElement[] = [element];

        if (elementId) {
          // 使用 element-id 查找所有相同的列表项
          const allElementsWithId = Array.from(
            document.querySelectorAll(`[${AttributeNames.elementId}]`)
          ) as HTMLElement[];

          relatedElements = allElementsWithId.filter(el => {
            const elId = el.getAttribute(AttributeNames.elementId);
            return elId === elementId;
          });
        } else {
          console.warn('[DesignMode] Element missing element-id attribute, only updating current element');
        }

        // 应用样式更新到所有相关元素（列表项同步）
        relatedElements.forEach(el => {
          el.setAttribute('data-ignore-mutation', 'true');
          el.className = newClass;
          // Use setTimeout to ensure MutationObserver sees the attribute
          setTimeout(() => {
            el.removeAttribute('data-ignore-mutation');
          }, 0);
        });


        // 更新选中的元素状态（如果当前选中的是这个元素）
        if (selectedElement === element) {
          setSelectedElement(element);
        }

        // 更新源码 - 直接使用 sourceInfo
        // try {
        //   const response = await fetch('/__appdev_design_mode/update', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       filePath: sourceInfo.fileName,
        //       line: sourceInfo.lineNumber,
        //       column: sourceInfo.columnNumber,
        //       newValue: newClass,
        //       type: 'style',
        //       originalValue: oldClass,
        //     }),
        //   });

        //   if (!response.ok) {
        //     throw new Error('Failed to update source');
        //   }
        // } catch (error) {
        //   console.error('[DesignMode] Error updating source:', error);
        //   throw error;
        // }

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
      findElementBySourceInfo
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

        // 查找所有具有相同 element-id 的元素（列表项同步）
        const elementId = element.getAttribute(AttributeNames.elementId);
        let relatedElements: HTMLElement[] = [element];

        if (elementId) {
          // 使用 element-id 查找所有相同的列表项
          const allElementsWithId = Array.from(
            document.querySelectorAll(`[${AttributeNames.elementId}]`)
          ) as HTMLElement[];

          relatedElements = allElementsWithId.filter(el => {
            const elId = el.getAttribute(AttributeNames.elementId);
            return elId === elementId;
          });
        } else {
          console.warn('[DesignMode] Element missing element-id attribute, only updating current element');
        }

        // 应用内容更新到所有相关元素（列表项同步）
        relatedElements.forEach(el => {
          el.setAttribute('data-ignore-mutation', 'true');
          el.innerText = newContent;
          // Use setTimeout to ensure MutationObserver sees the attribute
          setTimeout(() => {
            el.removeAttribute('data-ignore-mutation');
          }, 0);
        });


        // 更新选中的元素状态（如果当前选中的是这个元素）
        if (selectedElement === element) {
          setSelectedElement(element);
        }

        // 只有在 persist 为 true (默认) 时才更新源码
        // if (updateMessage.payload.persist !== false) {
        //   // 更新源码 - 使用 extractSourceInfo 获取源码信息
        //   const elementSourceInfo = extractSourceInfo(element);
        //   if (elementSourceInfo) {
        //     try {
        //       const response = await fetch('/__appdev_design_mode/update', {
        //         method: 'POST',
        //         headers: {
        //           'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //           filePath: elementSourceInfo.fileName,
        //           line: elementSourceInfo.lineNumber,
        //           column: elementSourceInfo.columnNumber,
        //           newValue: newContent,
        //           type: 'content',
        //           originalValue: originalContent,
        //         }),
        //       });

        //       if (!response.ok) {
        //         throw new Error('Failed to update source');
        //       }
        //     } catch (error) {
        //       console.error('[DesignMode] Error updating source:', error);
        //       throw error;
        //     }
        //   }
        // }

        // 发送更新完成消息
        sendToParent({
          type: 'CONTENT_UPDATED_CALLBACK',
          payload: {
            sourceInfo,
            oldValue: originalContent,
            newValue: newContent,
          },
          timestamp: Date.now(),
        });

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
      findElementBySourceInfo
    ]
  );

  /**
   * 更新源码文件
   */
  const updateSource = useCallback(
    async (
      element: HTMLElement,
      newValue: string,
      type: 'style' | 'content',
      originalValue?: string
    ) => {
      const sourceInfo = extractSourceInfo(element);
      if (!sourceInfo) {
        throw new Error('Element does not have source mapping data');
      }

      try {
        const response = await fetch('/__appdev_design_mode/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: sourceInfo.fileName,
            line: sourceInfo.lineNumber,
            column: sourceInfo.columnNumber,
            newValue,
            type,
            originalValue,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update source');
        }

      } catch (error) {
        console.error('[DesignMode] Error updating source:', error);
        throw error;
      }
    },
    []
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

            await updateSource(
              element,
              update.newValue,
              update.type,
              update.originalValue
            );

            return { success: true, sourceInfo: update.sourceInfo };
          })
        );

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
    [findElementBySourceInfo, sendToParent, updateSource]
  );

  /**
   * 元素选择处理
   */
  const selectElement = useCallback(
    async (element: HTMLElement | null) => {
      if (element && (element.hasAttribute(AttributeNames.staticContent)
        || element.hasAttribute(AttributeNames.staticClass))) {
        setSelectedElement(element);
      } else {
        setSelectedElement(null);
      }

      // 发送选择信息到父窗口（仅在iframe环境下）
      if (element && config.iframeMode?.enabled) {
        // 使用 resolveSourceInfo 获取正确的源位置
        // 对于 UI 组件（如 Button），会返回其使用位置而非定义位置
        const sourceInfo = resolveSourceInfo(element);
        console.log('[DesignModeContext] selectElement - resolveSourceInfo:', sourceInfo);

        if (sourceInfo) {
          // 判断是否为静态文本：
          // 1. 检查元素是否有 static-content 属性
          // 2. 严格验证元素是否真的只包含纯文本节点（不包含其他元素标签）
          const hasStaticContentAttr = element.hasAttribute(AttributeNames.staticContent);
          const isActuallyPureText = isPureStaticText(element);
          const isStaticText = hasStaticContentAttr && isActuallyPureText;

          // 判断是否为静态 className：
          // 检查元素是否有 static-class 属性（表示 className 是纯静态字符串，可编辑）
          const isStaticClass = element.hasAttribute(AttributeNames.staticClass);

          // 获取文本内容：如果是静态文本，返回完整内容；否则也返回内容（用于显示）
          let textContent = '';
          if (isStaticText) {
            // 对于静态文本，使用 textContent 获取所有文本（包括隐藏的）
            textContent = element.textContent || element.innerText || '';
          } else {
            // 对于非静态文本，也返回内容（可能为空）
            textContent = element.innerText || element.textContent || '';
          }

          const elementInfo: ElementInfo = {
            tagName: element.tagName.toLowerCase(),
            className: element.className,
            textContent: textContent,
            sourceInfo,
            isStaticText: isStaticText || false, // 默认为 false
            isStaticClass: isStaticClass, // 标记 className 是否可编辑
          };

          sendToParent({
            type: 'ELEMENT_SELECTED',
            payload: { elementInfo },
            timestamp: Date.now(),
          });

        } else {
          console.warn(
            `[DesignMode] Element selected but could not resolve source info:`,
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
      if (!next) {
        setSelectedElement(null);
      }
      return next;
    });
  }, []);

  /**
   * 提取元素源码信息
   */
  const extractSourceInfo = useCallback(
    (element: HTMLElement): SourceInfo | null => {
      // 优先尝试从 info JSON 属性获取
      const sourceInfoStr = element.getAttribute(AttributeNames.info);
      if (sourceInfoStr) {
        try {
          const sourceInfo = JSON.parse(sourceInfoStr);
          return {
            fileName: sourceInfo.fileName,
            lineNumber: sourceInfo.lineNumber,
            columnNumber: sourceInfo.columnNumber,
          };
        } catch (e) {
          console.warn(`Failed to parse ${AttributeNames.info}:`, e);
        }
      }

      // 备用方案：逐个属性获取
      const fileName = element.getAttribute(AttributeNames.file);
      const lineStr = element.getAttribute(AttributeNames.line);
      const columnStr = element.getAttribute(AttributeNames.column);

      if (fileName && lineStr && columnStr) {
        return {
          fileName,
          lineNumber: parseInt(lineStr, 10),
          columnNumber: parseInt(columnStr, 10),
        };
      }

      return null;
    },
    []
  );

  /**
   * 修改元素样式
   */
  const modifyElementClass = useCallback(
    async (element: HTMLElement, newClass: string) => {
      const oldClasses = element.className;
      const mergedClasses = twMerge(oldClasses, newClass);

      // 更新DOM
      element.className = mergedClasses;

      // 更新源码
      await updateSource(element, mergedClasses, 'style', oldClasses);

      // 添加到修改历史
      const modification: Modification = {
        id: Date.now().toString(),
        element: element.id || 'unknown',
        type: 'class',
        oldValue: oldClasses,
        newValue: mergedClasses,
        timestamp: Date.now(),
      };

      setModifications(prev => [modification, ...prev]);

      // 如果在iframe中，发送更新消息
      if (config.iframeMode?.enabled) {
        const sourceInfo = extractSourceInfo(element);
        if (sourceInfo) {
          sendToParent({
            type: 'STYLE_UPDATED',
            payload: {
              sourceInfo,
              oldClass: oldClasses,
              newClass: mergedClasses,
            },
            timestamp: Date.now(),
          });
        }
      }
    },
    [updateSource, config.iframeMode?.enabled]
  );

  /**
   * 更新元素内容
   */
  const updateElementContent = useCallback(
    async (element: HTMLElement, newContent: string) => {
      const sourceInfo = extractSourceInfo(element);
      const originalContent = element.innerText;


      // 更新DOM
      element.innerText = newContent;

      // 更新源码
      await updateSource(element, newContent, 'content', originalContent);

      // 如果在iframe中，发送更新消息
      if (config.iframeMode?.enabled) {
        const sourceInfo = extractSourceInfo(element);
        if (sourceInfo) {
          sendToParent({
            type: 'CONTENT_UPDATED',
            payload: {
              sourceInfo,
              oldValue: originalContent,
              newValue: newContent,
            },
            timestamp: Date.now(),
          });
        }
      }
    },
    [updateSource, config.iframeMode?.enabled]
  );

  /**
   * 批量更新元素
   */
  const batchUpdateElements = useCallback(
    async (
      updates: Array<{
        element: HTMLElement;
        type: 'style' | 'content';
        newValue: string;
        originalValue?: string;
      }>
    ) => {
      if (!config.batchUpdate?.enabled) {
        // 如果批量更新未启用，逐个处理
        await Promise.all(
          updates.map(update => {
            if (update.type === 'style') {
              return modifyElementClass(update.element, update.newValue);
            } else {
              return updateElementContent(update.element, update.newValue);
            }
          })
        );
        return;
      }

      // 批量更新模式
      const newUpdates = [...pendingBatchUpdates, ...updates];
      setPendingBatchUpdates(newUpdates);

      // 清除之前的定时器
      if (batchUpdateTimer) {
        clearTimeout(batchUpdateTimer);
      }

      // 设置新的定时器
      const timer = setTimeout(async () => {
        try {
          // 构建批量更新请求
          const batchUpdateItems = newUpdates.map(update => {
            const sourceInfo = extractSourceInfo(update.element);
            if (!sourceInfo) {
              throw new Error('Element missing source mapping');
            }

            return {
              type: update.type,
              sourceInfo,
              newValue: update.newValue,
              originalValue: update.originalValue,
            };
          });

          // 如果在iframe环境中，发送批量更新请求到父窗口
          if (config.iframeMode?.enabled) {
            await bridge.send({
              type: 'BATCH_UPDATE',
              payload: { updates: batchUpdateItems },
              timestamp: Date.now(),
            });
          } else {
            // 在主窗口中，直接调用API
            await fetch('/__appdev_design_mode/batch-update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                updates: batchUpdateItems,
              }),
            });
          }

          // 清理批量更新队列
          setPendingBatchUpdates([]);
        } catch (error) {
          console.error('[DesignMode] Batch update failed:', error);
          setPendingBatchUpdates([]);
          throw error;
        }
      }, config.batchUpdate.debounceMs);

      setBatchUpdateTimer(timer);
    },
    [
      config.batchUpdate,
      pendingBatchUpdates,
      batchUpdateTimer,
      config.iframeMode?.enabled,
      modifyElementClass,
      updateElementContent,
    ]
  );

  /**
   * 重置所有修改
   */
  const resetModifications = useCallback(() => {
    window.location.reload();
  }, []);

  /**
   * 发送消息到父窗口
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
    ): Promise<R> => {
      if (config.iframeMode?.enabled) {
        return await bridge.sendWithResponse(message, responseType);
      }
      throw new Error('Iframe mode is not enabled');
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
    return { status: 'healthy', details: { mode: 'standalone' } };
  }, [config.iframeMode?.enabled]);

  return (
    <DesignModeContext.Provider
      value={{
        // 状态
        isDesignMode,
        selectedElement,
        modifications,
        isConnected,
        bridgeStatus,

        // 配置
        config,

        // 操作方法
        toggleDesignMode,
        selectElement,
        modifyElementClass,
        updateElementContent,
        batchUpdateElements,
        resetModifications,

        // 桥接器方法
        sendMessage,
        sendMessageWithResponse,
        healthCheck,
      }}
    >
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
