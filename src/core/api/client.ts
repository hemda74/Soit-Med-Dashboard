import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
} from 'axios';
import { API_CONFIG } from '@/core/config/api.config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor
apiClient.interceptors.request.use(
	(config) => {
		// Add auth token if available
		const token = localStorage.getItem('auth_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	(error) => {
		// Handle common errors
		if (error.response?.status === 401) {
			// Unauthorized - clear token and redirect to login
			localStorage.removeItem('auth_token');
			window.location.href = '/login';
		}

		// Handle rate limiting (429 errors)
		if (error.response?.status === 429) {
			const retryAfter =
				error.response.headers['retry-after'] || '60';
			console.warn(
				`Rate limit exceeded. Retry after ${retryAfter} seconds`
			);

			// Show user-friendly message
			if (typeof window !== 'undefined') {
				// This will be handled by toast notifications in components
				console.error(
					'Too many requests. Please wait a moment and try again.'
				);
			}
		}

		// Transform error response
		const apiError = {
			message:
				error.response?.data?.message ||
				error.message ||
				'An error occurred',
			status: error.response?.status,
			code: error.response?.data?.code,
			details: error.response?.data,
		};

		return Promise.reject(apiError);
	}
);

// Generic API request function
export const apiRequest = async <T = unknown>(
	endpoint: string,
	options: RequestInit = {},
	token?: string
): Promise<T> => {
	const config: AxiosRequestConfig = {
		url: endpoint,
		method:
			(options.method as
				| 'GET'
				| 'POST'
				| 'PUT'
				| 'DELETE'
				| 'PATCH') || 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(token && { Authorization: `Bearer ${token}` }),
			...options.headers,
		} as any,
		...(options.body && { data: options.body }),
	};

	const response = await apiClient.request<T>(config);
	return response.data;
};

export default apiClient;
