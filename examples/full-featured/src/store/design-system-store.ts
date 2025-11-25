/**
 * @fileoverview 设计系统状态管理
 * @description 使用 Zustand 管理设计系统的全局状态
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import {
  DesignSystemState,
  DesignSystemAction,
  DesignToken,
  ComponentVariant,
  ComponentLibrary,
  DesignSystemConfig,
  DesignSystemEvent
} from '../types/design-system';

/**
 * 设计系统默认配置
 */
const defaultDesignSystemConfig: DesignSystemConfig = {
  name: 'Full Featured Design System',
  version: '1.0.0',
  description: 'A comprehensive design system with tokens, components, and utilities',
  author: 'XAGI Team',
  license: 'MIT',
  tokens: {
    colors: [
      {
        name: 'primary.50',
        value: '#eff6ff',
        category: 'color',
        description: 'Lightest primary color',
        palette: 'primary',
        scale: '50',
        tags: ['primary', 'light', 'background']
      },
      {
        name: 'primary.500',
        value: '#3b82f6',
        category: 'color',
        description: 'Main primary color',
        palette: 'primary',
        scale: '500',
        tags: ['primary', 'main', 'interactive']
      },
      {
        name: 'primary.900',
        value: '#1e3a8a',
        category: 'color',
        description: 'Darkest primary color',
        palette: 'primary',
        scale: '900',
        tags: ['primary', 'dark', 'text']
      },
      {
        name: 'neutral.50',
        value: '#fafafa',
        category: 'color',
        description: 'Lightest neutral color',
        palette: 'neutral',
        scale: '50',
        tags: ['neutral', 'light', 'background']
      },
      {
        name: 'neutral.500',
        value: '#737373',
        category: 'color',
        description: 'Main neutral color',
        palette: 'neutral',
        scale: '500',
        tags: ['neutral', 'main', 'text']
      },
      {
        name: 'neutral.900',
        value: '#171717',
        category: 'color',
        description: 'Darkest neutral color',
        palette: 'neutral',
        scale: '900',
        tags: ['neutral', 'dark', 'text']
      }
    ],
    typography: [
      {
        name: 'font-family.sans',
        value: {
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        },
        category: 'typography',
        description: 'Default sans-serif font family',
        type: 'body',
        tags: ['typography', 'font', 'sans-serif']
      },
      {
        name: 'font-family.mono',
        value: {
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        },
        category: 'typography',
        description: 'Default monospace font family',
        type: 'code',
        tags: ['typography', 'font', 'monospace']
      },
      {
        name: 'font-size.base',
        value: {
          fontSize: '1rem',
          lineHeight: '1.5',
        },
        category: 'typography',
        description: 'Base font size',
        type: 'body',
        scale: 'base',
        tags: ['typography', 'font-size', 'base']
      },
      {
        name: 'font-size.lg',
        value: {
          fontSize: '1.125rem',
          lineHeight: '1.75',
        },
        category: 'typography',
        description: 'Large font size',
        type: 'body',
        scale: 'lg',
        tags: ['typography', 'font-size', 'large']
      }
    ],
    spacing: [
      {
        name: 'spacing.0',
        value: '0',
        category: 'spacing',
        description: 'No spacing',
        scale: '0',
        tags: ['spacing', 'zero']
      },
      {
        name: 'spacing.1',
        value: '0.25rem',
        category: 'spacing',
        description: 'Extra small spacing',
        scale: '1',
        tags: ['spacing', 'extra-small']
      },
      {
        name: 'spacing.4',
        value: '1rem',
        category: 'spacing',
        description: 'Medium spacing',
        scale: '4',
        tags: ['spacing', 'medium']
      },
      {
        name: 'spacing.8',
        value: '2rem',
        category: 'spacing',
        description: 'Large spacing',
        scale: '8',
        tags: ['spacing', 'large']
      }
    ],
    shadows: [
      {
        name: 'shadow.sm',
        value: {
          offsetX: '0',
          offsetY: '1px',
          blurRadius: '2px',
          spreadRadius: '0',
          color: 'rgb(0 0 0 / 0.05)',
        },
        category: 'shadow',
        description: 'Small shadow',
        elevation: 1,
        tags: ['shadow', 'small', 'subtle']
      },
      {
        name: 'shadow.md',
        value: {
          offsetX: '0',
          offsetY: '4px',
          blurRadius: '6px',
          spreadRadius: '-1px',
          color: 'rgb(0 0 0 / 0.1)',
        },
        category: 'shadow',
        description: 'Medium shadow',
        elevation: 2,
        tags: ['shadow', 'medium', 'elevated']
      },
      {
        name: 'shadow.lg',
        value: {
          offsetX: '0',
          offsetY: '10px',
          blurRadius: '15px',
          spreadRadius: '-3px',
          color: 'rgb(0 0 0 / 0.1)',
        },
        category: 'shadow',
        description: 'Large shadow',
        elevation: 3,
        tags: ['shadow', 'large', 'prominent']
      }
    ],
    borderRadius: [
      {
        name: 'radius.sm',
        value: '0.125rem',
        category: 'border-radius',
        description: 'Small border radius',
        shape: 'small',
        tags: ['border-radius', 'small', 'subtle']
      },
      {
        name: 'radius.md',
        value: '0.375rem',
        category: 'border-radius',
        description: 'Medium border radius',
        shape: 'medium',
        tags: ['border-radius', 'medium', 'standard']
      },
      {
        name: 'radius.lg',
        value: '0.5rem',
        category: 'border-radius',
        description: 'Large border radius',
        shape: 'large',
        tags: ['border-radius', 'large', 'prominent']
      },
      {
        name: 'radius.full',
        value: '9999px',
        category: 'border-radius',
        description: 'Full border radius',
        shape: 'full',
        tags: ['border-radius', 'full', 'circular']
      }
    ],
    animations: [
      {
        name: 'duration.fast',
        value: {
          duration: '150ms',
          timingFunction: 'ease-in-out',
        },
        category: 'animation',
        description: 'Fast animation duration',
        type: 'transition',
        tags: ['animation', 'duration', 'fast']
      },
      {
        name: 'duration.medium',
        value: {
          duration: '300ms',
          timingFunction: 'ease-in-out',
        },
        category: 'animation',
        description: 'Medium animation duration',
        type: 'transition',
        tags: ['animation', 'duration', 'medium']
      },
      {
        name: 'duration.slow',
        value: {
          duration: '500ms',
          timingFunction: 'ease-in-out',
        },
        category: 'animation',
        description: 'Slow animation duration',
        type: 'transition',
        tags: ['animation', 'duration', 'slow']
      }
    ]
  },
  meta: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['design-system', 'tokens', 'components'],
    category: 'light'
  }
};

/**
 * 设计系统状态管理 Store
 */
const useDesignSystemStore = create<DesignSystemState & {
  dispatch: React.Dispatch<DesignSystemAction>;
  events: DesignSystemEvent[];
  addEvent: (event: Omit<DesignSystemEvent, 'timestamp'>) => void;
  clearEvents: () => void;
}>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // 初始状态
      config: defaultDesignSystemConfig,
      libraries: [],
      selectedToken: null,
      selectedComponent: null,
      selectedLibrary: null,
      searchQuery: '',
      filterBy: {
        category: null,
        status: null,
        tags: []
      },
      viewMode: 'grid',
      theme: 'light',
      isLoading: false,
      error: null,
      
      // 事件历史
      events: [],
      
      // 分发器函数
      dispatch: (action: DesignSystemAction) => {
        set((state) => {
          const newState = reducer(state, action);
          
          // 添加事件
          if (action.type !== 'RESET_STATE') {
            get().addEvent({
              type: getActionType(action),
              payload: action.payload,
            });
          }
          
          return newState;
        });
      },
      
      // 事件管理
      addEvent: (event: Omit<DesignSystemEvent, 'timestamp'>) => {
        set((state) => ({
          events: [
            {
              ...event,
              timestamp: new Date().toISOString()
            },
            ...state.events.slice(0, 99) // 保留最近100个事件
          ]
        }));
      },
      
      clearEvents: () => {
        set({ events: [] });
      },
      
      // 便捷操作方法
      setConfig: (config: DesignSystemConfig) => {
        get().dispatch({ type: 'SET_CONFIG', payload: config });
      },
      
      setSelectedToken: (token: DesignToken | null) => {
        get().dispatch({ type: 'SET_SELECTED_TOKEN', payload: token });
      },
      
      setSelectedComponent: (component: ComponentVariant | null) => {
        get().dispatch({ type: 'SET_SELECTED_COMPONENT', payload: component });
      },
      
      setSearchQuery: (query: string) => {
        get().dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
      },
      
      setFilter: (filter: Partial<DesignSystemState['filterBy']>) => {
        get().dispatch({ type: 'SET_FILTER', payload: filter });
      },
      
      resetState: () => {
        get().dispatch({ type: 'RESET_STATE' });
      },
    })),
    {
      name: 'design-system-store',
    }
  )
);

/**
 * Reducer 函数处理状态更新
 */
function reducer(state: DesignSystemState, action: DesignSystemAction): DesignSystemState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
        error: null,
      };
      
    case 'SET_LIBRARIES':
      return {
        ...state,
        libraries: action.payload,
        error: null,
      };
      
    case 'ADD_LIBRARY':
      return {
        ...state,
        libraries: [...state.libraries, action.payload],
        error: null,
      };
      
    case 'UPDATE_LIBRARY':
      return {
        ...state,
        libraries: state.libraries.map(lib => 
          lib.id === action.payload.id ? action.payload : lib
        ),
        error: null,
      };
      
    case 'DELETE_LIBRARY':
      return {
        ...state,
        libraries: state.libraries.filter(lib => lib.id !== action.payload),
        error: null,
      };
      
    case 'SET_SELECTED_TOKEN':
      return {
        ...state,
        selectedToken: action.payload,
      };
      
    case 'SET_SELECTED_COMPONENT':
      return {
        ...state,
        selectedComponent: action.payload,
      };
      
    case 'SET_SELECTED_LIBRARY':
      return {
        ...state,
        selectedLibrary: action.payload,
      };
      
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
      
    case 'SET_FILTER':
      return {
        ...state,
        filterBy: {
          ...state.filterBy,
          ...action.payload,
        },
      };
      
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };
      
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
      
    case 'RESET_STATE':
      return {
        ...state,
        selectedToken: null,
        selectedComponent: null,
        selectedLibrary: null,
        searchQuery: '',
        filterBy: {
          category: null,
          status: null,
          tags: [],
        },
        error: null,
        isLoading: false,
      };
      
    default:
      return state;
  }
}

/**
 * 获取操作类型
 */
function getActionType(action: DesignSystemAction): DesignSystemEvent['type'] {
  switch (action.type) {
    case 'SET_CONFIG':
      return 'library_imported';
    case 'ADD_LIBRARY':
      return 'library_imported';
    case 'UPDATE_LIBRARY':
      return 'component_updated';
    case 'DELETE_LIBRARY':
      return 'component_deleted';
    case 'SET_SELECTED_TOKEN':
      return action.payload ? 'token_created' : 'component_deleted';
    case 'SET_SELECTED_COMPONENT':
      return action.payload ? 'component_created' : 'component_deleted';
    case 'SET_THEME':
      return 'theme_switched';
    default:
      return 'token_updated';
  }
}

/**
 * 选择器函数
 */
export const useDesignTokens = () => {
  const config = useDesignSystemStore(state => state.config);
  return config?.tokens || { colors: [], typography: [], spacing: [], shadows: [], borderRadius: [], animations: [] };
};

export const useColors = () => {
  const tokens = useDesignTokens();
  return tokens.colors || [];
};

export const useTypography = () => {
  const tokens = useDesignTokens();
  return tokens.typography || [];
};

export const useSpacing = () => {
  const tokens = useDesignTokens();
  return tokens.spacing || [];
};

export const useShadows = () => {
  const tokens = useDesignTokens();
  return tokens.shadows || [];
};

export const useBorderRadius = () => {
  const tokens = useDesignTokens();
  return tokens.borderRadius || [];
};

export const useAnimations = () => {
  const tokens = useDesignTokens();
  return tokens.animations || [];
};

export const useLibraries = () => {
  return useDesignSystemStore(state => state.libraries);
};

export const useSelectedToken = () => {
  return useDesignSystemStore(state => state.selectedToken);
};

export const useSelectedComponent = () => {
  return useDesignSystemStore(state => state.selectedComponent);
};

export const useSearchAndFilters = () => {
  return useDesignSystemStore(state => ({
    searchQuery: state.searchQuery,
    filterBy: state.filterBy,
    viewMode: state.viewMode,
    theme: state.theme,
  }));
};

export const useLoadingAndError = () => {
  return useDesignSystemStore(state => ({
    isLoading: state.isLoading,
    error: state.error,
  }));
};

export const useEvents = () => {
  return useDesignSystemStore(state => state.events);
};

// 导出 Store 和选择器
export default useDesignSystemStore;