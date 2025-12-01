import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
    Calendar, 
    History, 
    TrendingUp, 
    Target, 
    FileText, 
    Users2, 
    BarChart3, 
    DollarSign,
    Handshake,
    Clock
} from 'lucide-react';
import {
    ChartBarIcon,
    UserGroupIcon,
    HandRaisedIcon as HandshakeIconOutline
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import { usePerformance } from '@/hooks/usePerformance';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealApprovalForm from '@/components/sales/DealApprovalForm';
import type { Deal } from '@/types/sales.types';
import { format } from 'date-fns';
import { Volume2 } from 'lucide-react';
import { getStaticFileUrl } from '@/utils/apiConfig';

interface SalesmanStatistics {
    salesmanId: string;
    salesmanName: string;
    clientsCount: number;
    visitsCount: number;
    successRate: number;
    lastActivity?: string;
    dealsCount?: number;
    revenue?: number;
}

interface TeamPerformance {
    salesmanName: string;
    clientsCount: number;
    visitsCount: number;
    successRate: number;
    lastActivity?: string;
}

const UnifiedSalesManagerDashboard: React.FC = () => {
    usePerformance('UnifiedSalesManagerDashboard');
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const {
        getSalesManagerDashboard,
        getWeeklyPlans,
        reviewWeeklyPlan,
        getDeals,
        getPendingApprovals,
        salesDashboard,
        weeklyPlans,
        deals,
        analyticsLoading,
        weeklyPlansLoading,
        dealsLoading,
        weeklyPlansError,
        dealsError
    } = useSalesStore();

    // Local state
    const [salesmenStats, setSalesmenStats] = useState<SalesmanStatistics[]>([]);
    const [salesmenLoading, setSalesmenLoading] = useState(false);
    const [moneyTargets, setMoneyTargets] = useState<any[]>([]);
    const [targetsLoading, setTargetsLoading] = useState(false);
    const [totalClientsCount, setTotalClientsCount] = useState<number>(0);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [allDeals, setAllDeals] = useState<Deal[]>([]);
    const [allDealsLoading, setAllDealsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [reviewComment, setReviewComment] = useState('');
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [showDealApproval, setShowDealApproval] = useState(false);
    const [activeTab, setActiveTab] = useState('team');
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentQuarter, setCurrentQuarter] = useState(Math.floor((new Date().getMonth()) / 3) + 1);
    const [pendingOffersCount, setPendingOffersCount] = useState<number>(0);
    const [pendingOffersLoading, setPendingOffersLoading] = useState(false);

    // Fetch all salesmen statistics
    const fetchSalesmenStatistics = useCallback(async () => {
        try {
            setSalesmenLoading(true);
            const response = await salesApi.getAllSalesmanStatistics(currentYear, currentQuarter);
            if (response.success && response.data) {
                const stats: SalesmanStatistics[] = response.data.map((stat: any) => ({
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
                    const response = await salesApi.getSalesmanTargets(salesman.id, currentYear);
                    if (response.success && response.data) {
                        allTargets.push(...response.data);
                    }
                } catch (error) {
                    // Continue if one fails
                }
            }

            try {
                const teamResponse = await salesApi.getTeamTarget(currentYear, currentQuarter);
                if (teamResponse.success && teamResponse.data) {
                    allTargets.push(teamResponse.data);
                }
            } catch (error) {
                // Team target might not exist
            }

            const moneyTargetsList = allTargets.filter((target: any) => target.targetType === 1);
            setMoneyTargets(moneyTargetsList);
        } catch (error) {
            console.error('Failed to fetch money targets:', error);
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
            plan.status === 'Submitted' || 
            plan.status === 'PendingReview' ||
            plan.status === 'PendingApproval'
        ) || [],
        [weeklyPlans]
    );

    const completedPlans = useMemo(() => 
        weeklyPlans?.filter(plan => plan.status === 'Completed') || [],
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

    // Handlers
    const handlePlanReview = async (planId: number) => {
        try {
            await reviewWeeklyPlan(planId, {
                comment: reviewComment,
            });
            setSelectedPlan(null);
            setReviewComment('');
            getWeeklyPlans();
        } catch (error) {
            console.error('Error reviewing plan:', error);
        }
    };

    const handleDealApproval = (deal: Deal) => {
        setSelectedDeal(deal);
        setShowDealApproval(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'Rejected':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'Submitted':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'Draft':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    const getDealStatusColor = (status: string) => {
        switch (status) {
            case 'PendingManagerApproval':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'PendingSuperAdminApproval':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'Approved':
            case 'Success':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'Failed':
            case 'Rejected':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    const safeFormatDate = (date: any, fallback: string = 'N/A'): string => {
        if (!date) return fallback;
        try {
            const parsed = new Date(date);
            if (isNaN(parsed.getTime())) return fallback;
            return format(parsed, 'MMM dd, yyyy');
        } catch {
            return fallback;
        }
    };

    if (analyticsLoading && weeklyPlansLoading && salesmenLoading && clientsLoading && allDealsLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t('loadingDashboard') || 'Loading dashboard...'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
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
                <Link to="/sales-manager/clients" className="block">
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
                                    <p className="text-sm text-muted-foreground">Total Clients</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">All Clients</h3>
                            <p className="text-muted-foreground text-sm">View and manage all team clients</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Pending Deals Card */}
                <Link to="/sales-manager/deal-approvals" className="block">
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
                                    <p className="text-sm text-muted-foreground">Pending Deals</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Deal Approvals</h3>
                            <p className="text-muted-foreground text-sm">Review and approve pending deals</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Pending Offer Approvals Card */}
                <Link to="/sales-manager/offer-approvals" className="block">
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
                                    <p className="text-sm text-muted-foreground">Pending Offers</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Offer Approvals</h3>
                            <p className="text-muted-foreground text-sm">Review and approve pending offers</p>
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
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Revenue</h3>
                        <p className="text-muted-foreground text-sm">Total successful deals revenue</p>
                    </CardContent>
                </Card>

                {/* Team Performance Card */}
                <Link to="/sales-manager" className="block">
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
                                    <p className="text-sm text-muted-foreground">Target Met</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Team Performance</h3>
                            <p className="text-muted-foreground text-sm">Monitor team performance metrics</p>
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
                                    <p className="text-sm text-muted-foreground">Active Plans</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Weekly Plans</h3>
                            <p className="text-muted-foreground text-sm">View and manage weekly sales plans</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Sales Targets Card */}
                <Link to="/sales-manager/targets" className="block">
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
                                    <p className="text-sm text-muted-foreground">Money Targets</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Sales Targets</h3>
                            <p className="text-muted-foreground text-sm">Set and track money targets</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Team Members Card */}
                <Link to="/admin/users" className="block">
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
                                    <p className="text-sm text-muted-foreground">Team Members</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Team Management</h3>
                            <p className="text-muted-foreground text-sm">Manage your sales team members</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="team">{t('teamPerformance') || 'Team Performance'}</TabsTrigger>
                    <TabsTrigger value="deals">{t('pendingDealApprovals') || 'Deal Approvals'}</TabsTrigger>
                    <TabsTrigger value="plans">{t('weeklyPlans') || 'Weekly Plans'}</TabsTrigger>
                    <TabsTrigger value="reports">{t('reports') || 'Reports'}</TabsTrigger>
                </TabsList>

                {/* Team Performance Tab */}
                <TabsContent value="team" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserGroupIcon className="h-5 w-5 mr-2" />
                                {t('teamPerformance') || 'Team Performance'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {salesmenLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : salesmenStats.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {salesmenStats.map((member, index) => (
                                        <div
                                            key={member.salesmanId || index}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {member.salesmanName}
                                                </h3>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {member.successRate.toFixed(1)}% success
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <div>
                                                    <span className="font-medium">{member.clientsCount}</span> clients
                                                </div>
                                                <div>
                                                    <span className="font-medium">{member.visitsCount}</span> visits
                                                </div>
                                                {member.dealsCount !== undefined && (
                                                    <div>
                                                        <span className="font-medium">{member.dealsCount}</span> deals
                                                    </div>
                                                )}
                                                {member.revenue !== undefined && (
                                                    <div>
                                                        <span className="font-medium">EGP {member.revenue.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {member.lastActivity && (
                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    Last activity: {safeFormatDate(member.lastActivity)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {t('noTeamData') || 'No team data available'}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Deal Approvals Tab */}
                <TabsContent value="deals" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <HandshakeIconOutline className="h-5 w-5 mr-2" />
                                {t('pendingDealApprovals') || 'Pending Deal Approvals'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dealsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : dealsError ? (
                                <div className="text-center py-8 text-red-500 dark:text-red-400">
                                    {dealsError}
                                </div>
                            ) : deals.filter(d => d.status === 'PendingManagerApproval').length > 0 ? (
                                // Note: This section shows deals pending manager approval (backward compatibility only)
                                // New deals go directly to SuperAdmin approval
                                <div className="space-y-4">
                                    {deals
                                        .filter(deal => deal.status === 'PendingManagerApproval')
                                        .map((deal) => (
                                            <div
                                                key={deal.id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {deal.clientName}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {deal.dealDescription}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {t('createdBy') || 'Created by'}: {deal.createdByName} • {deal.createdAt ? format(new Date(deal.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <Badge className={getDealStatusColor(deal.status)}>
                                                        {deal.status.replace(/([A-Z])/g, ' $1').trim()}
                                                    </Badge>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        <strong>{t('dealValue') || 'Deal Value'}:</strong> EGP {deal.dealValue.toLocaleString()}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() => handleDealApproval(deal)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            {t('reviewDeal') || 'Review Deal'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {t('noDealsPendingApproval') || 'No deals pending approval'}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Weekly Plans Tab */}
                <TabsContent value="plans" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                {t('weeklyPlansPendingApproval') || 'Weekly Plans Pending Approval'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {weeklyPlansLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : weeklyPlansError ? (
                                <div className="text-center py-8 text-red-500 dark:text-red-400">
                                    {weeklyPlansError}
                                </div>
                            ) : weeklyPlans.filter(plan => plan.status === 'Submitted').length > 0 ? (
                                <div className="space-y-4">
                                    {weeklyPlans
                                        .filter(plan => plan.status === 'Submitted')
                                        .map((plan) => (
                                            <div
                                                key={plan.id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {plan.planTitle}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {plan.employeeName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {plan.weekStartDate ? format(new Date(plan.weekStartDate), 'MMM dd') : 'N/A'} - {plan.weekEndDate ? format(new Date(plan.weekEndDate), 'MMM dd, yyyy') : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(plan.status)}>
                                                        {plan.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {plan.tasks?.length || 0} tasks
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() => setSelectedPlan(plan)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            {t('review') || 'Review'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    {t('noPlansPendingApproval') || 'No plans pending approval'}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                    <Card>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Deal Approval Modal */}
            {showDealApproval && selectedDeal && (
                <DealApprovalForm
                    deal={selectedDeal}
                    onSuccess={() => {
                        setShowDealApproval(false);
                        setSelectedDeal(null);
                        // Note: SalesManager approval removed - this is for backward compatibility only
                        getDeals({ status: 'PendingManagerApproval' });
                    }}
                    onCancel={() => {
                        setShowDealApproval(false);
                        setSelectedDeal(null);
                    }}
                />
            )}

            {/* Plan Review Modal */}
            {selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {t('reviewWeeklyPlan') || 'Review Weekly Plan'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedPlan.planTitle} by {selectedPlan.employeeName}
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('reviewComment') || 'Review Comment'}
                                    </label>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder={t('addReviewComments') || 'Add your review comments...'}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                    />
                                </div>

                                {selectedPlan.tasks && selectedPlan.tasks.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('tasks') || 'Tasks'} ({selectedPlan.tasks.length})
                                        </label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedPlan.tasks.map((task: any, index: number) => (
                                                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-sm dark:text-gray-100">{task.title}</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">{task.description}</p>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs ${task.priority === 'High'
                                                                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                                    : task.priority === 'Medium'
                                                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            }`}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}
                                                    </p>
                                                    {task.progresses && task.progresses.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {task.progresses.map((progress: any, pIndex: number) => (
                                                                <div key={pIndex} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                                    <span className="mr-1">{format(new Date(progress.progressDate), 'MMM dd')} - {progress.progressType}:</span>
                                                                    {progress.description && <span className="mr-1">{progress.description}</span>}
                                                                    {progress.voiceDescriptionUrl && (
                                                                        <div className="flex items-center space-x-1 ml-1">
                                                                            <Volume2 className="h-3 w-3" />
                                                                            <audio 
                                                                                controls 
                                                                                className="h-6 max-w-[200px]"
                                                                                preload="metadata"
                                                                            >
                                                                                <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/mp4" />
                                                                                <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/mpeg" />
                                                                                <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/wav" />
                                                                                <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/m4a" />
                                                                                <source src={getStaticFileUrl(progress.voiceDescriptionUrl)} type="audio/ogg" />
                                                                            </audio>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <div className="flex justify-end space-x-3">
                                <Button
                                    onClick={() => {
                                        setSelectedPlan(null);
                                        setReviewComment('');
                                    }}
                                    variant="outline"
                                >
                                    {t('cancel') || 'Cancel'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handlePlanReview(selectedPlan.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {t('submitReview') || 'Submit Review'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedSalesManagerDashboard;

