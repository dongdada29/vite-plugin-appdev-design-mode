import React from 'react';
import { DemoElement } from '../components/DemoElement';

const InteractiveDemo: React.FC = () => {
  // No local state or context needed - Design Mode is handled globally by the plugin

  const demoElements = [
    {
      id: 'hero-title',
      tag: 'h1',
      content: 'Interactive Design Mode Demo',
      className: 'text-4xl font-bold text-slate-900 mb-4'
    },
    {
      id: 'hero-description',
      tag: 'p',
      content: 'Click on elements in design mode to modify their properties in real-time',
      className: 'text-lg text-slate-600 mb-8 max-w-2xl'
    },
    {
      id: 'demo-button',
      tag: 'button',
      content: 'Click Me',
      className: 'px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm'
    },
    {
      id: 'demo-card',
      tag: 'div',
      content: 'Sample Card Content',
      className: 'mt-8 p-6 bg-white rounded-xl shadow-md border border-slate-200'
    }
  ];

  return (
    <div className="flex flex-col gap-8" data-page="interactive">
      <header className="flex flex-col gap-6 bg-slate-50 p-8 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Interactive Design Mode</h1>
          <p className="text-sm text-slate-500">
            Design Mode is now injected globally. Use the floating toggle in the bottom right to enable it.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 min-h-[600px]">
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 relative">
          <div className="bg-white p-12 rounded-lg shadow-sm min-h-full">
            {demoElements.map(element => (
              <DemoElement
                key={element.id}
                element={element}
                isDesignMode={false} // The global manager handles selection visuals
                onSelect={() => {}} // Handled globally
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="max-w-3xl">
          <h4 className="font-semibold text-slate-900 mb-4">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
            <li>Toggle <strong>Design Mode</strong> using the floating button</li>
            <li>Click on any element to select and edit it</li>
            <li>Modifications are applied globally</li>
          </ol>
        </div>
      </footer>
    </div>
  );
};

export default InteractiveDemo;
