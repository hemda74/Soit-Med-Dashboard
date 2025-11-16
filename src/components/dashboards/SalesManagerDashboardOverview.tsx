import React, { useEffect, useState } from 'react';
import { Calendar, History, TrendingUp, Target, FileText, Users2, BarChart3, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSalesStore } from '@/stores/salesStore';
import { useAuthStore } from '@/stores/authStore';
import { salesApi } from '@/services/sales/salesApi';
import SalesManagerDealApprovals from '@/components/dashboards/SalesManagerDealApprovals';
import SuperAdminDealApprovals from '@/components/dashboards/SuperAdminDealApprovals';
import { usePerformance } from '@/hooks/usePerformance';

interface SalesManagerDashboardOverviewProps {
    isSuperAdmin?: boolean;
}

const SalesManagerDashboardOverview: React.FC<SalesManagerDashboardOverviewProps> = ({ isSuperAdmin = false }) => {
    usePerformance('SalesManagerDashboardOverview');
    const {
        getSalesManagerDashboard,
        getWeeklyPlans,
        getSalesReports,
        salesDashboard,
        weeklyPlans,
        salesReports,
        analyticsLoading,
        weeklyPlansLoading,
        reportsLoading
    } = useSalesStore();

    const [moneyTargets, setMoneyTargets] = useState<any[]>([]);
    const [targetsLoading, setTargetsLoading] = useState(false);

    useEffect(() => {
        getSalesManagerDashboard();
        getWeeklyPlans();
        getSalesReports();
        fetchMoneyTargets();
    }, [getSalesManagerDashboard, getWeeklyPlans, getSalesReports]);

    const fetchMoneyTargets = async () => {
        try {
            setTargetsLoading(true);
            const currentYear = new Date().getFullYear();
            const currentQuarter = Math.floor((new Date().getMonth()) / 3) + 1;

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
    };

    const activePlans = weeklyPlans?.filter(plan => plan.status === 'Approved' || plan.status === 'Submitted') || [];
    const completedPlans = weeklyPlans?.filter(plan => plan.status === 'Draft' || plan.status === 'Rejected') || [];

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    {isSuperAdmin ? 'Sales Management Dashboard' : 'Sales Manager Dashboard'}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {isSuperAdmin
                        ? 'Overview of sales management and team performance'
                        : 'Manage your sales team and track performance'
                    }
                </p>
            </div>

            {/* Quick Action Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                {/* View Weekly Plans Card */}
                <Link to="/weekly-plans" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">
                                    {analyticsLoading || weeklyPlansLoading ? '-' : activePlans.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Active Plans</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Weekly Plans</h3>
                        <p className="text-muted-foreground text-sm mb-4">View and manage weekly sales plans for your team</p>
                        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                            View Plans
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* View History Card */}
                <Link to="/sales-reports" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">
                                    {analyticsLoading || weeklyPlansLoading ? '-' : completedPlans.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Sales Reports</h3>
                        <p className="text-muted-foreground text-sm mb-4">Review past sales performance and achievements</p>
                        <div className="flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                            View History
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Team Performance Card */}
                <Link to="/sales-manager" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">
                                    {analyticsLoading ? '-' : salesDashboard?.overview?.teamPerformance?.toFixed(0) || '0'}%
                                </p>
                                <p className="text-sm text-muted-foreground">Target Met</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Team Performance</h3>
                        <p className="text-muted-foreground text-sm mb-4">Monitor your sales team's performance metrics</p>
                        <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                            View Analytics
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Sales Targets Card */}
                <Link to="/sales-manager/targets" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
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
                        <p className="text-muted-foreground text-sm mb-4">Set and track money targets for salesmen</p>
                        <div className="space-y-2 mb-4">
                            {moneyTargets.length > 0 ? (
                                <>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            Total Set:
                                        </span>
                                        <span className="font-semibold">{moneyTargets.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Total Target:</span>
                                        <span className="font-semibold">
                                            ${moneyTargets.reduce((sum: number, target: any) => sum + (target.targetRevenue || 0), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No money targets set yet</p>
                            )}
                        </div>
                        <div className="flex items-center text-orange-600 text-sm font-medium group-hover:text-orange-700">
                            Manage Targets
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Reports Card */}
                <Link to="/sales-manager/reports-review" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">
                                    {reportsLoading ? '-' : salesReports?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Reports</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Sales Reports</h3>
                        <p className="text-muted-foreground text-sm mb-4">Generate and view detailed sales reports</p>
                        <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                            View Reports
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Sales Statistics Card */}
                <Link to="/sales-statistics" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">
                                    {analyticsLoading ? '-' : salesDashboard?.teamPerformance?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Salesmen</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Sales Statistics</h3>
                        <p className="text-muted-foreground text-sm mb-4">View detailed sales statistics and performance</p>
                        <div className="flex items-center text-cyan-600 text-sm font-medium group-hover:text-cyan-700">
                            View Statistics
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Team Members Card */}
                <Link to="/admin/users" className="block">
                    <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <Users2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-foreground">
                                    {analyticsLoading ? '-' : salesDashboard?.teamPerformance?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Team Members</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Team Management</h3>
                        <p className="text-muted-foreground text-sm mb-4">Manage your sales team members and assignments</p>
                        <div className="flex items-center text-pink-600 text-sm font-medium group-hover:text-pink-700">
                            Manage Team
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Deal Approvals Section */}
            {!isSuperAdmin && (
                <div className="mt-8">
                    <SalesManagerDealApprovals />
                </div>
            )}

            {isSuperAdmin && (
                <div className="mt-8">
                    <SuperAdminDealApprovals />
                </div>
            )}

            {/* Recent Activity Section */}
            <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
                </div>
                <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-foreground">New weekly plan created by John Doe</span>
                            </div>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-foreground">Sales target updated for Q4</span>
                            </div>
                            <span className="text-xs text-muted-foreground">5 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-foreground">Monthly report generated</span>
                            </div>
                            <span className="text-xs text-muted-foreground">1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalesManagerDashboardOverview;

