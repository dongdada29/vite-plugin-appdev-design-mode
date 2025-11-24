import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { DesignModeProvider } from './context/DesignModeContext';
import { DesignModeManager } from './components/DesignModeManager';

// 开发模式下的额外日志
if (import.meta.env.DEV) {
  console.log('🚀 Advanced AppDev Design Mode Example');
  console.log('🔧 Plugin Configuration:', {
    enabled: true,
    prefix: 'design-mode',
    verbose: true,
    typescript: true,
    react: true,
    routing: true,
    stateManagement: true
  });
}

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e' }}>
          <h1>Something went wrong.</h1>
          <p>Please refresh the page to try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DesignModeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <DesignModeManager />
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </DesignModeProvider>
  </React.StrictMode>
);
