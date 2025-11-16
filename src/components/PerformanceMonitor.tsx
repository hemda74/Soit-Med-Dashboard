import { useEffect, useState } from 'react';
import { usePerformanceMetrics } from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, BarChart3 } from 'lucide-react';

/**
 * Performance Monitor Component (Development Only)
 * Displays real-time performance metrics with toggle button
 */
export function PerformanceMonitor() {
	const { getMetrics, getAverageMetric } = usePerformanceMetrics();
	const [metrics, setMetrics] = useState(getMetrics());
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setMetrics(getMetrics());
		}, 2000); // Update every 2 seconds

		return () => clearInterval(interval);
	}, [getMetrics]);

	// Only show in development
	if (import.meta.env.PROD) {
		return null;
	}

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

	return (
		<>
			{/* Floating Toggle Button */}
			{!isOpen && (
				<Button
					onClick={() => setIsOpen(true)}
					className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg p-0"
					variant="default"
					size="icon"
					title="Show Performance Monitor"
				>
					<BarChart3 className="h-5 w-5" />
				</Button>
			)}

			{/* Performance Monitor Card */}
			{isOpen && (
				<Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm">Performance Monitor</CardTitle>
							<Button
								onClick={() => setIsOpen(false)}
								variant="ghost"
								size="icon"
								className="h-6 w-6"
								title="Close"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="text-xs font-semibold mb-2">Web Vitals</div>
						{Object.entries(webVitals).map(([name, value]) => {
							if (value === 0) return null;
							return (
								<div key={name} className="flex justify-between items-center text-xs">
									<span>{name}:</span>
									<span className="font-mono">{value.toFixed(0)}ms</span>
								</div>
							);
						})}
						<div className="text-xs font-semibold mt-4 mb-2">Recent Metrics</div>
						<div className="max-h-40 overflow-y-auto space-y-1">
							{metrics.slice(-5).map((metric, idx) => (
								<div
									key={idx}
									className="flex justify-between items-center text-xs p-1 rounded"
								>
									<span className="truncate flex-1">{metric.name}</span>
									<div className="flex items-center gap-2">
										<span className="font-mono">{metric.value.toFixed(0)}ms</span>
										<Badge
											className={`${getRatingColor(metric.rating)} text-white text-[10px] px-1 py-0`}
										>
											{metric.rating}
										</Badge>
									</div>
								</div>
							))}
						</div>
						<div className="text-xs text-muted-foreground mt-2">
							Total Metrics: {metrics.length}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}

