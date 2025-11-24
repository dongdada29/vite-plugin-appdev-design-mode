import React, { useEffect } from 'react';
import { useDesignMode } from '../context/DesignModeContext';

export const DesignModeManager: React.FC = () => {
  const { isDesignMode, selectElement, selectedElement } = useDesignMode();

  useEffect(() => {
    if (!isDesignMode) {
      // Cleanup visual indicators when exiting design mode
      document.querySelectorAll('[data-design-selected]').forEach(el => {
        el.removeAttribute('data-design-selected');
      });
      return;
    }

    const handleClick = (e: MouseEvent) => {
      // Don't select the overlay itself or controls
      if ((e.target as HTMLElement).closest('[data-design-mode-ui]')) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      // Only select elements that have data-source-info or explicit data-element
      // or just any element? Let's restrict to elements with ID or data attributes for now to avoid noise
      // But for "Global" feel, maybe any element. Let's stick to "interactive" ones for safety?
      // For this demo, let's allow selecting anything that looks like a component/element

      selectElement(target);
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-design-mode-ui]')) return;

      const target = e.target as HTMLElement;
      target.setAttribute('data-design-hover', 'true');
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.removeAttribute('data-design-hover');
    };

    document.addEventListener('click', handleClick, true); // Capture phase
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);

      // Cleanup hover attributes
      document.querySelectorAll('[data-design-hover]').forEach(el => {
        el.removeAttribute('data-design-hover');
      });
    };
  }, [isDesignMode, selectElement]);

  // Handle selection visual state
  useEffect(() => {
    // Clear previous selection
    document.querySelectorAll('[data-design-selected]').forEach(el => {
      el.removeAttribute('data-design-selected');
    });

    if (selectedElement) {
      selectedElement.setAttribute('data-design-selected', 'true');
    }
  }, [selectedElement]);

  // Inject global styles for design mode
  return (
    <style>{`
      [data-design-hover="true"] {
        outline: 2px dashed #60a5fa !important; /* blue-400 */
        outline-offset: 2px;
        cursor: pointer;
      }
      [data-design-selected="true"] {
        outline: 2px solid #2563eb !important; /* blue-600 */
        outline-offset: 2px;
      }
    `}</style>
  );
};
