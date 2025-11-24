import React, { Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAppStore } from './store/appStore';

// 页面组件
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ComponentShowcase = React.lazy(() => import('./pages/ComponentShowcase'));
const InteractiveDemo = React.lazy(() => import('./pages/InteractiveDemo'));
const ConfigurationGuide = React.lazy(() => import('./pages/ConfigurationGuide'));

// 通用组件
const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/showcase', label: 'Component Showcase', icon: '🎨' },
    { path: '/interactive', label: 'Interactive Demo', icon: '🎯' },
    { path: '/config', label: 'Configuration', icon: '⚙️' }
  ];

  return (
    <nav className={`nav ${theme}`} data-component="navigation">
      <div className="nav-brand" data-element="brand">
        <h1>Advanced Design Mode</h1>
        <span className="version">v1.0.0</span>
      </div>
      
      <div className="nav-links" data-element="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            data-nav-item={item.path.replace('/', '') || 'dashboard'}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="nav-actions" data-element="actions">
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          data-action="toggle-theme"
          title="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const { isLoading, error } = useAppStore();

  if (error) {
    return (
      <div className="app-error">
        <h1>Application Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reload Application
        </button>
      </div>
    );
  }

  return (
    <div className={`app ${useAppStore.getState().theme}`} data-app="advanced-demo">
      <Navigation />
      
      <main className="main-content" data-component="main">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/showcase" element={<ComponentShowcase />} />
            <Route path="/interactive" element={<InteractiveDemo />} />
            <Route path="/config" element={<ConfigurationGuide />} />
          </Routes>
        </Suspense>
      </main>
      
      <footer className="app-footer" data-component="footer">
        <p>Built with Vite + React + TypeScript + AppDev Design Mode Plugin</p>
      </footer>
    </div>
  );
};

export default App;
