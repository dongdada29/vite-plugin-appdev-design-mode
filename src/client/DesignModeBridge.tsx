import React, { useEffect, useCallback } from 'react';
import { useDesignMode } from './DesignModeContext';
import { bridge } from './bridge';
import {
  UpdateStyleMessage,
  UpdateContentMessage,
  ToggleDesignModeMessage,
  ElementSelectedMessage,
  ElementDeselectedMessage
} from '../types/messages';
import { AttributeNames } from './utils/attributeNames';
import { isPureStaticText } from './utils/elementUtils';

export const DesignModeBridge: React.FC = () => {
  const { selectedElement, modifyElementClass, updateElementContent } =
    useDesignMode();

  /**
   * 检查Bridge是否准备好
   */
  const isBridgeReady = useCallback(() => {
    // 检查是否在iframe环境中
    if (window.self === window.top) {
      return false;
    }

    // 检查Bridge是否已连接
    if (!bridge.isConnectedToTarget()) {
      return false;
    }

    return true;
  }, []);

  /**
   * 安全的发送消息函数
   */
  const safeSend = useCallback(
    async (type: string, payload: any) => {
      if (!isBridgeReady()) {
        return;
      }

      try {
        // 使用新的消息格式
        const message = {
          type,
          payload,
          timestamp: Date.now(),
        };

        await bridge.send(message as any);
      } catch (error) {
        // Failed to send message
      }
    },
    [isBridgeReady]
  );

  /**
   * 同步选择到主机
   */
  useEffect(() => {
    // 延迟执行，确保Bridge有时间初始化
    const timer = setTimeout(() => {
      if (selectedElement) {
        // 检查元素的 source 属性
        const sourceFile = selectedElement.getAttribute(AttributeNames.file);
        const sourceLine = selectedElement.getAttribute(AttributeNames.line);
        const sourceColumn = selectedElement.getAttribute(AttributeNames.column);

        // 确保我们有有效的元素数据
        // 判断是否为静态文本：
        // 1. 检查元素是否有 static-content 属性
        // 2. 严格验证元素是否真的只包含纯文本节点（不包含其他元素标签）
        const hasStaticContentAttr = selectedElement.hasAttribute(AttributeNames.staticContent);
        const isActuallyPureText = isPureStaticText(selectedElement);
        const isStaticText = hasStaticContentAttr && isActuallyPureText;
        
        const elementData = {
          tagName: selectedElement.tagName.toLowerCase(),
          className: selectedElement.className || '',
          textContent: (
            selectedElement.textContent ||
            selectedElement.innerText ||
            ''
          ).substring(0, 100),
          sourceInfo: {
            fileName: sourceFile || '',
            lineNumber: parseInt(sourceLine || '0', 10),
            columnNumber: parseInt(sourceColumn || '0', 10),
          },
          isStaticText: isStaticText || false, // 默认为 false
        };

        if (
          !elementData.sourceInfo.fileName ||
          elementData.sourceInfo.lineNumber === 0
        ) {
          console.warn(
            '[DesignModeBridge] Warning: Element missing source mapping attributes. Updates may fail.'
          );
        }

        safeSend('ELEMENT_SELECTED', { elementInfo: elementData });
      } else {
        safeSend('ELEMENT_DESELECTED', null);
      }
    }, 100); // 100ms延迟

    return () => clearTimeout(timer);
  }, [selectedElement, safeSend]);

  /**
   * 监听来自主机的命令
   */
  useEffect(() => {
    if (!isBridgeReady()) {
      return;
    }

    const unsubscribeStyle = bridge.on<UpdateStyleMessage>('UPDATE_STYLE', (message) => {
      const payload = message.payload;

      if (selectedElement && payload?.sourceInfo && payload?.newClass) {
        // 验证源信息是否匹配
        const elementSourceInfo = {
          fileName: selectedElement.getAttribute(AttributeNames.file) || '',
          lineNumber: parseInt(
            selectedElement.getAttribute(AttributeNames.line) || '0',
            10
          ),
          columnNumber: parseInt(
            selectedElement.getAttribute(AttributeNames.column) || '0',
            10
          ),
        };

        const sourceMatches =
          elementSourceInfo.fileName === payload.sourceInfo.fileName &&
          elementSourceInfo.lineNumber === payload.sourceInfo.lineNumber &&
          elementSourceInfo.columnNumber === payload.sourceInfo.columnNumber;

        if (sourceMatches) {
          modifyElementClass(selectedElement, payload.newClass);
        } else {
          console.warn(
            '[DesignModeBridge] Source info mismatch, ignoring style update'
          );
        }
      }
    });

    const unsubscribeContent = bridge.on<UpdateContentMessage>('UPDATE_CONTENT', (message) => {
      const payload = message.payload;

      if (
        selectedElement &&
        payload?.sourceInfo &&
        payload?.newContent !== undefined
      ) {
        // 验证源信息是否匹配
        const elementSourceInfo = {
          fileName: selectedElement.getAttribute(AttributeNames.file) || '',
          lineNumber: parseInt(
            selectedElement.getAttribute(AttributeNames.line) || '0',
            10
          ),
          columnNumber: parseInt(
            selectedElement.getAttribute(AttributeNames.column) || '0',
            10
          ),
        };

        const sourceMatches =
          elementSourceInfo.fileName === payload.sourceInfo.fileName &&
          elementSourceInfo.lineNumber === payload.sourceInfo.lineNumber &&
          elementSourceInfo.columnNumber === payload.sourceInfo.columnNumber;

        if (sourceMatches) {
          updateElementContent(selectedElement, payload.newContent);
        } else {
          console.warn(
            '[DesignModeBridge] Source info mismatch, ignoring content update'
          );
        }
      }
    });

    // 监听设计模式切换
    const unsubscribeToggle = bridge.on<ToggleDesignModeMessage>(
      'TOGGLE_DESIGN_MODE',
      (message) => {
        // 这里可以添加设计模式切换逻辑
      }
    );

    return () => {
      unsubscribeStyle();
      unsubscribeContent();
      unsubscribeToggle();
    };
  }, [
    selectedElement,
    modifyElementClass,
    updateElementContent,
    isBridgeReady,
  ]);

  /**
   * Bridge健康检查
   */
  useEffect(() => {
    if (!isBridgeReady()) {
      return;
    }

    const checkBridgeHealth = async () => {
      try {
        const health = await bridge.healthCheck();
        console.log('[DesignModeBridge] Bridge health check:', health);
      } catch (error) {
        console.warn('[DesignModeBridge] Bridge health check failed:', error);
      }
    };

    // 立即检查一次
    checkBridgeHealth();

    // 定期检查
    const healthTimer = setInterval(checkBridgeHealth, 30000); // 30秒检查一次

    return () => clearInterval(healthTimer);
  }, [isBridgeReady]);

  return null;
};
