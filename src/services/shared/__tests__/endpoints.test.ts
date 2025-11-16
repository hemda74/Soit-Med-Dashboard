import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from '../endpoints';

describe('API_ENDPOINTS', () => {
	it('has AUTH endpoints', () => {
		expect(API_ENDPOINTS.AUTH).toBeDefined();
		expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/Account/login');
		expect(API_ENDPOINTS.AUTH.CURRENT_USER).toBe('/User/me');
	});

	it('has USER endpoints with functions', () => {
		expect(API_ENDPOINTS.USER).toBeDefined();
		expect(API_ENDPOINTS.USER.ALL).toBe('/User/all');
		expect(API_ENDPOINTS.USER.BY_ID('123')).toBe('/User/123');
		expect(API_ENDPOINTS.USER.BY_DEPARTMENT(5)).toBe('/User/department/5');
	});

	it('encodes username in BY_USERNAME endpoint', () => {
		const username = 'test@user.com';
		const endpoint = API_ENDPOINTS.USER.BY_USERNAME(username);
		expect(endpoint).toContain('username');
		expect(endpoint).toBe(`/User/username/${encodeURIComponent(username)}`);
	});

	it('encodes role in BY_ROLE endpoint', () => {
		const role = 'Sales Manager';
		const endpoint = API_ENDPOINTS.USER.BY_ROLE(role);
		expect(endpoint).toContain('role');
		expect(endpoint).toBe(`/User/role/${encodeURIComponent(role)}`);
	});

	it('has ROLE endpoints', () => {
		expect(API_ENDPOINTS.ROLE).toBeDefined();
		expect(API_ENDPOINTS.ROLE.ALL).toBe('/Role');
		expect(API_ENDPOINTS.ROLE.FIELDS).toBe('/Role/fields');
	});

	it('has DEPARTMENT endpoints', () => {
		expect(API_ENDPOINTS.DEPARTMENT).toBeDefined();
		expect(API_ENDPOINTS.DEPARTMENT.ALL).toBe('/Department');
	});

	it('has HOSPITAL endpoints', () => {
		expect(API_ENDPOINTS.HOSPITAL).toBeDefined();
		expect(API_ENDPOINTS.HOSPITAL.ALL).toBe('/Hospital');
	});

	it('has GOVERNORATE endpoints', () => {
		expect(API_ENDPOINTS.GOVERNORATE).toBeDefined();
		expect(API_ENDPOINTS.GOVERNORATE.ALL).toBe('/Governorate');
	});

	it('USER.DELETE function works correctly', () => {
		const userId = 'user-123';
		const endpoint = API_ENDPOINTS.USER.DELETE(userId);
		expect(endpoint).toBe(`/User/${userId}`);
	});

	it('handles special characters in username', () => {
		const username = 'user@example.com';
		const endpoint = API_ENDPOINTS.USER.BY_USERNAME(username);
		expect(endpoint).toBe(`/User/username/${encodeURIComponent(username)}`);
	});
});




