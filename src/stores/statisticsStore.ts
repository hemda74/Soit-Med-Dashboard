import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { fetchUserStatistics } from '@/services';
import type { UserStatistics } from '@/types/api.types';

export interface StatisticsState {
	// Data
	statistics: UserStatistics | null;

	// Loading and error states
	isLoading: boolean;
	error: string | null;

	// Cache management
	lastFetched: number | null;
	cacheExpiry: number; // Cache expires after 5 minutes

	// Debug info
	apiCallCount: number;
	lastApiCallTime: number | null;

	// Actions
	fetchStatistics: (
		token: string,
		forceRefresh?: boolean
	) => Promise<void>;
	clearStatistics: () => void;
	clearError: () => void;

	// Computed values
	isStale: () => boolean;
	shouldFetch: (token: string) => boolean;
}

export const useStatisticsStore = create<StatisticsState>()(
	subscribeWithSelector((set, get) => ({
		statistics: null,
		isLoading: false,
		error: null,
		lastFetched: null,
		cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
		apiCallCount: 0,
		lastApiCallTime: null,

		fetchStatistics: async (
			token: string,
			forceRefresh = false
		) => {
			const state = get();

			// Don't fetch if already loading
			if (state.isLoading) {
				return;
			}

			// Don't fetch if we have fresh data and not forcing refresh
			if (
				!forceRefresh &&
				state.statistics &&
				!state.isStale()
			) {
				return;
			}

			// Don't fetch if we don't have a token
			if (!token) {
				set({
					error: 'No authentication token available',
				});
				return;
			}

			set({ isLoading: true, error: null });

			try {
				console.log('Fetching user statistics...');
				const data = await fetchUserStatistics(token);
				set({
					statistics: data,
					isLoading: false,
					error: null,
					lastFetched: Date.now(),
					apiCallCount: get().apiCallCount + 1,
					lastApiCallTime: Date.now(),
				});
				console.log(
					'User statistics fetched successfully:',
					data
				);
			} catch (error) {
				console.error(
					'Failed to fetch statistics:',
					error
				);
				set({
					isLoading: false,
					error:
						error instanceof Error
							? error.message
							: 'Failed to fetch statistics',
				});
			}
		},

		clearStatistics: () => {
			set({
				statistics: null,
				isLoading: false,
				error: null,
				lastFetched: null,
				apiCallCount: 0,
				lastApiCallTime: null,
			});
		},

		clearError: () => {
			set({ error: null });
		},

		isStale: () => {
			const state = get();
			if (!state.lastFetched) return true;
			return (
				Date.now() - state.lastFetched >
				state.cacheExpiry
			);
		},

		shouldFetch: (token: string) => {
			const state = get();
			return (
				!state.isLoading &&
				(!state.statistics || state.isStale()) &&
				!!token
			);
		},
	}))
);

// Selectors for common use cases
export const useStatistics = () =>
	useStatisticsStore((state) => state.statistics);
export const useStatisticsLoading = () =>
	useStatisticsStore((state) => state.isLoading);
export const useStatisticsError = () =>
	useStatisticsStore((state) => state.error);
// Individual action selectors to prevent infinite loops
export const useFetchStatistics = () =>
	useStatisticsStore((state) => state.fetchStatistics);
export const useClearStatistics = () =>
	useStatisticsStore((state) => state.clearStatistics);
export const useClearError = () =>
	useStatisticsStore((state) => state.clearError);

// Debug selectors
export const useStatisticsDebugInfo = () =>
	useStatisticsStore((state) => ({
		apiCallCount: state.apiCallCount,
		lastApiCallTime: state.lastApiCallTime,
	}));

// Individual debug selectors to prevent infinite loops
export const useApiCallCount = () =>
	useStatisticsStore((state) => state.apiCallCount);
export const useLastApiCallTime = () =>
	useStatisticsStore((state) => state.lastApiCallTime);
