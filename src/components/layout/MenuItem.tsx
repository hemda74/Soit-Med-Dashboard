import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { NavItemWithPath } from '@/types/navigation.types';

interface MenuItemProps {
  /** Navigation item with guaranteed path */
  nav: NavItemWithPath;
  /** Whether this item is currently active */
  active: boolean;
  /** Whether to render in RTL mode */
  rtl: boolean;
}

/**
 * Individual menu item component
 * Memoized to prevent unnecessary re-renders
 */
export const MenuItem = memo<MenuItemProps>(({ nav, active, rtl }) => {
  const iconClassName = `menu-item-icon-size ${
    active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
  }`;
  const linkClassName = `menu-item group ${
    active ? 'menu-item-active' : 'menu-item-inactive'
  } ${rtl ? 'justify-between text-right' : ''}`;

  return (
    <Link
      to={nav.path}
      dir={rtl ? 'rtl' : 'ltr'}
      aria-current={active ? 'page' : undefined}
      className={linkClassName}
    >
      {rtl ? (
        <div className="flex items-baseline gap-4 justify-between">
          <span className={iconClassName}>{nav.icon}</span>
          <span className="menu-item-text text-start">{nav.name}</span>
        </div>
      ) : (
        <>
          <span className={iconClassName}>{nav.icon}</span>
          <span className="menu-item-text ml-2 text-left">{nav.name}</span>
        </>
      )}
    </Link>
  );
});

MenuItem.displayName = 'MenuItem';

