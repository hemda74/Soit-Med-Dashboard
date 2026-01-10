import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesManStatisticsDTO } from "@/types/sales.types";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface OffersTrendChartProps {
	data: SalesManStatisticsDTO[];
	year?: number;
	quarter?: number;
	className?: string;
}

export default function OffersTrendChart({ data, year, quarter, className }: OffersTrendChartProps) {
	const { t, language } = useTranslation();

	const offersData = useMemo(() => {
		return data
			.map((stat) => ({
				name: stat.salesmanName,
				total: stat.totalOffers,
				accepted: stat.acceptedOffers,
				rejected: stat.rejectedOffers,
			}))
			.sort((a, b) => b.total - a.total)
			.slice(0, 10);
	}, [data]);

	const options: ApexOptions = useMemo(() => ({
		colors: ["#8b5cf6", "#10b981", "#ef4444"],
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
				columnWidth: "60%",
				borderRadius: 4,
				dataLabels: {
					position: "top",
				},
			},
		},
		dataLabels: {
			enabled: true,
			formatter: (val: number) => `${val}`,
			offsetY: -20,
			style: {
				fontSize: "12px",
				colors: ["#374151"],
			},
		},
		stroke: {
			show: true,
			width: 2,
			colors: ["transparent"],
		},
		xaxis: {
			categories: offersData.map((item) => item.name),
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
				text: t('numberOfOffers'),
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
		fill: {
			opacity: 0.8,
		},
		tooltip: {
			y: {
				formatter: (val: number) => `${val} ${t('offers')}`,
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
	}), [offersData, language, t]);

	const series = useMemo(() => [
		{
			name: t('totalOffers'),
			data: offersData.map((item) => item.total),
		},
		{
			name: t('accepted'),
			data: offersData.map((item) => item.accepted),
		},
		{
			name: t('rejected'),
			data: offersData.map((item) => item.rejected),
		},
	], [offersData, language, t]);

	const periodLabel = quarter ? `Q${quarter} ${year}` : year ? `${year}` : t('allTime');
	const totalOffers = data.reduce((sum, stat) => sum + stat.totalOffers, 0);
	const totalAccepted = data.reduce((sum, stat) => sum + stat.acceptedOffers, 0);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{t('offersTrend')}</CardTitle>
				<CardDescription>
					{t('offersTrendDescription')} {periodLabel} • {t('total')}: {totalOffers} {t('offers')} ({totalAccepted} {t('accepted')})
				</CardDescription>
			</CardHeader>
			<CardContent>
				{offersData.length === 0 ? (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						{t('noOffersData')}
					</div>
				) : (
					<div className="w-full">
						<Chart key={`offers-${year}-${quarter}-${data.length}`} options={options} series={series} type="bar" height={300} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

