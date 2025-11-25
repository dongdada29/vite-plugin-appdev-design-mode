import React from '../react';
import { useState, useEffect } from 'react';
import type { ElementInfo } from '@/types/messages';

// 确保React在所有情况下都可用
if (typeof React === 'undefined') {
  throw new Error(
    'React is not imported. Please ensure React is imported correctly.'
  );
}

export default function IframeDemoPage() {
  const [iframeDesignMode, setIframeDesignMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(
    null
  );
  const [editingContent, setEditingContent] = useState('');
  const [editingClass, setEditingClass] = useState('');

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'DESIGN_MODE_CHANGED':
          setIframeDesignMode(event.data.enabled);
          break;

        case 'ELEMENT_SELECTED':
          console.log('[Parent] Element selected - full payload:', payload);
          console.log('[Parent] ElementInfo:', payload.elementInfo);
          console.log('[Parent] SourceInfo:', payload.elementInfo?.sourceInfo);

          // 验证 sourceInfo 是否有效
          if (
            !payload.elementInfo?.sourceInfo ||
            !payload.elementInfo.sourceInfo.fileName ||
            payload.elementInfo.sourceInfo.lineNumber === 0
          ) {
            console.warn(
              '[Parent] Invalid sourceInfo received:',
              payload.elementInfo?.sourceInfo
            );
            console.warn('[Parent] This may cause update operations to fail');
          }

          setSelectedElement(payload.elementInfo);
          setEditingContent(payload.elementInfo.textContent);
          setEditingClass(payload.elementInfo.className);
          break;

        case 'ELEMENT_DESELECTED':
          setSelectedElement(null);
          console.log('[Parent] Element deselected');
          break;

        case 'CONTENT_UPDATED':
          console.log('[Parent] Content updated:', payload);
          break;

        case 'STYLE_UPDATED':
          console.log('[Parent] Style updated:', payload);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Toggle design mode in iframe
  const toggleIframeDesignMode = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'TOGGLE_DESIGN_MODE',
          enabled: !iframeDesignMode,
          timestamp: Date.now(),
        },
        '*'
      );
    }
  };

  // Update content from external panel
  const updateContent = () => {
    if (!selectedElement) {
      console.warn('[Parent] Cannot update content: no element selected');
      return;
    }

    // 验证 sourceInfo
    if (
      !selectedElement.sourceInfo ||
      !selectedElement.sourceInfo.fileName ||
      selectedElement.sourceInfo.lineNumber === 0
    ) {
      console.error(
        '[Parent] Cannot update content: invalid sourceInfo',
        selectedElement.sourceInfo
      );
      alert(
        '无法更新内容：元素信息不完整。请确保在 iframe 中选择了正确的元素。'
      );
      return;
    }

    console.log('[Parent] Sending UPDATE_CONTENT:', {
      sourceInfo: selectedElement.sourceInfo,
      newContent: editingContent,
    });

    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'UPDATE_CONTENT',
          payload: {
            sourceInfo: selectedElement.sourceInfo,
            newContent: editingContent,
          },
          timestamp: Date.now(),
        },
        '*'
      );
    }
  };

  // Update style from external panel
  const updateStyle = () => {
    if (!selectedElement) {
      console.warn('[Parent] Cannot update style: no element selected');
      return;
    }

    // 验证 sourceInfo
    if (
      !selectedElement.sourceInfo ||
      !selectedElement.sourceInfo.fileName ||
      selectedElement.sourceInfo.lineNumber === 0
    ) {
      console.error(
        '[Parent] Cannot update style: invalid sourceInfo',
        selectedElement.sourceInfo
      );
      alert(
        '无法更新样式：元素信息不完整。请确保在 iframe 中选择了正确的元素。'
      );
      return;
    }

    console.log('[Parent] Sending UPDATE_STYLE:', {
      sourceInfo: selectedElement.sourceInfo,
      newClass: editingClass,
    });

    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'UPDATE_STYLE',
          payload: {
            sourceInfo: selectedElement.sourceInfo,
            newClass: editingClass,
          },
          timestamp: Date.now(),
        },
        '*'
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Top Control Bar */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Iframe 设计模式演示
          </h1>
          <button
            onClick={toggleIframeDesignMode}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              iframeDesignMode
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {iframeDesignMode ? '✓ 设计模式已启用' : '启用设计模式'}
          </button>
        </div>
      </div>

      <div className='flex h-[calc(100vh-73px)]'>
        {/* Left: External Property Panel */}
        <div className='w-80 bg-white border-r border-gray-200 overflow-y-auto'>
          <div className='p-6'>
            <h2 className='text-lg font-bold text-gray-900 mb-4'>
              外部属性面板
            </h2>

            {selectedElement ? (
              <div className='space-y-6'>
                {/* Element Info */}
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h3 className='text-sm font-semibold text-blue-900 mb-2'>
                    选中元素
                  </h3>
                  <div className='text-xs text-blue-700 space-y-1'>
                    <div>
                      <span className='font-medium'>标签:</span>{' '}
                      {selectedElement.tagName}
                    </div>
                    <div className='break-all'>
                      <span className='font-medium'>文件:</span>{' '}
                      {selectedElement.sourceInfo.fileName.split('/').pop()}
                    </div>
                    <div>
                      <span className='font-medium'>位置:</span>{' '}
                      {selectedElement.sourceInfo.lineNumber}:
                      {selectedElement.sourceInfo.columnNumber}
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    内容编辑
                  </label>
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    rows={3}
                  />
                  <button
                    onClick={updateContent}
                    className='mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'
                  >
                    更新内容
                  </button>
                </div>

                {/* Style Editor */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    样式编辑 (className)
                  </label>
                  <textarea
                    value={editingClass}
                    onChange={e => setEditingClass(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm'
                    rows={4}
                  />
                  <button
                    onClick={updateStyle}
                    className='mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors'
                  >
                    更新样式
                  </button>
                </div>

                {/* Quick Style Presets */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    快速样式
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() =>
                        setEditingClass(editingClass + ' bg-red-100')
                      }
                      className='px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200'
                    >
                      红色背景
                    </button>
                    <button
                      onClick={() =>
                        setEditingClass(editingClass + ' bg-blue-100')
                      }
                      className='px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
                    >
                      蓝色背景
                    </button>
                    <button
                      onClick={() => setEditingClass(editingClass + ' p-8')}
                      className='px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200'
                    >
                      大内边距
                    </button>
                    <button
                      onClick={() =>
                        setEditingClass(editingClass + ' rounded-xl')
                      }
                      className='px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200'
                    >
                      圆角
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-12 text-gray-500'>
                <svg
                  className='w-16 h-16 mx-auto mb-4 text-gray-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122'
                  />
                </svg>
                <p className='text-sm'>
                  {iframeDesignMode
                    ? '点击 iframe 内的元素开始编辑'
                    : '请先启用设计模式'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Iframe Preview */}
        <div className='flex-1 bg-gray-50 p-6'>
          <div className='h-full bg-white rounded-lg shadow-xl overflow-hidden'>
            <iframe
              src={window.location.origin}
              className='w-full h-full'
              title='设计模式 Iframe 演示'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
