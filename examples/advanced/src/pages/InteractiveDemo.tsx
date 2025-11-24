import React, { useState, useRef } from 'react';

import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';
import { cn } from '../utils/cn';

const InteractiveDemo: React.FC = () => {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [modifications, setModifications] = useState<Array<{
    id: string;
    element: string;
    property: string;
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

    // Remove selection from other elements
    previewRef.current?.querySelectorAll('[data-selected="true"]').forEach(el => {
      if (el !== element) el.removeAttribute('data-selected');
    });

    element.setAttribute('data-selected', 'true');
  };

  const modifyElement = (property: string, value: string) => {
    if (!selectedElement) return;

    const oldValue = selectedElement.style[property as any] ||
                    selectedElement.className ||
                    '';

    selectedElement.style[property as any] = value;

    const modification = {
      id: Date.now().toString(),
      element: selectedElement.id || 'unknown',
      property,
      oldValue: String(oldValue),
      newValue: value,
      timestamp: Date.now()
    };

    setModifications(prev => [modification, ...prev]);
  };

  const resetModifications = () => {
    modifications.forEach(mod => {
      const element = previewRef.current?.querySelector(`#${mod.element}`) as HTMLElement;
      if (element) {
        if (mod.property === 'className') {
          // For className we might need more complex logic if we were fully replacing classes
          // But here we are mostly using style for modifications
          element.className = mod.oldValue;
        } else {
          element.style[mod.property as any] = mod.oldValue;
        }
        element.removeAttribute('data-selected');
      }
    });
    setModifications([]);
    setSelectedElement(null);
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
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600">Background:</label>
                <input
                  type="color"
                  className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                  onChange={(e) => modifyElement('backgroundColor', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600">Text Color:</label>
                <input
                  type="color"
                  className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                  onChange={(e) => modifyElement('color', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 min-w-[200px]">
                <label className="text-sm font-medium text-slate-600 w-20">Font Size:</label>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-[120px] h-5"
                  defaultValue={[16]}
                  max={48}
                  min={12}
                  step={1}
                  onValueChange={(value) => modifyElement('fontSize', value[0] + 'px')}
                >
                  <Slider.Track className="bg-slate-200 relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8"
                    aria-label="Font size"
                  />
                </Slider.Root>
              </div>
              <div className="flex items-center gap-3 min-w-[200px]">
                <label className="text-sm font-medium text-slate-600 w-20">Padding:</label>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-[120px] h-5"
                  defaultValue={[16]}
                  max={64}
                  min={0}
                  step={4}
                  onValueChange={(value) => modifyElement('padding', value[0] + 'px')}
                >
                  <Slider.Track className="bg-slate-200 relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8"
                    aria-label="Padding"
                  />
                </Slider.Root>
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
                    <span className="font-mono text-xs text-slate-500">{mod.property}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono text-xs">
                    <span className="line-through opacity-50 truncate max-w-[40%]">{mod.oldValue}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-blue-600 font-medium truncate max-w-[40%]">{mod.newValue}</span>
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
            <li>Use the editor controls to modify element properties in real-time</li>
            <li>View a history of all changes in the right sidebar</li>
            <li>Click <strong>Reset All</strong> to revert changes</li>
          </ol>
        </div>
      </footer>
    </div>
  );
};

export default InteractiveDemo;
