import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Cpu,
  Sparkles,
  Lock,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  FileText,
} from 'lucide-react';

/**
 * 首页组件
 * 展示应用页面开发助手的主要功能和使用说明
 */
function Home() {
  const examplePrompts = [
    { text: '制作登录页面', icon: Lock },
    { text: '添加商品列表', icon: Package },
    { text: '制作购物车', icon: ShoppingCart },
    { text: '创建仪表盘', icon: BarChart3 },
    { text: '设计用户资料页', icon: User },
    { text: '构建表单系统', icon: FileText },
  ];

  const steps = [
    {
      number: '1',
      title: '说出想法',
      description: '在左下角对话框输入您的需求',
      icon: MessageCircle,
    },
    {
      number: '2',
      title: 'AI 制作',
      description: 'AI 自动制作网页功能',
      icon: Cpu,
    },
    {
      number: '3',
      title: '查看效果',
      description: '立即看到制作结果',
      icon: Sparkles,
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col'>
      <div className='flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            应用页面开发助手
          </h1>
          <p className='text-base sm:text-lg text-gray-600 mb-6'>
            让智能助手帮您快速创建网页应用，只需简单描述，即刻生成专业页面
          </p>
        </div>

        {/* 使用步骤 - 单行展示 */}
        <div className='mb-8'>
          <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center'>
            简单三步开始
          </h2>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8'>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className='flex items-center gap-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm'>
                    {step.number}
                  </div>
                  <div className='flex items-center gap-2'>
                    <IconComponent className='w-5 h-5 text-blue-600' />
                    <h3 className='font-semibold text-gray-900 text-sm'>
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 示例提示 */}
        <div className='bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm'>
          <h3 className='text-base sm:text-lg font-bold text-gray-900 mb-4 text-center'>
            试试这样说
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {examplePrompts.slice(0, 6).map((prompt, index) => {
              const IconComponent = prompt.icon;
              return (
                <Card
                  key={index}
                  className='cursor-pointer border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200'
                >
                  <CardContent className='p-3'>
                    <div className='flex items-center gap-2'>
                      <IconComponent className='w-4 h-4 text-blue-600' />
                      <span className='text-sm text-gray-700 truncate'>
                        "{prompt.text}"
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className='text-xs text-gray-500 mt-4 text-center'>
            本页为示例页面，请直接替换成符合用户需求的页面
          </p>
        </div>
      </div>

      {/* 页脚 */}
      <div className='text-center py-3 sm:py-4 px-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm'>
        <p className='text-xs sm:text-sm text-gray-600'>
          智能页面开发助手 | 专为现代 Web 开发设计
        </p>
      </div>
    </div>
  );
}

export default Home;
