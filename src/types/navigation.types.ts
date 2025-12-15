import type { ReactNode } from 'react';

/**
 * All valid user roles in the system
 */
export type UserRole =
	| 'SuperAdmin'
	| 'Admin'
	| 'SalesMan'
	| 'SalesManager'
	| 'SalesSupport'
	| 'MaintenanceSupport'
	| 'MaintenanceManager'
	| 'SparePartsCoordinator'
	| 'InventoryManager'
	| 'FinanceManager'
	| 'FinanceEmployee'
	| 'LegalManager'
	| 'LegalEmployee'
	| 'MaintenanceManager'
	| 'MaintenanceSupport'
	| 'SparePartsCoordinator'
	| 'InventoryManager';

/**
 * Navigation item configuration
 */
export interface NavItem {
	/** Display name (can be translation key or direct string) */
	name: string;
	/** Icon component to render */
	icon: ReactNode;
	/** Route path (optional for group headers) */
	path?: string;
	/** Roles that can access this item (undefined = all roles) */
	roles?: readonly UserRole[];
	/** Nested navigation items (for future expansion) */
	subItems?: readonly SubNavItem[];
}

/**
 * Sub-navigation item (for nested menus)
 */
export interface SubNavItem {
	name: string;
	path: string;
	pro?: boolean;
	new?: boolean;
}

/**
 * Navigation item with guaranteed path
 */
export type NavItemWithPath = NavItem & { path: string };
