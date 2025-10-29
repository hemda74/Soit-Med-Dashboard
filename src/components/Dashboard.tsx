import { Calendar, History, TrendingUp, Target, FileText, Users2, Users, UserPlus, BarChart3, HeadphonesIcon, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard'
import { useSalesStore } from '@/stores/salesStore'

// Removed development-only notification debugger to clean production UI
export default function Dashboard() {
    const { hasRole } = useAuthStore()
    const { t } = useTranslation()
    const isSuperAdmin = hasRole('SuperAdmin')
    const isSalesManager = hasRole('SalesManager')
    const isSalesman = hasRole('Salesman')
    const isSalesSupport = hasRole('SalesSupport')

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
    } = useSalesStore()

    useEffect(() => {
        if (isSalesManager || isSuperAdmin) {
            getSalesManagerDashboard()
            getWeeklyPlans()
            getSalesReports()
        }
    }, [isSalesManager, isSuperAdmin, getSalesManagerDashboard, getWeeklyPlans, getSalesReports])

    const activePlans = weeklyPlans?.filter(plan => plan.status === 'Approved' || plan.status === 'Submitted') || []
    const completedPlans = weeklyPlans?.filter(plan => plan.status === 'Draft' || plan.status === 'Rejected') || []

    return (
        <div className="space-y-8">
            {/* SuperAdmin Only Content - Statistics and Charts */}
            {isSuperAdmin && (
                <SuperAdminDashboard />
            )}


            {/* Sales Manager Specific Content */}
            {(isSalesManager || isSuperAdmin) && (
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
                                            {analyticsLoading ? '-' : salesDashboard?.overview?.revenueThisMonth ? `$${Math.round(salesDashboard.overview.revenueThisMonth / 1000)}K` : '$0K'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">This Month</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Sales Targets</h3>
                                <p className="text-muted-foreground text-sm mb-4">Set and track monthly sales targets</p>
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
            )}

            {/* Salesman Specific Content */}
            {isSalesman && !isSuperAdmin && (
                <>
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            My Sales Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Manage your clients and track your sales performance
                        </p>
                    </div>

                    {/* Quick Action Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                        {/* My Clients Card */}
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">24</p>
                                    <p className="text-sm text-muted-foreground">My Clients</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">My Clients</h3>
                            <p className="text-muted-foreground text-sm mb-4">View and manage your client portfolio</p>
                            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                                View Clients
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* My Visits Card */}
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">8</p>
                                    <p className="text-sm text-muted-foreground">This Week</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">My Visits</h3>
                            <p className="text-muted-foreground text-sm mb-4">Schedule and track your client visits</p>
                            <div className="flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                                View Visits
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* My Performance Card */}
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">85%</p>
                                    <p className="text-sm text-muted-foreground">Success Rate</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">My Performance</h3>
                            <p className="text-muted-foreground text-sm mb-4">Track your sales performance and analytics</p>
                            <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                                View Analytics
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Add Client Card */}
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">+</p>
                                    <p className="text-sm text-muted-foreground">New Client</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Add Client</h3>
                            <p className="text-muted-foreground text-sm mb-4">Add new clients to your portfolio</p>
                            <div className="flex items-center text-orange-600 text-sm font-medium group-hover:text-orange-700">
                                Add Client
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Schedule Visit Card */}
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">3</p>
                                    <p className="text-sm text-muted-foreground">Today</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Schedule Visit</h3>
                            <p className="text-muted-foreground text-sm mb-4">Schedule new client visits</p>
                            <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                                Schedule Visit
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* My Reports Card */}
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">12</p>
                                    <p className="text-sm text-muted-foreground">Reports</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">My Reports</h3>
                            <p className="text-muted-foreground text-sm mb-4">View your sales reports and performance</p>
                            <div className="flex items-center text-pink-600 text-sm font-medium group-hover:text-pink-700">
                                View Reports
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

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
                                        <span className="text-sm text-foreground">New client visit completed</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-foreground">Client follow-up scheduled</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">5 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm text-foreground">New client added to portfolio</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">1 day ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Sales Support Specific Content */}
            {isSalesSupport && !isSuperAdmin && (
                <>
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {t('salesSupportDashboard')}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {t('salesSupportDashboardDescription')}
                        </p>
                    </div>

                    {/* Quick Action Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                        {/* Support Dashboard Card */}
                        <Link to="/sales-support" className="block">
                            <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        <HeadphonesIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-foreground">12</p>
                                        <p className="text-sm text-muted-foreground">Active Tickets</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                                    {t('salesSupportDashboard')}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {t('salesSupportDashboardDescription')}
                                </p>
                            </div>
                        </Link>

                        {/* Support Management Card */}
                        <Link to="/sales-support/requests" className="block">
                            <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-foreground">8</p>
                                        <p className="text-sm text-muted-foreground">Team Members</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                                    {t('salesSupportManagement')}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {t('salesSupportManagementDescription')}
                                </p>
                            </div>
                        </Link>

                        {/* Create Support User Card */}
                        <Link to="/sales-support/offer" className="block">
                            <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        <UserPlus className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-foreground">+</p>
                                        <p className="text-sm text-muted-foreground">New User</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-purple-600 transition-colors">
                                    {t('createSalesSupportUser')}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {t('salesSupportUserDescription')}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="mt-12">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-foreground">{t('recentActivity')}</h2>
                        </div>
                        <div className="bg-card rounded-xl p-6 border-2 border-border shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-foreground">New support ticket resolved</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-foreground">Customer inquiry received</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">5 hours ago</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm text-foreground">Support team meeting scheduled</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">1 day ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Non-SuperAdmin, Non-SalesManager, Non-Salesman, and Non-SalesSupport Content */}
            {
                !isSuperAdmin && !isSalesManager && !isSalesman && !isSalesSupport && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Settings className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to Soit-Med Dashboard</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                You don't have permission to view analytics and statistics.
                                Please contact your administrator if you need access to this information.
                            </p>
                        </div>
                    </div>
                )
            }

            {/* Notification debugger removed for production */}
        </div >
    )
}
