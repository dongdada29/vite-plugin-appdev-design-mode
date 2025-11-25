/**
 * @fileoverview 设计系统管理页面
 * @description 展示和管理设计系统的所有令牌，包括颜色、字体、间距等
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Ruler, 
  Shadow, 
  Circle, 
  Zap,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Upload,
  Settings,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button, IconButton } from '../components/ui/Button';
import { TokenCard } from '../components/design-system/TokenCard';
import { ColorPalette } from '../components/design-system/ColorPalette';
import { 
  useColors, 
  useTypography, 
  useSpacing, 
  useShadows,
  useBorderRadius,
  useAnimations,
  useSelectedToken,
  useDesignSystemStore 
} from '../store/design-system-store';
import { clsx } from 'clsx';

// 令牌类型定义
type TokenType = 'all' | 'color' | 'typography' | 'spacing' | 'shadow' | 'border-radius' | 'animation';

// 令牌类别配置
const TOKEN_CATEGORIES = {
  all: { label: 'All Tokens', icon: Settings, color: 'neutral' },
  color: { label: 'Colors', icon: Palette, color: 'primary' },
  typography: { label: 'Typography', icon: Type, color: 'secondary' },
  spacing: { label: 'Spacing', icon: Ruler, color: 'success' },
  shadow: { label: 'Shadows', icon: Shadow, color: 'warning' },
  'border-radius': { label: 'Border Radius', icon: Circle, color: 'error' },
  animation: { label: 'Animation', icon: Zap, color: 'info' },
} as const;

/**
 * 设计系统主页面组件
 */
const DesignSystem: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<TokenType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeprecated, setShowDeprecated] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);

  // 获取所有令牌数据
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const shadows = useShadows();
  const borderRadius = useBorderRadius();
  const animations = useAnimations();

  // 合并所有令牌
  const allTokens = useMemo(() => {
    return [
      ...colors,
      ...typography,
      ...spacing,
      ...shadows,
      ...borderRadius,
      ...animations,
    ];
  }, [colors, typography, spacing, shadows, borderRadius, animations]);

  // 过滤令牌
  const filteredTokens = useMemo(() => {
    return allTokens.filter(token => {
      // 类别过滤
      const matchesCategory = activeCategory === 'all' || token.category === activeCategory;
      
      // 搜索过滤
      const matchesSearch = searchQuery === '' || 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.value.toString().toLowerCase().includes(searchQuery.toLowerCase());
      
      // 废弃状态过滤
      const matchesDeprecated = showDeprecated || !token.deprecated;
      
      return matchesCategory && matchesSearch && matchesDeprecated;
    });
  }, [allTokens, activeCategory, searchQuery, showDeprecated]);

  // 渲染特定类别的内容
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'color':
        return (
          <ColorPalette 
            variant="grid"
            showControls={false}
            interactive={true}
          />
        );
        
      case 'typography':
        return (
          <div className="token-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typography.map((token, index) => (
              <motion.div
                key={token.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TokenCard token={token} interactive={true} />
              </motion.div>
            ))}
          </div>
        );
        
      case 'spacing':
        return (
          <div className="token-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {spacing.map((token, index) => (
              <motion.div
                key={token.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TokenCard token={token} variant="compact" interactive={true} />
              </motion.div>
            ))}
          </div>
        );
        
      case 'shadow':
        return (
          <div className="token-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shadows.map((token, index) => (
              <motion.div
                key={token.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TokenCard token={token} interactive={true} />
              </motion.div>
            ))}
          </div>
        );
        
      case 'border-radius':
        return (
          <div className="token-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {borderRadius.map((token, index) => (
              <motion.div
                key={token.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TokenCard token={token} variant="compact" interactive={true} />
              </motion.div>
            ))}
          </div>
        );
        
      case 'animation':
        return (
          <div className="token-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animations.map((token, index) => (
              <motion.div
                key={token.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TokenCard token={token} interactive={true} />
              </motion.div>
            ))}
          </div>
        );
        
      default:
        return (
          <div className="token-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTokens.map((token, index) => (
                <motion.div
                  key={token.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <TokenCard token={token} interactive={true} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        );
    }
  };

  // 获取类别统计
  const getCategoryStats = (type: TokenType) => {
    switch (type) {
      case 'color': return colors.length;
      case 'typography': return typography.length;
      case 'spacing': return spacing.length;
      case 'shadow': return shadows.length;
      case 'border-radius': return borderRadius.length;
      case 'animation': return animations.length;
      default: return allTokens.length;
    }
  };

  return (
    <div className="design-system-page" data-component="DesignSystemPage">
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header mb-8" data-element="header"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="space-y-2" data-element="title-section">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Design System
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your design tokens, typography, colors, and component guidelines
            </p>
          </div>
          
          <div className="flex items-center space-x-3" data-element="actions">
            <Button
              variant="outline"
              icon={<Upload className="w-4 h-4" />}
              data-component="Button"
              data-element="import-button"
              data-action="import-tokens"
            >
              Import
            </Button>
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              data-component="Button"
              data-element="export-button"
              data-action="export-tokens"
            >
              Export
            </Button>
            <Button
              icon={<Plus className="w-4 h-4" />}
              data-component="Button"
              data-element="add-token-button"
              data-action="add-token"
            >
              Add Token
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 控制面板 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="control-panel mb-8" data-element="controls"
      >
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* 搜索框 */}
              <div className="flex-1 max-w-md" data-element="search">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    data-component="Input"
                    data-element="search-input"
                    data-placeholder="search-tokens"
                  />
                </div>
              </div>
              
              {/* 视图模式切换 */}
              <div className="flex items-center space-x-2" data-element="view-mode">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">View:</span>
                <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={clsx(
                      'px-3 py-1.5 text-sm transition-colors',
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
                      'px-3 py-1.5 text-sm transition-colors',
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
              
              {/* 废弃令牌切换 */}
              <div className="flex items-center space-x-2" data-element="deprecated-filter">
                <IconButton
                  variant={showDeprecated ? 'primary' : 'ghost'}
                  onClick={() => setShowDeprecated(!showDeprecated)}
                  size="sm"
                  data-component="IconButton"
                  data-element="deprecated-toggle"
                  data-action="toggle-deprecated"
                >
                  {showDeprecated ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </IconButton>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Show deprecated
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* 类别选择器 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="category-tabs mb-8" data-element="categories"
      >
        <div className="flex flex-wrap gap-2" data-element="tab-list">
          {Object.entries(TOKEN_CATEGORIES).map(([key, config]) => {
            const Icon = config.icon;
            const count = getCategoryStats(key as TokenType);
            const isActive = activeCategory === key;
            
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key as TokenType)}
                className={clsx(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200',
                  isActive
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                )}
                data-component="CategoryTab"
                data-element="category-tab"
                data-category={key}
                data-active={isActive ? 'true' : 'false'}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{config.label}</span>
                <span className={clsx(
                  'px-2 py-0.5 text-xs rounded-full',
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 主要内容区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="main-content" data-element="content"
      >
        {/* 空状态 */}
        {filteredTokens.length === 0 && activeCategory !== 'color' ? (
          <Card>
            <CardBody className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No tokens found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Try adjusting your search criteria or browse different categories.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                data-component="Button"
                data-element="clear-filters-button"
                data-action="clear-filters"
              >
                Clear Filters
              </Button>
            </CardBody>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="category-content" data-element="category-content"
            >
              {renderCategoryContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* 统计信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="stats-footer mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800" data-element="stats"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center" data-element="stats-grid">
          {Object.entries(TOKEN_CATEGORIES).slice(1).map(([key, config]) => {
            const Icon = config.icon;
            const count = getCategoryStats(key as TokenType);
            
            return (
              <div 
                key={key}
                className="stat-item p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                data-component="StatItem"
                data-element="stat-item"
                data-category={key}
              >
                <Icon className={clsx(
                  'w-6 h-6 mx-auto mb-2',
                  `text-${config.color}-500`
                )} />
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {count}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DesignSystem;