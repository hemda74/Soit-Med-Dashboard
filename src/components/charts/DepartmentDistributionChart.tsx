import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useStatistics, useStatisticsLoading, useStatisticsError } from "@/stores/statisticsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function DepartmentDistributionChart() {
    // Use statistics store instead of local state
    const statistics = useStatistics();
    const loading = useStatisticsLoading();
    const error = useStatisticsError();

    // Prepare chart data from API
    const chartData = statistics?.usersByDepartment ? {
        labels: Object.keys(statistics.usersByDepartment),
        series: Object.values(statistics.usersByDepartment),
        total: Object.values(statistics.usersByDepartment).reduce((sum, count) => sum + count, 0)
    } : null;

    const options: ApexOptions = {
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"],
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
                    size: "65%",
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
                    <CardTitle>Employee Distribution</CardTitle>
                    <CardDescription>
                        User distribution across different departments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading department data...</span>
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
                    <CardTitle>Employee Distribution</CardTitle>
                    <CardDescription>
                        User distribution across different departments
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
                    <CardTitle>Employee Distribution</CardTitle>
                    <CardDescription>
                        User distribution across different departments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="text-center text-muted-foreground">
                            <p>No department data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Employee Distribution</CardTitle>
                <CardDescription>
                    User distribution across different departments
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

                {/* Department Statistics Table */}
                <div className="mt-6 space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Department Breakdown</h4>
                    <div className="space-y-2">
                        {chartData.labels.map((department, index) => {
                            const count = chartData.series[index];
                            const percentage = chartData.total > 0 ? ((count / chartData.total) * 100).toFixed(1) : "0";
                            return (
                                <div key={department} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: options.colors?.[index] || "#3b82f6" }}
                                        ></div>
                                        <span className="text-gray-700">{department}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600">{count} users</span>
                                        <span className="text-gray-500 w-12 text-right">{percentage}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}