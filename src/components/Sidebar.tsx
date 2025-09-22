import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    UserPlus,
    User,
    ChevronLeft,
    ChevronRight,

    BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const { hasRole } = useAuthStore();
    const { theme } = useThemeStore();
    const { t } = useTranslation();
    const location = useLocation();
    const isAdmin = hasRole('SuperAdmin') || hasRole('Admin');
    const isDark = theme === 'dark';

    const navigationItems = [
        {
            name: t('dashboard'),
            href: '/',
            icon: Home,
            bgColor: isDark ? 'bg-card' : 'bg-white',
            hoverColor: 'hover:bg-muted/50',
            activeBgColor: 'bg-muted',
        },
        {
            name: t('profile'),
            href: '/profile',
            icon: User,
            bgColor: isDark ? 'bg-card' : 'bg-white',
            hoverColor: 'hover:bg-muted/50',
            activeBgColor: 'bg-muted',
        },
        ...(isAdmin ? [
            {
                name: t('usersList'),
                href: '/admin/users',
                icon: Users,
                bgColor: isDark ? 'bg-card' : 'bg-white',
                hoverColor: 'hover:bg-muted/50',
                activeBgColor: 'bg-muted',
            },
            {
                name: 'Create New User',
                href: '/admin/create-role-user',
                icon: UserPlus,
                bgColor: isDark ? 'bg-card' : 'bg-white',
                hoverColor: 'hover:bg-muted/50',
                activeBgColor: 'bg-muted',
            },
        ] : []),
    ];

    return (
        <div className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r transition-all duration-300 z-40",
            isDark ? "bg-card border-border" : "bg-white border-gray-200",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Toggle Button */}
            <div className={cn(
                "flex justify-end p-4 border-b",
                isDark ? "border-border" : "border-gray-200"
            )}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className={cn(
                        "h-8 w-8 p-0",
                        isDark ? "hover:bg-muted" : "hover:bg-gray-100"
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navigationItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? `${item.activeBgColor} text-foreground shadow-sm border border-border`
                                    : `text-muted-foreground hover:text-foreground ${item.hoverColor}`,
                                isCollapsed && "justify-center"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 flex-shrink-0",
                                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {!isCollapsed && (
                                <span className={cn(
                                    "font-medium transition-opacity duration-200",
                                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Decorative Elements */}
            {!isCollapsed && (
                <div className="absolute bottom-4 left-4 right-4">
                    <div className={cn(
                        "rounded-lg p-4 border-2 shadow-lg",
                        isDark
                            ? "bg-card border-border"
                            : "bg-white border-border"
                    )}>
                        <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-3 w-3 text-white" />
                            </div>
                            <span className="font-medium">Quick Stats</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Manage your users efficiently
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
