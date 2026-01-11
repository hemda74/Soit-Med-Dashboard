import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesManStatisticsDTO } from "@/types/sales.types";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface RevenueTrendChartProps {
	data: SalesManStatisticsDTO[];
	year?: number;
	quarter?: number;
	className?: string;
}

export default function RevenueTrendChart({ data, year, quarter, className }: RevenueTrendChartProps) {
	const { t, language } = useTranslation();

	// Calculate revenue per salesman and sort
	const revenueData = useMemo(() => {
		return data
			.map((stat) => ({
				name: stat.salesmanName,
				revenue: stat.totalDealValue,
				deals: stat.totalDeals,
			}))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 10);
	}, [data]);

	const options: ApexOptions = useMemo(() => ({
		colors: ["#10b981"],
		chart: {
			fontFamily: "Inter, sans-serif",
			type: "area",
			height: 300,
			toolbar: {
				show: false,
			},
		},
		stroke: {
			curve: "smooth",
			width: 3,
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
			y: {
				formatter: (val: number) => `EGP ${val.toLocaleString()}`,
			},
		},
		xaxis: {
			categories: revenueData.map((item) => item.name),
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
			labels: {
				style: {
					fontSize: "12px",
					colors: ["#6b7280"],
				},
				rotate: -45,
				rotateAlways: false,
			},
		},
		yaxis: {
			labels: {
				style: {
					fontSize: "12px",
					colors: ["#6b7280"],
				},
				formatter: (val: number) => {
					if (val >= 1000000) return `EGP ${(val / 1000000).toFixed(1)}M`;
					if (val >= 1000) return `EGP ${(val / 1000).toFixed(1)}K`;
					return `EGP ${val}`;
				},
			},
			title: {
				text: t('revenueAxisLabel'),
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
	}), [revenueData, language, t]);

	const series = useMemo(() => [
		{
			name: t('totalRevenue'),
			data: revenueData.map((item) => item.revenue),
		},
	], [revenueData, language, t]);

	const periodLabel = quarter ? `Q${quarter} ${year}` : year ? `${year}` : t('allTime');
	const totalRevenue = data.reduce((sum, stat) => sum + stat.totalDealValue, 0);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{t('revenueTrend')}</CardTitle>
				<CardDescription>
					{t('revenueTrendDescription')} {periodLabel} • {t('total')}: EGP {totalRevenue.toLocaleString()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{revenueData.length === 0 ? (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						{t('noRevenueData')}
					</div>
				) : (
					<div className="w-full">
						<Chart key={`revenue-${year}-${quarter}-${data.length}`} options={options} series={series} type="area" height={300} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

