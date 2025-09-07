import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { loginUser, getCurrentUser, decodeToken } from '../services/authApi';
import type { AuthUser } from '../types/auth.types';
import toast from 'react-hot-toast';

export interface User extends AuthUser {
	token: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	loginAttempts: number;
	lastLoginAttempt: number | null;
	sessionExpiry: number | null;
	rememberMe: boolean;

	// Actions
	login: (userName: string, password: string) => Promise<void>;
	fetchUserData: () => Promise<void>;
	logout: () => void;
	setLoading: (loading: boolean) => void;

	// Session management
	checkTokenExpiry: () => boolean;
	refreshToken: () => Promise<void>;
	extendSession: () => void;

	// Security features
	incrementLoginAttempts: () => void;
	resetLoginAttempts: () => void;
	isAccountLocked: () => boolean;

	// User preferences
	setRememberMe: (remember: boolean) => void;
	updateUserProfile: (updates: Partial<AuthUser>) => void;

	// Permissions
	hasRole: (role: string) => boolean;
	hasAnyRole: (roles: string[]) => boolean;
	hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
	subscribeWithSelector(
		persist(
			(set, get) => ({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				loginAttempts: 0,
				lastLoginAttempt: null,
				sessionExpiry: null,
				rememberMe: false,

				login: async (
					userName: string,
					password: string
				) => {
					set({ isLoading: true });

					try {
						// Check if account is locked
						if (get().isAccountLocked()) {
							throw new Error(
								'Account temporarily locked due to multiple failed attempts. Please try again later.'
							);
						}

						// Call the real API
						const response =
							await loginUser({
								UserName: userName,
								Password: password,
							});

						// Fetch complete user data using the token
						const userData =
							await getCurrentUser(
								response.token
							);

						// Calculate session expiry
						const decoded = decodeToken(
							response.token
						);
						const sessionExpiry =
							decoded?.exp
								? decoded.exp *
								  1000
								: Date.now() +
								  24 *
										60 *
										60 *
										1000;

						const user: User = {
							...userData,
							token: response.token,
						};

						set({
							user,
							isAuthenticated: true,
							isLoading: false,
							sessionExpiry,
							loginAttempts: 0,
							lastLoginAttempt: null,
						});

						toast.success(
							`Welcome back, ${user.firstName}!`
						);
					} catch (error: any) {
						get().incrementLoginAttempts();
						set({ isLoading: false });
						const errorMessage =
							error.message ||
							'Login failed. Please check your credentials.';
						toast.error(errorMessage);
						throw new Error(errorMessage);
					}
				},

				fetchUserData: async () => {
					const { user } = get();
					if (!user?.token) return;

					try {
						set({ isLoading: true });
						const userData =
							await getCurrentUser(
								user.token
							);

						set({
							user: {
								...userData,
								token: user.token,
							},
							isLoading: false,
						});
					} catch (error: any) {
						console.error(
							'Failed to fetch user data:',
							error
						);
						set({ isLoading: false });
						// If token is invalid, logout
						if (
							error.message.includes(
								'401'
							) ||
							error.message.includes(
								'403'
							)
						) {
							get().logout();
						}
					}
				},

				logout: () => {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					});
				},

				setLoading: (loading: boolean) => {
					set({ isLoading: loading });
				},

				// Session management
				checkTokenExpiry: () => {
					const { sessionExpiry } = get();
					if (!sessionExpiry) return false;
					return Date.now() > sessionExpiry;
				},

				refreshToken: async () => {
					const { user } = get();
					if (!user?.token) return;

					try {
						// This would call a refresh token endpoint
						// For now, we'll just extend the current session
						get().extendSession();
					} catch (error) {
						console.error(
							'Token refresh failed:',
							error
						);
						get().logout();
					}
				},

				extendSession: () => {
					const newExpiry =
						Date.now() +
						24 * 60 * 60 * 1000; // 24 hours
					set({ sessionExpiry: newExpiry });
				},

				// Security features
				incrementLoginAttempts: () => {
					set((state) => ({
						loginAttempts:
							state.loginAttempts + 1,
						lastLoginAttempt: Date.now(),
					}));
				},

				resetLoginAttempts: () => {
					set({
						loginAttempts: 0,
						lastLoginAttempt: null,
					});
				},

				isAccountLocked: () => {
					const {
						loginAttempts,
						lastLoginAttempt,
					} = get();
					if (loginAttempts < 5) return false;

					const lockoutDuration = 15 * 60 * 1000; // 15 minutes
					if (!lastLoginAttempt) return false;

					return (
						Date.now() - lastLoginAttempt <
						lockoutDuration
					);
				},

				// User preferences
				setRememberMe: (remember: boolean) => {
					set({ rememberMe: remember });
				},

				updateUserProfile: (
					updates: Partial<AuthUser>
				) => {
					set((state) => ({
						user: state.user
							? {
									...state.user,
									...updates,
							  }
							: null,
					}));
				},

				// Permissions
				hasRole: (role: string) => {
					const { user } = get();
					return (
						user?.roles.includes(role) ||
						false
					);
				},

				hasAnyRole: (roles: string[]) => {
					const { user } = get();
					if (!user) return false;
					return roles.some((role) =>
						user.roles.includes(role)
					);
				},

				hasPermission: (permission: string) => {
					// This would typically check against a permissions system
					// For now, we'll use role-based permissions
					const { user } = get();
					if (!user) return false;

					// SuperAdmin has all permissions
					if (user.roles.includes('SuperAdmin'))
						return true;

					// Add more granular permission logic here
					return false;
				},
			}),
			{
				name: 'auth-storage',
				partialize: (state) => ({
					user: state.user,
					isAuthenticated: state.isAuthenticated,
					sessionExpiry: state.sessionExpiry,
					rememberMe: state.rememberMe,
				}),
			}
		)
	)
);
