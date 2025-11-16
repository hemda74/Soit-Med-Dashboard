import { describe, it, expect, beforeEach, vi } from 'vitest';
import { API_CONFIG, getApiUrl } from '../api';

describe('API Configuration', () => {
	const originalEnv = import.meta.env;

	beforeEach(() => {
		// Reset environment variables
		vi.resetModules();
	});

	it('has correct default BASE_URL', () => {
		expect(API_CONFIG.BASE_URL).toBeDefined();
		expect(typeof API_CONFIG.BASE_URL).toBe('string');
	});

	it('has all required endpoints', () => {
		expect(API_CONFIG.ENDPOINTS.LOGIN).toBe('/Account/login');
		expect(API_CONFIG.ENDPOINTS.USER_ME).toBe('/User/me');
		expect(API_CONFIG.ENDPOINTS.AVAILABLE_ROLES).toBe('/Role');
		expect(API_CONFIG.ENDPOINTS.USERS).toBe('/User');
	});

	it('getApiUrl constructs correct URL with default base', () => {
		const url = getApiUrl('/test/endpoint');
		expect(url).toContain('/test/endpoint');
		expect(url).toContain('api');
	});

	it('getApiUrl handles endpoint without leading slash', () => {
		const url = getApiUrl('test/endpoint');
		expect(url).toBeDefined();
		expect(typeof url).toBe('string');
	});

	it('getApiUrl handles endpoint with leading slash', () => {
		const url = getApiUrl('/test/endpoint');
		expect(url).toBeDefined();
		expect(typeof url).toBe('string');
		expect(url).toContain('/test/endpoint');
	});

	it('getApiUrl combines base URL and endpoint correctly', () => {
		const endpoint = '/User/me';
		const url = getApiUrl(endpoint);
		expect(url).toBe(`${API_CONFIG.BASE_URL}${endpoint}`);
	});

	it('API_CONFIG is readonly (const assertion)', () => {
		// TypeScript ensures this is readonly, but we can verify structure
		expect(API_CONFIG).toHaveProperty('BASE_URL');
		expect(API_CONFIG).toHaveProperty('ENDPOINTS');
		expect(API_CONFIG.ENDPOINTS).toHaveProperty('LOGIN');
		expect(API_CONFIG.ENDPOINTS).toHaveProperty('USER_ME');
		expect(API_CONFIG.ENDPOINTS).toHaveProperty('AVAILABLE_ROLES');
		expect(API_CONFIG.ENDPOINTS).toHaveProperty('USERS');
	});
});




