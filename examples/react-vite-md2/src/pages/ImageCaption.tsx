import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Copy, Check, Loader2, Upload, X } from 'lucide-react';
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

export default function ImageCaption() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|bmp)$/)) {
      toast.error('仅支持 JPG、PNG、BMP 格式的图片');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      
      const base64Data = result.split(',')[1];
      const mimeType = file.type;
      setImageBase64(`data:${mimeType};base64,${base64Data}`);
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageBase64('');
    setContent('');
  };

  const handleGenerate = async () => {
    if (!imageBase64) {
      toast.error('请先上传图片');
      return;
    }

    setIsGenerating(true);
    setContent('');
    const controller = new AbortController();
    setAbortController(controller);

    let markdownContent = '';

    try {
      await sendChatStream({
        endpoint: 'https://api-integrations.appmiaoda.com/app-7a7nlc9zki69/api-2jBYdN3A9Jyz/v2/chat/completions',
        apiId: APP_ID,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的公众号文案写手，擅长为图片配写简洁有力的文案。请根据图片内容，生成适合公众号发布的配文，包括标题和正文。文案要简洁、有吸引力，能够引起读者共鸣。使用 Markdown 格式输出。'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请为这张图片生成适合公众号发布的配文'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
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
          toast.success('配文生成完成');
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
      <PageMeta title="图片配文 - 公众号推文助手" description="上传图片，AI 将为您生成精准的文案内容" />
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
                  图片配文
                </CardTitle>
                <CardDescription>
                  上传图片，AI 将为您生成精准的文案内容
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>上传图片</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="预览"
                        className="w-full rounded-lg border"
                        crossOrigin="anonymous"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">点击上传</span> 或拖拽图片到此处
                        </p>
                        <p className="text-xs text-muted-foreground">
                          支持 JPG、PNG、BMP 格式，最大 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/bmp"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
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
                    disabled={!imageBase64}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成配文
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
                    <li>图片内容越清晰，生成的配文越精准</li>
                    <li>支持 JPG、PNG、BMP 格式</li>
                    <li>可以在编辑器中修改生成的配文</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>配文预览与编辑</CardTitle>
                <CardDescription>
                  在这里查看和编辑生成的配文
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
                      <p>上传图片并点击生成，配文将在这里显示</p>
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
