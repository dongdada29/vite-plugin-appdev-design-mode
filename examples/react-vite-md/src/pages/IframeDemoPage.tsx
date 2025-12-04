import React from 'react';
import { useState, useEffect } from 'react';
import type { ElementInfo } from '@/types/messages';
import type { TailwindPanelConfig } from '@/types/messages';
import { twMerge } from 'tailwind-merge';


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
    const [pendingChanges, setPendingChanges] = useState<
        Array<{
            type: 'style' | 'content';
            sourceInfo: any;
            newValue: string;
            originalValue?: string;
        }>
    >([]);
    const [tailwindConfig, setTailwindConfig] = useState<TailwindPanelConfig | null>(null);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    // Listen for messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Debug log for message source
            if (event.data.type === 'ELEMENT_SELECTED') {
                console.log('[Parent] Received ELEMENT_SELECTED', {
                    source: event.source,
                    iframeWindow: iframeRef.current?.contentWindow,
                    isMatch: iframeRef.current && event.source === iframeRef.current.contentWindow,
                    data: event.data
                });
            }
            if (event.data.type === 'ADD_TO_CHAT') {
                return console.log('[Parent] Add to chat:', event.data.payload);
            }

            if (event.data.type === 'COPY_ELEMENT') {
                return console.log('[Parent] Copy element:', event.data.payload);
            }

            // Only accept messages from the iframe
            if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
                if (event.data.type === 'ELEMENT_SELECTED') {
                    console.warn('[Parent] Ignoring message from non-iframe source');
                }
                return;
            }

            const { type, payload } = event.data;

            switch (type) {
                case 'DESIGN_MODE_CHANGED':
                    setIframeDesignMode(event.data.enabled);
                    break;

                case 'ELEMENT_SELECTED':
                    console.log('[Parent] Processing ELEMENT_SELECTED', payload);

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

                case 'TAILWIND_CONFIG':
                    console.log('[Parent] Received Tailwind config:', payload);
                    setTailwindConfig(payload.config);
                    break;

            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Debounce hook
    const useDebounce = <T,>(value: T, delay: number): T => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };

    const debouncedContent = useDebounce(editingContent, 300);
    const debouncedClass = useDebounce(editingClass, 300);

    // Upsert pending change
    const upsertPendingChange = (
        type: 'style' | 'content',
        newValue: string,
        originalValue?: string
    ) => {
        if (!selectedElement) return;
        setPendingChanges(prev => {
            const existingIndex = prev.findIndex(
                item =>
                    item.type === type &&
                    item.sourceInfo.fileName === selectedElement.sourceInfo.fileName &&
                    item.sourceInfo.lineNumber === selectedElement.sourceInfo.lineNumber
            );

            const newChange = {
                type,
                sourceInfo: selectedElement.sourceInfo,
                newValue,
                originalValue: originalValue || (type === 'style' ? selectedElement.className : selectedElement.textContent),
            };

            if (existingIndex >= 0) {
                const newList = [...prev];
                newList[existingIndex] = newChange;
                return newList;
            } else {
                return [...prev, newChange];
            }
        });
    };

    const lastSelectedElementRef = React.useRef(selectedElement);

    // Real-time content update
    useEffect(() => {
        if (!selectedElement) return;

        // If selection changed, skip this update cycle
        if (selectedElement !== lastSelectedElementRef.current) {
            console.log('[Parent] Skipping content update due to selection change');
            return;
        }

        console.log('[Parent] Content effect triggered', {
            debouncedContent,
            currentContent: selectedElement.textContent,
            shouldUpdate: debouncedContent !== selectedElement.textContent
        });

        if (debouncedContent === selectedElement.textContent) return;

        console.log('[Parent] Sending UPDATE_CONTENT', debouncedContent);
        upsertPendingChange('content', debouncedContent);

        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
                {
                    type: 'UPDATE_CONTENT',
                    payload: {
                        sourceInfo: selectedElement.sourceInfo,
                        newContent: debouncedContent,
                        persist: false,
                    },
                    timestamp: Date.now(),
                },
                '*'
            );
        }
    }, [debouncedContent, selectedElement]); // Removed upsertPendingChange to fix infinite loop

    // Real-time style update
    useEffect(() => {
        if (!selectedElement) return;

        // If selection changed, skip this update cycle
        if (selectedElement !== lastSelectedElementRef.current) {
            console.log('[Parent] Skipping style update due to selection change');
            return;
        }

        if (debouncedClass === selectedElement.className) return;

        upsertPendingChange('style', debouncedClass);

        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
                {
                    type: 'UPDATE_STYLE',
                    payload: {
                        sourceInfo: selectedElement.sourceInfo,
                        newClass: debouncedClass,
                        persist: false,
                    },
                    timestamp: Date.now(),
                },
                '*'
            );
        }
    }, [debouncedClass, selectedElement]); // Removed upsertPendingChange to fix infinite loop

    // Update lastSelectedElementRef AFTER other effects
    useEffect(() => {
        lastSelectedElementRef.current = selectedElement;
    }, [selectedElement]);

    // Style Manager Logic - Using twMerge
    const toggleStyle = (newStyle: string, categoryRegex: RegExp) => {
        let currentClasses = editingClass.split(' ').filter(c => c.trim());

        // Remove existing class in the same category
        currentClasses = currentClasses.filter(c => !categoryRegex.test(c));

        // Add new style if it's not empty (allows clearing style)
        if (newStyle) {
            currentClasses.push(newStyle);
        }

        // Use twMerge to handle conflicting classes
        const mergedClasses = twMerge(currentClasses.join(' '));
        setEditingClass(mergedClasses);
    };

    const hasStyle = (style: string) => {
        return editingClass.split(' ').includes(style);
    };

    // UI Controls - Dynamic Tailwind Config Rendering
    const renderDynamicColorPicker = (prefix: string, label: string) => {
        if (!tailwindConfig?.colors) {
            return <div className="mb-4 text-sm text-gray-500">加载配置中...</div>;
        }

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {Object.entries(tailwindConfig.colors).map(([colorName, shades]) => (
                        Object.entries(shades as Record<string, string>).map(([shade, hex]) => {
                            const styleClass = `${prefix}-${colorName}-${shade}`;
                            const isActive = hasStyle(styleClass);
                            return (
                                <button
                                    key={`${colorName}-${shade}`}
                                    onClick={() => toggleStyle(styleClass, new RegExp(`^${prefix}-[a-z]+(-\\d+)?$`))}
                                    className={`w-8 h-8 rounded-full border-2 transition-all flex-shrink-0 ${isActive ? 'border-gray-900 scale-110 ring-2 ring-offset-1 ring-blue-500' : 'border-gray-300 hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: hex }}
                                    title={`${colorName}-${shade} (${hex})`}
                                />
                            );
                        })
                    ))}
                    <button
                        onClick={() => toggleStyle('', new RegExp(`^${prefix}-[a-z]+(-\\d+)?$`))}
                        className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-100 flex-shrink-0"
                    >
                        清除
                    </button>
                </div>
            </div>
        );
    };

    // Legacy color picker for fallback
    const renderColorPicker = (prefix: string, colors: string[], label: string) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {colors.map(color => {
                    const styleClass = `${prefix}-${color}`;
                    const isActive = hasStyle(styleClass);
                    return (
                        <button
                            key={color}
                            onClick={() => toggleStyle(styleClass, new RegExp(`^${prefix}-[a-z]+(-\\d+)?$`))}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${isActive ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                                } ${styleClass.replace('text-', 'bg-')}`} // Use bg color for preview
                            title={color}
                        />
                    );
                })}
                <button
                    onClick={() => toggleStyle('', new RegExp(`^${prefix}-[a-z]+(-\\d+)?$`))}
                    className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-100"
                >
                    清除
                </button>
            </div>
        </div>
    );

    const renderSelect = (prefix: string, options: { label: string; value: string }[], label: string) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                    const styleClass = opt.value ? `${prefix}-${opt.value}` : '';
                    const isActive = styleClass ? hasStyle(styleClass) : !options.some(o => o.value && hasStyle(`${prefix}-${o.value}`));
                    return (
                        <button
                            key={opt.label}
                            onClick={() => toggleStyle(styleClass, new RegExp(`^${prefix}(-[a-z0-9]+)?$`))}
                            className={`px-3 py-1 text-sm rounded border transition-all ${isActive
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>
        </div>
    );

    // Toggle design mode in iframe
    const toggleIframeDesignMode = () => {
        const iframe = iframeRef.current;
        console.log('[Parent] Toggling iframe design mode...', iframe);
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

    // 保存所有更改
    const saveChanges = async () => {
        if (pendingChanges.length === 0) return;

        console.log('[Parent] Saving changes...', pendingChanges);

        try {
            const response = await fetch('/__appdev_design_mode/batch-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    updates: pendingChanges.map(change => ({
                        filePath: change.sourceInfo.fileName,
                        line: change.sourceInfo.lineNumber,
                        column: change.sourceInfo.columnNumber,
                        newValue: change.newValue,
                        type: change.type,
                        originalValue: change.originalValue,
                    })),
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('[Parent] Batch update success:', result);
                alert(`成功保存 ${result.summary.successful} 个更改！`);
                setPendingChanges([]); // 清空待保存列表
            } else {
                const error = await response.json();
                console.error('[Parent] Batch update failed:', error);
                alert('保存失败，请查看控制台错误信息。');
            }
        } catch (error) {
            console.error('[Parent] Error saving changes:', error);
            alert('保存出错，请检查网络连接。');
        }
    };

    return (
        <div className='min-h-screen' data-selection-exclude="true">
            {/* Top Control Bar */}
            <div className='bg-white border-b border-gray-200 px-6 py-4'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Iframe 设计模式演示
                    </h1>
                    <div className='flex gap-4'>
                        {pendingChanges.length > 0 && (
                            <button
                                onClick={saveChanges}
                                className='px-6 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md flex items-center gap-2'
                            >
                                <span>保存更改 ({pendingChanges.length})</span>
                                <svg
                                    className='w-4 h-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                                    />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={toggleIframeDesignMode}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${iframeDesignMode
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                        >
                            {iframeDesignMode ? '✓ 设计模式已启用' : '启用设计模式'}
                        </button>
                    </div>
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
                                    </div>
                                </div>

                                {/* Content Editor - 仅当 isStaticText 为 true 时显示 */}
                                {selectedElement.isStaticText && (
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
                                    </div>
                                )}

                                <hr className="border-gray-200" />

                                {/* Smart Style Controls */}
                                <div>
                                    <h3 className="text-md font-bold text-gray-900 mb-4">样式设置</h3>

                                    {tailwindConfig ? (
                                        <>
                                            {renderDynamicColorPicker('bg', '背景颜色')}
                                            {renderDynamicColorPicker('text', '文字颜色')}
                                        </>
                                    ) : (
                                        <>
                                            {renderColorPicker('bg', ['white', 'gray-100', 'red-100', 'blue-100', 'green-100', 'yellow-100', 'purple-100'], '背景颜色')}
                                            {renderColorPicker('text', ['gray-900', 'gray-500', 'red-600', 'blue-600', 'green-600', 'purple-600', 'white'], '文字颜色')}
                                        </>
                                    )}

                                    {renderSelect('p', [
                                        { label: '无', value: '0' },
                                        { label: '小', value: '2' },
                                        { label: '中', value: '4' },
                                        { label: '大', value: '8' },
                                        { label: '特大', value: '12' }
                                    ], '内边距 (Padding)')}

                                    {renderSelect('rounded', [
                                        { label: '直角', value: 'none' },
                                        { label: '小圆角', value: 'sm' },
                                        { label: '圆角', value: 'md' },
                                        { label: '大圆角', value: 'lg' },
                                        { label: '全圆角', value: 'full' }
                                    ], '圆角 (Border Radius)')}

                                    {renderSelect('text', [
                                        { label: '小', value: 'sm' },
                                        { label: '默认', value: 'base' },
                                        { label: '中', value: 'lg' },
                                        { label: '大', value: 'xl' },
                                        { label: '特大', value: '2xl' }
                                    ], '文字大小 (Font Size)')}
                                </div>

                                {/* Raw Style Editor */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <label className='block text-sm font-medium text-gray-500 mb-2'>
                                        原始 ClassName (高级)
                                    </label>
                                    <textarea
                                        value={editingClass}
                                        onChange={e => setEditingClass(e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-xs text-gray-500'
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className='text-center py-12 text-gray-500'>
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
                            ref={iframeRef}
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


