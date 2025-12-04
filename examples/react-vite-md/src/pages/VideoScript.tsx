import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { sendChatStream } from '@/services/chatStream';
import PageMeta from '@/components/common/PageMeta';

const APP_ID = import.meta.env.VITE_APP_ID;

const markdownToHtml = (markdown: string): string => {
  let html = markdown;
  
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  return html;
};

export default function VideoScript() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('请输入视频主题');
      return;
    }

    setIsGenerating(true);
    setContent('');
    const controller = new AbortController();
    setAbortController(controller);

    let markdownContent = '';

    try {
      await sendChatStream({
        endpoint: 'https://api-integrations.appmiaoda.com/app-7a7nlc9zki69/api-2bk93oeO9NlE/v2/chat/completions',
        apiId: APP_ID,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的视频脚本创作者，擅长为公众号视频内容创作详细的拍摄脚本。请根据用户提供的主题，生成一个完整的视频脚本，包括：标题、简介、分镜脚本（场景描述、台词、时长、拍摄要点）。脚本要详细、实用，便于执行。使用 Markdown 格式输出，用表格展示分镜脚本。'
          },
          {
            role: 'user',
            content: `请为我创作一个关于"${topic}"的视频拍摄脚本`
          }
        ],
        onUpdate: (newContent: string) => {
          markdownContent = newContent;
          const htmlContent = markdownToHtml(markdownContent);
          setContent(htmlContent);
        },
        onComplete: () => {
          setIsGenerating(false);
          setAbortController(null);
          toast.success('脚本生成完成');
        },
        onError: (error: Error) => {
          setIsGenerating(false);
          setAbortController(null);
          toast.error(`生成失败: ${error.message}`);
        },
        signal: controller.signal
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
        setAbortController(null);
        toast.error('生成失败，请重试');
      }
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsGenerating(false);
      toast.info('已停止生成');
    }
  };

  const handleCopy = async () => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const blob = new Blob([tempDiv.innerHTML], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([tempDiv.innerText], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setIsCopied(true);
      toast.success('脚本已复制');
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败，请手动选择复制');
    }
  };

  return (
    <>
      <PageMeta title="视频脚本 - 公众号推文助手" description="输入视频主题，AI 将为您生成详细的拍摄脚本" />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  视频脚本生成
                </CardTitle>
                <CardDescription>
                  输入视频主题，AI 将为您生成详细的拍摄脚本
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">视频主题</Label>
                  <Textarea
                    id="topic"
                    placeholder="例如：产品使用教程、品牌故事讲述、活动现场记录..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={4}
                    disabled={isGenerating}
                  />
                </div>

                {isGenerating ? (
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={handleStop}
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    停止生成
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={!topic.trim()}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成脚本
                  </Button>
                )}

                {content && !isGenerating && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {isCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        复制脚本
                      </>
                    )}
                  </Button>
                )}

                <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                  <p className="font-semibold">使用提示：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>详细描述视频主题和目标受众</li>
                    <li>脚本包含分镜、台词、时长等信息</li>
                    <li>可以在编辑器中修改和完善脚本</li>
                    <li>适合短视频和中长视频制作</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>脚本预览与编辑</CardTitle>
                <CardDescription>
                  在这里查看和编辑生成的视频脚本
                </CardDescription>
              </CardHeader>
              <CardContent>
                {content ? (
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                  />
                ) : (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground min-h-[400px] flex items-center justify-center">
                    <div>
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>输入主题并点击生成，脚本将在这里显示</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
