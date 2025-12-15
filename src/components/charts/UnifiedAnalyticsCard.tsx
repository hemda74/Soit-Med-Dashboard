import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useState } from "react";
import { useStatistics, useStatisticsLoading, useStatisticsError } from "@/stores/statisticsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, XCircle, Users, Building2, Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function UnifiedAnalyticsCard() {
    // Use statistics store instead of local state
    const statistics = useStatistics();
    const loading = useStatisticsLoading();
    const error = useStatisticsError();
    const [activeTab, setActiveTab] = useState<'departments' | 'roles' | 'status'>('departments');
    const { t, language } = useTranslation();

    // Prepare chart data
    const departmentData = statistics?.usersByDepartment ? {
        labels: Object.keys(statistics.usersByDepartment),
        series: Object.values(statistics.usersByDepartment),
        total: Object.values(statistics.usersByDepartment).reduce((sum, count) => sum + count, 0)
    } : null;

    const roleData = statistics?.usersByRoleBreakdown ? {
        labels: Object.keys(statistics.usersByRoleBreakdown),
        series: Object.values(statistics.usersByRoleBreakdown),
        total: Object.values(statistics.usersByRoleBreakdown).reduce((sum, count) => sum + count, 0)
    } : null;

    const statusData = statistics ? {
        labels: [t('activeUsers'), t('inactiveUsers')],
        series: [statistics.activeUsers, statistics.inactiveUsers],
        total: statistics.totalUsers,
        activePercentage: statistics.totalUsers > 0 ? ((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1) : "0"
    } : null;

    const getChartOptions = (data: any, colors: string[]): ApexOptions => ({
        colors: colors,
        chart: {
            fontFamily: language === 'ar' ? "Cairo, Inter, sans-serif" : "Inter, sans-serif",
            type: "donut",
        },
        labels: data?.labels || [],
        legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            fontFamily: "Inter",
            fontSize: "12px",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "75%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: t('total'),
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#374151",
                            formatter: function () {
                                return data?.total?.toString() || "0";
                            },
                        },
                        value: {
                            show: true,
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "#1f2937",
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: "10px",
                fontWeight: 600,
            },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: (val: number) => `${val} ${t('users')}`,
            },
        },
    });

    const departmentOptions = getChartOptions(departmentData, ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]);
    const roleOptions = getChartOptions(roleData, ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1", "#14b8a6", "#f43f5e", "#8b5cf6"]);
    const statusOptions = getChartOptions(statusData, ["#10b981", "#ef4444"]);

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {t('analyticsDashboard')}
                    </CardTitle>
                    <CardDescription>
                        {t('analyticsDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t('loadingAnalyticsData')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {t('analyticsDashboard')}
                    </CardTitle>
                    <CardDescription>
                        {t('analyticsDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-2 border-border shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    {t('analyticsDashboard')}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                    {t('analyticsDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Tab Navigation */}
                <div className={`flex ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} bg-muted/50 dark:bg-muted/30 p-1.5 rounded-xl border border-border/50`}>
                    <button
                        onClick={() => setActiveTab('departments')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'departments'
                            ? 'bg-card text-foreground shadow-md border border-primary/20 scale-[1.02]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                            }`}
                    >
                        <Building2 className={`w-4 h-4 ${activeTab === 'departments' ? 'text-primary' : ''}`} />
                        {t('departments')}
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'roles'
                            ? 'bg-card text-foreground shadow-md border border-primary/20 scale-[1.02]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                            }`}
                    >
                        <Shield className={`w-4 h-4 ${activeTab === 'roles' ? 'text-primary' : ''}`} />
                        {t('roles')}
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'status'
                            ? 'bg-card text-foreground shadow-md border border-primary/20 scale-[1.02]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                            }`}
                    >
                        <Users className={`w-4 h-4 ${activeTab === 'status' ? 'text-primary' : ''}`} />
                        {t('status')}
                    </button>
                </div>

                {/* Chart Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'departments' && departmentData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart - 50% */}
                            <div className="flex items-center justify-center">
                                <Chart
                                    options={departmentOptions}
                                    series={departmentData.series}
                                    type="donut"
                                    height={380}
                                />
                            </div>
                            {/* Breakdown - 50% */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    {t('departmentBreakdown')}
                                </h4>
                                <div className="space-y-2">
                                    {departmentData.labels.map((department, index) => {
                                        const count = departmentData.series[index];
                                        const percentage = departmentData.total > 0 ? ((count / departmentData.total) * 100).toFixed(1) : "0";
                                        return (
                                            <div key={department} className={`flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex items-center ${language === 'ar' ? 'gap-2 flex-row-reverse' : 'gap-2'}`}>
                                                    <div
                                                        className="w-3 h-3 rounded-full shadow-sm"
                                                        style={{ backgroundColor: departmentOptions.colors?.[index] || "#3b82f6" }}
                                                    ></div>
                                                    <span className="text-sm font-medium text-foreground truncate">{department}</span>
                                                </div>
                                                <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-sm font-bold text-foreground">{count}</span>
                                                    <span className={`text-xs text-muted-foreground font-medium min-w-[3rem] ${language === 'ar' ? 'text-left' : 'text-right'}`}>{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && roleData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart - 50% */}
                            <div className="flex items-center justify-center">
                                <Chart
                                    options={roleOptions}
                                    series={roleData.series}
                                    type="donut"
                                    height={380}
                                />
                            </div>
                            {/* Breakdown - 50% */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    {t('roleBreakdown')}
                                </h4>
                                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-2">
                                    {roleData.labels.map((role, index) => {
                                        const count = roleData.series[index];
                                        const percentage = roleData.total > 0 ? ((count / roleData.total) * 100).toFixed(1) : "0";
                                        return (
                                            <div key={role} className={`flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex items-center ${language === 'ar' ? 'gap-2 flex-row-reverse' : 'gap-2'}`}>
                                                    <div
                                                        className="w-3 h-3 rounded-full shadow-sm"
                                                        style={{ backgroundColor: roleOptions.colors?.[index] || "#3b82f6" }}
                                                    ></div>
                                                    <span className="text-sm font-medium text-foreground truncate">{role}</span>
                                                </div>
                                                <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-sm font-bold text-foreground">{count}</span>
                                                    <span className={`text-xs text-muted-foreground font-medium min-w-[3rem] ${language === 'ar' ? 'text-left' : 'text-right'}`}>{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && statusData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart - 50% */}
                            <div className="flex items-center justify-center">
                                <Chart
                                    options={statusOptions}
                                    series={statusData.series}
                                    type="donut"
                                    height={380}
                                />
                            </div>
                            {/* Breakdown - 50% */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    {t('statusOverview')}
                                </h4>

                                {/* Active Users */}
                                <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 rounded-xl border-2 border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-all ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center ${language === 'ar' ? 'gap-3 flex-row-reverse' : 'gap-3'}`}>
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">{t('activeUsers')}</p>
                                            <p className="text-xs text-green-700 dark:text-green-300">{t('currentlyActiveInSystem')}</p>
                                        </div>
                                    </div>
                                    <div className={`text-right ${language === 'ar' ? 'text-left' : ''}`}>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{statistics?.activeUsers}</p>
                                        <p className="text-xs font-medium text-green-700 dark:text-green-300">{statusData.activePercentage}%</p>
                                    </div>
                                </div>

                                {/* Inactive Users */}
                                <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 rounded-xl border-2 border-red-200/50 dark:border-red-800/30 shadow-sm hover:shadow-md transition-all ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center ${language === 'ar' ? 'gap-3 flex-row-reverse' : 'gap-3'}`}>
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                                            <XCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-red-900 dark:text-red-100">{t('inactiveUsers')}</p>
                                            <p className="text-xs text-red-700 dark:text-red-300">{t('currentlyInactiveInSystem')}</p>
                                        </div>
                                    </div>
                                    <div className={`text-right ${language === 'ar' ? 'text-left' : ''}`}>
                                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">{statistics?.inactiveUsers}</p>
                                        <p className="text-xs font-medium text-red-700 dark:text-red-300">{((statistics?.inactiveUsers || 0) / (statistics?.totalUsers || 1) * 100).toFixed(1)}%</p>
                                    </div>
                                </div>

                                {/* Success Rate */}
                                <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center ${language === 'ar' ? 'gap-3 flex-row-reverse' : 'gap-3'}`}>
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                            <span className="text-sm text-white font-bold">%</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{t('successRate')}</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">{t('activeUsersPercentage')}</p>
                                        </div>
                                    </div>
                                    <div className={`text-right ${language === 'ar' ? 'text-left' : ''}`}>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statusData.activePercentage}%</p>
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{t('excellent')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
