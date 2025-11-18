import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesmanStatisticsDTO } from "@/types/sales.types";
import { useMemo } from "react";

interface DealStatusChartProps {
	data: SalesmanStatisticsDTO[];
	year?: number;
	quarter?: number;
	className?: string;
}

export default function DealStatusChart({ data, year, quarter, className }: DealStatusChartProps) {
	const dealStatusData = useMemo(() => {
		const statusCounts = {
			Total: 0,
			Success: 0,
			Failed: 0,
		};

		data.forEach((stat) => {
			statusCounts.Total += stat.totalDeals;
			// Assuming successful deals are those with success status
			// You may need to adjust based on your actual data structure
			statusCounts.Success += stat.totalDeals; // This is a placeholder
			statusCounts.Failed += stat.failedDeals || 0;
		});

		return Object.entries(statusCounts)
			.filter(([_, value]) => value > 0)
			.map(([name, value]) => ({ name, value }));
	}, [data]);

	const options: ApexOptions = {
		colors: ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"],
		chart: {
			fontFamily: "Inter, sans-serif",
			type: "donut",
			height: 300,
		},
		labels: dealStatusData.map((item) => item.name),
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
				formatter: (val: number) => `${val} deals`,
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
							label: "Total Deals",
							formatter: () => {
								const total = dealStatusData.reduce((sum, item) => sum + item.value, 0);
								return total.toString();
							},
						},
					},
				},
			},
		},
	};

	const series = dealStatusData.map((item) => item.value);

	const periodLabel = quarter ? `Q${quarter} ${year}` : year ? `${year}` : "All Time";
	const totalDeals = dealStatusData.reduce((sum, item) => sum + item.value, 0);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Deal Status Distribution</CardTitle>
				<CardDescription>
					Deal status breakdown for {periodLabel} • Total: {totalDeals} deals
				</CardDescription>
			</CardHeader>
			<CardContent>
				{dealStatusData.length === 0 ? (
					<div className="flex items-center justify-center h-[300px] text-muted-foreground">
						No deal status data available
					</div>
				) : (
					<div className="w-full">
						<Chart options={options} series={series} type="donut" height={300} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

