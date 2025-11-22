import { useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

export default function MonthlyActivityChart() {
    const { t } = useTranslation();

    const monthKeys = useMemo(
        () => [
            "janShort",
            "febShort",
            "marShort",
            "aprShort",
            "mayShort",
            "junShort",
            "julShort",
            "augShort",
            "sepShort",
            "octShort",
            "novShort",
            "decShort",
        ],
        []
    );

    const monthLabels = useMemo(() => monthKeys.map((key) => t(key) || key), [monthKeys, t]);

    const series = useMemo(
        () => [
            {
                name: t("loginsLabel") || "Logins",
                data: [120, 135, 142, 158, 165, 178, 185, 192, 188, 195, 203, 210],
            },
            {
                name: t("reportsCreatedLabel") || "Reports Created",
                data: [45, 52, 38, 67, 58, 72, 89, 95, 78, 85, 92, 88],
            },
            {
                name: t("dataExportsLabel") || "Data Exports",
                data: [25, 30, 22, 35, 28, 40, 45, 48, 42, 50, 55, 52],
            },
        ],
        [t]
    );

    const options: ApexOptions = useMemo(() => ({
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
            categories: monthLabels,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            title: {
                text: t("numberOfActivities") || "Number of Activities",
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
                formatter: (val: number) => `${val} ${t("activitiesLabel") || "activities"}`,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "right",
            fontFamily: "Inter",
        },
    }), [monthLabels, t]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{t("monthlyActivityOverview") || "Monthly Activity Overview"}</CardTitle>
                <CardDescription>
                    {t("monthlyActivityDescription") || "User activities and system usage patterns"}
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
