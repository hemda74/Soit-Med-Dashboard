// API Client with Performance Monitoring
import { performanceMonitor } from '@/utils/performance';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';

export async function apiRequestWithPerformance<T>(
	endpoint: string,
	options: RequestInit = {},
	token?: string
): Promise<T> {
	const authToken = token || getAuthToken();
	const apiUrl = getApiBaseUrl();
	const fullUrl = `${apiUrl}${endpoint}`;

	return performanceMonitor.measureApiCall(endpoint, async () => {
		const response = await fetch(fullUrl, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...(authToken && { Authorization: `Bearer ${authToken}` }),
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || `API request failed with status ${response.status}`
			);
		}

		return response.json();
	});
}

