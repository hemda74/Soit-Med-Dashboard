import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,

			login: async (email: string, password: string) => {
				set({ isLoading: true });

				try {
					// Simulate API call
					await new Promise((resolve) =>
						setTimeout(resolve, 1000)
					);

					// Mock successful login
					if (
						email === 'admin@example.com' &&
						password === 'password'
					) {
						const user = {
							id: '1',
							email,
							name: 'Admin User',
						};
						set({
							user,
							isAuthenticated: true,
							isLoading: false,
						});
					} else {
						throw new Error(
							'Invalid credentials'
						);
					}
				} catch (error) {
					set({ isLoading: false });
					throw error;
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
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
