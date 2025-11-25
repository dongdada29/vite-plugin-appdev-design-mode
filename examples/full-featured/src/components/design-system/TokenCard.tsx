/**
 * @fileoverview 令牌卡片组件
 * @description 展示设计系统令牌的可视化组件
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Edit3, Trash2, Tag } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button, IconButton } from '../ui/Button';
import { DesignToken, ColorToken, TypographyToken, SpacingToken, ShadowToken, BorderRadiusToken, AnimationToken } from '../../types/design-system';
import { useDesignSystemStore } from '../../store/design-system-store';
import { clsx } from 'clsx';

// 令牌卡片属性接口
interface TokenCardProps {
  token: DesignToken;
  variant?: 'default' | 'compact' | 'detailed';
  interactive?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * 令牌卡片主组件
 */
const TokenCard: React.FC<TokenCardProps> = ({
  token,
  variant = 'default',
  interactive = true,
  showActions = true,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { setSelectedToken } = useDesignSystemStore();

  // 复制令牌值
  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(String(token.value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  // 选择令牌
  const handleSelect = () => {
    if (interactive) {
      setSelectedToken(token);
    }
  };

  // 渲染令牌预览
  const renderTokenPreview = () => {
    switch (token.category) {
      case 'color':
        return <ColorTokenPreview token={token as ColorToken} />;
      case 'typography':
        return <TypographyTokenPreview token={token as TypographyToken} />;
      case 'spacing':
        return <SpacingTokenPreview token={token as SpacingToken} />;
      case 'shadow':
        return <ShadowTokenPreview token={token as ShadowToken} />;
      case 'border-radius':
        return <BorderRadiusTokenPreview token={token as BorderRadiusToken} />;
      case 'animation':
        return <AnimationTokenPreview token={token as AnimationToken} />;
      default:
        return <DefaultTokenPreview token={token} />;
    }
  };

  // 渲染令牌信息
  const renderTokenInfo = () => {
    const categoryIcons = {
      color: '🎨',
      typography: '📝',
      spacing: '📏',
      shadow: '🌑',
      'border-radius': '🔘',
      'z-index': '📊',
      animation: '⚡',
    };

    return (
      <div className="token-info" data-element="info">
        <div className="flex items-center space-x-2 mb-2" data-element="header">
          <span className="text-lg" data-element="icon">
            {categoryIcons[token.category]}
          </span>
          <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100" data-element="name">
            {token.name}
          </h4>
          {token.deprecated && (
            <span className="px-2 py-0.5 text-xs bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-200 rounded-full">
              Deprecated
            </span>
          )}
        </div>
        
        {token.description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3" data-element="description">
            {token.description}
          </p>
        )}
        
        {token.tags && token.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3" data-element="tags">
            {token.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {token.tags.length > 3 && (
              <span className="text-xs text-neutral-500">
                +{token.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -2 } : {}}
      className={clsx(
        'token-card',
        {
          'cursor-pointer': interactive,
          'opacity-75': token.deprecated,
        },
        className
      )}
      data-component="TokenCard"
      data-element="card"
      data-category={token.category}
      data-name={token.name}
      onClick={handleSelect}
    >
      <Card
        variant="default"
        size="sm"
        hover={interactive}
        interactive={interactive}
        className="h-full"
      >
        <CardBody className="p-4">
          {/* 令牌预览 */}
          <div className="token-preview mb-4" data-element="preview">
            {renderTokenPreview()}
          </div>
          
          {/* 令牌信息 */}
          {renderTokenInfo()}
          
          {/* 令牌值和操作 */}
          <div className="token-actions flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800" data-element="actions">
            <div className="token-value flex items-center space-x-2" data-element="value">
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded font-mono">
                {typeof token.value === 'object' ? JSON.stringify(token.value) : token.value}
              </code>
            </div>
            
            {showActions && (
              <div className="token-buttons flex items-center space-x-1" data-element="buttons">
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToken();
                  }}
                  aria-label="Copy token value"
                  data-component="IconButton"
                  data-element="copy-button"
                  data-action="copy-value"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-success-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </IconButton>
                
                {interactive && (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(!isEditing);
                    }}
                    aria-label="Edit token"
                    data-component="IconButton"
                    data-element="edit-button"
                    data-action="edit-token"
                  >
                    <Edit3 className="w-3 h-3" />
                  </IconButton>
                )}
              </div>
            )}
          </div>
          
          {/* 编辑模式 */}
          {isEditing && interactive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="token-editor mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800"
              data-element="editor"
            >
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Token Value
                </label>
                <textarea
                  className="w-full px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800"
                  rows={2}
                  value={typeof token.value === 'object' ? JSON.stringify(token.value, null, 2) : String(token.value)}
                  readOnly
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

// 颜色令牌预览组件
const ColorTokenPreview: React.FC<{ token: ColorToken }> = ({ token }) => {
  return (
    <div className="color-token-preview" data-element="color-preview">
      <div
        className="color-swatch w-full h-16 rounded-lg border border-neutral-200 dark:border-neutral-700"
        style={{ backgroundColor: token.value }}
        data-element="swatch"
      />
      <div className="color-info mt-2 text-center">
        <div className="text-xs font-mono" data-element="hex-value">
          {token.value}
        </div>
        {token.scale && (
          <div className="text-xs text-neutral-500" data-element="scale">
            {token.palette} {token.scale}
          </div>
        )}
      </div>
    </div>
  );
};

// 字体令牌预览组件
const TypographyTokenPreview: React.FC<{ token: TypographyToken }> = ({ token }) => {
  const { fontSize, fontWeight, lineHeight } = token.value;
  
  return (
    <div className="typography-token-preview p-3 bg-neutral-50 dark:bg-neutral-800 rounded" data-element="typography-preview">
      <div
        style={{
          fontSize: fontSize || '1rem',
          fontWeight: fontWeight || 400,
          lineHeight: lineHeight || '1.5',
        }}
        data-element="text-sample"
      >
        The quick brown fox
      </div>
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1" data-element="typography-info">
        {fontSize && <div>Size: {fontSize}</div>}
        {fontWeight && <div>Weight: {fontWeight}</div>}
        {lineHeight && <div>Line Height: {lineHeight}</div>}
      </div>
    </div>
  );
};

// 间距令牌预览组件
const SpacingTokenPreview: React.FC<{ token: SpacingToken }> = ({ token }) => {
  return (
    <div className="spacing-token-preview" data-element="spacing-preview">
      <div className="flex items-center space-x-2">
        <div
          className="bg-primary-200 dark:bg-primary-800 h-4 rounded"
          style={{ width: token.value }}
          data-element="spacing-bar"
        />
        <span className="text-xs font-mono" data-element="spacing-value">
          {token.value}
        </span>
      </div>
    </div>
  );
};

// 阴影令牌预览组件
const ShadowTokenPreview: React.FC<{ token: ShadowToken }> = ({ token }) => {
  const { offsetX = '0', offsetY = '0', blurRadius = '0', spreadRadius = '0', color = 'transparent' } = token.value;
  
  return (
    <div className="shadow-token-preview" data-element="shadow-preview">
      <div
        className="shadow-demo w-full h-16 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
        style={{
          boxShadow: `${offsetX} ${offsetY} ${blurRadius} ${spreadRadius} ${color}`,
        }}
        data-element="shadow-box"
      />
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1" data-element="shadow-info">
        <div>X: {offsetX}</div>
        <div>Y: {offsetY}</div>
        <div>Blur: {blurRadius}</div>
        <div>Spread: {spreadRadius}</div>
      </div>
    </div>
  );
};

// 圆角令牌预览组件
const BorderRadiusTokenPreview: React.FC<{ token: BorderRadiusToken }> = ({ token }) => {
  return (
    <div className="border-radius-token-preview" data-element="radius-preview">
      <div
        className="radius-demo w-full h-16 bg-primary-100 dark:bg-primary-900/20"
        style={{ borderRadius: token.value }}
        data-element="radius-box"
      />
      <div className="mt-2 text-center text-xs font-mono" data-element="radius-value">
        {token.value}
      </div>
    </div>
  );
};

// 动画令牌预览组件
const AnimationTokenPreview: React.FC<{ token: AnimationToken }> = ({ token }) => {
  const { duration = '300ms', timingFunction = 'ease' } = token.value;
  
  return (
    <div className="animation-token-preview" data-element="animation-preview">
      <div className="flex items-center space-x-2">
        <div className="animation-demo w-8 h-8 bg-primary-500 rounded-full" data-element="animated-circle" />
        <div className="text-xs space-y-1" data-element="animation-info">
          <div>Duration: {duration}</div>
          <div>Easing: {timingFunction}</div>
        </div>
      </div>
    </div>
  );
};

// 默认令牌预览组件
const DefaultTokenPreview: React.FC<{ token: DesignToken }> = ({ token }) => {
  return (
    <div className="default-token-preview p-3 bg-neutral-50 dark:bg-neutral-800 rounded" data-element="default-preview">
      <div className="text-center text-sm font-mono" data-element="value">
        {typeof token.value === 'object' ? JSON.stringify(token.value) : String(token.value)}
      </div>
    </div>
  );
};

export { TokenCard, ColorTokenPreview, TypographyTokenPreview, SpacingTokenPreview, ShadowTokenPreview, BorderRadiusTokenPreview, AnimationTokenPreview };
export type { TokenCardProps };

export default TokenCard;