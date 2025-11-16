import { useState, useEffect } from 'react';
import { usePerformanceMetrics } from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Performance Monitoring Page
 * View detailed performance metrics and analytics
 */
export default function PerformancePage() {
	const { getMetrics, getAverageMetric, clearMetrics } = usePerformanceMetrics();
	const [metrics, setMetrics] = useState(getMetrics());
	const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setMetrics(getMetrics());
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	const webVitals = {
		LCP: getAverageMetric('LCP'),
		FID: getAverageMetric('FID'),
		CLS: getAverageMetric('CLS'),
		FCP: getAverageMetric('FCP'),
		TTFB: getAverageMetric('TTFB'),
		INP: getAverageMetric('INP'),
	};

	const getRatingColor = (rating: string) => {
		switch (rating) {
			case 'good':
				return 'bg-green-500';
			case 'needs-improvement':
				return 'bg-yellow-500';
			case 'poor':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getRatingBadge = (rating: string) => {
		return (
			<Badge className={`${getRatingColor(rating)} text-white`}>
				{rating}
			</Badge>
		);
	};

	const filteredMetrics = selectedMetric
		? metrics.filter((m) => m.name === selectedMetric)
		: metrics;

	const metricGroups = metrics.reduce((acc, metric) => {
		const group = metric.name.split('_')[0];
		if (!acc[group]) acc[group] = [];
		acc[group].push(metric);
		return acc;
	}, {} as Record<string, typeof metrics>);

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Performance Monitoring</h1>
				<Button onClick={clearMetrics} variant="outline">
					Clear Metrics
				</Button>
			</div>

			{/* Web Vitals Section */}
			<Card>
				<CardHeader>
					<CardTitle>Core Web Vitals</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						{Object.entries(webVitals).map(([name, value]) => (
							<div key={name} className="p-4 border rounded-lg">
								<div className="text-sm text-muted-foreground">{name}</div>
								<div className="text-2xl font-bold mt-1">
									{value > 0 ? `${value.toFixed(0)}ms` : 'N/A'}
								</div>
								{value > 0 && (
									<div className="mt-2">
										{getRatingBadge(
											value < 1000 ? 'good' : value < 2000 ? 'needs-improvement' : 'poor'
										)}
									</div>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Metric Groups */}
			<Card>
				<CardHeader>
					<CardTitle>Metric Groups</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2 mb-4">
						<Button
							variant={selectedMetric === null ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedMetric(null)}
						>
							All ({metrics.length})
						</Button>
						{Object.keys(metricGroups).map((group) => (
							<Button
								key={group}
								variant={selectedMetric === group ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSelectedMetric(group)}
							>
								{group} ({metricGroups[group].length})
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Metrics List */}
			<Card>
				<CardHeader>
					<CardTitle>
						{selectedMetric ? `Metrics: ${selectedMetric}` : 'All Metrics'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{filteredMetrics.length === 0 ? (
							<div className="text-center text-muted-foreground py-8">
								No metrics recorded yet. Start using the app to see performance data.
							</div>
						) : (
							filteredMetrics.map((metric, idx) => (
								<div
									key={idx}
									className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
								>
									<div className="flex-1">
										<div className="font-medium">{metric.name}</div>
										<div className="text-sm text-muted-foreground">
											{new Date(metric.timestamp).toLocaleString()}
											{metric.url && (
												<span className="ml-2 text-xs">({metric.url})</span>
											)}
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right">
											<div className="font-mono font-bold">
												{metric.value.toFixed(2)}ms
											</div>
										</div>
										{getRatingBadge(metric.rating)}
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			{/* Statistics */}
			<Card>
				<CardHeader>
					<CardTitle>Statistics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<div className="text-sm text-muted-foreground">Total Metrics</div>
							<div className="text-2xl font-bold">{metrics.length}</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Good</div>
							<div className="text-2xl font-bold text-green-500">
								{metrics.filter((m) => m.rating === 'good').length}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Needs Improvement</div>
							<div className="text-2xl font-bold text-yellow-500">
								{metrics.filter((m) => m.rating === 'needs-improvement').length}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Poor</div>
							<div className="text-2xl font-bold text-red-500">
								{metrics.filter((m) => m.rating === 'poor').length}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

