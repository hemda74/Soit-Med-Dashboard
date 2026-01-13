import type { NavItem } from '@/types/navigation.types';
import {
  GridIcon,
  UserCircleIcon,
} from '@/components/icons';
import {
  ListChecks,
  Users,
  BarChart3,
  Target,
  HeadphonesIcon,
  ShoppingCart,
  Handshake,
  FileText,
  Clock,
  Wrench,
  Package,
  DollarSign,
  Warehouse,
  Archive,
  MessageCircle,
  UserPlus,
  Building2,
} from 'lucide-react';

/**
 * Icon size constant for consistency
 */
const ICON_SIZE = 'w-5 h-5';

/**
 * Creates navigation configuration
 * @param t - Translation function
 * @returns Array of navigation items
 */
export const createNavigationConfig = (t: (key: string) => string): readonly NavItem[] => [
  // Dashboard - available to all authenticated users
  {
    icon: <GridIcon />,
    name: t('dashboard'),
    path: '/dashboard',
  },
  // Admin section
  {
    icon: <UserCircleIcon />,
    name: t('allUsers'),
    path: '/Admin/users',
    roles: ['Admin', 'SuperAdmin',] as const,
  },
  {
    icon: <UserCircleIcon />,
    name: t('createUser'),
    path: '/Admin/create-role-user',
    roles: ['Admin', 'SuperAdmin'] as const,
  },
  {
    icon: <UserPlus className={ICON_SIZE} />,
    name: t('clientAccountCreation'),
    path: '/Admin/client-accounts',
    roles: ['Admin', 'SuperAdmin'] as const,
  },
  // Super Admin specific
  {
    icon: <Clock className={ICON_SIZE} />,
    name: t('pendingDealApprovals'),
    path: '/super-Admin/deal-approvals',
    roles: ['SuperAdmin'] as const,
  },
  // Sales section
  {
    icon: <ListChecks />,
    name: t('weeklyPlans'),
    path: '/weekly-plans',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  // Sales Manager section
  {
    icon: <Users />,
    name: t('salesManagerDashboard'),
    path: '/SalesManager',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  {
    icon: <Target />,
    name: t('salesTargets'),
    path: '/SalesManager/targets',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  {
    icon: <BarChart3 />,
    name: t('salesAnalytics'),
    path: '/sales-analytics',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  {
    icon: <BarChart3 />,
    name: t('reportsReview'),
    path: '/SalesManager/reports-review',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  {
    icon: <Handshake />,
    name: t('deals'),
    path: '/SalesManager/deals',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  {
    icon: <Users />,
    name: t('salesClients.title'),
    path: '/SalesManager/clients',
    roles: ['SalesManager', 'SalesSupport', 'SuperAdmin'] as const,
  },
  {
    icon: <Clock className={ICON_SIZE} />,
    name: t('pendingApprovals'),
    path: '/SalesManager/deal-approvals',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  {
    icon: <Clock className={ICON_SIZE} />,
    name: t('pendingOfferApprovals'),
    path: '/SalesManager/offer-approvals',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  {
    icon: <FileText />,
    name: t('offers'),
    path: '/SalesManager/offers',
    roles: ['SalesManager', 'SuperAdmin'] as const,
  },
  // Shared products catalog
  {
    icon: <ShoppingCart />,
    name: t('productsCatalog'),
    path: '/sales-support/products',
    roles: ['SalesManager', 'SalesSupport', 'SuperAdmin'] as const,
  },
  // Sales Support section
  {
    icon: <HeadphonesIcon />,
    name: t('offerCreation'),
    path: '/sales-support/offer',
    roles: ['SalesSupport', 'SuperAdmin'] as const,
  },
  {
    icon: <HeadphonesIcon />,
    name: t('requestsInbox'),
    path: '/sales-support/requests',
    roles: ['SalesSupport', 'SuperAdmin'] as const,
  },
  // Chat section - Role-based chat access
  {
    icon: <MessageCircle className={ICON_SIZE} />,
    name: t('chat'),
    path: '/chat',
    roles: ['Admin', 'SuperAdmin', 'SalesSupport', 'MaintenanceSupport'] as const,
  },
  // Maintenance section
  {
    icon: <Wrench className={ICON_SIZE} />,
    name: t('maintenanceSupport'),
    path: '/maintenance-support',
    roles: ['MaintenanceSupport', 'MaintenanceManager', 'SuperAdmin'] as const,
  },
  {
    icon: <Package className={ICON_SIZE} />,
    name: t('sparePartsCoordinatorDashboard'),
    path: '/spare-parts-coordinator',
    roles: ['SparePartsCoordinator', 'SuperAdmin'] as const,
  },
  {
    icon: <Package className={ICON_SIZE} />,
    name: t('sparePartRequests'),
    path: '/maintenance/spare-parts',
    roles: ['SparePartsCoordinator', 'InventoryManager', 'SuperAdmin'] as const,
  },
  {
    icon: <Building2 className={ICON_SIZE} />,
    name: t('clientEquipmentVisits'),
    path: '/maintenance/client-equipment-visits',
    roles: ['MaintenanceSupport', 'MaintenanceManager', 'SuperAdmin'] as const,
  },
  {
    icon: <BarChart3 className={ICON_SIZE} />,
    name: t('maintenanceDashboard'),
    path: '/maintenance-dashboard-ui',
    roles: ['MaintenanceSupport', 'MaintenanceManager', 'Engineer', 'SuperAdmin'] as const,
  },
  // Inventory section
  {
    icon: <Warehouse className={ICON_SIZE} />,
    name: t('inventoryManagerDashboard'),
    path: '/InventoryManager',
    roles: ['InventoryManager', 'SuperAdmin'] as const,
  },
  // Finance section
  {
    icon: <DollarSign className={ICON_SIZE} />,
    name: t('accountingDashboard'),
    path: '/accounting',
    roles: ['FinanceManager', 'FinanceEmployee', 'SuperAdmin'] as const,
  },
  // Legal section
  {
    icon: <FileText className={ICON_SIZE} />,
    name: t('legalDeals'),
    path: '/legal/deals',
    roles: ['LegalManager', 'LegalEmployee', 'SuperAdmin'] as const,
  },
  {
    icon: <Archive className={ICON_SIZE} />,
    name: t('legalDealsHistory'),
    path: '/legal/deals/history',
    roles: ['LegalManager', 'LegalEmployee', 'SuperAdmin'] as const,
  },
  {
    icon: <FileText className={ICON_SIZE} />,
    name: t('contracts'),
    path: '/contracts',
    roles: ['LegalManager', 'LegalEmployee', 'SuperAdmin'] as const,
  },
] as const;

