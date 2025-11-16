import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance';

/**
 * Hook to measure component render performance
 */
export function usePerformance(componentName: string): void {
	const renderStartRef = useRef<number>(performance.now());
	const renderCountRef = useRef<number>(0);

	useEffect(() => {
		const renderTime = performance.now() - renderStartRef.current;
		renderCountRef.current += 1;

		// Only track after first render
		if (renderCountRef.current > 1) {
			performanceMonitor.measureComponentRender(componentName, renderTime);
		}

		renderStartRef.current = performance.now();
	});
}

/**
 * Hook to measure API call performance
 */
export function useApiPerformance() {
	return {
		measureApiCall: async <T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> => {
			return performanceMonitor.measureApiCall(endpoint, apiCall);
		},
	};
}

/**
 * Hook to get performance metrics
 */
export function usePerformanceMetrics() {
	return {
		getMetrics: () => performanceMonitor.getMetrics(),
		getMetricsByName: (name: string) => performanceMonitor.getMetricsByName(name),
		getAverageMetric: (name: string) => performanceMonitor.getAverageMetric(name),
		clearMetrics: () => performanceMonitor.clearMetrics(),
	};
}

