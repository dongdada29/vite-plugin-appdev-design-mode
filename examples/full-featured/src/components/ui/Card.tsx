/**
 * @fileoverview 卡片组件
 * @description 提供各种样式和布局的卡片容器组件
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// 卡片变体类型
type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'filled';

// 卡片尺寸类型
type CardSize = 'sm' | 'md' | 'lg' | 'xl';

// 卡片属性接口
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  hover?: boolean;
  interactive?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  variantClass?: string;
  sizeClass?: string;
}

// 卡片标题属性接口
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

// 卡片内容属性接口
interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

// 卡片底部属性接口
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

// 卡片图片属性接口
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  overlay?: boolean;
  height?: string | number;
  className?: string;
}

/**
 * 卡片组件实现
 */
const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  size = 'md',
  hover = false,
  interactive = false,
  loading = false,
  children,
  className,
  variantClass,
  sizeClass,
  onClick,
  ...props
}, ref) => {
  // 卡片变体样式配置
  const variantStyles: Record<CardVariant, string> = {
    default: `
      bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800
    `,
    elevated: `
      bg-white dark:bg-neutral-900 border-0 shadow-lg dark:shadow-neutral-900/20
      hover:shadow-xl transition-shadow duration-300
    `,
    outlined: `
      bg-transparent border-2 border-primary-200 dark:border-primary-800
      hover:border-primary-300 dark:hover:border-primary-700
    `,
    ghost: `
      bg-transparent border-0
      hover:bg-neutral-50 dark:hover:bg-neutral-800/50
    `,
    filled: `
      bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700
    `,
  };

  // 卡片尺寸样式配置
  const sizeStyles: Record<CardSize, string> = {
    sm: 'p-3 space-y-2',
    md: 'p-4 space-y-3',
    lg: 'p-6 space-y-4',
    xl: 'p-8 space-y-6',
  };

  // 悬停效果样式
  const hoverStyles = hover || interactive ? `
    transition-all duration-200 ease-in-out cursor-pointer
    hover:shadow-md hover:-translate-y-1
    hover:shadow-neutral-500/10 dark:hover:shadow-neutral-900/20
  ` : '';

  // 交互样式
  const interactiveStyles = interactive ? `
    active:scale-95 active:shadow-sm
  ` : '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover || interactive ? { y: -4 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      className={clsx(
        // 基础样式
        `
          card rounded-lg overflow-hidden
          ${interactive ? 'cursor-pointer' : ''}
          ${loading ? 'pointer-events-none' : ''}
        `,
        // 变体样式
        variantStyles[variant],
        // 尺寸样式
        sizeStyles[size],
        // 悬停和交互样式
        hoverStyles,
        interactiveStyles,
        // 自定义类名
        className
      )}
      onClick={interactive ? onClick : undefined}
      data-component="Card"
      data-element="card"
      data-variant={variant}
      data-size={size}
      data-hover={hover ? 'true' : 'false'}
      data-interactive={interactive ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      {...props}
    >
      {loading ? (
        <CardSkeleton variant={variant} size={size} />
      ) : (
        children
      )}
    </motion.div>
  );
});

Card.displayName = 'Card';

/**
 * 卡片头部组件
 */
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'card-header flex items-start justify-between',
        className
      )}
      data-component="CardHeader"
      data-element="header"
      {...props}
    >
      <div className="header-content flex-1" data-element="content">
        {title && (
          <h3 
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
            data-element="title"
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p 
            className="text-sm text-neutral-600 dark:text-neutral-400 mt-1"
            data-element="subtitle"
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="header-action ml-4 flex-shrink-0" data-element="action">
          {action}
        </div>
      )}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * 卡片内容组件
 */
const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('card-body', className)}
      data-component="CardBody"
      data-element="body"
      {...props}
    >
      {children}
    </div>
  );
});

CardBody.displayName = 'CardBody';

/**
 * 卡片底部组件
 */
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'card-footer flex items-center justify-between',
        'border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4',
        className
      )}
      data-component="CardFooter"
      data-element="footer"
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

/**
 * 卡片图片组件
 */
const CardImage = forwardRef<HTMLImageElement, CardImageProps>(({
  src,
  alt,
  overlay = false,
  height = 200,
  className,
  ...props
}, ref) => {
  return (
    <div 
      className={clsx(
        'card-image relative overflow-hidden',
        className
      )}
      data-component="CardImage"
      data-element="image"
      data-overlay={overlay ? 'true' : 'false'}
    >
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={clsx(
          'w-full object-cover',
          overlay && 'absolute inset-0 h-full'
        )}
        style={{ height }}
        data-element="img"
        {...props}
      />
      {overlay && (
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
          data-element="overlay"
        />
      )}
    </div>
  );
});

CardImage.displayName = 'CardImage';

/**
 * 卡片骨架屏组件
 */
const CardSkeleton: React.FC<{ variant: CardVariant; size: CardSize }> = ({ variant, size }) => {
  const skeletonSizes = {
    sm: { padding: 'p-3', gap: 'space-y-2' },
    md: { padding: 'p-4', gap: 'space-y-3' },
    lg: { padding: 'p-6', gap: 'space-y-4' },
    xl: { padding: 'p-8', gap: 'space-y-6' },
  };

  const { padding, gap } = skeletonSizes[size];

  return (
    <div className={`card-skeleton ${padding} ${gap}`} data-element="skeleton">
      {/* 头部骨架 */}
      <div className="flex items-start justify-between" data-element="header-skeleton">
        <div className="flex-1" data-element="content-skeleton">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
        <div className="ml-4" data-element="action-skeleton">
          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      
      {/* 内容骨架 */}
      <div className="space-y-3" data-element="body-skeleton">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-4/6" />
      </div>
      
      {/* 底部骨架 */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800" data-element="footer-skeleton">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
        <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    </div>
  );
};

/**
 * 卡片组组件
 */
interface CardGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

const CardGroup: React.FC<CardGroupProps> = ({
  columns = 3,
  gap = 'md',
  children,
  className,
  ...props
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={clsx(
        'card-group grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      data-component="CardGroup"
      data-element="group"
      data-columns={columns}
      data-gap={gap}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardImage,
  CardGroup,
  CardSkeleton
};

export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardImageProps,
  CardGroupProps,
  CardVariant,
  CardSize
};

export default Card;