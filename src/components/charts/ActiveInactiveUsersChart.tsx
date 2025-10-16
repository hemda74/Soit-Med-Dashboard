import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useStatistics, useStatisticsLoading, useStatisticsError } from "@/stores/statisticsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function ActiveInactiveUsersChart() {
    // Use statistics store instead of local state
    const statistics = useStatistics();
    const loading = useStatisticsLoading();
    const error = useStatisticsError();

    // Prepare chart data from API
    const chartData = statistics ? {
        labels: ['Active Users', 'Inactive Users'],
        series: [statistics.activeUsers, statistics.inactiveUsers],
        total: statistics.totalUsers,
        activePercentage: statistics.totalUsers > 0 ? ((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1) : "0",
        inactivePercentage: statistics.totalUsers > 0 ? ((statistics.inactiveUsers / statistics.totalUsers) * 100).toFixed(1) : "0"
    } : null;

    const options: ApexOptions = {
        colors: ["#10b981", "#ef4444"],
        chart: {
            fontFamily: "Inter, sans-serif",
            type: "donut",
            height: 300,
        },
        labels: chartData?.labels || [],
        legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            fontFamily: "Inter",
            fontSize: "14px",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total Users",
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#374151",
                            formatter: function () {
                                return chartData?.total?.toString() || "0";
                            },
                        },
                        value: {
                            show: true,
                            fontSize: "20px",
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
                fontSize: "12px",
                fontWeight: 600,
            },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: (val: number) => `${val} users`,
            },
        },
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>User Status Distribution</CardTitle>
                    <CardDescription>
                        Active vs Inactive users distribution
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading user status data...</span>
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
                    <CardTitle>User Status Distribution</CardTitle>
                    <CardDescription>
                        Active vs Inactive users distribution
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!chartData || chartData.total === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>User Status Distribution</CardTitle>
                    <CardDescription>
                        Active vs Inactive users distribution
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="text-center text-muted-foreground">
                            <p>No user status data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>User Status Distribution</CardTitle>
                <CardDescription>
                    Active vs Inactive users distribution
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    <Chart
                        options={options}
                        series={chartData.series}
                        type="donut"
                        height={300}
                    />
                </div>

                {/* Status Statistics */}
                <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Status Breakdown</h4>

                    {/* Active Users */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900">Active Users</p>
                                <p className="text-xs text-green-600">Currently active in the system</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-green-900">{statistics?.activeUsers}</p>
                            <p className="text-xs text-green-600">{chartData.activePercentage}%</p>
                        </div>
                    </div>

                    {/* Inactive Users */}
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-red-900">Inactive Users</p>
                                <p className="text-xs text-red-600">Currently inactive in the system</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-red-900">{statistics?.inactiveUsers}</p>
                            <p className="text-xs text-red-600">{chartData.inactivePercentage}%</p>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-xs text-white font-bold">%</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-900">Success Rate</p>
                                <p className="text-xs text-blue-600">Active users percentage</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-blue-900">{chartData.activePercentage}%</p>
                            <p className="text-xs text-blue-600">Excellent</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
