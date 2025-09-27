import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepartmentDistributionChart() {
    const options: ApexOptions = {
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
        chart: {
            fontFamily: "Inter, sans-serif",
            type: "donut",
            height: 300,
        },
        labels: [
            "Cardiology",
            "Neurology",
            "Orthopedics",
            "Pediatrics",
            "Emergency",
            "Other"
        ],
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
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
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

    const series = [45, 32, 28, 35, 22, 18];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>
                    User distribution across different departments
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    <Chart options={options} series={series} type="donut" height={300} />
                </div>
            </CardContent>
        </Card>
    );
}
