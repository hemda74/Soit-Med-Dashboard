import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ApiCall {
	id: string;
	endpoint: string;
	method: string;
	status: 'pending' | 'success' | 'error';
	startTime: number;
	endTime?: number;
	error?: string;
}

export interface ApiState {
	// Loading states for different API calls
	loadingStates: Record<string, boolean>;

	// Error states
	errors: Record<string, string | null>;

	// API call history (for debugging)
	apiCalls: ApiCall[];

	// Global loading state
	isGlobalLoading: boolean;
	globalLoadingMessage?: string;

	// Actions
	setLoading: (key: string, loading: boolean) => void;
	setError: (key: string, error: string | null) => void;
	clearError: (key: string) => void;
	clearAllErrors: () => void;

	// API call tracking
	startApiCall: (endpoint: string, method: string) => string;
	finishApiCall: (id: string, success: boolean, error?: string) => void;
	clearApiHistory: () => void;

	// Global loading
	setGlobalLoading: (loading: boolean, message?: string) => void;

	// Utility methods
	isLoading: (key: string) => boolean;
	hasError: (key: string) => boolean;
	getError: (key: string) => string | null;
}

export const useApiStore = create<ApiState>()(
	subscribeWithSelector((set, get) => ({
		loadingStates: {},
		errors: {},
		apiCalls: [],
		isGlobalLoading: false,
		globalLoadingMessage: undefined,

		// Loading state management
		setLoading: (key: string, loading: boolean) => {
			set((state) => ({
				loadingStates: {
					...state.loadingStates,
					[key]: loading,
				},
			}));
		},

		// Error state management
		setError: (key: string, error: string | null) => {
			set((state) => ({
				errors: {
					...state.errors,
					[key]: error,
				},
			}));
		},

		clearError: (key: string) => {
			set((state) => {
				const newErrors = { ...state.errors };
				delete newErrors[key];
				return { errors: newErrors };
			});
		},

		clearAllErrors: () => {
			set({ errors: {} });
		},

		// API call tracking
		startApiCall: (endpoint: string, method: string) => {
			const id = `api-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
			const apiCall: ApiCall = {
				id,
				endpoint,
				method,
				status: 'pending',
				startTime: Date.now(),
			};

			set((state) => ({
				apiCalls: [
					apiCall,
					...state.apiCalls.slice(0, 49),
				], // Keep last 50 calls
			}));

			return id;
		},

		finishApiCall: (
			id: string,
			success: boolean,
			error?: string
		) => {
			set((state) => ({
				apiCalls: state.apiCalls.map((call) =>
					call.id === id
						? {
								...call,
								status: success
									? 'success'
									: 'error',
								endTime: Date.now(),
								error,
						  }
						: call
				),
			}));
		},

		clearApiHistory: () => {
			set({ apiCalls: [] });
		},

		// Global loading state
		setGlobalLoading: (loading: boolean, message?: string) => {
			set({
				isGlobalLoading: loading,
				globalLoadingMessage: message,
			});
		},

		// Utility methods
		isLoading: (key: string) => {
			return get().loadingStates[key] || false;
		},

		hasError: (key: string) => {
			return !!get().errors[key];
		},

		getError: (key: string) => {
			return get().errors[key] || null;
		},
	}))
);

// Selectors for common use cases
export const useApiLoading = (key: string) =>
	useApiStore((state) => state.loadingStates[key] || false);

export const useApiError = (key: string) =>
	useApiStore((state) => state.errors[key] || null);

export const useGlobalLoading = () =>
	useApiStore((state) => state.isGlobalLoading);

export const useApiCallHistory = () => useApiStore((state) => state.apiCalls);
