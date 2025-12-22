// Shared API client and utilities

import { getApiUrl } from '@/config/api';
import { performanceMonitor } from '@/utils/performance';

// Generic API request function with error handling
export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	token?: string
): Promise<T> {
	return performanceMonitor.measureApiCall(endpoint, async () => {
		const url = getApiUrl(endpoint);

		const defaultHeaders: HeadersInit = {};

		// Only set Content-Type for JSON requests, not for FormData
		if (!(options.body instanceof FormData)) {
			defaultHeaders['Content-Type'] = 'application/json';
		}

		if (token) {
			defaultHeaders.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(url, {
			...options,
			headers: {
				...defaultHeaders,
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorData: any;

			try {
				errorData = JSON.parse(errorText);
				// Ensure status is always included
				if (!errorData.status) {
					errorData.status = response.status;
				}
			} catch {
				errorData = {
					message:
						errorText ||
						`HTTP ${response.status}: Request failed`,
					status: response.status,
				};
			}

			// Add helpful message for 403 errors
			if (response.status === 403) {
				errorData.message = errorData.message || 'Access denied. You do not have permission to perform this action.';
			}

			throw errorData;
		}

		const responseText = await response.text();
		let jsonData: T;

		try {
			jsonData = JSON.parse(responseText);
		} catch (parseError) {
			console.error('JSON parse error:', parseError);
			throw new Error('Failed to parse response as JSON');
		}

		return jsonData;
	});
}

// API Error interface
export interface ApiError {
	message: string;
	status?: number;
	code?: string;
	timestamp?: string;
	details?: Array<{
		code: string;
		description: string;
	}>;
}

// API Response wrapper
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

// Paginated API Response wrapper
export interface PaginatedApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}
