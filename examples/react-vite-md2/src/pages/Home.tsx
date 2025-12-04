import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image, Video, Code2 } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: '图文生成',
      description: '输入主题，AI 自动生成完整的图文推送内容',
      path: '/article-generator',
      color: 'text-primary'
    },
    {
      icon: Image,
      title: '图片配文',
      description: '上传图片，AI 为您生成精准的文案内容',
      path: '/image-caption',
      color: 'text-primary'
    },
    {
      icon: Video,
      title: '视频脚本',
      description: '创建视频拍摄和制作的详细脚本文案',
      path: '/video-script',
      color: 'text-primary'
    },
    {
      icon: Code2,
      title: '设计模式演示',
      description: '体验 Iframe 设计模式，实时编辑页面元素',
      path: '/iframe-demo',
      color: 'text-primary'
    }
  ];

  return (
    <>
      <PageMeta title="公众号推文助手" description="专为微信公众号内容创作者设计的一站式推文制作工具" />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              公众号推文助手
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              专为微信公众号内容创作者设计，提供图文生成、图片配文、视频脚本创作等功能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.path}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary"
                  onClick={() => navigate(feature.path)}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="default">
                      开始创作
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Card className="max-w-3xl mx-auto bg-accent border-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">功能特色</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">⚡ 快速生成 1</h3>
                    <p className="text-sm text-muted-foreground">
                      AI 驱动，秒级生成高质量内容
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">✨ 在线编辑</h3>
                    <p className="text-sm text-muted-foreground">
                      富文本编辑器，支持样式自定义
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">📋 一键复制</h3>
                    <p className="text-sm text-muted-foreground">
                      保留格式，直接粘贴到公众号
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
