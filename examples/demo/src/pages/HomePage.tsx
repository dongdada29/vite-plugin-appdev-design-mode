import React from 'react';

export default function HomePage() {
  const title = "欢迎使用设计模式";
  const content = "体验实时可视化编辑，自动更新源代码。";
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 主标题区域 */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          你好，{title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {content}
          点击右下角的设计模式开关即可开始！
          {'--变量测试--'}
        </p>
      </div>

      {/* 功能卡片 */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 bg-blue-100">样式编辑</h3>
          <p className="text-gray-600 bg-gray-100">
            点击任意元素，实时修改其 Tailwind CSS 类。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 bg-blue-100">内容编辑12</h3>
          <p className="text-gray-600 bg-gray-100">
            双击文本元素直接编辑内容，自动更新源文件。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 bg-blue-100">源码更新</h3>
          <p className="text-gray-600 bg-gray-100">
            所有修改都会自动保存到源代码文件中。
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-xl p-8">
3111
        <div className="space-y-4">
          <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">可编辑卡片</h3>
            <p className="text-blue-700 bg-blue-100 bg-red-100">
              这是一个可编辑的段落。在设计模式下试着点击它！
            </p>
          </div>

          <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
源码更新 1
            <p className="text-green-700">
              你可以修改背景、文字颜色、内边距等等。
            </p>
          </div>

          <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h3 className="text-xl font-semibold text-purple-900 mb-2">第三个卡片</h3>
            <p className="text-purple-700">
              双击这段文字可以直接编辑！3434341212121212
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
