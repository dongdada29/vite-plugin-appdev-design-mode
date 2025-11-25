import React, { useState, useEffect } from 'react';

export default function IframeDemoPage() {
  const [iframeDesignMode, setIframeDesignMode] = useState(false);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'DESIGN_MODE_CHANGED') {
        setIframeDesignMode(event.data.enabled);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Toggle design mode in iframe
  const toggleIframeDesignMode = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'TOGGLE_DESIGN_MODE',
        enabled: !iframeDesignMode
      }, '*');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Iframe 集成演示</h1>
      <p className="text-xl text-gray-600 mb-8">
        此页面演示如何从外部控制 iframe 内的设计模式。
      </p>

      {/* 外部控制面板 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">外部控制面板</h2>
            <p className="text-indigo-100">
              控制 iframe 内的设计模式：
              <span className="ml-2 font-semibold">
                {iframeDesignMode ? '已启用' : '已禁用'}
              </span>
            </p>
          </div>
          <button
            onClick={toggleIframeDesignMode}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              iframeDesignMode
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-white hover:bg-gray-100 text-indigo-600'
            }`}
          >
            {iframeDesignMode ? '关闭设计模式' : '启用设计模式'}
          </button>
        </div>
      </div>

      {/* 信息区域 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">工作原理</h2>
        <ul className="list-disc list-inside text-blue-800 space-y-2">
          <li>父窗口通过 postMessage 发送 TOGGLE_DESIGN_MODE 消息</li>
          <li>iframe 内的应用接收消息并切换设计模式状态</li>
          <li>iframe 内的 UI 会自动隐藏，由外部面板控制</li>
          <li>设计模式仅在 iframe 内生效，不影响父页面</li>
        </ul>
      </div>

      {/* Iframe 容器 */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">嵌入式预览</h2>
        <p className="text-gray-600 mb-4">
          下方是一个嵌入了同一应用的 iframe。点击上方的按钮来控制 iframe 内的设计模式。
        </p>

        <div className="border-4 border-gray-300 rounded-lg overflow-hidden">
          <iframe
            src={window.location.origin}
            className="w-full h-96"
            title="设计模式 Iframe 演示"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold text-gray-900 mb-2">技术细节：</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 父窗口发送：<code className="bg-gray-200 px-1 rounded">TOGGLE_DESIGN_MODE</code></li>
            <li>• iframe 响应：<code className="bg-gray-200 px-1 rounded">DESIGN_MODE_CHANGED</code></li>
            <li>• 状态同步：实时双向通信</li>
            <li>• UI 隔离：iframe 内 UI 自动隐藏</li>
          </ul>
        </div>
      </div>

      {/* 代码示例 */}
      <div className="mt-8 bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">代码示例</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
{`// 父窗口：发送切换命令
iframe.contentWindow.postMessage({
  type: 'TOGGLE_DESIGN_MODE',
  enabled: true
}, '*');

// iframe 内：接收并响应
window.addEventListener('message', (event) => {
  if (event.data.type === 'TOGGLE_DESIGN_MODE') {
    setDesignMode(event.data.enabled);

    // 通知父窗口状态已更新
    window.parent.postMessage({
      type: 'DESIGN_MODE_CHANGED',
      enabled: event.data.enabled
    }, '*');
  }
});`}
        </pre>
      </div>
    </div>
  );
}
