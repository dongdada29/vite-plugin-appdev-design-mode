import React, { useState, useRef } from 'react';

import * as Switch from '@radix-ui/react-switch';
import { cn } from '../utils/cn';
import { twMerge } from 'tailwind-merge';

// Tailwind Presets
const TAILWIND_PRESETS = {
  bgColors: [
    { label: 'White', value: 'bg-white' },
    { label: 'Slate 50', value: 'bg-slate-50' },
    { label: 'Blue 50', value: 'bg-blue-50' },
    { label: 'Blue 100', value: 'bg-blue-100' },
    { label: 'Blue 600', value: 'bg-blue-600' },
    { label: 'Red 50', value: 'bg-red-50' },
    { label: 'Green 50', value: 'bg-green-50' },
  ],
  textColors: [
    { label: 'Slate 900', value: 'text-slate-900' },
    { label: 'Slate 600', value: 'text-slate-600' },
    { label: 'Blue 600', value: 'text-blue-600' },
    { label: 'White', value: 'text-white' },
    { label: 'Red 600', value: 'text-red-600' },
  ],
  fontSizes: [
    { label: 'Small', value: 'text-sm' },
    { label: 'Base', value: 'text-base' },
    { label: 'Large', value: 'text-lg' },
    { label: 'XL', value: 'text-xl' },
    { label: '2XL', value: 'text-2xl' },
    { label: '4XL', value: 'text-4xl' },
  ],
  paddings: [
    { label: '0', value: 'p-0' },
    { label: '2', value: 'p-2' },
    { label: '4', value: 'p-4' },
    { label: '6', value: 'p-6' },
    { label: '8', value: 'p-8' },
    { label: '12', value: 'p-12' },
  ],
  rounded: [
    { label: 'None', value: 'rounded-none' },
    { label: 'Small', value: 'rounded-sm' },
    { label: 'Medium', value: 'rounded-md' },
    { label: 'Large', value: 'rounded-lg' },
    { label: 'Full', value: 'rounded-full' },
  ]
};

const InteractiveDemo: React.FC = () => {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  // We need to track the current classes for the selected element to show the correct state
  const [currentClasses, setCurrentClasses] = useState<string>('');

  const [modifications, setModifications] = useState<Array<{
    id: string;
    element: string;
    type: 'class';
    oldValue: string;
    newValue: string;
    timestamp: number;
  }>>([]);
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleElementClick = (elementId: string, element: HTMLElement) => {
    if (!isDesignMode) return;

    setSelectedElement(element);
    setCurrentClasses(element.className);

    // Remove selection from other elements
    previewRef.current?.querySelectorAll('[data-selected="true"]').forEach(el => {
      if (el !== element) el.removeAttribute('data-selected');
    });

    element.setAttribute('data-selected', 'true');
  };

  const modifyClass = (category: string, newClass: string) => {
    if (!selectedElement) return;

    const oldClasses = selectedElement.className;
    // Use tailwind-merge to intelligently merge classes (handling conflicts)
    // We append the new class, and twMerge resolves conflicts (e.g., p-4 overrides p-2)
    const mergedClasses = twMerge(oldClasses, newClass);

    selectedElement.className = mergedClasses;
    setCurrentClasses(mergedClasses);

    const modification = {
      id: Date.now().toString(),
      element: selectedElement.id || 'unknown',
      type: 'class' as const,
      oldValue: oldClasses, // Storing full class string might be verbose, but accurate
      newValue: mergedClasses,
      timestamp: Date.now()
    };

    setModifications(prev => [modification, ...prev]);
  };

  const resetModifications = () => {
    // This is a simplified reset. In a real app, we'd need to track initial state more robustly.
    // Here we just reload the page or we could store initial classes in a map.
    // For this demo, let's just clear the modifications list and maybe warn the user.
    // A better approach for this specific demo structure:
    // Since we are modifying the DOM directly, we can't easily "undo" without storing history.
    // But we can just re-render the list if we were driving from state.
    // Since we are doing direct DOM manipulation for the "Design Mode" feel:
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-8" data-page="interactive">
      <header className="flex flex-col gap-6 bg-slate-50 p-8 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Interactive Design Mode</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Design Mode</label>
            <Switch.Root
              checked={isDesignMode}
              onCheckedChange={(checked) => {
                setIsDesignMode(checked);
                if (!checked) setSelectedElement(null);
              }}
              className={cn(
                "w-[42px] h-[25px] bg-slate-200 rounded-full relative shadow-inner focus:shadow-black transition-colors data-[state=checked]:bg-blue-600 cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-blue-400"
              )}
            >
              <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
            </Switch.Root>
          </div>
        </div>

        {selectedElement && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Editing: <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">{selectedElement.id}</code>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Background</label>
                <div className="flex flex-wrap gap-2">
                  {TAILWIND_PRESETS.bgColors.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => modifyClass('bg', preset.value)}
                      className={cn(
                        "w-8 h-8 rounded border border-slate-200 shadow-sm transition-transform hover:scale-110 focus:ring-2 focus:ring-blue-400",
                        preset.value.replace('bg-', 'bg-'), // This works because the class names are literal
                        currentClasses.includes(preset.value) && "ring-2 ring-blue-500 ring-offset-2"
                      )}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Text Color</label>
                <div className="flex flex-wrap gap-2">
                  {TAILWIND_PRESETS.textColors.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => modifyClass('text', preset.value)}
                      className={cn(
                        "w-8 h-8 rounded border border-slate-200 shadow-sm transition-transform hover:scale-110 focus:ring-2 focus:ring-blue-400 flex items-center justify-center font-bold",
                        preset.value.replace('text-', 'text-'), // Apply color to text
                        "bg-slate-100",
                        currentClasses.includes(preset.value) && "ring-2 ring-blue-500 ring-offset-2"
                      )}
                      title={preset.label}
                    >
                      A
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Font Size</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-md text-sm"
                  onChange={(e) => modifyClass('text-size', e.target.value)}
                  value={TAILWIND_PRESETS.fontSizes.find(p => currentClasses.includes(p.value))?.value || ''}
                >
                  <option value="">Select size...</option>
                  {TAILWIND_PRESETS.fontSizes.map(preset => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </select>
              </div>

              {/* Padding */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Padding</label>
                 <div className="flex flex-wrap gap-1">
                  {TAILWIND_PRESETS.paddings.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => modifyClass('p', preset.value)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border border-slate-200 hover:bg-slate-50",
                        currentClasses.includes(preset.value) && "bg-blue-100 border-blue-300 text-blue-700"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounded */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Rounded</label>
                 <div className="flex flex-wrap gap-1">
                  {TAILWIND_PRESETS.rounded.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => modifyClass('rounded', preset.value)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border border-slate-200 hover:bg-slate-50",
                        currentClasses.includes(preset.value) && "bg-blue-100 border-blue-300 text-blue-700"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 min-h-[600px]">
        <div
          ref={previewRef}
          className={cn(
            "bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 relative transition-all duration-300",
            isDesignMode && "border-blue-400 bg-blue-50/30"
          )}
        >
          <div className="bg-white p-12 rounded-lg shadow-sm min-h-full">
            {demoElements.map(element => {
              const Tag = element.tag as any;
              return (
                <Tag
                  key={element.id}
                  id={element.id}
                  className={cn(
                    element.className,
                    "transition-all duration-200 cursor-default",
                    isDesignMode && "hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 cursor-pointer",
                    "data-[selected=true]:outline data-[selected=true]:outline-2 data-[selected=true]:outline-blue-600 data-[selected=true]:outline-offset-2"
                  )}
                  onClick={(e: React.MouseEvent) => {
                    if (isDesignMode) {
                      e.preventDefault();
                      handleElementClick(element.id, e.currentTarget as HTMLElement);
                    }
                  }}
                  data-element={element.id}
                >
                  {element.content}
                </Tag>
              );
            })}
          </div>
        </div>

        <aside className="bg-slate-50 border border-slate-200 rounded-xl flex flex-col overflow-hidden h-fit sticky top-24">
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Modifications</h3>
            <button
              onClick={resetModifications}
              disabled={modifications.length === 0}
              className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-3">
            {modifications.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8 italic">No modifications yet</p>
            ) : (
              modifications.map(mod => (
                <div key={mod.id} className="bg-white p-3 rounded border border-slate-200 text-sm shadow-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">{mod.element}</span>
                    <span className="font-mono text-xs text-slate-500">class update</span>
                  </div>
                  <div className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono text-xs break-all">
                    <div className="mb-1 opacity-50 line-through">{mod.oldValue}</div>
                    <div className="text-blue-600 font-medium">{mod.newValue}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 text-right">
                    {new Date(mod.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <footer className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="max-w-3xl">
          <h4 className="font-semibold text-slate-900 mb-4">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
            <li>Toggle <strong>Design Mode</strong> using the switch in the header</li>
            <li>Click on any element in the preview area to select it</li>
            <li>Use the preset controls to apply Tailwind classes</li>
            <li>Modifications are applied via <code>tailwind-merge</code></li>
            <li>View a history of class changes in the right sidebar</li>
          </ol>
        </div>
      </footer>
    </div>
  );
};

export default InteractiveDemo;
