import { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
  HeadphonesIcon
} from "lucide-react";
import Logo from "../Logo";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { hasAnyRole } = useAuthStore();
  const { t, language } = useTranslation();

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        icon: <GridIcon />,
        name: t('dashboard'),
        path: "/dashboard",
      },
    ]

    // Only Admin/SuperAdmin can see Create New Role
    if (hasAnyRole(['Admin', 'SuperAdmin'])) {
      items.push({
        icon: <UserCircleIcon />,
        name: t('createNewRole'),
        path: "/admin/create-role-user",
      })
    }

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

  // Sales Manager specific menu
  const salesManagerNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['SalesManager', 'SuperAdmin']) ? [{
      icon: <Users />,
      name: t('salesManagement'),
      subItems: [
        { name: t('salesManagerDashboard'), path: "/sales-manager", pro: false },
        { name: t('salesTargets'), path: "/sales-manager/targets", pro: false },
        { name: t('reportsReview'), path: "/sales-manager/reports-review", pro: false },
        { name: t('weeklyPlansReview'), path: "/sales-manager/weekly-plans-review", pro: false },
      ],
    }] : [], [hasAnyRole, t]);

  // Salesman specific menu
  const salesmanNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['Salesman', 'SuperAdmin']) ? [{
      icon: <Target />,
      name: t('mySales'),
      subItems: [
        { name: t('myDashboard'), path: "/salesman", pro: false },
      ],
    }] : [], [hasAnyRole, t]);

  // Sales Support menu - for Sales Support and Super Admin
  const salesSupportNavItems: NavItem[] = useMemo(() =>
    hasAnyRole(['SalesSupport', 'SuperAdmin']) ? [{
      icon: <HeadphonesIcon />,
      name: t('salesSupport'),
      subItems: [
        { name: t('salesSupportDashboard'), path: "/sales-support", pro: false },
        { name: t('offerCreation'), path: "/sales-support/offer", pro: false },
        { name: t('requestsInbox'), path: "/sales-support/requests", pro: false },
      ],
    }] : [], [hasAnyRole, t]);

  const allNavItems: NavItem[] = useMemo(() => [
    ...navItems,
    ...salesNavItems,
    ...salesManagerNavItems,
    ...salesmanNavItems,
    ...salesSupportNavItems,
    ...adminNavItems,
  ], [navItems, salesNavItems, salesManagerNavItems, salesmanNavItems, salesSupportNavItems, adminNavItems]);


  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleSubmenuToggle = useCallback((index: number, menuType: "main") => {
    setOpenSubmenu(prev =>
      prev?.type === menuType && prev?.index === index
        ? null
        : { type: menuType, index }
    );
  }, []);

  useEffect(() => {
    if (allNavItems.length > 0 && !openSubmenu) {
      setOpenSubmenu({
        type: "main",
        index: 0,
      });
    }
  }, [allNavItems.length, openSubmenu]);



  const renderMenuItems = (items: NavItem[], menuType: "main") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer lg:justify-start`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              <span className="menu-item-text">{nav.name}</span>
              <ChevronDownIcon
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
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
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
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
      ))}
    </ul>
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
            <div>
              <h2
                className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start"
              >
                {t('menu')}
              </h2>
              {renderMenuItems(allNavItems, "main")}
            </div>
          </div>
        </nav>
        <SidebarWidget />
      </div>
    </aside>
  );
};

export default AppSidebar;
