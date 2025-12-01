import { extractSourceInfo } from '../utils/sourceInfo';
import { isPureStaticText } from '../utils/elementUtils';

export interface MenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
}

/**
 * Create and show a context menu at the specified position
 */
export function showContextMenu(
  element: HTMLElement,
  x: number,
  y: number,
  menuItems: MenuItem[]
): HTMLElement {
  // Remove existing menu
  const existingMenu = document.querySelector('[data-context-menu="true"]') as HTMLElement;
  if (existingMenu) {
    document.body.removeChild(existingMenu);
  }

  // Create context menu
  const menu = document.createElement('div');
  menu.setAttribute('data-context-menu', 'true');
  menu.style.position = 'fixed';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.background = 'white';
  menu.style.border = '1px solid #ccc';
  menu.style.borderRadius = '4px';
  menu.style.padding = '4px 0';
  menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  menu.style.zIndex = '10000';
  menu.style.minWidth = '150px';

  // Create menu items
  menuItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.textContent = item.label;
    menuItem.style.padding = '8px 16px';

    if (item.disabled) {
      menuItem.style.color = '#999';
      menuItem.style.cursor = 'not-allowed';
    } else {
      menuItem.style.cursor = 'pointer';
      menuItem.style.color = '#333';
    }

    menuItem.style.background = 'transparent';

    menuItem.addEventListener('mouseenter', () => {
      if (!item.disabled) {
        menuItem.style.background = '#f0f0f0';
      }
    });

    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.background = 'transparent';
    });

    menuItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.disabled) return;
      item.action();
      closeContextMenu(menu);
    });

    menu.appendChild(menuItem);
  });

  // Add to page
  document.body.appendChild(menu);

  // Ensure menu stays within viewport
  const rect = menu.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (rect.right > viewportWidth) {
    menu.style.left = (viewportWidth - rect.width - 10) + 'px';
  }
  if (rect.bottom > viewportHeight) {
    menu.style.top = (viewportHeight - rect.height - 10) + 'px';
  }

  // Setup close handlers
  setupContextMenuCloseHandlers(menu);

  return menu;
}

/**
 * Close the context menu
 */
export function closeContextMenu(menu: HTMLElement) {
  // Execute cleanup function
  if ((menu as any).__cleanupHandlers) {
    (menu as any).__cleanupHandlers();
    delete (menu as any).__cleanupHandlers;
  }

  // Remove menu element
  if (menu.parentNode) {
    menu.parentNode.removeChild(menu);
  }
}

/**
 * Setup context menu close handlers (clickoutside and ESC key)
 */
function setupContextMenuCloseHandlers(menu: HTMLElement) {
  const closeMenu = () => {
    closeContextMenu(menu);
  };

  // Click outside to close
  const handleClickOutside = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      // Prevent event from bubbling to avoid deselecting element
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    }
  };

  // Right-click outside to close
  const handleContextMenu = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      closeMenu();
    }
  };

  // ESC key to close
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  // Scroll to close
  const handleScroll = () => {
    closeMenu();
  };

  // Add listeners with slight delay to avoid immediate triggering
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll, true);
  }, 0);

  // Store cleanup function
  (menu as any).__cleanupHandlers = () => {
    document.removeEventListener('click', handleClickOutside, true);
    document.removeEventListener('contextmenu', handleContextMenu, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('scroll', handleScroll, true);
    window.removeEventListener('resize', handleScroll, true);
  };
}
