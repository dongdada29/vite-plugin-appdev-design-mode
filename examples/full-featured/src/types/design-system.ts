/**
 * @fileoverview 设计系统类型定义
 * @description 定义设计系统相关的TypeScript类型和接口
 */

// 设计令牌基础类型
export interface DesignToken {
  name: string;
  value: string | number | Record<string, any>; // 允许复杂对象
  category: 'color' | 'typography' | 'spacing' | 'shadow' | 'border-radius' | 'z-index' | 'animation';
  description?: string;
  deprecated?: boolean;
  tags?: string[];
}

// 色彩令牌
export interface ColorToken extends DesignToken {
  category: 'color';
  value: string;
  hue?: number;
  saturation?: number;
  lightness?: number;
  alpha?: number;
  palette?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  scale?: string; // e.g., '50', '100', '500', '900'
}

// 字体令牌
export interface TypographyToken extends DesignToken {
  category: 'typography';
  value: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number | string;
    lineHeight?: string | number;
    letterSpacing?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  };
  type?: 'heading' | 'body' | 'caption' | 'code' | 'display';
  scale?: string;
}

// 间距令牌
export interface SpacingToken extends DesignToken {
  category: 'spacing';
  value: string | number;
  scale?: string;
  unit?: 'px' | 'rem' | 'em' | 'vh' | 'vw' | '%';
}

// 阴影令牌
export interface ShadowToken extends DesignToken {
  category: 'shadow';
  value: {
    offsetX?: string | number;
    offsetY?: string | number;
    blurRadius?: string | number;
    spreadRadius?: string | number;
    color: string;
    inset?: boolean;
  };
  elevation?: number;
}

// 圆角令牌
export interface BorderRadiusToken extends DesignToken {
  category: 'border-radius';
  value: string | number;
  unit?: 'px' | 'rem' | 'em' | '%';
  shape?: 'none' | 'small' | 'medium' | 'large' | 'full';
}

// 动画令牌
export interface AnimationToken extends DesignToken {
  category: 'animation';
  value: {
    duration?: string;
    timingFunction?: string;
    delay?: string;
    iterationCount?: number | 'infinite';
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  };
  type?: 'transition' | 'animation' | 'transform';
}

// 设计系统配置
export interface DesignSystemConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  tokens: {
    colors: ColorToken[];
    typography: TypographyToken[];
    spacing: SpacingToken[];
    shadows: ShadowToken[];
    borderRadius: BorderRadiusToken[];
    animations: AnimationToken[];
  };
  meta: {
    created: string;
    updated: string;
    tags: string[];
    category: 'light' | 'dark' | 'auto';
  };
}

// 组件变体
export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  category: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  preview?: string;
  code?: string;
  usage?: string;
  accessibility?: string[];
  status: 'draft' | 'review' | 'approved' | 'deprecated';
}

// 组件库
export interface ComponentLibrary {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  components: ComponentVariant[];
  categories: string[];
  tags: string[];
  license: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// 设计系统状态
export interface DesignSystemState {
  config: DesignSystemConfig | null;
  libraries: ComponentLibrary[];
  selectedToken: DesignToken | null;
  selectedComponent: ComponentVariant | null;
  selectedLibrary: ComponentLibrary | null;
  searchQuery: string;
  filterBy: {
    category: string | null;
    status: string | null;
    tags: string[];
  };
  viewMode: 'grid' | 'list' | 'table';
  theme: 'light' | 'dark' | 'auto';
  isLoading: boolean;
  error: string | null;
}

// 操作类型
export type DesignSystemAction =
  | { type: 'SET_CONFIG'; payload: DesignSystemConfig }
  | { type: 'SET_LIBRARIES'; payload: ComponentLibrary[] }
  | { type: 'ADD_LIBRARY'; payload: ComponentLibrary }
  | { type: 'UPDATE_LIBRARY'; payload: ComponentLibrary }
  | { type: 'DELETE_LIBRARY'; payload: string }
  | { type: 'SET_SELECTED_TOKEN'; payload: DesignToken | null }
  | { type: 'SET_SELECTED_COMPONENT'; payload: ComponentVariant | null }
  | { type: 'SET_SELECTED_LIBRARY'; payload: ComponentLibrary | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<DesignSystemState['filterBy']> }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' | 'table' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// 导出配置
export interface ExportConfig {
  format: 'json' | 'css' | 'scss' | 'tailwind' | 'typescript' | 'figma';
  include: {
    tokens: boolean;
    components: boolean;
    utilities: boolean;
    comments: boolean;
  };
  output: {
    fileName?: string;
    directory?: string;
    structure: 'flat' | 'nested';
  };
  options: {
    prefix?: string;
    suffix?: string;
    transform?: (value: any, key: string) => any;
    filter?: (token: DesignToken) => boolean;
  };
}

// 导入配置
export interface ImportConfig {
  source: {
    type: 'file' | 'url' | 'api' | 'clipboard';
    path?: string;
    url?: string;
    api?: {
      endpoint: string;
      method: 'GET' | 'POST';
      headers?: Record<string, string>;
      body?: any;
    };
  };
  options: {
    merge: boolean;
    validate: boolean;
    backup: boolean;
    overwrite: boolean;
  };
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'critical';
  fix?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  severity: 'warning' | 'info';
  suggestion?: string;
}

export interface ValidationSuggestion {
  message: string;
  action: string;
  impact: 'low' | 'medium' | 'high';
}

// 设计系统分析
export interface DesignSystemAnalytics {
  overview: {
    totalTokens: number;
    totalComponents: number;
    totalLibraries: number;
    coverage: number;
  };
  usage: {
    mostUsedTokens: { token: string; count: number }[];
    mostUsedComponents: { component: string; count: number }[];
    componentDistribution: { category: string; count: number }[];
  };
  quality: {
    accessibilityScore: number;
    consistencyScore: number;
    documentationScore: number;
    testCoverage: number;
  };
  performance: {
    bundleSize: number;
    loadTime: number;
    renderTime: number;
  };
}

// 主题配置
export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'light' | 'dark' | 'auto';
  tokens: Partial<DesignSystemConfig['tokens']>;
  overrides: Record<string, any>;
  meta: {
    author: string;
    version: string;
    tags: string[];
    category: 'default' | 'accessibility' | 'branded' | 'custom';
  };
}

// 组件生成器配置
export interface ComponentGeneratorConfig {
  name: string;
  template: string;
  props: {
    name: string;
    type: string;
    required: boolean;
    default?: any;
    description?: string;
  }[];
  styles: {
    [key: string]: any;
  };
  variants: {
    [key: string]: ComponentVariant;
  };
  accessibility: {
    ariaRoles: string[];
    ariaProperties: Record<string, string>;
    keyboardNavigation: string[];
    screenReaderSupport: string[];
  };
}

// 设计系统工具函数参数
export interface ToolFunction {
  id: string;
  name: string;
  description: string;
  category: 'validation' | 'conversion' | 'generation' | 'analysis' | 'export';
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: any;
  }[];
  returns: {
    type: string;
    description: string;
  };
  execute: (params: Record<string, any>) => Promise<any>;
}

// 设计系统事件
export interface DesignSystemEvent {
  type: 'token_created' | 'token_updated' | 'token_deleted' | 'component_created' | 'component_updated' | 'component_deleted' | 'theme_switched' | 'library_imported' | 'library_exported';
  payload: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// 设计系统通知
export interface DesignSystemNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actions?: {
    label: string;
    action: string;
    primary?: boolean;
  }[];
  timestamp: string;
  read: boolean;
  persistent?: boolean;
}

// 具体接口已经在上面定义了，这里不需要重复导出