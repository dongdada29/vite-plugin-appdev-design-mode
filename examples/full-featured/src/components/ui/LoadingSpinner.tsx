/**
 * @fileoverview 加载动画组件
 * @description 提供各种加载状态的可复用组件
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * 旋转加载器组件
 */
const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'neutral' | 'white';
  className?: string;
}> = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-secondary-600 border-t-transparent',
    neutral: 'border-neutral-400 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div 
      className={`
        inline-block border-2 rounded-full animate-spin
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        ${className}
      `}
      data-component="LoadingSpinner"
      data-element="spinner"
      data-size={size}
      data-color={color}
    />
  );
};

/**
 * 点状加载器组件
 */
const LoadingDots: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'neutral' | 'white';
  className?: string;
}> = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    neutral: 'bg-neutral-400',
    white: 'bg-white'
  };

  return (
    <div 
      className={`
        loading-dots flex space-x-1
        ${className}
      `}
      data-component="LoadingDots"
      data-element="dots"
      data-size={size}
      data-color={color}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`
            ${sizeClasses[size]} ${colorClasses[color]} rounded-full
          `}
          data-element="dot"
          data-dot-index={index}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: index * 0.16,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

/**
 * 脉冲加载器组件
 */
const LoadingPulse: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'neutral' | 'white';
  className?: string;
}> = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    neutral: 'bg-neutral-400',
    white: 'bg-white'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} ${colorClasses[color]} rounded-full
        animate-pulse
        ${className}
      `}
      data-component="LoadingPulse"
      data-element="pulse"
      data-size={size}
      data-color={color}
    />
  );
};

/**
 * 页面级加载组件
 */
const PageLoading: React.FC<{
  title?: string;
  description?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}> = ({ 
  title = 'Loading...', 
  description = 'Please wait while we prepare your content.',
  variant = 'spinner',
  className = '' 
}) => {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots size="lg" color="primary" />;
      case 'pulse':
        return <LoadingPulse size="xl" color="primary" />;
      default:
        return <LoadingSpinner size="lg" color="primary" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        page-loading flex flex-col items-center justify-center min-h-[400px]
        text-center p-8
        ${className}
      `}
      data-component="PageLoading"
      data-element="loading-container"
      data-variant={variant}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="loading-animation mb-6"
        data-element="animation"
      >
        {renderLoader()}
      </motion.div>
      
      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
        data-element="title"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-neutral-600 dark:text-neutral-400 max-w-sm"
        data-element="description"
      >
        {description}
      </motion.p>
    </motion.div>
  );
};

/**
 * 按钮内加载组件
 */
const ButtonLoading: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'neutral' | 'white';
  text?: string;
}> = ({ 
  size = 'sm', 
  color = 'white',
  text = 'Loading...'
}) => {
  return (
    <div 
      className="button-loading flex items-center space-x-2"
      data-component="ButtonLoading"
      data-element="button-loading"
    >
      <LoadingSpinner size={size} color={color} />
      <span className="sr-only">{text}</span>
    </div>
  );
};

/**
 * 骨架屏加载组件
 */
const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
}> = ({ 
  lines = 3,
  className = ''
}) => {
  return (
    <div 
      className={`skeleton-loader space-y-3 ${className}`}
      data-component="SkeletonLoader"
      data-element="skeleton"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={`
            skeleton-line h-4 bg-neutral-200 dark:bg-neutral-700 rounded
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
          data-element="skeleton-line"
          data-line-index={index}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

export {
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  PageLoading,
  ButtonLoading,
  SkeletonLoader
};

export default LoadingSpinner;