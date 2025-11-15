import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/hooks/useTranslation";

// Import icons
import {
  ChevronDownIcon,
  GridIcon,
  UserCircleIcon,
} from "../icons";
import {
  ListChecks,
  Users,
  BarChart3,
  Target,
  HeadphonesIcon,
  Shield,
  ShoppingCart,
  Handshake,
  FileText,
  Clock,
  Wrench,
  Package,
  DollarSign,
  Warehouse
} from "lucide-react";
import Logo from "../Logo";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type MenuCategory = {
  title: string;
  icon?: React.ReactNode;
  items: NavItem[];
};

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { hasAnyRole, hasRole } = useAuthStore();
  const { t, language } = useTranslation();
  const isSuperAdmin = hasRole('SuperAdmin');

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        icon: <GridIcon />,
        name: t('dashboard'),
        path: "/dashboard",
      },
    ]

    return items
  }, [t, hasAnyRole]);

  // Admin menu - only for Admin and Super Admin
  const adminNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['Admin', 'SuperAdmin']) ? [{
      icon: <UserCircleIcon />,
      name: t('users'),
      subItems: [
        { name: t('allUsers'), path: "/admin/users", pro: false },
        { name: t('createUser'), path: "/admin/create-role-user", pro: false },
      ],
    }] : [], [hasAnyRole, t]);

  // Sales menu - for Salesman, Sales Manager, and Super Admin
  const salesNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['Salesman', 'SalesManager', 'SuperAdmin']) ? [
      {
        icon: <ListChecks />,
        name: t('weeklyPlans'),
        path: "/weekly-plans",
      },
      {
        icon: <BarChart3 />,
        name: t('salesReports'),
        path: "/sales-reports",
      }
    ] : [], [hasAnyRole, t]);

  // Sales Manager specific menu - flattened (no submenus)
  const salesManagerNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['SalesManager', 'SuperAdmin']) ? [
      {
        icon: <Users />,
        name: t('salesManagerDashboard'),
        path: "/sales-manager",
      },
      {
        icon: <Target />,
        name: t('salesTargets'),
        path: "/sales-manager/targets",
      },
      {
        icon: <BarChart3 />,
        name: t('reportsReview'),
        path: "/sales-manager/reports-review",
      },
      {
        icon: <Handshake />,
        name: 'Deals',
        path: "/sales-manager/deals",
      },
      {
        icon: <Clock />,
        name: 'Pending Approvals',
        path: "/sales-manager/deal-approvals",
      },
      {
        icon: <FileText />,
        name: 'Offers',
        path: "/sales-manager/offers",
      },
      {
        icon: <ShoppingCart />,
        name: 'Products Catalog',
        path: "/sales-support/products",
      },
    ] : [], [hasAnyRole, t]);

  // Salesman specific menu - Removed My Sales Dashboard
  const salesmanNavItems: NavItem[] = useMemo(() => [], []);

  // Sales Support menu - for Sales Support and Super Admin
  const salesSupportNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['SalesSupport', 'SuperAdmin']) ? [
      {
        icon: <HeadphonesIcon />,
        name: t('salesSupportDashboard'),
        path: "/sales-support",
      },
      {
        icon: <HeadphonesIcon />,
        name: t('offerCreation'),
        path: "/sales-support/offer",
      },
      {
        icon: <HeadphonesIcon />,
        name: t('requestsInbox'),
        path: "/sales-support/requests",
      },
      {
        icon: <HeadphonesIcon />,
        name: 'Products Catalog',
        path: "/sales-support/products",
      },
    ] : [], [hasAnyRole, t]);

  // Maintenance Support menu - for Maintenance Support, Maintenance Manager, and Super Admin
  const maintenanceSupportNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['MaintenanceSupport', 'MaintenanceManager', 'SuperAdmin']) ? [
      {
        icon: <Wrench className="w-5 h-5" />,
        name: 'Maintenance Support',
        path: "/maintenance-support",
      },
    ] : [], [hasAnyRole, t]);

  // Spare Parts Coordinator menu
  const sparePartsCoordinatorNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['SparePartsCoordinator', 'SuperAdmin']) ? [
      {
        icon: <Package className="w-5 h-5" />,
        name: t('sparePartsCoordinatorDashboard') || 'Spare Parts Coordinator',
        path: "/spare-parts-coordinator",
      },
      {
        icon: <Package className="w-5 h-5" />,
        name: t('sparePartRequests') || 'Spare Part Requests',
        path: "/maintenance/spare-parts",
      },
    ] : [], [hasAnyRole, t]);

  // Inventory Manager menu
  const inventoryManagerNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['InventoryManager', 'SuperAdmin']) ? [
      {
        icon: <Warehouse className="w-5 h-5" />,
        name: t('inventoryManagerDashboard') || 'Inventory Manager',
        path: "/inventory-manager",
      },
      {
        icon: <Warehouse className="w-5 h-5" />,
        name: t('sparePartRequests') || 'Spare Part Requests',
        path: "/maintenance/spare-parts",
      },
    ] : [], [hasAnyRole, t]);

  // Accounting menu - for Finance Manager, Finance Employee, and Super Admin
  const accountingNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['FinanceManager', 'FinanceEmployee', 'SuperAdmin']) ? [
      {
        icon: <DollarSign className="w-5 h-5" />,
        name: 'Accounting Dashboard',
        path: "/accounting",
      },
    ] : [], [hasAnyRole, t]);

  // For Super Admin: Organize into categorized modules
  const superAdminCategories: MenuCategory[] = useMemo(() => {
    if (!isSuperAdmin) return [];

    return [
      {
        title: t('adminModule') || 'Admin Module',
        icon: <Shield className="w-4 h-4" />,
        items: [
          {
            icon: <UserCircleIcon />,
            name: t('users'),
            subItems: [
              { name: t('allUsers'), path: "/admin/users", pro: false },
              { name: t('createUser'), path: "/admin/create-role-user", pro: false },
            ],
          },
          {
            icon: <ShoppingCart className="w-4 h-4" />,
            name: t('allOffers'),
            path: "/admin/offers",
          },
          {
            icon: <Clock className="w-4 h-4" />,
            name: 'Pending Deal Approvals',
            path: "/super-admin/deal-approvals",
          },
        ],
      },
      {
        title: t('salesModule') || 'Sales Module',
        icon: <ShoppingCart className="w-4 h-4" />,
        items: [
          {
            icon: <ListChecks />,
            name: t('weeklyPlans'),
            path: "/weekly-plans",
          },
          {
            icon: <BarChart3 />,
            name: t('salesReports'),
            path: "/sales-reports",
          },
          {
            icon: <Users />,
            name: t('salesManagerDashboard'),
            path: "/sales-manager",
          },
          {
            icon: <Target />,
            name: t('salesTargets'),
            path: "/sales-manager/targets",
          },
          {
            icon: <BarChart3 />,
            name: t('reportsReview'),
            path: "/sales-manager/reports-review",
          },

          {
            icon: <Handshake />,
            name: 'Deals',
            path: "/sales-manager/deals",
          },
          {
            icon: <FileText />,
            name: 'Offers',
            path: "/sales-manager/offers",
          },
          {
            icon: <ShoppingCart />,
            name: 'Products Catalog',
            path: "/sales-support/products",
          },
          {
            icon: <HeadphonesIcon />,
            name: t('salesSupportDashboard'),
            path: "/sales-support",
          },
          {
            icon: <HeadphonesIcon />,
            name: t('offerCreation'),
            path: "/sales-support/offer",
          },
          {
            icon: <HeadphonesIcon />,
            name: t('requestsInbox'),
            path: "/sales-support/requests",
          },
        ],
      },
      {
        title: 'Maintenance Module',
        icon: <Wrench className="w-4 h-4" />,
        items: [
          {
            icon: <Wrench className="w-4 h-4" />,
            name: 'Maintenance Support',
            path: "/maintenance-support",
          },
          {
            icon: <Package className="w-4 h-4" />,
            name: t('sparePartsCoordinatorDashboard') || 'Spare Parts Coordinator',
            path: "/spare-parts-coordinator",
          },
          {
            icon: <Warehouse className="w-4 h-4" />,
            name: t('inventoryManagerDashboard') || 'Inventory Manager',
            path: "/inventory-manager",
          },
        ],
      },
      {
        title: 'Finance Module',
        icon: <DollarSign className="w-4 h-4" />,
        items: [
          {
            icon: <DollarSign className="w-4 h-4" />,
            name: 'Accounting Dashboard',
            path: "/accounting",
          },
        ],
      },
    ];
  }, [isSuperAdmin, t]);

  // For non-Super Admin users: use flat structure
  const allNavItems: NavItem[] = useMemo(() => {
    if (isSuperAdmin) return navItems; // Dashboard only for Super Admin (categories handle the rest)

    return [
      ...navItems,
      ...salesNavItems,
      ...salesManagerNavItems,
      ...salesmanNavItems,
      ...salesSupportNavItems,
      ...maintenanceSupportNavItems,
      ...sparePartsCoordinatorNavItems,
      ...inventoryManagerNavItems,
      ...accountingNavItems,
      ...adminNavItems,
    ];
  }, [isSuperAdmin, navItems, salesNavItems, salesManagerNavItems, salesmanNavItems, salesSupportNavItems, maintenanceSupportNavItems, sparePartsCoordinatorNavItems, inventoryManagerNavItems, accountingNavItems, adminNavItems]);


  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "category";
    categoryIndex?: number;
    index: number;
  } | null>(null);

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleSubmenuToggle = useCallback((index: number, menuType: "main" | "category", categoryIndex?: number) => {
    setOpenSubmenu(prev => {
      const key = categoryIndex !== undefined
        ? `${menuType}-${categoryIndex}-${index}`
        : `${menuType}-${index}`;
      const prevKey = prev?.categoryIndex !== undefined
        ? `${prev.type}-${prev.categoryIndex}-${prev.index}`
        : `${prev?.type}-${prev?.index}`;

      return key === prevKey
        ? null
        : { type: menuType, index, categoryIndex };
    });
  }, []);

  useEffect(() => {
    if (isSuperAdmin && superAdminCategories.length > 0 && !openSubmenu) {
      // Auto-open first category's first item if it has subItems
      const firstCategory = superAdminCategories[0];
      if (firstCategory.items.length > 0 && firstCategory.items[0].subItems) {
        setOpenSubmenu({
          type: "category",
          categoryIndex: 0,
          index: 0,
        });
      }
    } else if (!isSuperAdmin && allNavItems.length > 0 && !openSubmenu) {
      setOpenSubmenu({
        type: "main",
        index: 0,
      });
    }
  }, [isSuperAdmin, superAdminCategories, allNavItems.length, openSubmenu]);




  const renderMenuItems = (items: NavItem[], menuType: "main" | "category", categoryIndex?: number) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const isOpen = categoryIndex !== undefined
          ? openSubmenu?.type === menuType && openSubmenu?.categoryIndex === categoryIndex && openSubmenu?.index === index
          : openSubmenu?.type === menuType && openSubmenu?.index === index;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType, categoryIndex)}
                className={`menu-item group ${isOpen
                  ? "menu-item-active"
                  : "menu-item-inactive"
                  } cursor-pointer lg:justify-start`}
              >
                <span
                  className={`menu-item-icon-size  ${isOpen
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                <span className="menu-item-text">{nav.name}</span>
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  <span className="menu-item-text">{nav.name}</span>
                </Link>
              )
            )}
            {nav.subItems && (
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen ? "auto" : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                          }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                              {t('new')}
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                              {t('pro')}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const renderCategories = (categories: MenuCategory[]) => (
    <div className="flex flex-col gap-6">
      {categories.map((category, categoryIndex) => (
        <div key={category.title} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2 mb-2">
            {category.icon && (
              <span className="text-gray-500 dark:text-gray-400">
                {category.icon}
              </span>
            )}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {category.title}
            </h3>
          </div>
          {renderMenuItems(category.items, "category", categoryIndex)}
        </div>
      ))}
    </div>
  );

  const isRTL = language === 'ar';

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-[9998] border-gray-200 
        ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
        w-[290px]
        ${isRTL ? "translate-x-full" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className="py-8 flex justify-start"
      >
        <Logo asLink={true} />
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {isSuperAdmin ? (
              <>
                {/* Dashboard for Super Admin */}
                <div>
                  <h2
                    className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start"
                  >
                    {t('menu')}
                  </h2>
                  {renderMenuItems(allNavItems, "main")}
                </div>
                {/* Categorized Modules for Super Admin */}
                {superAdminCategories.length > 0 && (
                  <div className="mt-4">
                    {renderCategories(superAdminCategories)}
                  </div>
                )}
              </>
            ) : (
              <div>
                <h2
                  className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start"
                >
                  {t('menu')}
                </h2>
                {renderMenuItems(allNavItems, "main")}
              </div>
            )}
          </div>
        </nav>
        <Logo asLink={false} />
      </div>
    </aside>
  );
};

export default AppSidebar;
