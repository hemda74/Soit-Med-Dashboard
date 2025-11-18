import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesmanStatisticsDTO } from "@/types/sales.types";
import { useMemo } from "react";

interface VisitsTrendChartProps {
	data: SalesmanStatisticsDTO[];
	year?: number;
	quarter?: number;
	className?: string;
}

export default function VisitsTrendChart({ data, year, quarter, className }: VisitsTrendChartProps) {
	const visitsData = useMemo(() => {
		return data
			.map((stat) => ({
				name: stat.salesmanName,
				total: stat.totalVisits,
				successful: stat.successfulVisits,
				failed: stat.failedVisits,
			}))
			.sort((a, b) => b.total - a.total)
			.slice(0, 10);
	}, [data]);

	const options: ApexOptions = {
		colors: ["#3b82f6", "#10b981", "#ef4444"],
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
			categories: visitsData.map((item) => item.name),
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
				text: "Number of Visits",
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
				formatter: (val: number) => `${val} visits`,
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
	};

	const series = [
		{
			name: "Total Visits",
			data: visitsData.map((item) => item.total),
		},
		{
			name: "Successful",
			data: visitsData.map((item) => item.successful),
		},
		{
			name: "Failed",
			data: visitsData.map((item) => item.failed),
		},
	];

	const periodLabel = quarter ? `Q${quarter} ${year}` : year ? `${year}` : "All Time";
	const totalVisits = data.reduce((sum, stat) => sum + stat.totalVisits, 0);
	const totalSuccessful = data.reduce((sum, stat) => sum + stat.successfulVisits, 0);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Visits Trend</CardTitle>
				<CardDescription>
					Visit performance by salesman for {periodLabel} • Total: {totalVisits} visits ({totalSuccessful} successful)
				</CardDescription>
			</CardHeader>
			<CardContent>
				{visitsData.length === 0 ? (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						No visits data available
					</div>
				) : (
					<div className="w-full">
						<Chart options={options} series={series} type="bar" height={300} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

