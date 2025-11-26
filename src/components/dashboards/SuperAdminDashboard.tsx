import React, { useEffect, useMemo, useCallback } from 'react';
import {
    BarChart3,
    Users,
    Clock,
    ShoppingCart,
    Headphones,
    Wrench,
    Warehouse,
    DollarSign
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
    useStatistics,
    useStatisticsLoading,
    useStatisticsStore
} from '@/stores/statisticsStore';
import { salesApi } from '@/services';

// Type definitions moved outside component for better performance
type DashboardCard = {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    title: string;
    description: string;
    primaryLabel: string;
    path: string;
    secondaryLabel?: string;
    statLabel?: string;
    statValue?: string | number;
    statTrend?: string;
    colorScheme: {
        iconBg: string;
        iconColor: string;
        borderAccent: string;
        statBg: string;
    };
};

// Pure utility function - moved outside component
const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
};

// Type for deal approval response
interface DealApproval {
    status: string;
    [key: string]: unknown;
}

// Memoized card component to prevent unnecessary re-renders
interface DashboardCardProps {
    card: DashboardCard;
    onNavigate: (path: string) => () => void;
}

const DashboardCardComponent = React.memo<DashboardCardProps>(({ card, onNavigate }) => {
    const IconComponent = card.icon;

    return (
        <Card
            className={`border border-border/50 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/40 ${card.colorScheme.borderAccent} border-l-4`}
        >
            <CardContent className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${card.colorScheme.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-6 h-6 ${card.colorScheme.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                                {card.badge}
                            </p>
                            <h2 className="text-xl font-semibold text-foreground mb-2">{card.title}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {card.description}
                            </p>
                        </div>
                    </div>
                    {card.statValue !== undefined && (
                        <div className={`rounded-lg px-4 py-3 text-right border ${card.colorScheme.statBg}`}>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                {card.statLabel}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {card.statValue}
                            </p>
                            {card.statTrend && (
                                <p className="text-xs font-medium text-muted-foreground mt-1">
                                    {card.statTrend}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-border/50">
                    <Button
                        onClick={onNavigate(card.path)}
                        size="default"
                        className="flex items-center gap-2 w-full sm:w-auto"
                    >
                        {card.primaryLabel}
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    {card.secondaryLabel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
                            onClick={onNavigate(card.path)}
                        >
                            {card.secondaryLabel}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

DashboardCardComponent.displayName = 'DashboardCardComponent';

const SuperAdminDashboard: React.FC = () => {
    usePerformance('SuperAdminDashboard');
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const statistics = useStatistics();
    const statisticsLoading = useStatisticsLoading();
    const fetchStatistics = useStatisticsStore((state) => state.fetchStatistics);
    const [pendingApprovalsCount, setPendingApprovalsCount] = React.useState<number>(0);

    useEffect(() => {
        if (user?.token) {
            fetchStatistics(user.token);
        }
    }, [user?.token, fetchStatistics]);

    useEffect(() => {
        const loadPendingApprovals = async () => {
            if (!user?.token) return;
            try {
                const response = await salesApi.getPendingSuperAdminApprovals();
                if (response.success && response.data) {
                    const superAdminApprovals = response.data.filter(
                        (deal: DealApproval) => deal.status === 'PendingSuperAdminApproval'
                    );
                    setPendingApprovalsCount(superAdminApprovals.length);
                }
            } catch (error) {
                console.error('Failed to load pending approvals:', error);
            }
        };
        loadPendingApprovals();
    }, [user?.token]);

    // Memoize active users percentage calculation
    const activeUsersPercentage = useMemo(() => {
        if (!statistics) return '0';
        if (statistics.totalUsers === 0) return '0';
        return ((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1);
    }, [statistics?.activeUsers, statistics?.totalUsers]);

    // Memoize dashboard cards configuration to prevent recreation on every render
    const dashboardCards: DashboardCard[] = useMemo(() => [
        {
            id: 'users',
            icon: Users,
            badge: t('allUsers'),
            title: t('viewUsers'),
            description:
                t('userAnalyticsDescription') ||
                'Dive into detailed user analytics, growth trends, activity breakdowns, and system health insights directly from the Users Management screen.',
            primaryLabel: t('viewUsers'),
            secondaryLabel: t('goToUsersAnalytics') || 'Open Users Analytics',
            path: '/admin/users',
            statLabel: t('activeUsers') || 'Active Users',
            statValue: statisticsLoading ? '...' : formatNumber(statistics?.activeUsers),
            statTrend: statistics ? `${activeUsersPercentage}% ${t('active') || 'active'}` : undefined,
            colorScheme: {
                iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
                iconColor: 'text-blue-600 dark:text-blue-400',
                borderAccent: 'border-l-blue-500',
                statBg: 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20',
            },
        },
        {
            id: 'sales-analytics',
            icon: BarChart3,
            badge: t('salesAnalytics') || 'Sales Analytics',
            title: t('salesAnalytics') || 'Sales Analytics',
            description:
                t('salesAnalyticsDescription') ||
                'View comprehensive sales statistics, performance metrics, and detailed analytics.',
            primaryLabel: t('viewSalesAnalytics') || 'View Sales Analytics',
            secondaryLabel: t('goToSalesAnalytics') || 'Open Sales Analytics',
            path: '/sales-analytics',
            colorScheme: {
                iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
                iconColor: 'text-orange-600 dark:text-orange-400',
                borderAccent: 'border-l-orange-500',
                statBg: 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/20',
            },
        },
        {
            id: 'deal-approvals',
            icon: Clock,
            badge: t('pendingDealApprovals') || 'Pending Deal Approvals',
            title: t('pendingDealApprovals') || 'Pending Deal Approvals',
            description:
                t('dealApprovalsDescription') ||
                'Review, approve, or reject high-priority deals awaiting your decision.',
            primaryLabel: t('reviewDeals') || 'Review Deals',
            path: '/super-admin/deal-approvals',
            statLabel: t('awaitingApproval') || 'Awaiting approval',
            statValue: pendingApprovalsCount,
            statTrend:
                pendingApprovalsCount > 0
                    ? `${pendingApprovalsCount} ${t(pendingApprovalsCount === 1 ? 'deal' : 'deals')}`
                    : undefined,
            colorScheme: {
                iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
                iconColor: 'text-amber-600 dark:text-amber-400',
                borderAccent: 'border-l-amber-500',
                statBg: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20',
            },
        },
        {
            id: 'products',
            icon: ShoppingCart,
            badge: t('productsCatalog') || 'Products Catalog',
            title: t('productsCatalog') || 'Products Catalog',
            description:
                t('productsCatalogDescription') ||
                'Audit product availability, pricing, and sales support materials.',
            primaryLabel: t('openCatalog') || 'Open Catalog',
            path: '/sales-support/products',
            colorScheme: {
                iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
                iconColor: 'text-indigo-600 dark:text-indigo-400',
                borderAccent: 'border-l-indigo-500',
                statBg: 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20',
            },
        },
        {
            id: 'sales-support',
            icon: Headphones,
            badge: t('salesSupportDashboard') || 'Sales Support Dashboard',
            title: t('salesSupportDashboard') || 'Sales Support Dashboard',
            description:
                t('salesSupportDashboardDescription') ||
                'Oversee sales support pipelines, requests, and resource allocation.',
            primaryLabel: t('openDashboard') || 'Open Dashboard',
            path: '/dashboard?tab=sales-support',
            colorScheme: {
                iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
                iconColor: 'text-cyan-600 dark:text-cyan-400',
                borderAccent: 'border-l-cyan-500',
                statBg: 'bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/20',
            },
        },
        {
            id: 'maintenance',
            icon: Wrench,
            badge: t('maintenanceSupport') || 'Maintenance Support',
            title: t('maintenanceSupport') || 'Maintenance Support',
            description:
                t('maintenanceSupportDescription') ||
                'Track tickets, equipment readiness, and spare parts coordination.',
            primaryLabel: t('viewMaintenance') || 'Open Maintenance',
            path: '/maintenance-support',
            colorScheme: {
                iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                borderAccent: 'border-l-emerald-500',
                statBg: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20',
            },
        },
        {
            id: 'inventory',
            icon: Warehouse,
            badge: t('inventoryManagerDashboard') || 'Inventory Manager',
            title: t('inventoryManagerDashboard') || 'Inventory Management',
            description:
                t('inventoryManagerDescription') ||
                'Monitor stock levels, logistics, and fulfillment for all warehouses.',
            primaryLabel: t('viewInventory') || 'View Inventory',
            path: '/inventory-manager',
            colorScheme: {
                iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
                iconColor: 'text-violet-600 dark:text-violet-400',
                borderAccent: 'border-l-violet-500',
                statBg: 'bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/20',
            },
        },
        {
            id: 'accounting',
            icon: DollarSign,
            badge: t('accountingDashboard') || 'Accounting Dashboard',
            title: t('accountingDashboard') || 'Accounting Dashboard',
            description:
                t('accountingDashboardDescription') ||
                'Inspect financial performance, invoicing, and payment follow-ups.',
            primaryLabel: t('openDashboard') || 'Open Dashboard',
            path: '/accounting',
            colorScheme: {
                iconBg: 'bg-green-500/10 dark:bg-green-500/20',
                iconColor: 'text-green-600 dark:text-green-400',
                borderAccent: 'border-l-green-500',
                statBg: 'bg-green-500/5 dark:bg-green-500/10 border-green-500/20',
            },
        },
    ], [
        t,
        statisticsLoading,
        statistics,
        activeUsersPercentage,
        pendingApprovalsCount,
    ]);

    // Memoize navigation handler to prevent function recreation on every render
    const handleNavigate = useCallback((path: string) => () => {
        navigate(path);
    }, [navigate]);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-wide text-muted-foreground font-semibold">
                        {t('overview') || 'Overview'}
                    </p>
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('superAdminDashboard') || 'Super Admin Dashboard'}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        {t('superAdminDashboardDescription') ||
                            'Quickly jump into every mission-critical module across the platform.'}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                {dashboardCards.map((card) => (
                    <DashboardCardComponent
                        key={card.id}
                        card={card}
                        onNavigate={handleNavigate}
                    />
                ))}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
