import React, { useEffect } from 'react';
import { useDesignMode } from './DesignModeContext';
import { bridge } from './bridge';

export const DesignModeBridge: React.FC = () => {
  const { selectedElement, modifyElementClass, updateElementContent } = useDesignMode();

  // Sync selection to host
  useEffect(() => {
    if (selectedElement) {
      // We need to send serializable data
      const payload = {
        tagName: selectedElement.tagName,
        id: selectedElement.id,
        className: selectedElement.className,
        innerText: selectedElement.innerText.substring(0, 50), // Preview
        source: {
          file: selectedElement.getAttribute('data-source-file'),
          line: selectedElement.getAttribute('data-source-line'),
          column: selectedElement.getAttribute('data-source-column'),
        }
      };
      bridge.send('SELECTION_CHANGED', payload);
    } else {
      bridge.send('SELECTION_CHANGED', null);
    }
  }, [selectedElement]);

  // Listen for commands from host
  useEffect(() => {
    const unsubscribeStyle = bridge.on('UPDATE_STYLE', (payload: any) => {
      if (selectedElement) {
        // Verify if payload matches selected element?
        // For now assume host is in sync.
        modifyElementClass(selectedElement, payload.newClass);
      }
    });

    const unsubscribeContent = bridge.on('UPDATE_CONTENT', (payload: any) => {
      if (selectedElement) {
        updateElementContent(selectedElement, payload.newContent);
      }
    });

    return () => {
      unsubscribeStyle();
      unsubscribeContent();
    };
  }, [selectedElement, modifyElementClass, updateElementContent]);

  return null;
};
