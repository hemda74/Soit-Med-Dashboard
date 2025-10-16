import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserGrowthChart() {
    const options: ApexOptions = {
        colors: ["#3b82f6", "#10b981"],
        chart: {
            fontFamily: "Inter, sans-serif",
            type: "line",
            height: 300,
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: "smooth",
            width: [3, 3],
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.3,
                opacityTo: 0.1,
            },
        },
        markers: {
            size: 4,
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
        grid: {
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            enabled: true,
            x: {
                format: "MMM yyyy",
            },
        },
        xaxis: {
            type: "category",
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
            labels: {
                style: {
                    fontSize: "12px",
                    colors: ["#6b7280"],
                },
            },
            title: {
                text: "Number of Users",
                style: {
                    fontSize: "14px",
                    color: "#374151",
                },
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
            name: "New Users",
            data: [45, 52, 38, 67, 58, 72, 89, 95, 78, 85, 92, 88],
        },
        {
            name: "Active Users",
            data: [120, 135, 142, 158, 165, 178, 185, 192, 188, 195, 203, 210],
        },
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>User Growth Overview</CardTitle>
                <CardDescription>
                    Monthly user registration and activity trends
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    <Chart options={options} series={series} type="line" height={300} />
                </div>
            </CardContent>
        </Card>
    );
}
