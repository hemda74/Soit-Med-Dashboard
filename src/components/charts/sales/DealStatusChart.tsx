import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesManStatisticsDTO } from "@/types/sales.types";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface DealStatusChartProps {
	data: SalesManStatisticsDTO[];
	year?: number;
	quarter?: number;
	className?: string;
}

export default function DealStatusChart({ data, year, quarter, className }: DealStatusChartProps) {
	const { t, language } = useTranslation();

	const dealStatusData = useMemo(() => {
		const successValue = data.reduce((sum, stat) => sum + stat.totalDeals, 0);
		const failedValue = data.reduce((sum, stat) => sum + (stat.failedDeals || 0), 0);

		return [
			{ label: t('successfulLabel'), value: successValue },
			{ label: t('failedLabel'), value: failedValue },
		].filter((item) => item.value > 0);
	}, [data, language, t]);

	const options: ApexOptions = useMemo(() => ({
		colors: ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"],
		chart: {
			fontFamily: "Inter, sans-serif",
			type: "donut",
			height: 300,
		},
		labels: dealStatusData.map((item) => item.label),
		legend: {
			show: true,
			position: "bottom",
			horizontalAlign: "center",
		},
		dataLabels: {
			enabled: true,
			formatter: (val: number, opts: any) => {
				const label = opts.w.globals.labels[opts.seriesIndex];
				const value = opts.w.globals.series[opts.seriesIndex];
				return `${label}: ${value}`;
			},
		},
		tooltip: {
			y: {
				formatter: (val: number) => `${val} ${t('deals')}`,
			},
		},
		plotOptions: {
			pie: {
				donut: {
					size: "60%",
					labels: {
						show: true,
						total: {
							show: true,
							label: t('totalDeals'),
							formatter: () => {
								const total = dealStatusData.reduce((sum, item) => sum + item.value, 0);
								return total.toString();
							},
						},
					},
				},
			},
		},
	}), [dealStatusData, t]);

	const series = useMemo(() => dealStatusData.map((item) => item.value), [dealStatusData]);

	const periodLabel = quarter ? `Q${quarter} ${year}` : year ? `${year}` : t('allTime');
	const totalDeals = dealStatusData.reduce((sum, item) => sum + item.value, 0);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{t('dealStatusDistribution')}</CardTitle>
				<CardDescription>
					{t('dealStatusDescription')} {periodLabel} • {t('total')}: {totalDeals} {t('deals')}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{dealStatusData.length === 0 ? (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						{t('noDealStatusData')}
					</div>
				) : (
					<div className="w-full">
						<Chart key={`dealstatus-${year}-${quarter}-${data.length}`} options={options} series={series} type="donut" height={300} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

