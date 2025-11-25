/**
 * @fileoverview 颜色面板组件
 * @description 展示和管理设计系统中的颜色令牌
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Plus, MoreVertical } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button, IconButton } from '../ui/Button';
import { ColorToken } from '../../types/design-system';
import { useColors, useDesignSystemStore } from '../../store/design-system-store';
import { clsx } from 'clsx';

// 颜色面板属性接口
interface ColorPaletteProps {
  title?: string;
  variant?: 'grid' | 'list' | 'swatch';
  showControls?: boolean;
  interactive?: boolean;
  className?: string;
}

// 颜色色板属性接口
interface ColorSwatchProps {
  token: ColorToken;
  variant?: 'default' | 'compact' | 'large';
  showLabel?: boolean;
  showValue?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 颜色色板组件
 */
const ColorSwatch: React.FC<ColorSwatchProps> = ({
  token,
  variant = 'default',
  showLabel = true,
  showValue = true,
  interactive = true,
  onClick,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const { setSelectedToken } = useDesignSystemStore();

  // 复制颜色值
  const copyColor = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(token.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  // 处理点击
  const handleClick = () => {
    if (interactive) {
      setSelectedToken(token);
      onClick?.();
    }
  };

  // 尺寸配置
  const sizeConfig = {
    default: { width: 'w-full', height: 'h-20', padding: 'p-4' },
    compact: { width: 'w-full', height: 'h-12', padding: 'p-2' },
    large: { width: 'w-full', height: 'h-32', padding: 'p-6' },
  };

  const config = sizeConfig[variant];

  // 显示文本颜色（基于背景亮度）
  const getContrastColor = (hexColor: string) => {
    // 简单的亮度计算
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={interactive ? { scale: 1.02 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      className={clsx(
        'color-swatch cursor-pointer group relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 transition-all duration-200',
        config.width,
        config.height,
        {
          'hover:shadow-lg': interactive,
          'hover:border-primary-300': interactive,
        },
        className
      )}
      data-component="ColorSwatch"
      data-element="swatch"
      data-token-name={token.name}
      data-palette={token.palette}
      data-scale={token.scale}
      style={{ backgroundColor: token.value }}
      onClick={handleClick}
    >
      {/* 颜色背景 */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: token.value }}
        data-element="background"
      />
      
      {/* 覆盖层 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"
        data-element="overlay"
      />
      
      {/* 色板内容 */}
      <div 
        className={clsx(
          'relative z-10 flex flex-col justify-between h-full',
          config.padding
        )}
        data-element="content"
      >
        {/* 顶部标签 */}
        {showLabel && (
          <div className="flex items-center justify-between" data-element="header">
            <div className="flex items-center space-x-2" data-element="labels">
              <span 
                className="px-2 py-1 text-xs font-semibold rounded backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: getContrastColor(token.value)
                }}
                data-element="name"
              >
                {token.name}
              </span>
              {token.deprecated && (
                <span className="px-1.5 py-0.5 text-xs bg-warning-500 text-white rounded backdrop-blur-sm">
                  Deprecated
                </span>
              )}
            </div>
            
            {interactive && (
              <IconButton
                size="sm"
                variant="ghost"
                onClick={copyColor}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                data-component="IconButton"
                data-element="copy-button"
                data-action="copy-color"
              >
                {copied ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-success-400"
                  >
                    ✓
                  </motion.div>
                ) : (
                  <span 
                    className="text-sm font-mono"
                    style={{ color: getContrastColor(token.value) }}
                  >
                    #
                  </span>
                )}
              </IconButton>
            )}
          </div>
        )}
        
        {/* 底部信息 */}
        {showValue && (
          <div className="space-y-1" data-element="footer">
            <div 
              className="text-xs font-mono backdrop-blur-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: getContrastColor(token.value)
              }}
              data-element="value"
            >
              {token.value}
            </div>
            
            {token.scale && token.palette && (
              <div 
                className="text-xs backdrop-blur-sm px-2 py-1 rounded"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  color: getContrastColor(token.value)
                }}
                data-element="metadata"
              >
                {token.palette} • {token.scale}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 选择指示器 */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-sm"
          data-element="selected-indicator"
        />
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * 颜色面板主组件
 */
const ColorPalette: React.FC<ColorPaletteProps> = ({
  title = 'Color Palette',
  variant = 'grid',
  showControls = true,
  interactive = true,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const colors = useColors();
  const { setSelectedToken, selectedToken } = useDesignSystemStore();

  // 过滤和搜索颜色
  const filteredColors = useMemo(() => {
    return colors.filter(color => {
      const matchesSearch = searchQuery === '' || 
        color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPalette = selectedPalette === null || 
        color.palette === selectedPalette;
      
      return matchesSearch && matchesPalette;
    });
  }, [colors, searchQuery, selectedPalette]);

  // 按调色板分组
  const colorsByPalette = useMemo(() => {
    const grouped: Record<string, ColorToken[]> = {};
    filteredColors.forEach(color => {
      const palette = color.palette || 'other';
      if (!grouped[palette]) {
        grouped[palette] = [];
      }
      grouped[palette].push(color);
    });
    return grouped;
  }, [filteredColors]);

  // 获取所有调色板
  const palettes = useMemo(() => {
    const paletteSet = new Set(colors.map(color => color.palette || 'other'));
    return Array.from(paletteSet);
  }, [colors]);

  return (
    <div 
      className={clsx('color-palette', className)}
      data-component="ColorPalette"
      data-element="palette"
      data-variant={variant}
      data-view-mode={viewMode}
    >
      {/* 控制面板 */}
      {showControls && (
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* 标题 */}
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h3>
              
              {/* 控制按钮 */}
              <div className="flex items-center space-x-3">
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    data-component="Input"
                    data-element="search-input"
                    data-placeholder="search-colors"
                  />
                </div>
                
                {/* 过滤器按钮 */}
                <IconButton
                  variant={showFilters ? 'primary' : 'ghost'}
                  onClick={() => setShowFilters(!showFilters)}
                  data-component="IconButton"
                  data-element="filter-button"
                  data-action="toggle-filters"
                >
                  <Filter className="w-4 h-4" />
                </IconButton>
                
                {/* 视图模式切换 */}
                <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={clsx(
                      'px-3 py-2 text-sm transition-colors',
                      viewMode === 'grid' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    )}
                    data-component="ToggleButton"
                    data-element="grid-view-button"
                    data-action="set-view-grid"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={clsx(
                      'px-3 py-2 text-sm transition-colors',
                      viewMode === 'list' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    )}
                    data-component="ToggleButton"
                    data-element="list-view-button"
                    data-action="set-view-list"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* 过滤器面板 */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800"
                  data-element="filters"
                >
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedPalette(null)}
                      className={clsx(
                        'px-3 py-1.5 text-sm rounded-full border transition-colors',
                        selectedPalette === null
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      )}
                      data-component="FilterChip"
                      data-element="all-palettes-chip"
                      data-action="select-all-palettes"
                    >
                      All Palettes
                    </button>
                    
                    {palettes.map(palette => (
                      <button
                        key={palette}
                        onClick={() => setSelectedPalette(palette)}
                        className={clsx(
                          'px-3 py-1.5 text-sm rounded-full border transition-colors capitalize',
                          selectedPalette === palette
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        )}
                        data-component="FilterChip"
                        data-element={`${palette}-palette-chip`}
                        data-action={`select-${palette}-palette`}
                      >
                        {palette}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      )}

      {/* 颜色网格/列表 */}
      <div className="space-y-8">
        {Object.entries(colorsByPalette).map(([palette, paletteColors]) => (
          <div key={palette} className="palette-group" data-element="palette-group" data-palette={palette}>
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4 capitalize">
              {palette} Palette ({paletteColors.length})
            </h4>
            
            <div className={clsx(
              'grid gap-4',
              {
                'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8': viewMode === 'grid',
                'space-y-2': viewMode === 'list',
              }
            )}>
              <AnimatePresence>
                {paletteColors.map((color, index) => (
                  <motion.div
                    key={color.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ColorSwatch
                      token={color}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                      showLabel={viewMode === 'grid'}
                      showValue={viewMode === 'grid'}
                      interactive={interactive}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
      
      {/* 空状态 */}
      {filteredColors.length === 0 && (
        <div className="text-center py-12" data-element="empty-state">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No colors found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedPalette(null);
            }}
            data-component="Button"
            data-element="clear-filters-button"
            data-action="clear-all-filters"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export { ColorPalette, ColorSwatch };
export type { ColorPaletteProps, ColorSwatchProps };

export default ColorPalette;