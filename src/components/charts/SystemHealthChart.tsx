import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemHealthChart() {
    const options: ApexOptions = {
        colors: ["#10b981", "#f59e0b", "#ef4444"],
        chart: {
            fontFamily: "Inter, sans-serif",
            type: "area",
            height: 250,
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: "smooth",
            width: 2,
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.4,
                opacityTo: 0.1,
            },
        },
        markers: {
            size: 0,
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 4,
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
                format: "HH:mm",
            },
        },
        xaxis: {
            type: "datetime",
            categories: [
                "2024-01-01T00:00:00.000Z",
                "2024-01-01T04:00:00.000Z",
                "2024-01-01T08:00:00.000Z",
                "2024-01-01T12:00:00.000Z",
                "2024-01-01T16:00:00.000Z",
                "2024-01-01T20:00:00.000Z",
                "2024-01-02T00:00:00.000Z",
            ],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                format: "HH:mm",
                style: {
                    fontSize: "12px",
                    colors: ["#6b7280"],
                },
            },
        },
        yaxis: {
            min: 0,
            max: 100,
            title: {
                text: "System Health (%)",
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
                formatter: (val: number) => `${val}%`,
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
            name: "CPU Usage",
            data: [45, 52, 38, 67, 58, 72, 89],
        },
        {
            name: "Memory Usage",
            data: [35, 42, 28, 57, 48, 62, 79],
        },
        {
            name: "Disk Usage",
            data: [25, 32, 18, 47, 38, 52, 69],
        },
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>System Health Metrics</CardTitle>
                <CardDescription>
                    Real-time system performance monitoring
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    <Chart options={options} series={series} type="area" height={250} />
                </div>
            </CardContent>
        </Card>
    );
}
