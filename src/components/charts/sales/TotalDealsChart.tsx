import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesManStatisticsDTO } from "@/types/sales.types";
import { useTranslation } from "@/hooks/useTranslation";

interface TotalDealsChartProps {
	data: SalesManStatisticsDTO[];
	year?: number;
	quarter?: number;
	className?: string;
}

export default function TotalDealsChart({ data, year, quarter, className }: TotalDealsChartProps) {
	const { t } = useTranslation();

	// Calculate total deals per salesman
	const dealsData = data.map((stat) => ({
		name: stat.salesmanName,
		value: stat.totalDeals,
	}));

	// Sort by deals (descending) and take top 10
	const topSalesmen = dealsData
		.sort((a, b) => b.value - a.value)
		.slice(0, 10);

	const options: ApexOptions = {
		colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1"],
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
				horizontal: true,
				columnWidth: "70%",
				borderRadius: 4,
				borderRadiusApplication: "end",
				dataLabels: {
					position: "top",
				},
			},
		},
		dataLabels: {
			enabled: true,
			formatter: (val: number) => `${val} ${t('deals')}`,
			offsetX: 0,
			offsetY: 0,
			style: {
				fontSize: "12px",
				fontWeight: 600,
				colors: ["#374151"],
			},
		},
		stroke: {
			show: true,
			width: 1,
			colors: ["#fff"],
		},
		xaxis: {
			categories: topSalesmen.map((item) => item.name),
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
			},
		},
		yaxis: {
			title: {
				text: t('numberOfDeals'),
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
			xaxis: {
				lines: {
					show: true,
				},
			},
			yaxis: {
				lines: {
					show: false,
				},
			},
		},
		fill: {
			opacity: 0.8,
		},
		tooltip: {
			y: {
				formatter: (val: number) => `${val} ${t('deals')}`,
			},
		},
		legend: {
			show: false,
		},
	};

	const series = [
		{
			name: t('totalDeals'),
			data: topSalesmen.map((item) => item.value),
		},
	];

	const periodLabel = quarter ? `Q${quarter} ${year}` : year ? `${year}` : t('allTime');
	const totalDeals = data.reduce((sum, stat) => sum + stat.totalDeals, 0);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{t('totalDealsBySalesMan')}</CardTitle>
				<CardDescription>
					{t('topPerformersFor')} {periodLabel} • {t('total')}: {totalDeals} {t('deals')}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{topSalesmen.length === 0 ? (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						{t('noDealsDataAvailable')}
					</div>
				) : (
					<div className="w-full">
						<Chart key={`deals-${year}-${quarter}-${data.length}`} options={options} series={series} type="bar" height={300} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

