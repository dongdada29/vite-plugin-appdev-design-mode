import React from 'react';
import { cn } from '../utils/cn';

export interface DemoElementProps {
  element: {
    id: string;
    tag: string;
    content: string;
    className: string;
  };
  isDesignMode: boolean;
  onSelect: (element: HTMLElement) => void;
}

export const DemoElement: React.FC<DemoElementProps> = ({ element, isDesignMode, onSelect }) => {
  const Tag = element.tag as any;

  return (
    <Tag
      id={element.id}
      className={cn(
        element.className,
        "transition-all duration-200 cursor-default",
        isDesignMode && "hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 cursor-pointer",
        "data-[selected=true]:outline data-[selected=true]:outline-2 data-[selected=true]:outline-blue-600 data-[selected=true]:outline-offset-2"
      )}
      onClick={(e: React.MouseEvent) => {
        if (isDesignMode) {
          e.preventDefault();
          onSelect(e.currentTarget as HTMLElement);
        }
      }}
      data-element={element.id}
    >
      {element.content}
    </Tag>
  );
};
