import React, { useEffect } from 'react';
import { useDesignMode } from './DesignModeContext';

export const DesignModeManager: React.FC = () => {
  const { isDesignMode, selectElement, selectedElement } = useDesignMode();

  useEffect(() => {
    if (!isDesignMode) {
      document.querySelectorAll('[data-design-selected]').forEach(el => {
        el.removeAttribute('data-design-selected');
      });
      return;
    }

    const handleClick = (e: MouseEvent) => {
      // Don't select the overlay itself or controls (assuming they are in shadow DOM or have specific attribute)
      // Since this manager runs in the main document context (event listeners), we need to be careful.
      // The UI will be in a separate root, likely in Shadow DOM, so events might not bubble up the same way
      // OR we need to check if target is part of our UI.
      if ((e.target as HTMLElement).closest('#__vite_plugin_design_mode__')) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      selectElement(target);
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('#__vite_plugin_design_mode__')) return;

      const target = e.target as HTMLElement;
      target.setAttribute('data-design-hover', 'true');
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.removeAttribute('data-design-hover');
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // Inject global styles for design mode into the MAIN document head
    const styleId = 'appdev-design-mode-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        [data-design-hover="true"] {
          outline: 2px dashed #60a5fa !important; /* blue-400 */
          outline-offset: 2px;
          cursor: pointer;
        }
        [data-design-selected="true"] {
          outline: 2px solid #2563eb !important; /* blue-600 */
          outline-offset: 2px;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Optional: remove styles when unmounting?
      // For now, let's keep them or we can remove them if we want to be clean.
      // Since this component might be mounted/unmounted, maybe better to keep them
      // or manage them carefully.
      // Let's remove them to be clean.
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }

      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);

      document.querySelectorAll('[data-design-hover]').forEach(el => {
        el.removeAttribute('data-design-hover');
      });
    };
  }, [isDesignMode, selectElement]);

  useEffect(() => {
    document.querySelectorAll('[data-design-selected]').forEach(el => {
      el.removeAttribute('data-design-selected');
    });

    if (selectedElement) {
      selectedElement.setAttribute('data-design-selected', 'true');
    }
  }, [selectedElement]);

  return null; // No UI to render, just logic and global side effects
};
