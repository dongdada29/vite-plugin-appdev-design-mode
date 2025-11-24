import React, { useState } from 'react';
import './App.css';

// 函数组件示例
function HeaderComponent() {
  return (
    <header className='main-header' data-component='header'>
      <h1 className='title' data-element='main-title'>
        Vite Design Mode Plugin Demo
      </h1>
      <nav className='navigation' data-component='nav'>
        <ul className='nav-list'>
          <li>
            <a href='#features' className='nav-link'>
              Features
            </a>
          </li>
          <li>
            <a href='#examples' className='nav-link'>
              Examples
            </a>
          </li>
          <li>
            <a href='#docs' className='nav-link'>
              Documentation
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

// 类组件示例
class CounterComponent extends React.Component<{ initial?: number }> {
  state = {
    count: this.props.initial || 0,
  };

  render() {
    return (
      <div className='counter-container' data-component='counter'>
        <h2 data-element='counter-title'>计数器示例</h2>
        <div className='counter-display'>
          <span className='counter-value' data-element='counter-value'>
            当前值: {this.state.count}
          </span>
        </div>
        <div className='counter-buttons'>
          <button
            className='counter-btn increment'
            onClick={() => this.setState({ count: this.state.count + 1 })}
            data-action='increment'
          >
            +1
          </button>
          <button
            className='counter-btn decrement'
            onClick={() => this.setState({ count: this.state.count - 1 })}
            data-action='decrement'
          >
            -1
          </button>
          <button
            className='counter-btn reset'
            onClick={() => this.setState({ count: 0 })}
            data-action='reset'
          >
            重置
          </button>
        </div>
      </div>
    );
  }
}

// 复杂嵌套组件示例
function FeatureSection() {
  const features = [
    {
      id: 'source-mapping',
      title: '源码映射',
      description: '自动注入源码位置信息到DOM元素',
      icon: '🗺️',
    },
    {
      id: 'ast-analysis',
      title: 'AST分析',
      description: '基于Babel AST的精确组件识别',
      icon: '🔍',
    },
    {
      id: 'hot-reload',
      title: '热更新',
      description: '与Vite开发服务器无缝集成',
      icon: '⚡',
    },
  ];

  return (
    <section className='features-section' data-section='features'>
      <h2 className='section-title' data-element='section-title'>
        插件特性
      </h2>
      <div className='features-grid'>
        {features.map(feature => (
          <div
            key={feature.id}
            className='feature-card'
            data-feature={feature.id}
          >
            <div className='feature-icon' data-element='feature-icon'>
              {feature.icon}
            </div>
            <h3 className='feature-title' data-element='feature-title'>
              {feature.title}
            </h3>
            <p
              className='feature-description'
              data-element='feature-description'
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// 动态内容示例
function DynamicContent() {
  const [isVisible, setIsVisible] = useState(false);
  const [items, setItems] = useState(['项目1', '项目2', '项目3']);

  return (
    <div className='dynamic-section' data-section='dynamic'>
      <h2 className='section-title' data-element='dynamic-title'>
        动态内容示例
      </h2>

      <div className='dynamic-controls'>
        <button
          className='toggle-btn'
          onClick={() => setIsVisible(!isVisible)}
          data-action='toggle-visibility'
        >
          {isVisible ? '隐藏' : '显示'}内容
        </button>
        <button
          className='add-item-btn'
          onClick={() => setItems([...items, `项目${items.length + 1}`])}
          data-action='add-item'
        >
          添加项目
        </button>
      </div>

      {isVisible && (
        <div className='dynamic-content' data-element='dynamic-list'>
          <ul className='items-list'>
            {items.map((item, index) => (
              <li key={index} className='list-item' data-item={index}>
                <span className='item-text'>{item}</span>
                <button
                  className='remove-btn'
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  data-action='remove-item'
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 表单组件示例
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`表单提交成功!\n姓名: ${formData.name}\n邮箱: ${formData.email}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className='form-section' data-section='contact'>
      <h2 className='section-title' data-element='form-title'>
        联系表单
      </h2>
      <form
        className='contact-form'
        onSubmit={handleSubmit}
        data-form='contact'
      >
        <div className='form-group'>
          <label htmlFor='name' className='form-label'>
            姓名
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='form-input'
            data-element='name-input'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='email' className='form-label'>
            邮箱
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            className='form-input'
            data-element='email-input'
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='message' className='form-label'>
            消息
          </label>
          <textarea
            id='message'
            name='message'
            value={formData.message}
            onChange={handleChange}
            className='form-textarea'
            data-element='message-textarea'
            rows={4}
            required
          />
        </div>

        <button type='submit' className='submit-btn' data-action='submit-form'>
          发送消息
        </button>
      </form>
    </section>
  );
}

// 主应用组件
function App() {
  return (
    <div className='App' data-appdev-component='App'>
      <HeaderComponent />

      <main className='main-content'>
        <section className='hero-section' data-section='hero'>
          <div className='hero-content'>
            <h1 className='hero-title' data-element='hero-title'>
              Vite Plugin AppDev Design Mode
            </h1>
            <p className='hero-description' data-element='hero-description'>
              一个强大的Vite插件，为React开发者提供源码映射和可视化编辑功能
            </p>
            <div className='hero-buttons'>
              <button className='hero-btn primary' data-action='get-started'>
                开始使用
              </button>
              <button className='hero-btn secondary' data-action='view-docs'>
                查看文档
              </button>
            </div>
          </div>
        </section>

        <CounterComponent initial={5} />
        <FeatureSection />
        <DynamicContent />
        <ContactForm />
      </main>

      <footer className='main-footer' data-component='footer'>
        <p className='footer-text' data-element='footer-text'>
          © 2024 Vite Plugin AppDev Design Mode. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
