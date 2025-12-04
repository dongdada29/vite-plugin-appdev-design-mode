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
        <div className="rounded-lg shadow-lg p-6 bg-green-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 bg-red-100">样式编辑</h3>
          <p className="text-gray-600 bg-gray-100">
            点击任意元素，实时修改其 Tailwind CSS 类。
          </p>
        </div>

        <div className="rounded-lg shadow-lg p-6 bg-green-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 bg-green-100">内容编辑12</h3>
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
            <h3 className="text-xl font-semibold text-blue-900 mb-2">可编辑卡片 1212</h3>
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
            <p className="text-purple-700 bg-green-100">
              双击这段文字可以直接编辑！3434341212121212
            </p>
          </div>
        </div>
      </div>
      {/* 列表修改测试区域 */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">列表修改测试</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          {[
            { text: "写一篇关于人工智能的文章", icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
            { text: "解释量子计算", icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
            { text: "设计一个Logo", icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          ].slice(0, 6).map((prompt, index) => {
            const IconComponent = prompt.icon;
            return (
              <div
                key={index}
                className='cursor-pointer border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 bg-white rounded-lg shadow-sm'
              >
                <div className='p-3'>
                  <div className='flex items-center gap-2 bg-yellow-100'>
                    <IconComponent className='w-4 h-4 text-blue-600' />
                    <span className='text-sm text-gray-700 truncate'>
                      "{prompt.text}"
                    </span>
                    <p>这量个相同的文本 1212</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
