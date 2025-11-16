/**
 * Example usage of performance monitoring hooks
 * This file demonstrates how to use performance monitoring in components
 */

import { usePerformance, useApiPerformance } from '@/hooks/usePerformance';
import { performanceMonitor } from '@/utils/performance';

// Example 1: Component with automatic render tracking
export function ExampleComponent() {
	// Automatically tracks component render time
	usePerformance('ExampleComponent');

	return <div>Example Component</div>;
}

// Example 2: Component with API call tracking
export function DataFetchingComponent() {
	const { measureApiCall } = useApiPerformance();

	const fetchData = async () => {
		// Automatically tracks API call duration
		return measureApiCall('users', async () => {
			const response = await fetch('/api/users');
			return response.json();
		});
	};

	return <button onClick={fetchData}>Fetch Data</button>;
}

// Example 3: Custom function measurement
export async function processData() {
	return performanceMonitor.measureFunction('dataProcessing', async () => {
		// Your data processing logic
		const result = await heavyComputation();
		return result;
	});
}

// Example 4: Custom metric recording
export function recordCustomMetric() {
	performanceMonitor.recordMetric('custom_operation', 150, 'good');
}

async function heavyComputation() {
	// Simulated heavy computation
	return new Promise((resolve) => setTimeout(resolve, 100));
}

