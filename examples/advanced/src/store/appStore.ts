import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // UI状态
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  
  // 应用状态
  currentPage: string;
  user: {
    name: string;
    email: string;
    preferences: {
      showTooltips: boolean;
      animations: boolean;
      compactMode: boolean;
    };
  };
  
  // 组件状态
  components: Array<{
    id: string;
    name: string;
    type: string;
    props: Record<string, any>;
    children?: string[];
    parent?: string;
  }>;
  
  // 设计模式状态
  designMode: {
    enabled: boolean;
    selectedElement: string | null;
    showGrid: boolean;
    showInfo: boolean;
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: string) => void;
  updateUserPreferences: (preferences: Partial<AppState['user']['preferences']>) => void;
  
  // 组件操作
  addComponent: (component: Omit<AppState['components'][0], 'id'>) => void;
  updateComponent: (id: string, updates: Partial<AppState['components'][0]>) => void;
  removeComponent: (id: string) => void;
  
  // 设计模式操作
  setDesignModeEnabled: (enabled: boolean) => void;
  setSelectedElement: (element: string | null) => void;
  toggleGrid: () => void;
  toggleInfo: () => void;
  
  // 重置状态
  reset: () => void;
}

const initialState = {
  theme: 'light' as const,
  isLoading: false,
  error: null,
  currentPage: 'dashboard',
  user: {
    name: 'Demo User',
    email: 'demo@example.com',
    preferences: {
      showTooltips: true,
      animations: true,
      compactMode: false
    }
  },
  components: [
    {
      id: 'header-1',
      name: 'AppHeader',
      type: 'header',
      props: { title: 'Advanced Demo', showNav: true }
    },
    {
      id: 'card-1', 
      name: 'InfoCard',
      type: 'card',
      props: { title: 'Welcome', content: 'This is an advanced example' }
    }
  ],
  designMode: {
    enabled: false,
    selectedElement: null,
    showGrid: false,
    showInfo: true
  }
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // UI Actions
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        }), false, 'toggleTheme'),
        
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        setCurrentPage: (page) => set({ currentPage: page }, false, 'setCurrentPage'),
        
        updateUserPreferences: (preferences) => set((state) => ({
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, ...preferences }
          }
        }), false, 'updateUserPreferences'),
        
        // Component Actions
        addComponent: (component) => set((state) => ({
          components: [
            ...state.components,
            { ...component, id: `${component.name}-${Date.now()}` }
          ]
        }), false, 'addComponent'),
        
        updateComponent: (id, updates) => set((state) => ({
          components: state.components.map(comp => 
            comp.id === id ? { ...comp, ...updates } : comp
          )
        }), false, 'updateComponent'),
        
        removeComponent: (id) => set((state) => ({
          components: state.components.filter(comp => comp.id !== id)
        }), false, 'removeComponent'),
        
        // Design Mode Actions
        setDesignModeEnabled: (enabled) => set((state) => ({
          designMode: { ...state.designMode, enabled }
        }), false, 'setDesignModeEnabled'),
        
        setSelectedElement: (element) => set((state) => ({
          designMode: { ...state.designMode, selectedElement: element }
        }), false, 'setSelectedElement'),
        
        toggleGrid: () => set((state) => ({
          designMode: { ...state.designMode, showGrid: !state.designMode.showGrid }
        }), false, 'toggleGrid'),
        
        toggleInfo: () => set((state) => ({
          designMode: { ...state.designMode, showInfo: !state.designMode.showInfo }
        }), false, 'toggleInfo'),
        
        // Reset
        reset: () => set(initialState, false, 'reset')
      }),
      {
        name: 'advanced-design-mode-storage',
        partialize: (state) => ({
          theme: state.theme,
          user: state.user,
          designMode: state.designMode
        })
      }
    ),
    {
      name: 'app-store'
    }
  )
);
