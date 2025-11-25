import React from 'react';
import ReactDOM from 'react-dom/client';
import { DesignModeProvider } from './DesignModeContext';
import { DesignModeManager } from './DesignModeManager';
import { DesignModeUI } from './DesignModeUI';

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
    <React.StrictMode>
      <DesignModeProvider>
        <DesignModeManager />
        <DesignModeUI />
      </DesignModeProvider>
    </React.StrictMode>
  );
};

if (typeof window !== 'undefined') {
  init();
}
