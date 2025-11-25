import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import IframeDemoPage from './pages/IframeDemoPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'features' | 'iframe'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">设计模式演示</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                首页
              </button>
              <button
                onClick={() => setCurrentPage('features')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'features'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                功能展示
              </button>
              <button
                onClick={() => setCurrentPage('iframe')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'iframe'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Iframe 演示
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'features' && <FeaturesPage />}
        {currentPage === 'iframe' && <IframeDemoPage />}
      </main>
    </div>
  );
}

export default App;
