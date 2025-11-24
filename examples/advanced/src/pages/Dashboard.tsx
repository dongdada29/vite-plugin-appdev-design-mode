import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon }) => (
  <div className="metric-card" data-component="metric-card">
    <div className="metric-header" data-element="metric-header">
      <h3 data-element="metric-title">{title}</h3>
      <span className="metric-icon" data-element="metric-icon">{icon}</span>
    </div>
    <div className="metric-value" data-element="metric-value">{value}</div>
    {change && (
      <div className={`metric-change ${trend}`} data-element="metric-change">
        {trend === 'up' && '↗️'}
        {trend === 'down' && '↘️'}
        {trend === 'neutral' && '➡️'}
        {change}
      </div>
    )}
  </div>
);

interface FeatureDemoProps {
  title: string;
  description: string;
  code: string;
  demo: React.ReactNode;
}

const FeatureDemo: React.FC<FeatureDemoProps> = ({ title, description, code, demo }) => {
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'code'>('demo');

  return (
    <div className="feature-demo" data-component="feature-demo">
      <div className="feature-header" data-element="feature-header">
        <h3 data-element="feature-title">{title}</h3>
        <div className="feature-tabs" data-element="tabs">
          <button 
            className={`tab ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo')}
            data-tab="demo"
          >
            Demo
          </button>
          <button 
            className={`tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
            data-tab="code"
          >
            Code
          </button>
        </div>
      </div>
      
      <p className="feature-description" data-element="description">{description}</p>
      
      <div className="feature-content" data-element="content">
        {activeTab === 'demo' ? (
          <div className="demo-container" data-element="demo">
            {demo}
          </div>
        ) : (
          <pre className="code-container" data-element="code">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { theme, user, components } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const metrics = [
    { title: 'Total Components', value: components.length, change: '+2', trend: 'up' as const, icon: '🧩' },
    { title: 'Active Elements', value: 24, change: '+5', trend: 'up' as const, icon: '⚡' },
    { title: 'Design Mode Sessions', value: 156, change: '+12', trend: 'up' as const, icon: '🎨' },
    { title: 'Code Quality Score', value: '94%', change: '+2%', trend: 'up' as const, icon: '📊' }
  ];

  const componentList = components.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard" data-page="dashboard">
      {/* Welcome Section */}
      <section className="welcome-section" data-section="welcome">
        <div className="welcome-content" data-element="content">
          <h1 data-element="title">
            Welcome back, {user.name}!
          </h1>
          <p data-element="subtitle">
            Here's what's happening with your design mode plugin today.
          </p>
        </div>
        <div className="status-indicators" data-element="indicators">
          <div className="status-item" data-status="plugin-active">
            <span className="status-dot active"></span>
            <span>Plugin Active</span>
          </div>
          <div className="status-item" data-status="theme">
            <span className="theme-indicator">{theme === 'light' ? '☀️' : '🌙'}</span>
            <span>{theme.charAt(0).toUpperCase() + theme.slice(1)} Mode</span>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="metrics-section" data-section="metrics">
        <h2 className="section-title" data-element="section-title">System Metrics</h2>
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </section>

      {/* Feature Demonstrations */}
      <section className="features-section" data-section="features">
        <h2 className="section-title" data-element="section-title">Plugin Features</h2>
        <div className="features-grid">
          <FeatureDemo
            title="Source Mapping"
            description="Automatic injection of source location information into DOM elements during compilation."
            code={`// 插件自动为JSX元素添加源码信息
<div className="example" data-source-info="...">
  Content here
</div>`}
            demo={
              <div className="source-map-demo">
                <div className="demo-element" data-element="mapped">
                  Hover over me to see source mapping info
                </div>
              </div>
            }
          />
          
          <FeatureDemo
            title="Component Tree"
            description="Visual representation of component hierarchy with source locations."
            code={`// 自动生成的组件树
App (App.tsx:12)
├── Header (Header.tsx:5)
├── Navigation (Nav.tsx:15)
└── MainContent (Main.tsx:8)`}
            demo={
              <div className="component-tree">
                <div className="tree-node root" data-node="app">
                  <div className="node-label">App</div>
                  <div className="children">
                    <div className="tree-node" data-node="header">
                      <div className="node-label">Header</div>
                    </div>
                    <div className="tree-node" data-node="main">
                      <div className="node-label">MainContent</div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          
          <FeatureDemo
            title="Live Editing"
            description="Real-time style modifications with automatic HMR integration."
            code={`// 修改样式实时生效
const modifyStyles = async (elementId, newStyles) => {
  await fetch('/__modify_element_source', {
    method: 'POST',
    body: JSON.stringify({ elementId, newStyles })
  });
};`}
            demo={
              <div className="live-edit-demo">
                <div className="editable-element" data-editable="true">
                  Click to edit styles
                </div>
                <div className="style-controls">
                  <button className="style-btn primary">Primary</button>
                  <button className="style-btn secondary">Secondary</button>
                  <button className="style-btn danger">Danger</button>
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* Component Registry */}
      <section className="components-section" data-section="components">
        <div className="section-header" data-element="header">
          <h2 className="section-title" data-element="title">Component Registry</h2>
          <div className="search-container" data-element="search">
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              data-element="input"
            />
          </div>
        </div>
        
        <div className="components-grid">
          {componentList.map((component) => (
            <div key={component.id} className="component-card" data-component={component.type}>
              <div className="component-header">
                <h4 data-element="name">{component.name}</h4>
                <span className="component-type" data-element="type">{component.type}</span>
              </div>
              <div className="component-info" data-element="info">
                <small>ID: {component.id}</small>
                <div className="props-preview">
                  {Object.entries(component.props).slice(0, 2).map(([key, value]) => (
                    <span key={key} className="prop-tag">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
