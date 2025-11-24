import React, { useState } from 'react';

const ComponentShowcase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('buttons');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const categories = [
    { id: 'buttons', label: 'Buttons', icon: '🔘' },
    { id: 'forms', label: 'Forms', icon: '📝' },
    { id: 'cards', label: 'Cards', icon: '🃏' },
    { id: 'navigation', label: 'Navigation', icon: '🧭' }
  ];

  const components = {
    buttons: [
      {
        id: 'primary-btn',
        name: 'Primary Button',
        description: 'Main action button with primary styling',
        component: (
          <button className="btn-primary">Primary Action</button>
        ),
        code: `<button className="btn-primary">Primary Action</button>`
      },
      {
        id: 'secondary-btn',
        name: 'Secondary Button',
        description: 'Secondary action button',
        component: (
          <button className="btn-secondary">Secondary Action</button>
        ),
        code: `<button className="btn-secondary">Secondary Action</button>`
      },
      {
        id: 'danger-btn',
        name: 'Danger Button',
        description: 'Destructive action button',
        component: (
          <button className="btn-danger">Delete Item</button>
        ),
        code: `<button className="btn-danger">Delete Item</button>`
      }
    ],
    forms: [
      {
        id: 'input-field',
        name: 'Input Field',
        description: 'Standard text input with label',
        component: (
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Enter username" className="form-input" />
          </div>
        ),
        code: `<div className="form-group">
  <label>Username</label>
  <input type="text" placeholder="Enter username" className="form-input" />
</div>`
      },
      {
        id: 'checkbox-group',
        name: 'Checkbox Group',
        description: 'Multiple choice checkboxes',
        component: (
          <div className="form-group">
            <label>Preferences</label>
            <div className="checkbox-group">
              <label><input type="checkbox" /> Email notifications</label>
              <label><input type="checkbox" /> SMS alerts</label>
              <label><input type="checkbox" /> Push notifications</label>
            </div>
          </div>
        ),
        code: `<div className="form-group">
  <label>Preferences</label>
  <div className="checkbox-group">
    <label><input type="checkbox" /> Email notifications</label>
    <label><input type="checkbox" /> SMS alerts</label>
    <label><input type="checkbox" /> Push notifications</label>
  </div>
</div>`
      }
    ],
    cards: [
      {
        id: 'info-card',
        name: 'Info Card',
        description: 'Card with title, content and actions',
        component: (
          <div className="card">
            <div className="card-header">
              <h3>Card Title</h3>
            </div>
            <div className="card-body">
              <p>This is a sample card component with some descriptive content.</p>
            </div>
            <div className="card-actions">
              <button className="btn-text">Learn More</button>
            </div>
          </div>
        ),
        code: `<div className="card">
  <div className="card-header">
    <h3>Card Title</h3>
  </div>
  <div className="card-body">
    <p>This is a sample card component with some descriptive content.</p>
  </div>
  <div className="card-actions">
    <button className="btn-text">Learn More</button>
  </div>
</div>`
      }
    ],
    navigation: [
      {
        id: 'breadcrumb',
        name: 'Breadcrumb',
        description: 'Navigation breadcrumb trail',
        component: (
          <nav className="breadcrumb">
            <a href="#">Home</a>
            <span>/</span>
            <a href="#">Products</a>
            <span>/</span>
            <span>Current Page</span>
          </nav>
        ),
        code: `<nav className="breadcrumb">
  <a href="#">Home</a>
  <span>/</span>
  <a href="#">Products</a>
  <span>/</span>
  <span>Current Page</span>
</nav>`
      }
    ]
  };

  return (
    <div className="component-showcase" data-page="showcase">
      <header className="showcase-header">
        <h1>Component Showcase</h1>
        <p>Explore various UI components and their source mappings</p>
      </header>

      <div className="showcase-content">
        <aside className="category-sidebar">
          <h3>Categories</h3>
          <nav className="category-nav">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
                data-category={category.id}
              >
                <span className="icon">{category.icon}</span>
                <span className="label">{category.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="components-display">
          <div className="components-grid">
            {components[activeCategory as keyof typeof components]?.map(component => (
              <div
                key={component.id}
                className={`component-item ${selectedComponent === component.id ? 'selected' : ''}`}
                data-component={component.id}
                onClick={() => setSelectedComponent(
                  selectedComponent === component.id ? null : component.id
                )}
              >
                <div className="component-preview" data-element="preview">
                  {component.component}
                </div>
                <div className="component-info">
                  <h4 data-element="name">{component.name}</h4>
                  <p data-element="description">{component.description}</p>
                </div>
                {selectedComponent === component.id && (
                  <div className="component-code" data-element="code">
                    <pre><code>{component.code}</code></pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ComponentShowcase;
