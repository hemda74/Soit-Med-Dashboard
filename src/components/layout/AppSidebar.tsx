import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { createNavigationConfig } from '@/config/navigation.config';
import type { NavItem } from '@/types/navigation.types';
import { MenuItem } from './MenuItem';
import Logo from '../Logo';

/**
 * Type guard to check if nav item has a path
 */
const hasPath = (item: NavItem): item is NavItem & { path: string } =>
  Boolean(item.path);

/**
 * Checks if a path is active (handles nested routes)
 */
const isPathActive = (currentPath: string, targetPath: string): boolean => {
  if (currentPath === targetPath) return true;
  // Handle nested routes - e.g., /sales-manager/deals/123 matches /sales-manager/deals
  return currentPath.startsWith(targetPath + '/');
};

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { hasAnyRole } = useAuthStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';

  // Create navigation config with translations
  const navConfig = useMemo(
    () => createNavigationConfig(t),
    [t]
  );

  // Filter navigation items based on user roles
  const allNavItems = useMemo(
    () =>
      navConfig.filter(
        ({ roles }) => !roles || hasAnyRole(roles as string[])
      ),
    [navConfig, hasAnyRole]
  );

  // Check if a path is currently active
  const isActive = useCallback(
    (path: string) => isPathActive(location.pathname, path),
    [location.pathname]
  );

  // Render menu items list
  const renderMenuItems = useCallback(
    (items: NavItem[]) => (
      <ul className="flex flex-col gap-4">
        {items.filter(hasPath).map((nav) => (
          <li key={`${nav.path}-${nav.name}`}>
            <MenuItem
              nav={nav}
              active={isActive(nav.path)}
              rtl={isRTL}
            />
          </li>
        ))}
      </ul>
    ),
    [isActive, isRTL]
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-[9998] border-gray-200 
        ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
        w-[290px]
        ${isRTL ? 'translate-x-full' : '-translate-x-full'}
        lg:translate-x-0`}
    >
      <div className="py-8 flex justify-start">
        <Logo asLink={true} />
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">
                {t('menu')}
              </h2>
              {renderMenuItems(allNavItems)}
            </div>
          </div>
        </nav>
        <Logo asLink={false} />
      </div>
    </aside>
  );
};

export default AppSidebar;
