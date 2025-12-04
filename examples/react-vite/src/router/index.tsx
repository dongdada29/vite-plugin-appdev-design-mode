import { createHashRouter, Link, Outlet, useLocation } from 'react-router-dom';
import Home from '@/pages/Home';
import IframeDemoPage from '@/pages/IframeDemoPage';

/**
 * 布局组件
 * 包含导航栏和页面内容区域
 */
function Layout() {
  const location = useLocation();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* 导航栏 */}
      <nav className='bg-white shadow-md'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-indigo-600'>设计模式演示</h1>
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                to='/'
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                首页
              </Link>
              <Link
                to='/iframe-demo'
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/iframe-demo'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Iframe 演示
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 页面内容 */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

/**
 * 404 页面组件
 * 当访问不存在的路由时显示
 */
function NotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4'>
      <div className='text-center max-w-md'>
        <h1 className='text-6xl font-bold text-gray-900 mb-4'>404</h1>
        <p className='text-xl text-gray-600 mb-2'>页面未找到</p>
        <p className='text-sm text-gray-500 mb-8'>
          抱歉，您访问的页面不存在或已被移动
        </p>
        <Link
          to='/'
          className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

/**
 * 路由配置
 * 使用 HashRouter（hash 模式）
 * 路由路径格式：/#/ 等
 *
 * Hash 模式的优点：
 * - 不需要服务器配置，可以在任何路径下部署
 * - URL 中的 hash 部分不会发送到服务器
 * - 适合静态部署和 CDN 部署
 *
 * 添加新路由：
 * {
 *   path: '/your-path',
 *   element: <YourComponent />,
 * }
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/iframe-demo',
        element: <IframeDemoPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
