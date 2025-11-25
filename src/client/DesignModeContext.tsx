import React, { createContext, useContext, useState, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

export interface Modification {
  id: string;
  element: string;
  type: 'class' | 'style';
  oldValue: string;
  newValue: string;
  timestamp: number;
}

interface DesignModeContextType {
  isDesignMode: boolean;
  toggleDesignMode: () => void;
  selectedElement: HTMLElement | null;
  selectElement: (element: HTMLElement | null) => void;
  modifications: Modification[];
  modifyElementClass: (element: HTMLElement, newClass: string) => void;
  resetModifications: () => void;
}

const DesignModeContext = createContext<DesignModeContextType | undefined>(undefined);

export const DesignModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [modifications, setModifications] = useState<Modification[]>([]);

  const toggleDesignMode = useCallback(() => {
    setIsDesignMode(prev => {
      const next = !prev;
      if (!next) setSelectedElement(null);
      return next;
    });
  }, []);

  const selectElement = useCallback((element: HTMLElement | null) => {
    setSelectedElement(element);
  }, []);

  const modifyElementClass = useCallback((element: HTMLElement, newClass: string) => {
    const oldClasses = element.className;
    const mergedClasses = twMerge(oldClasses, newClass);

    element.className = mergedClasses;

    const modification: Modification = {
      id: Date.now().toString(),
      element: element.id || 'unknown',
      type: 'class',
      oldValue: oldClasses,
      newValue: mergedClasses,
      timestamp: Date.now()
    };

    setModifications(prev => [modification, ...prev]);
  }, []);

  const resetModifications = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <DesignModeContext.Provider value={{
      isDesignMode,
      toggleDesignMode,
      selectedElement,
      selectElement,
      modifications,
      modifyElementClass,
      resetModifications
    }}>
      {children}
    </DesignModeContext.Provider>
  );
};

export const useDesignMode = () => {
  const context = useContext(DesignModeContext);
  if (context === undefined) {
    throw new Error('useDesignMode must be used within a DesignModeProvider');
  }
  return context;
};
