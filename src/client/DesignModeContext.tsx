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
  updateElementContent: (element: HTMLElement, newContent: string) => void;
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

  const updateSource = useCallback(async (element: HTMLElement, newValue: string, type: 'style' | 'content') => {
    const filePath = element.getAttribute('data-source-file');
    const line = element.getAttribute('data-source-line');
    const column = element.getAttribute('data-source-column');

    if (!filePath || !line || !column) {
      console.warn('Element does not have source mapping data', element);
      return;
    }

    try {
      const response = await fetch('/__appdev_design_mode/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath,
          line: parseInt(line, 10),
          column: parseInt(column, 10),
          newValue,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update source');
      }

      console.log(`[DesignMode] Updated ${type} for ${filePath}:${line}`);
    } catch (error) {
      console.error('[DesignMode] Error updating source:', error);
    }
  }, []);

  const modifyElementClass = useCallback((element: HTMLElement, newClass: string) => {
    const oldClasses = element.className;
    const mergedClasses = twMerge(oldClasses, newClass);

    element.className = mergedClasses;

    // Call API to persist changes
    updateSource(element, mergedClasses, 'style');

    const modification: Modification = {
      id: Date.now().toString(),
      element: element.id || 'unknown',
      type: 'class',
      oldValue: oldClasses,
      newValue: mergedClasses,
      timestamp: Date.now()
    };

    setModifications(prev => [modification, ...prev]);
  }, [updateSource]);

  const updateElementContent = useCallback((element: HTMLElement, newContent: string) => {
    // Update DOM immediately for feedback
    element.innerText = newContent;

    // Call API to persist changes
    updateSource(element, newContent, 'content');
  }, [updateSource]);

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
      updateElementContent,
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
