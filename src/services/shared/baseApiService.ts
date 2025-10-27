import { apiRequest } from './apiClient';
import { getAuthToken } from './authService';

export class BaseApiService {
	protected async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const token = getAuthToken() || undefined;
		return apiRequest<T>(endpoint, options, token);
	}

	protected async makePaginatedRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const token = getAuthToken() || undefined;
		return apiRequest<T>(endpoint, options, token);
	}
}
