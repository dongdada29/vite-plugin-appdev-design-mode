import Home from './pages/Home';
import ArticleGenerator from './pages/ArticleGenerator';
import ImageCaption from './pages/ImageCaption';
import VideoScript from './pages/VideoScript';
import UserSet from './pages/UserSet';
import IframeDemoPage from './pages/IframeDemoPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <Home />
  },
  {
    name: '图文生成',
    path: '/article-generator',
    element: <ArticleGenerator />
  },
  {
    name: '图片配文',
    path: '/image-caption',
    element: <ImageCaption />
  },
  {
    name: '视频脚本',
    path: '/video-script',
    element: <VideoScript />
  },
  {
    name: '个人设置',
    path: '/user-set',
    element: <UserSet />
  },
  {
    name: 'Iframe 演示',
    path: '/iframe-demo',
    element: <IframeDemoPage />
  }
];

export default routes;