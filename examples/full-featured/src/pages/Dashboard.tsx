/**
 * @fileoverview 仪表盘页面组件
 * @description 设计系统的概览仪表盘，展示系统状态、统计信息和快速入口
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardGroup } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDesignTokens, useColors, useTypography, useSpacing, useEvents } from '../store/design-system-store';

// 统计卡片组件
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

// 统计卡片组件
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="stats-card"
      data-component="StatsCard"
      data-element="card"
      data-color={color}
    >
      <Card interactive className="h-full">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`
              w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} 
              flex items-center justify-center text-white shadow-lg
            `} data-element="icon">
              {icon}
            </div>
            
            {trend && (
              <div className="flex items-center text-sm" data-element="trend">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-success-600 dark:text-success-400">
                  +{trend.value}%
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2" data-element="content">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100" data-element="value">
              {value}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm" data-element="label">
              {title}
            </p>
            {trend && (
              <p className="text-xs text-neutral-500" data-element="trend-label">
                {trend.label}
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// 活动项组件
interface ActivityItemProps {
  type: 'token' | 'component' | 'library' | 'theme';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

// 活动项组件
const ActivityItem: React.FC<ActivityItemProps> = ({ type, title, description, timestamp, status }) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'token':
        return <Palette className="w-4 h-4" />;
      case 'component':
        return <Layout className="w-4 h-4" />;
      case 'library':
        return <Type className="w-4 h-4" />;
      case 'theme':
        return <Zap className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-success-500';
      case 'pending':
        return 'text-warning-500';
      case 'error':
        return 'text-error-500';
      default:
        return 'text-neutral-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="activity-item flex items-start space-x-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors" data-component="ActivityItem" data-element="item" data-type={type} data-status={status}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${status === 'success' ? 'bg-success-100 dark:bg-success-900/20' : 
          status === 'pending' ? 'bg-warning-100 dark:bg-warning-900/20' : 
          'bg-error-100 dark:bg-error-900/20'
        }
      `} data-element="icon-container">
        {getTypeIcon()}
      </div>
      
      <div className="flex-1 min-w-0" data-element="content">
        <div className="flex items-center justify-between mb-1" data-element="header">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate" data-element="title">
            {title}
          </p>
          <div className={`flex items-center ${getStatusColor()}`} data-element="status">
            {getStatusIcon()}
          </div>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2" data-element="description">
          {description}
        </p>
        <p className="text-xs text-neutral-500" data-element="timestamp">
          {timestamp}
        </p>
      </div>
    </div>
  );
};

/**
 * 仪表盘主组件
 */
const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取设计系统数据
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const events = useEvents();

  // 模拟数据加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // 统计数据
  const stats = {
    totalTokens: colors.length + typography.length + spacing.length,
    totalColors: colors.length,
    totalTypography: typography.length,
    totalSpacing: spacing.length,
    totalComponents: 24, // 模拟数据
    totalLibraries: 3, // 模拟数据
    designScore: 94, // 模拟数据
  };

  // 最近活动（基于真实事件）
  const recentActivities = events.slice(0, 5).map((event, index) => ({
    type: event.type.includes('token') ? 'token' : event.type.includes('component') ? 'component' : 'theme',
    title: `System ${event.type}`,
    description: `System ${event.type} was updated`,
    timestamp: new Date(event.timestamp).toLocaleTimeString(),
    status: 'success' as const
  }));

  // 如果加载中，显示加载状态
  if (isLoading) {
    return (
      <div className="dashboard-loading" data-component="DashboardLoading" data-element="loading">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard space-y-8" data-component="Dashboard" data-element="dashboard">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="welcome-section" data-element="welcome-section"
      >
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white" data-element="hero">
          <div className="max-w-3xl" data-element="content">
            <h1 className="text-3xl font-bold mb-4" data-element="title">
              Welcome to Design System Studio
            </h1>
            <p className="text-primary-100 mb-6 text-lg" data-element="subtitle">
              Manage your design tokens, components, and build consistent user interfaces.
            </p>
            <div className="flex flex-wrap gap-3" data-element="actions">
              <Button
                variant="secondary"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                data-component="Button"
                data-element="get-started-button"
                data-action="navigate-editor"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                className="text-white border-white/30 hover:bg-white/10"
                data-component="Button"
                data-element="learn-more-button"
                data-action="navigate-docs"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 统计卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stats-section" data-element="stats-section"
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6" data-element="section-title">
          System Overview
        </h2>
        <CardGroup columns={4} gap="lg" data-element="stats-grid">
          <StatsCard
            title="Total Tokens"
            value={stats.totalTokens}
            icon={<Palette className="w-6 h-6" />}
            trend={{ value: 12, label: 'from last month' }}
            color="primary"
          />
          <StatsCard
            title="Design Score"
            value={`${stats.designScore}%`}
            icon={<CheckCircle className="w-6 h-6" />}
            trend={{ value: 5, label: 'improvement' }}
            color="success"
          />
          <StatsCard
            title="Components"
            value={stats.totalComponents}
            icon={<Layout className="w-6 h-6" />}
            trend={{ value: 8, label: 'new this month' }}
            color="secondary"
          />
          <StatsCard
            title="Libraries"
            value={stats.totalLibraries}
            icon={<Type className="w-6 h-6" />}
            color="warning"
          />
        </CardGroup>
      </motion.div>

      {/* 内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-element="content-grid">
        {/* 左侧列 */}
        <div className="lg:col-span-2 space-y-8" data-element="left-column">
          {/* 快速访问 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="quick-access" data-element="quick-access"
          >
            <Card>
              <CardHeader title="Quick Access" />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="access-grid">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    data-component="Button"
                    data-element="design-system-button"
                    data-action="navigate-design-system"
                  >
                    <div className="flex items-center space-x-3" data-element="content">
                      <Palette className="w-5 h-5 text-primary-500" />
                      <div className="text-left">
                        <div className="font-medium">Design System</div>
                        <div className="text-sm text-neutral-500">Manage tokens & themes</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    data-component="Button"
                    data-element="component-editor-button"
                    data-action="navigate-editor"
                  >
                    <div className="flex items-center space-x-3" data-element="content">
                      <Layout className="w-5 h-5 text-secondary-500" />
                      <div className="text-left">
                        <div className="font-medium">Component Editor</div>
                        <div className="text-sm text-neutral-500">Build & customize</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    data-component="Button"
                    data-element="live-preview-button"
                    data-action="navigate-preview"
                  >
                    <div className="flex items-center space-x-3" data-element="content">
                      <Zap className="w-5 h-5 text-success-500" />
                      <div className="text-left">
                        <div className="font-medium">Live Preview</div>
                        <div className="text-sm text-neutral-500">Real-time testing</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    data-component="Button"
                    data-element="libraries-button"
                    data-action="navigate-libraries"
                  >
                    <div className="flex items-center space-x-3" data-element="content">
                      <Users className="w-5 h-5 text-warning-500" />
                      <div className="text-left">
                        <div className="font-medium">Libraries</div>
                        <div className="text-sm text-neutral-500">Component collections</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* 令牌统计 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="token-stats" data-element="token-stats"
          >
            <Card>
              <CardHeader title="Token Distribution" />
              <CardBody>
                <div className="space-y-4" data-element="token-grid">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span className="text-sm font-medium">Colors</span>
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{stats.totalColors} tokens</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                      <span className="text-sm font-medium">Typography</span>
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{stats.totalTypography} tokens</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                      <span className="text-sm font-medium">Spacing</span>
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{stats.totalSpacing} tokens</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* 右侧列 */}
        <div className="space-y-8" data-element="right-column">
          {/* 最近活动 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="recent-activity" data-element="recent-activity"
          >
            <Card>
              <CardHeader title="Recent Activity" />
              <CardBody>
                <div className="space-y-3" data-element="activity-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <ActivityItem key={index} {...activity} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
                
                {events.length > 5 && (
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      data-component="Button"
                      data-element="view-all-activity-button"
                      data-action="navigate-activity"
                    >
                      View All Activity
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* 系统状态 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="system-status" data-element="system-status"
          >
            <Card>
              <CardHeader title="System Status" />
              <CardBody>
                <div className="space-y-4" data-element="status-items">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success-500" />
                      <span className="text-sm font-medium">Design Mode</span>
                    </div>
                    <span className="text-sm text-success-600 dark:text-success-400">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success-500" />
                      <span className="text-sm font-medium">Token Sync</span>
                    </div>
                    <span className="text-sm text-success-600 dark:text-success-400">Synced</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success-500" />
                      <span className="text-sm font-medium">Component Library</span>
                    </div>
                    <span className="text-sm text-success-600 dark:text-success-400">Updated</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;