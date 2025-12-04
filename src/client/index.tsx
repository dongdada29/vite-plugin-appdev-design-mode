import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { DesignModeProvider } from './DesignModeContext';
import { DesignModeManager } from './DesignModeManager';
import { BridgeReadyMessage, TailwindConfigMessage } from '../types/messages';
import * as React from 'react';

/**
 * 发送 Tailwind 配置到父窗口
 */
async function sendTailwindConfig() {
  try {
    // 动态导入虚拟模块
    const tailwindConfig = await import('virtual:tailwind-config').then((m) => m.default);

    // 创建 Tailwind 配置消息
    const message: TailwindConfigMessage = {
      type: 'TAILWIND_CONFIG',
      payload: {
        config: tailwindConfig,
      },
      timestamp: Date.now(),
    };

    // 发送到父窗口
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
      console.log('[DesignMode] Tailwind config sent to parent window');
    }
  } catch (error) {
    console.warn('[DesignMode] Failed to send Tailwind config:', error);
  }
}

const init = () => {
  const containerId = '__vite_plugin_design_mode__';
  if (document.getElementById(containerId)) return;

  const container = document.createElement('div');
  container.id = containerId;
  document.body.appendChild(container);

  // Use Shadow DOM to isolate styles
  const shadowRoot = container.attachShadow({ mode: 'open' });
  const rootElement = document.createElement('div');
  shadowRoot.appendChild(rootElement);

  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <DesignModeProvider>
        <DesignModeManager />
      </DesignModeProvider>
    </StrictMode>
  );
};

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}


if (typeof window !== 'undefined') {
  init();
  // 发送 Tailwind 配置（延迟以确保父窗口已准备好）
  setTimeout(() => {
    sendTailwindConfig();
  }, 1000);
}

