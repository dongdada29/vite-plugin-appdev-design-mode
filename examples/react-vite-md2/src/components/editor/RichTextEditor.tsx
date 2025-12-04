import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export default function RichTextEditor({ content, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
  };

  const toolbarButtons = [
    {
      group: 'text',
      buttons: [
        { icon: Bold, command: 'bold', title: '粗体' },
        { icon: Italic, command: 'italic', title: '斜体' },
        { icon: Underline, command: 'underline', title: '下划线' }
      ]
    },
    {
      group: 'heading',
      buttons: [
        { icon: Heading1, command: 'h1', title: '一级标题', isFormatBlock: true },
        { icon: Heading2, command: 'h2', title: '二级标题', isFormatBlock: true },
        { icon: Heading3, command: 'h3', title: '三级标题', isFormatBlock: true }
      ]
    },
    {
      group: 'align',
      buttons: [
        { icon: AlignLeft, command: 'justifyLeft', title: '左对齐' },
        { icon: AlignCenter, command: 'justifyCenter', title: '居中' },
        { icon: AlignRight, command: 'justifyRight', title: '右对齐' }
      ]
    },
    {
      group: 'list',
      buttons: [
        { icon: List, command: 'insertUnorderedList', title: '无序列表' },
        { icon: ListOrdered, command: 'insertOrderedList', title: '有序列表' },
        { icon: Quote, command: 'formatBlock', value: 'blockquote', title: '引用' }
      ]
    }
  ];

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-card', className)}>
      <div className="border-b bg-muted p-2 flex flex-wrap gap-2">
        {toolbarButtons.map((group, groupIndex) => (
          <div key={group.group} className="flex gap-1">
            {group.buttons.map((btn) => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btn.command}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title={btn.title}
                  onClick={() => {
                    if (btn.isFormatBlock) {
                      formatBlock(btn.command);
                    } else {
                      execCommand(btn.command, btn.value);
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
            {groupIndex < toolbarButtons.length - 1 && (
              <Separator orientation="vertical" className="h-8 mx-1" />
            )}
          </div>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[400px] focus:outline-none prose prose-sm max-w-none"
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  );
}
