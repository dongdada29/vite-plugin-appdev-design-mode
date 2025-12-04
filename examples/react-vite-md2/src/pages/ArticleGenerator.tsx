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

export default function ArticleGenerator() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('请输入文章主题');
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
            content: '你是一个专业的公众号文章写手，擅长创作吸引人的图文内容。请根据用户提供的主题，生成一篇完整的公众号文章，包括标题、引言、正文和结尾。文章要有吸引力，语言生动，适合微信公众号阅读。使用 Markdown 格式输出。'
          },
          {
            role: 'user',
            content: `请为我创作一篇关于"${topic}"的公众号文章`
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
          toast.success('文章生成完成');
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
      toast.success('内容已复制，可直接粘贴到公众号编辑器');
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败，请手动选择复制');
    }
  };

  return (
    <>
      <PageMeta title="图文生成 - 公众号推文助手" description="输入文章主题，AI 将为您生成完整的公众号图文内容" />
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
                  图文生成
                </CardTitle>
                <CardDescription>
                  输入文章主题，AI 将为您生成完整的公众号图文内容
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">文章主题</Label>
                  <Textarea
                    id="topic"
                    placeholder="例如：如何提高工作效率、健康饮食的重要性、春季旅游攻略..."
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
                    生成文章
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
                        复制内容
                      </>
                    )}
                  </Button>
                )}

                <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                  <p className="font-semibold">使用提示：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>主题描述越详细，生成的内容越精准</li>
                    <li>可以在编辑器中修改生成的内容</li>
                    <li>点击"复制内容"后可直接粘贴到公众号</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>内容预览与编辑</CardTitle>
                <CardDescription>
                  在这里查看和编辑生成的内容
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
                      <p>输入主题并点击生成，内容将在这里显示</p>
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
