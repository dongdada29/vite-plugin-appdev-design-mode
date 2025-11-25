/**
 * @fileoverview 按钮组件
 * @description 提供各种样式和状态的按钮组件
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// 按钮变体类型
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';

// 按钮尺寸类型
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// 按钮属性接口
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  variantClass?: string;
  sizeClass?: string;
}

/**
 * 按钮组件实现
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className,
  disabled,
  variantClass,
  sizeClass,
  onClick,
  ...props
}, ref) => {
  // 按钮变体样式配置
  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-primary-600 border-primary-600 text-white
      hover:bg-primary-700 hover:border-primary-700 
      focus:ring-primary-500 focus:ring-offset-2
      active:bg-primary-800 active:border-primary-800
      disabled:bg-primary-300 disabled:border-primary-300
    `,
    secondary: `
      bg-neutral-200 border-neutral-300 text-neutral-900
      hover:bg-neutral-300 hover:border-neutral-400
      focus:ring-neutral-500 focus:ring-offset-2
      active:bg-neutral-400 active:border-neutral-500
      disabled:bg-neutral-100 disabled:border-neutral-200
      dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
      dark:hover:bg-neutral-600 dark:hover:border-neutral-500
      dark:active:bg-neutral-500 dark:active:border-neutral-400
      dark:disabled:bg-neutral-800 dark:disabled:border-neutral-700
    `,
    outline: `
      bg-transparent border-primary-600 text-primary-600
      hover:bg-primary-600 hover:text-white
      focus:ring-primary-500 focus:ring-offset-2
      active:bg-primary-700 active:border-primary-700
      disabled:text-primary-300 disabled:border-primary-300
      disabled:hover:bg-transparent disabled:hover:text-primary-300
    `,
    ghost: `
      bg-transparent border-transparent text-neutral-700
      hover:bg-neutral-100 hover:text-neutral-900
      focus:ring-neutral-500 focus:ring-offset-2
      active:bg-neutral-200 active:text-neutral-900
      disabled:text-neutral-400
      dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100
      dark:active:bg-neutral-700 dark:active:text-neutral-100
    `,
    link: `
      bg-transparent border-transparent text-primary-600
      hover:text-primary-700 hover:underline
      focus:ring-primary-500 focus:ring-offset-2
      active:text-primary-800
      disabled:text-primary-300 disabled:no-underline
    `,
    danger: `
      bg-error-600 border-error-600 text-white
      hover:bg-error-700 hover:border-error-700
      focus:ring-error-500 focus:ring-offset-2
      active:bg-error-800 active:border-error-800
      disabled:bg-error-300 disabled:border-error-300
    `,
  };

  // 按钮尺寸样式配置
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  // 计算按钮内容
  const buttonContent = (
    <span className="button-content flex items-center justify-center space-x-2">
      {icon && iconPosition === 'left' && !loading && (
        <span className="button-icon-left" data-element="icon-left">
          {icon}
        </span>
      )}
      
      {loading && (
        <span className="button-loading-icon" data-element="loading-icon">
          <div className="loading-spinner w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      
      <span className="button-text" data-element="text">
        {loading && loadingText ? loadingText : children}
      </span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="button-icon-right" data-element="icon-right">
          {icon}
        </span>
      )}
    </span>
  );

  // 应用自定义样式类
  const combinedVariantClass = variantClass || variantStyles[variant];
  const combinedSizeClass = sizeClass || sizeStyles[size];

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        // 基础样式
        `
          inline-flex items-center justify-center font-medium rounded-md border
          transition-all duration-200 focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          disabled:transform-none
        `,
        // 变体样式
        combinedVariantClass,
        // 尺寸样式
        combinedSizeClass,
        // 全宽度
        fullWidth && 'w-full',
        // 自定义类名
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      data-component="Button"
      data-element="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
});

// 显示名称
Button.displayName = 'Button';

/**
 * 图标按钮组件
 */
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'size'> {
  size?: Exclude<ButtonSize, 'xl'>;
  'aria-label': string; // 无障碍属性必需
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  size = 'md',
  className,
  ...props
}, ref) => {
  const iconSizeStyles: Record<ButtonSize, string> = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
    xl: 'w-14 h-14 p-3',
  };

  return (
    <Button
      ref={ref}
      size={size}
      className={clsx(
        '!p-0 !rounded-full',
        iconSizeStyles[size],
        className
      )}
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';

/**
 * 浮动操作按钮
 */
interface FloatingActionButtonProps extends Omit<IconButtonProps, 'variant'> {
  variant?: ButtonVariant;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(({
  position = 'bottom-right',
  className,
  ...props
}, ref) => {
  const positionStyles = {
    'bottom-right': 'fixed bottom-6 right-6 z-50',
    'bottom-left': 'fixed bottom-6 left-6 z-50',
    'top-right': 'fixed top-6 right-6 z-50',
    'top-left': 'fixed top-6 left-6 z-50',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={clsx('floating-action-button', positionStyles[position])}
      data-component="FloatingActionButton"
      data-element="fab"
      data-position={position}
    >
      <IconButton
        ref={ref}
        size="lg"
        variant="primary"
        className={clsx(
          `
            !rounded-full !shadow-lg !shadow-primary-500/25
            hover:!shadow-xl hover:!shadow-primary-500/30
            bg-gradient-to-br from-primary-500 to-primary-600
            hover:from-primary-600 hover:to-primary-700
            border-0
          `,
          className
        )}
        {...props}
      />
    </motion.div>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export { Button, IconButton, FloatingActionButton };
export type { ButtonProps, IconButtonProps, FloatingActionButtonProps, ButtonVariant, ButtonSize };

export default Button;