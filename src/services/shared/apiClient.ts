// Shared API client and utilities

import { getApiUrl } from '@/config/api';

// Generic API request function with error handling
export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	token?: string
): Promise<T> {
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
		} catch {
			errorData = {
				message:
					errorText ||
					`HTTP ${response.status}: Request failed`,
				status: response.status,
			};
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
}
