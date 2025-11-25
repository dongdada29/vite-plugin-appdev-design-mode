import React from 'react';

export default function IframeDemoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Iframe 集成演示</h1>
      <p className="text-xl text-gray-600 mb-8">
        此页面演示设计模式如何在 iframe 环境中工作。
      </p>

      {/* 信息区域 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">工作原理</h2>
        <ul className="list-disc list-inside text-blue-800 space-y-2">
          <li>在 iframe 内运行时，设计模式 UI 会自动隐藏</li>
          <li>选择状态通过 postMessage 传递给父窗口</li>
          <li>父窗口可以发送样式/内容更新命令</li>
          <li>这使得外部设计面板可以控制 iframe 内容</li>
        </ul>
      </div>

      {/* Iframe 容器 */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">嵌入式预览</h2>
        <p className="text-gray-600 mb-4">
          下方是一个嵌入了同一应用的 iframe。注意设计模式 UI 在 iframe 内的行为有所不同。
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
            <li>• 通过 window.postMessage 进行桥接通信</li>
            <li>• 消息类型：SELECTION_CHANGED、UPDATE_STYLE、UPDATE_CONTENT</li>
            <li>• 自动检测：window.self !== window.top</li>
            <li>• 基于 iframe 上下文的条件 UI 渲染</li>
          </ul>
        </div>
      </div>

      {/* 代码示例 */}
      <div className="mt-8 bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">代码示例</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
{`// 在 iframe 中（应用）
bridge.send('SELECTION_CHANGED', {
  tagName: 'div',
  className: 'bg-blue-500',
  source: { file: '/src/App.tsx', line: 42 }
});

// 在父窗口中（宿主）
bridge.on('SELECTION_CHANGED', (payload) => {
  console.log('元素已选中:', payload);
  // 更新外部设计面板 UI
});

// 从父窗口发送更新命令
bridge.send('UPDATE_STYLE', {
  newClass: 'bg-red-500 p-8'
});`}
        </pre>
      </div>
    </div>
  );
}
