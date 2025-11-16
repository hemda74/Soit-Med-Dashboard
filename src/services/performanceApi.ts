// Performance API service for sending metrics to backend

import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import type { PerformanceMetric } from '@/utils/performance';

/**
 * Send performance metric to backend
 */
export async function sendPerformanceMetric(metric: PerformanceMetric): Promise<void> {
	try {
		const token = getAuthToken();
		const apiUrl = getApiBaseUrl();

		await fetch(`${apiUrl}/api/Performance/metric`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify(metric),
			keepalive: true, // Send even if page is unloading
		});
	} catch (error) {
		// Silently fail - don't break the app
	}
}

/**
 * Send batch of performance metrics
 */
export async function sendPerformanceMetricsBatch(
	metrics: PerformanceMetric[]
): Promise<void> {
	try {
		const token = getAuthToken();
		const apiUrl = getApiBaseUrl();

		await fetch(`${apiUrl}/api/Performance/metrics`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify({ metrics }),
			keepalive: true,
		});
	} catch (error) {
		// Silently fail
	}
}

