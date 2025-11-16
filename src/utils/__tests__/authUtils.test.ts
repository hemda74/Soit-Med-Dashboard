import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAuthToken, isAuthenticated, getCurrentUser } from '../authUtils';

describe('authUtils', () => {
	const originalLocalStorage = global.localStorage;

	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
	});

	describe('getAuthToken', () => {
		it('returns null when no auth storage exists', () => {
			expect(getAuthToken()).toBeNull();
		});

		it('returns null when auth storage is empty', () => {
			localStorage.setItem('auth-storage', '{}');
			expect(getAuthToken()).toBeNull();
		});

		it('returns token when auth storage contains valid token', () => {
			const authState = {
				state: {
					user: {
						token: 'test-token-123',
					},
				},
			};
			localStorage.setItem('auth-storage', JSON.stringify(authState));
			expect(getAuthToken()).toBe('test-token-123');
		});

		it('returns null when auth storage has invalid JSON', () => {
			localStorage.setItem('auth-storage', 'invalid-json');
			// Should handle error gracefully
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			expect(getAuthToken()).toBeNull();
			consoleSpy.mockRestore();
		});

		it('returns null when user object is missing', () => {
			const authState = {
				state: {},
			};
			localStorage.setItem('auth-storage', JSON.stringify(authState));
			expect(getAuthToken()).toBeNull();
		});
	});

	describe('isAuthenticated', () => {
		it('returns false when no token exists', () => {
			expect(isAuthenticated()).toBe(false);
		});

		it('returns true when token exists', () => {
			const authState = {
				state: {
					user: {
						token: 'test-token',
					},
				},
			};
			localStorage.setItem('auth-storage', JSON.stringify(authState));
			expect(isAuthenticated()).toBe(true);
		});

		it('returns false when token is null', () => {
			const authState = {
				state: {
					user: {
						token: null,
					},
				},
			};
			localStorage.setItem('auth-storage', JSON.stringify(authState));
			expect(isAuthenticated()).toBe(false);
		});
	});

	describe('getCurrentUser', () => {
		it('returns null when no auth storage exists', () => {
			expect(getCurrentUser()).toBeNull();
		});

		it('returns null when auth storage is empty', () => {
			localStorage.setItem('auth-storage', '{}');
			expect(getCurrentUser()).toBeNull();
		});

		it('returns user object when auth storage contains user', () => {
			const user = {
				id: '1',
				userName: 'testuser',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
			};
			const authState = {
				state: {
					user,
				},
			};
			localStorage.setItem('auth-storage', JSON.stringify(authState));
			expect(getCurrentUser()).toEqual(user);
		});

		it('returns null when auth storage has invalid JSON', () => {
			localStorage.setItem('auth-storage', 'invalid-json');
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			expect(getCurrentUser()).toBeNull();
			consoleSpy.mockRestore();
		});

		it('returns null when user object is missing', () => {
			const authState = {
				state: {},
			};
			localStorage.setItem('auth-storage', JSON.stringify(authState));
			expect(getCurrentUser()).toBeNull();
		});
	});
});




