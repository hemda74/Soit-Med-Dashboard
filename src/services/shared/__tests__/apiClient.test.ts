import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, ApiError } from '../apiClient';

// Mock the dependencies
vi.mock('@/config/api', () => ({
	getApiUrl: vi.fn((endpoint: string) => `http://localhost:5117/api${endpoint}`),
}));

vi.mock('@/utils/performance', () => ({
	performanceMonitor: {
		measureApiCall: vi.fn(async (endpoint: string, fn: () => Promise<any>) => {
			return fn();
		}),
	},
}));

describe('apiRequest', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('makes successful API request and returns data', async () => {
		const mockData = { id: 1, name: 'Test' };
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			text: async () => JSON.stringify(mockData),
		});

		const result = await apiRequest('/test');
		expect(result).toEqual(mockData);
		expect(global.fetch).toHaveBeenCalledWith(
			'http://localhost:5117/api/test',
			expect.objectContaining({
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
				}),
			})
		);
	});

	it('includes Authorization header when token is provided', async () => {
		const mockData = { id: 1 };
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			text: async () => JSON.stringify(mockData),
		});

		await apiRequest('/test', {}, 'test-token');
		expect(global.fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer test-token',
				}),
			})
		);
	});

	it('does not set Content-Type for FormData', async () => {
		const formData = new FormData();
		formData.append('file', new Blob());
		const mockData = { success: true };
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			text: async () => JSON.stringify(mockData),
		});

		await apiRequest('/upload', { body: formData });
		const fetchCall = (global.fetch as any).mock.calls[0][1];
		expect(fetchCall.headers['Content-Type']).toBeUndefined();
	});

	it('handles API error with JSON response', async () => {
		const errorData = { message: 'Error occurred', status: 400 };
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 400,
			text: async () => JSON.stringify(errorData),
		});

		await expect(apiRequest('/test')).rejects.toEqual(errorData);
	});

	it('handles API error with text response', async () => {
		const errorText = 'Simple error message';
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 500,
			text: async () => errorText,
		});

		await expect(apiRequest('/test')).rejects.toEqual({
			message: errorText,
			status: 500,
		});
	});

	it('handles API error with empty response', async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 404,
			text: async () => '',
		});

		await expect(apiRequest('/test')).rejects.toEqual({
			message: 'HTTP 404: Request failed',
			status: 404,
		});
	});

	it('handles invalid JSON response', async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			text: async () => 'invalid json',
		});

		await expect(apiRequest('/test')).rejects.toThrow('Failed to parse response as JSON');
	});

	it('merges custom headers with default headers', async () => {
		const mockData = { id: 1 };
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			text: async () => JSON.stringify(mockData),
		});

		await apiRequest('/test', {
			headers: {
				'Custom-Header': 'custom-value',
			},
		});

		const fetchCall = (global.fetch as any).mock.calls[0][1];
		expect(fetchCall.headers['Content-Type']).toBe('application/json');
		expect(fetchCall.headers['Custom-Header']).toBe('custom-value');
	});

	it('passes through request options', async () => {
		const mockData = { id: 1 };
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			text: async () => JSON.stringify(mockData),
		});

		await apiRequest('/test', {
			method: 'POST',
			mode: 'cors',
		});

		const fetchCall = (global.fetch as any).mock.calls[0][1];
		expect(fetchCall.method).toBe('POST');
		expect(fetchCall.mode).toBe('cors');
	});
});




