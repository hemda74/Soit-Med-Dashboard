import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonthlyActivityChart() {
    const options: ApexOptions = {
        colors: ["#3b82f6", "#10b981", "#f59e0b"],
        chart: {
            fontFamily: "Inter, sans-serif",
            type: "bar",
            height: 300,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "55%",
                borderRadius: 4,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        xaxis: {
            categories: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            title: {
                text: "Number of Activities",
                style: {
                    fontSize: "14px",
                    color: "#374151",
                },
            },
            labels: {
                style: {
                    fontSize: "12px",
                    colors: ["#6b7280"],
                },
            },
        },
        grid: {
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 0.8,
        },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} activities`,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "right",
            fontFamily: "Inter",
        },
    };

    const series = [
        {
            name: "Logins",
            data: [120, 135, 142, 158, 165, 178, 185, 192, 188, 195, 203, 210],
        },
        {
            name: "Reports Created",
            data: [45, 52, 38, 67, 58, 72, 89, 95, 78, 85, 92, 88],
        },
        {
            name: "Data Exports",
            data: [25, 30, 22, 35, 28, 40, 45, 48, 42, 50, 55, 52],
        },
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Monthly Activity Overview</CardTitle>
                <CardDescription>
                    User activities and system usage patterns
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    <Chart options={options} series={series} type="bar" height={300} />
                </div>
            </CardContent>
        </Card>
    );
}
