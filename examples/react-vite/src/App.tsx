import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';

/**
 * 应用主组件
 * 使用 RouterProvider 来管理路由
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
