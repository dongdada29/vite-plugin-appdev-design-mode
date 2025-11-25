import React from 'react';

export default function FeaturesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">全部功能</h1>

      {/* 功能 1: 样式编辑 */}
      <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">1. 样式编辑</h2>
        <p className="text-gray-700 mb-6">
          选择任意元素，使用可视化编辑器修改其 Tailwind CSS 类。
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-100 rounded-md">
            <p className="text-sm text-slate-600">默认样式</p>
          </div>
          <div className="p-4 bg-blue-100 rounded-md">
            <p className="text-sm text-blue-600">修改后的样式</p>
          </div>
          <div className="p-6 bg-red-50 rounded-lg">
            <p className="text-base text-red-700">大内边距</p>
          </div>
          <div className="p-2 bg-green-50 rounded-full">
            <p className="text-xs text-green-700">小内边距 + 圆角</p>
          </div>
        </div>
      </section>

      {/* 功能 2: 内容编辑 */}
      <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">2. 内容编辑</h2>
        <p className="text-gray-700 mb-6">
          双击任意文本即可直接编辑。修改会保存到源文件中。
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900">可编辑标题</h3>
            <p className="text-gray-600">双击即可编辑这段文字。</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-md">
            <p className="text-blue-900">试着编辑这段文本！11</p>
          </div>
        </div>
      </section>

      {/* 功能 3: 源码映射 */}
      <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">3. 源码映射</h2>
        <p className="text-gray-700 mb-6">
          每个元素都有指向其源文件位置的元数据。
        </p>

        <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm">
          <div>data-source-file="/src/pages/FeaturesPage.tsx"</div>
          <div>data-source-line="42"</div>
          <div>data-source-column="8"</div>
        </div>
      </section>

      {/* 功能 4: 实时更新 */}
      <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">4. 实时更新</h2>
        <p className="text-gray-700 mb-6">
          所有修改都会立即反映在界面上并保存到磁盘。
        </p>

        <div className="flex items-center space-x-4">
          <div className="flex-1 p-4 bg-orange-50 rounded-md text-center">
            <p className="text-orange-700 font-medium">修改前</p>
          </div>
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="flex-1 p-4 bg-orange-100 rounded-lg text-center">
            <p className="text-orange-900 font-bold">修改后</p>
          </div>
        </div>
      </section>

      {/* 交互演示 */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">交互演示</h2>
        <p className="text-indigo-100 mb-6">
          启用设计模式，尝试修改这些元素：
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">卡片 1</h3>
            <p className="text-indigo-100">修改我的背景！</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">卡片 2</h3>
            <p className="text-indigo-100">改变我的文字颜色！</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">卡片 3</h3>
            <p className="text-indigo-100">编辑我的内容！</p>
          </div>
        </div>
      </section>
    </div>
  );
}
