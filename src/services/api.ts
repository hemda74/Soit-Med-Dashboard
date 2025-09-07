import { API_BASE_URL } from '@/utils/constants';

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const config: RequestInit = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
			...options,
		};

		const response = await fetch(url, config);

		if (!response.ok) {
			throw new Error(
				`HTTP error! status: ${response.status}`
			);
		}

		return response.json();
	}

	async get<T>(endpoint: string, token?: string): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'GET',
			headers: token
				? { Authorization: `Bearer ${token}` }
				: {},
		});
	}

	async post<T>(
		endpoint: string,
		data?: any,
		token?: string
	): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
			headers: token
				? { Authorization: `Bearer ${token}` }
				: {},
		});
	}

	async delete<T>(endpoint: string, token?: string): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'DELETE',
			headers: token
				? { Authorization: `Bearer ${token}` }
				: {},
		});
	}

	async put<T>(endpoint: string, data?: any, token?: string): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
			headers: token
				? { Authorization: `Bearer ${token}` }
				: {},
		});
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
