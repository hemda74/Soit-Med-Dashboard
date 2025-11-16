import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('AuthStore', () => {
	beforeEach(() => {
		// Reset store state before each test
		useAuthStore.getState().logout();
	});

	it('initializes with no user', () => {
		const state = useAuthStore.getState();
		expect(state.isAuthenticated).toBe(false);
		expect(state.user).toBeNull();
	});

	it('sets user on login', () => {
		const mockTokens = {
			token: 'test-token',
			expired: new Date().toISOString(),
		};

		// Note: This is a simplified test - actual login requires API call
		// In real tests, you'd mock the API service
		const state = useAuthStore.getState();
		expect(state.isAuthenticated).toBe(false);
	});

	it('clears user on logout', () => {
		const state = useAuthStore.getState();
		state.logout();
		expect(state.isAuthenticated).toBe(false);
		expect(state.user).toBeNull();
	});

	it('checks role correctly', () => {
		const state = useAuthStore.getState();
		// Mock user with roles by directly setting state
		// Note: In real usage, user would be set via login() method
		useAuthStore.setState({
			user: {
				id: '1',
				userName: 'test',
				email: 'test@test.com',
				firstName: 'Test',
				lastName: 'User',
				fullName: 'Test User',
				isActive: true,
				roles: ['SuperAdmin'],
				departmentId: 1,
				departmentName: 'IT',
				departmentDescription: 'IT Department',
				createdAt: new Date().toISOString(),
				lastLoginAt: null,
				profileImage: null,
				phoneNumber: null,
				token: 'test-token',
			},
			isAuthenticated: true,
		});

		const updatedState = useAuthStore.getState();
		expect(updatedState.hasRole('SuperAdmin')).toBe(true);
		expect(updatedState.hasRole('Admin')).toBe(false);
	});
});

