import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Calendar,
    TrendingUp,
    Target,
    Users2,
    DollarSign,
    Clock
} from 'lucide-react';
import {
    ChartBarIcon,

    HandRaisedIcon as HandshakeIconOutline
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { usePerformance } from '@/hooks/usePerformance';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent } from '@/components/ui/card';

import type { Deal } from '@/types/sales.types';
import { format } from 'date-fns';


interface SalesManStatistics {
    salesmanId: string;
    salesmanName: string;
    clientsCount: number;
    visitsCount: number;
    successRate: number;
    lastActivity?: string;
    dealsCount?: number;
    revenue?: number;
}

const UnifiedSalesManagerDashboard: React.FC = () => {
    usePerformance('UnifiedSalesManagerDashboard');
    const { t } = useTranslation();
    const { user } = useAuthStore();

    const {
        getSalesManagerDashboard,
        getWeeklyPlans,
        getDeals,
        getPendingApprovals,
        salesDashboard,
        weeklyPlans,
        deals,
        analyticsLoading,
        weeklyPlansLoading,
        dealsLoading,

    } = useSalesStore();

    // Local state
    const [salesmenStats, setSalesmenStats] = useState<SalesManStatistics[]>([]);
    const [salesmenLoading, setSalesmenLoading] = useState(false);
    const [totalClientsCount, setTotalClientsCount] = useState<number>(0);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [allDeals, setAllDeals] = useState<Deal[]>([]);
    const [allDealsLoading, setAllDealsLoading] = useState(false);
    const [currentYear] = useState<number>(new Date().getFullYear());
    const [currentQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
    const [pendingOffersCount, setPendingOffersCount] = useState<number>(0);
    const [pendingOffersLoading, setPendingOffersLoading] = useState(false);
    const [moneyTargets, setMoneyTargets] = useState<any[]>([]);
    const [targetsLoading, setTargetsLoading] = useState(false);

    // Fetch all salesmen statistics
    const fetchSalesmenStatistics = useCallback(async () => {
        try {
            setSalesmenLoading(true);
            const response = await salesApi.getAllSalesManStatistics(currentYear, currentQuarter);
            if (response.success && response.data) {
                const stats: SalesManStatistics[] = response.data.map((stat: any) => ({
                    salesmanId: stat.salesmanId || stat.id,
                    salesmanName: stat.salesmanName || stat.name || 'Unknown',
                    clientsCount: stat.clientsCount || stat.totalClients || 0,
                    visitsCount: stat.visitsCount || stat.totalVisits || 0,
                    successRate: stat.successRate || stat.performancePercentage || 0,
                    lastActivity: stat.lastActivity,
                    dealsCount: stat.dealsCount || stat.totalDeals || 0,
                    revenue: stat.revenue || stat.totalRevenue || 0,
                }));
                setSalesmenStats(stats);
            }
        } catch (error) {
            console.error('Failed to fetch salesmen statistics:', error);
        } finally {
            setSalesmenLoading(false);
        }
    }, [currentYear, currentQuarter]);

    // Fetch money targets
    const fetchMoneyTargets = useCallback(async () => {
        try {
            setTargetsLoading(true);
            const salesmenResponse = await salesApi.getOfferSalesmen();
            if (!salesmenResponse.success || !salesmenResponse.data) {
                return;
            }

            const allTargets: any[] = [];
            for (const salesman of salesmenResponse.data) {
                try {
                    const response = await salesApi.getSalesManTargets(salesman.id, currentYear);
                    if (response.success && response.data) {
                        allTargets.push(...response.data);
                    }
                } catch {
                    // Continue if one fails
                }
            }

            try {
                const teamResponse = await salesApi.getTeamTarget(currentYear, currentQuarter);
                if (teamResponse.success && teamResponse.data) {
                    allTargets.push(teamResponse.data);
                }
            } catch {
                // Team target might not exist
            }

            const moneyTargetsList = allTargets.filter((target: any) => target.targetType === 1);
            setMoneyTargets(moneyTargetsList);
        } catch {
            console.error('Failed to fetch money targets:');
        } finally {
            setTargetsLoading(false);
        }
    }, [currentYear, currentQuarter]);

    // Fetch total clients count
    const fetchTotalClientsCount = useCallback(async () => {
        try {
            setClientsLoading(true);
            // Use searchClients with pageSize=1 to get totalCount without loading all clients
            const response = await salesApi.searchClients({ page: 1, pageSize: 1 });
            if (response.success && response.data) {
                setTotalClientsCount(response.data.totalCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch total clients count:', error);
        } finally {
            setClientsLoading(false);
        }
    }, []);

    // Fetch all deals for revenue calculation
    const fetchAllDeals = useCallback(async () => {
        try {
            setAllDealsLoading(true);
            // Get all deals (no status filter) to calculate total revenue
            const response = await salesApi.getDeals({});
            if (response.success && response.data) {
                setAllDeals(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch all deals:', error);
        } finally {
            setAllDealsLoading(false);
        }
    }, []);

    // Load pending offer approvals count
    const loadPendingOfferApprovals = useCallback(async () => {
        if (!user?.token) return;
        try {
            setPendingOffersLoading(true);
            const response = await salesApi.getPendingSalesManagerApprovals();
            if (response.success && response.data) {
                setPendingOffersCount(response.data.length || 0);
            }
        } catch (error) {
            console.error('Failed to load pending offer approvals:', error);
        } finally {
            setPendingOffersLoading(false);
        }
    }, [user?.token]);

    // Initial data fetch
    useEffect(() => {
        getSalesManagerDashboard(currentYear, currentQuarter);
        getWeeklyPlans({ page: 1, pageSize: 100 });
        getDeals({ status: 'PendingManagerApproval' });
        getPendingApprovals();
        fetchSalesmenStatistics();
        fetchMoneyTargets();
        fetchTotalClientsCount();
        fetchAllDeals();
        loadPendingOfferApprovals();
    }, [
        currentYear,
        currentQuarter,
        getSalesManagerDashboard,
        getWeeklyPlans,
        getDeals,
        getPendingApprovals,
        fetchSalesmenStatistics,
        fetchMoneyTargets,
        fetchTotalClientsCount,
        fetchAllDeals,
        loadPendingOfferApprovals
    ]);

    // Memoized calculations
    const activePlans = useMemo(() =>
        weeklyPlans?.filter(plan =>
            plan.status === 'Approved' ||
            plan.status === 'Submitted'
        ) || [],
        [weeklyPlans]
    );


    const teamPerformancePercentage = useMemo(() => {
        if (!salesDashboard?.overview?.teamPerformance) {
            const avgSuccessRate = (salesDashboard as any)?.averageSuccessRate;
            if (avgSuccessRate) {
                return Number(avgSuccessRate.toFixed(0));
            }
            // Calculate from salesmen stats
            if (salesmenStats.length > 0) {
                const avg = salesmenStats.reduce((sum, stat) => sum + stat.successRate, 0) / salesmenStats.length;
                return Number(avg.toFixed(0));
            }
            return 0;
        }
        return Number(salesDashboard.overview.teamPerformance.toFixed(0));
    }, [salesDashboard, salesmenStats]);

    const salesmenCount = useMemo(() => {
        if (salesmenStats.length > 0) return salesmenStats.length;
        if (salesDashboard?.teamPerformance && Array.isArray(salesDashboard.teamPerformance)) {
            return salesDashboard.teamPerformance.length;
        }
        if ((salesDashboard as any)?.salesmen && Array.isArray((salesDashboard as any).salesmen)) {
            return (salesDashboard as any).salesmen.length;
        }
        return 0;
    }, [salesDashboard, salesmenStats]);

    const totalClients = useMemo(() => {
        // Use real API data first
        if (totalClientsCount > 0) {
            return totalClientsCount;
        }
        // Fallback to dashboard data
        if (salesDashboard?.overview?.totalClients) {
            return salesDashboard.overview.totalClients;
        }
        // Fallback to sum from salesmen stats
        return salesmenStats.reduce((sum, stat) => sum + stat.clientsCount, 0);
    }, [totalClientsCount, salesDashboard, salesmenStats]);

    // Note: SalesManager approval for deals removed - deals go directly to SuperAdmin
    // This count is kept for backward compatibility with existing deals
    const pendingDealsCount = useMemo(() => {
        return deals.filter(d => d.status === 'PendingManagerApproval').length;
    }, [deals]);

    const totalRevenue = useMemo(() => {
        // Use all deals for accurate revenue calculation
        const successDeals = allDeals.length > 0
            ? allDeals.filter(d => d.status === 'Success' || d.status === 'Approved')
            : deals.filter(d => d.status === 'Success' || d.status === 'Approved');

        return successDeals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
    }, [allDeals, deals]);




    if (analyticsLoading && weeklyPlansLoading && salesmenLoading && clientsLoading && allDealsLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t('loadingDashboard') || 'Loading dashboard...'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {t('salesManagerDashboard') || 'Sales Manager Dashboard'}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {t('salesManagerDashboardDescription') || 'Manage your sales team and track performance'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome back, {user?.firstName} {user?.lastName}
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
                </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
                {/* Total Clients Card */}
                <Link to="/SalesManager/clients" className="block">
                    <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <ChartBarIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {clientsLoading || analyticsLoading ? '-' : totalClients.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('totalClients')}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('allClients')}</h3>
                            <p className="text-muted-foreground text-sm">{t('viewAndManageAllTeamClients')}</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Pending Deals Card */}
                <Link to="/SalesManager/deal-approvals" className="block">
                    <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <HandshakeIconOutline className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {dealsLoading ? '-' : pendingDealsCount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('pendingDeals')}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('dealApprovals')}</h3>
                            <p className="text-muted-foreground text-sm">{t('reviewAndApprovePendingDeals')}</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Pending Offer Approvals Card */}
                <Link to="/SalesManager/offer-approvals" className="block">
                    <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {pendingOffersLoading ? '-' : pendingOffersCount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('pendingOffers')}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('offerApprovals')}</h3>
                            <p className="text-muted-foreground text-sm">{t('reviewAndApprovePendingOffers')}</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Total Revenue Card */}
                <Card className="border-2 border-border shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">
                                    {allDealsLoading ? '-' : `EGP ${totalRevenue.toLocaleString()}`}
                                </p>
                                <p className="text-sm text-muted-foreground">{t('totalRevenue')}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{t('revenue')}</h3>
                        <p className="text-muted-foreground text-sm">{t('totalSuccessfulDealsRevenue')}</p>
                    </CardContent>
                </Card>

                {/* Team Performance Card */}
                <Link to="/SalesManager" className="block">
                    <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {analyticsLoading ? '-' : `${teamPerformancePercentage}%`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('targetMet')}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('teamPerformance')}</h3>
                            <p className="text-muted-foreground text-sm">{t('monitorTeamPerformanceMetrics')}</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Weekly Plans Card */}
                <Link to="/weekly-plans" className="block">
                    <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {weeklyPlansLoading ? '-' : activePlans.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('activePlans')}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('weeklyPlans')}</h3>
                            <p className="text-muted-foreground text-sm">{t('viewAndManageWeeklySalesPlans')}</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Sales Targets Card */}
                <Link to="/SalesManager/targets" className="block">
                    <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {targetsLoading ? '-' : moneyTargets.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('moneyTargets')}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('salesTargets')}</h3>
                            <p className="text-muted-foreground text-sm">{t('setAndTrackMoneyTargets')}</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Team Members Card */}
                <Link to="/Admin/users" className="block">
                    <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Users2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {salesmenLoading ? '-' : salesmenCount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('teamMembers')}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('teamManagement')}</h3>
                            <p className="text-muted-foreground text-sm">{t('manageYourSalesTeamMembers')}</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>


        </div>
    );
};

export default UnifiedSalesManagerDashboard;

