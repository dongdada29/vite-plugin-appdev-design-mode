import React, { useState } from 'react';

const ConfigurationGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('basic');

  const sections = [
    { id: 'basic', label: 'Basic Setup', icon: '⚙️' },
    { id: 'options', label: 'Configuration Options', icon: '🔧' },
    { id: 'advanced', label: 'Advanced Usage', icon: '🚀' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🛠️' }
  ];

  const configExamples = {
    basic: {
      title: 'Basic Setup',
      description: 'Get started with the plugin in minutes',
      code: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from 'vite-plugin-appdev-design-mode';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode() // Basic configuration
  ]
});`,
      explanation: 'This is the minimal configuration needed to get started. The plugin will use all default options.'
    },
    options: {
      title: 'Configuration Options',
      description: 'Customize the plugin behavior with various options',
      code: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from 'vite-plugin-appdev-design-mode';

export default defineConfig({
  plugins: [
    react(),
    appdevDesignMode({
      // Enable/disable the plugin
      enabled: true,
      
      // Only enable in development
      enableInProduction: false,
      
      // Custom attribute prefix
      attributePrefix: 'design-mode',
      
      // Enable verbose logging
      verbose: true,
      
      // File patterns to exclude
      exclude: [
        'node_modules',
        '.git',
        'dist',
        '**/*.test.{ts,tsx,js,jsx}'
      ],
      
      // File patterns to include
      include: [
        'src/**/*.{ts,tsx,js,jsx}',
        'components/**/*.{ts,tsx,js,jsx}'
      ]
    })
  ]
});`,
      explanation: 'This configuration shows all available options and their default values.'
    },
    advanced: {
      title: 'Advanced Usage',
      description: 'Advanced patterns and integration techniques',
      code: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import appdevDesignMode from 'vite-plugin-appdev-design-mode';

export default defineConfig({
  plugins: [
    react(),
    // Multiple configurations for different environments
    appdevDesignMode({
      enabled: true,
      attributePrefix: 'dev-mode',
      verbose: process.env.NODE_ENV === 'development',
      
      // Conditional inclusion based on environment
      include: process.env.NODE_ENV === 'development' 
        ? ['src/**/*.{ts,tsx,js,jsx}']
        : [], // Disable in production
      
      // Custom exclude patterns
      exclude: [
        'node_modules',
        '.git',
        'dist',
        'build',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/__tests__/**',
        'stories/**',
        '**/*.stories.{ts,tsx}'
      ]
    })
  ],
  
  // Server configuration for API endpoints
  server: {
    port: 5173,
    host: true,
    middlewareMode: false
  }
});

// Environment-specific configuration
const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
  plugins: isDevelopment ? [
    react(),
    appdevDesignMode({
      verbose: true,
      attributePrefix: 'dev'
    })
  ] : [react()]
});`,
      explanation: 'This example shows how to configure the plugin differently based on environment and use cases.'
    },
    troubleshooting: {
      title: 'Troubleshooting',
      description: 'Common issues and their solutions',
      code: `# Common Issues and Solutions

## Plugin not injecting source information

### Problem: Elements don't have data attributes
### Solution: Check file inclusion patterns
\`\`\`js
appdevDesignMode({
  include: ['src/**/*.{ts,tsx,js,jsx}'] // Make sure this matches your project structure
})
\`\`\`

## Performance issues

### Problem: Plugin slowing down development server
### Solution: Exclude unnecessary files
\`\`\`js
appdevDesignMode({
  exclude: [
    'node_modules',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/__tests__/**',
    'stories/**'
  ]
})
\`\`\`

## TypeScript errors

### Problem: Cannot find module '@babel/core'
### Solution: Install peer dependencies
\`\`\`bash
npm install --save-dev @babel/core @babel/traverse @babel/types
\`\`\`

## Custom configuration not working

### Problem: Plugin using default configuration
### Solution: Check import path and plugin options
\`\`\`js
// Correct import
import appdevDesignMode from 'vite-plugin-appdev-design-mode';

// Make sure options are passed correctly
appdevDesignMode({
  enabled: true, // This should not be undefined
  attributePrefix: 'custom'
})
\`\`\`

## API endpoints not accessible

### Problem: Cannot access plugin API endpoints
### Solution: Check server configuration and CORS
\`\`\`js
export default defineConfig({
  server: {
    cors: true, // Enable CORS for API access
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
\`\`\``,
      explanation: 'This section covers common problems developers encounter and their solutions.'
    }
  };

  return (
    <div className="config-guide" data-page="config">
      <header className="guide-header">
        <h1>Configuration Guide</h1>
        <p>Learn how to configure and use the AppDev Design Mode plugin effectively</p>
      </header>

      <div className="guide-content">
        <nav className="guide-sidebar">
          <h3>Sections</h3>
          <ul className="guide-nav">
            {Object.entries(configExamples).map(([key, section]) => (
              <li key={key}>
                <button
                  className={`nav-item ${activeSection === key ? 'active' : ''}`}
                  onClick={() => setActiveSection(key)}
                  data-section={key}
                >
                  <span className="icon">{sections.find(s => s.id === key)?.icon}</span>
                  <span className="label">{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="guide-main">
          <div className="guide-section">
            <div className="section-header">
              <h2 data-element="section-title">
                {configExamples[activeSection as keyof typeof configExamples].title}
              </h2>
              <p className="section-description" data-element="section-description">
                {configExamples[activeSection as keyof typeof configExamples].description}
              </p>
            </div>

            <div className="content-blocks">
              <div className="code-block" data-element="code-block">
                <div className="code-header">
                  <h4>Configuration</h4>
                  <button 
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(configExamples[activeSection as keyof typeof configExamples].code);
                    }}
                    data-action="copy-code"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="code-content">
                  <code>{configExamples[activeSection as keyof typeof configExamples].code}</code>
                </pre>
              </div>

              <div className="explanation-block" data-element="explanation">
                <h4>Explanation</h4>
                <p>{configExamples[activeSection as keyof typeof configExamples].explanation}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="guide-footer">
        <div className="additional-resources">
          <h4>Additional Resources</h4>
          <ul>
            <li>
              <a href="https://vitejs.dev/config/" target="_blank" rel="noopener noreferrer">
                📖 Vite Configuration Documentation
              </a>
            </li>
            <li>
              <a href="https://babeljs.io/docs/babel-plugin-there/" target="_blank" rel="noopener noreferrer">
                🔧 Babel Plugin API Documentation
              </a>
            </li>
            <li>
              <a href="https://github.com/vite-plugin-appdev-design-mode" target="_blank" rel="noopener noreferrer">
                📦 Plugin Repository
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default ConfigurationGuide;
