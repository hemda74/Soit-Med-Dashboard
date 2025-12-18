import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesManStatisticsDTO } from "@/types/sales.types";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface ConversionRateChartProps {
	data: SalesManStatisticsDTO[];
	year?: number;
	quarter?: number;
	className?: string;
}

export default function ConversionRateChart({ data, year, quarter, className }: ConversionRateChartProps) {
	const { t, language } = useTranslation();

	const conversionData = useMemo(() => {
		return data
			.map((stat) => ({
				name: stat.salesmanName,
				successRate: stat.successRate,
				offerAcceptanceRate: stat.offerAcceptanceRate,
				dealConversionRate: stat.totalOffers > 0 ? (stat.totalDeals / stat.totalOffers) * 100 : 0,
			}))
			.sort((a, b) => b.successRate - a.successRate)
			.slice(0, 10);
	}, [data]);

	const options: ApexOptions = useMemo(() => ({
		colors: ["#10b981", "#3b82f6", "#f59e0b"],
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
			width: 3,
		},
		markers: {
			size: 5,
			strokeColors: "#fff",
			strokeWidth: 2,
			hover: {
				size: 7,
			},
		},
		xaxis: {
			categories: conversionData.map((item) => item.name),
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
			title: {
				text: t('ratePercentage'),
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
				formatter: (val: number) => `${val.toFixed(1)}%`,
			},
			min: 0,
			max: 100,
		},
		tooltip: {
			y: {
				formatter: (val: number) => `${val.toFixed(1)}%`,
			},
		},
		legend: {
			show: true,
			position: "top",
			horizontalAlign: "right",
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
	}), [conversionData, language, t]);

	const series = useMemo(() => [
		{
			name: t('successRate'),
			data: conversionData.map((item) => item.successRate),
		},
		{
			name: t('offerAcceptanceRate'),
			data: conversionData.map((item) => item.offerAcceptanceRate),
		},
		{
			name: t('dealConversionRate'),
			data: conversionData.map((item) => item.dealConversionRate),
		},
	], [conversionData, language, t]);

	const periodLabel = quarter ? `Q${quarter} ${year}` : year ? `${year}` : t('allTime');
	const avgSuccessRate = data.length > 0
		? data.reduce((sum, stat) => sum + stat.successRate, 0) / data.length
		: 0;
	const avgOfferAcceptance = data.length > 0
		? data.reduce((sum, stat) => sum + stat.offerAcceptanceRate, 0) / data.length
		: 0;

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{t('conversionRates')}</CardTitle>
				<CardDescription>
					{t('conversionRatesDescription')} {periodLabel} • {t('avgSuccessShort')}: {avgSuccessRate.toFixed(1)}% • {t('avgOfferAcceptanceShort')}: {avgOfferAcceptance.toFixed(1)}%
				</CardDescription>
			</CardHeader>
			<CardContent>
				{conversionData.length === 0 ? (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						{t('noConversionDataAvailable')}
					</div>
				) : (
					<div className="w-full">
						<Chart options={options} series={series} type="line" height={300} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

