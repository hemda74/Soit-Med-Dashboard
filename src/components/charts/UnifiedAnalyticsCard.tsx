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

    const getChartOptions = (data: { labels: string[]; series: number[]; total?: number } | null, colors: string[]): ApexOptions => ({
        colors: colors,
        chart: {
            fontFamily: language === 'ar' ? "Cairo, Inter, sans-serif" : "Inter, sans-serif",
            type: "donut",
            height: 250,
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
                    size: "60%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: t('total'),
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#374151",
                            formatter: function () {
                                return data?.total?.toString() || "0";
                            },
                        },
                        value: {
                            show: true,
                            fontSize: "18px",
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
            <CardContent className="space-y-6">
                {/* Tab Navigation */}
                <div className={`flex ${language === 'ar' ? 'space-x-reverse' : 'space-x-1'} bg-gray-100 p-1 rounded-lg`}>
                    <button
                        onClick={() => setActiveTab('departments')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'departments'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Building2 className="w-4 h-4" />
                        {t('departments')}
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'roles'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        {t('roles')}
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'status'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        {t('status')}
                    </button>
                </div>

                {/* Chart Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'departments' && departmentData && (
                        <div className="space-y-4">
                            <Chart
                                options={departmentOptions}
                                series={departmentData.series}
                                type="donut"
                                height={250}
                            />
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-900">{t('departmentBreakdown')}</h4>
                                <div className={`grid grid-cols-2 ${language === 'ar' ? 'gap-2' : 'gap-2'}`}>
                                    {departmentData.labels.map((department, index) => {
                                        const count = departmentData.series[index];
                                        const percentage = departmentData.total > 0 ? ((count / departmentData.total) * 100).toFixed(1) : "0";
                                        return (
                                            <div key={department} className={`flex items-center justify-between text-xs p-2 bg-gray-50 rounded ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex items-center ${language === 'ar' ? 'gap-2 flex-row-reverse' : 'gap-2'}`}>
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: departmentOptions.colors?.[index] || "#3b82f6" }}
                                                    ></div>
                                                    <span className="text-gray-700 truncate">{department}</span>
                                                </div>
                                                <div className={`flex items-center ${language === 'ar' ? 'gap-2 flex-row-reverse' : 'gap-2'}`}>
                                                    <span className="text-gray-600">{count}</span>
                                                    <span className={`text-gray-500 w-8 ${language === 'ar' ? 'text-left' : 'text-right'}`}>{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && roleData && (
                        <div className="space-y-4">
                            <Chart
                                options={roleOptions}
                                series={roleData.series}
                                type="donut"
                                height={250}
                            />
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-900">{t('roleBreakdown')}</h4>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {roleData.labels.map((role, index) => {
                                        const count = roleData.series[index];
                                        const percentage = roleData.total > 0 ? ((count / roleData.total) * 100).toFixed(1) : "0";
                                        return (
                                            <div key={role} className={`flex items-center justify-between text-xs p-2 bg-gray-50 rounded ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex items-center ${language === 'ar' ? 'gap-2 flex-row-reverse' : 'gap-2'}`}>
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: roleOptions.colors?.[index] || "#3b82f6" }}
                                                    ></div>
                                                    <span className="text-gray-700 truncate">{role}</span>
                                                </div>
                                                <div className={`flex items-center ${language === 'ar' ? 'gap-2 flex-row-reverse' : 'gap-2'}`}>
                                                    <span className="text-gray-600">{count}</span>
                                                    <span className={`text-gray-500 w-8 ${language === 'ar' ? 'text-left' : 'text-right'}`}>{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && statusData && (
                        <div className="space-y-4">
                            <Chart
                                options={statusOptions}
                                series={statusData.series}
                                type="donut"
                                height={250}
                            />
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-900">{t('statusOverview')}</h4>

                                {/* Active Users */}
                                <div className={`flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center ${language === 'ar' ? 'gap-3 flex-row-reverse' : 'gap-3'}`}>
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">{t('activeUsers')}</p>
                                            <p className="text-xs text-green-600">{t('currentlyActiveInSystem')}</p>
                                        </div>
                                    </div>
                                    <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                                        <p className="text-lg font-bold text-green-900">{statistics?.activeUsers}</p>
                                        <p className="text-xs text-green-600">{statusData.activePercentage}%</p>
                                    </div>
                                </div>

                                {/* Inactive Users */}
                                <div className={`flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center ${language === 'ar' ? 'gap-3 flex-row-reverse' : 'gap-3'}`}>
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <div>
                                            <p className="text-sm font-medium text-red-900">{t('inactiveUsers')}</p>
                                            <p className="text-xs text-red-600">{t('currentlyInactiveInSystem')}</p>
                                        </div>
                                    </div>
                                    <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                                        <p className="text-lg font-bold text-red-900">{statistics?.inactiveUsers}</p>
                                        <p className="text-xs text-red-600">{((statistics?.inactiveUsers || 0) / (statistics?.totalUsers || 1) * 100).toFixed(1)}%</p>
                                    </div>
                                </div>

                                {/* Success Rate */}
                                <div className={`flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center ${language === 'ar' ? 'gap-3 flex-row-reverse' : 'gap-3'}`}>
                                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                            <span className="text-xs text-white font-bold">%</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">{t('successRate')}</p>
                                            <p className="text-xs text-blue-600">{t('activeUsersPercentage')}</p>
                                        </div>
                                    </div>
                                    <div className={language === 'ar' ? 'text-left' : 'text-right'}>
                                        <p className="text-lg font-bold text-blue-900">{statusData.activePercentage}%</p>
                                        <p className="text-xs text-blue-600">{t('excellent')}</p>
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
