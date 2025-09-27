import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

/**
 * Unified loading utility hook
 * Provides convenient methods to manage global loading state
 */
export function useLoading() {
	const { setLoading, loading } = useAppStore();

	const showLoading = useCallback(() => setLoading(true), [setLoading]);
	const hideLoading = useCallback(() => setLoading(false), [setLoading]);

	/**
	 * Wraps an async function with loading state management
	 * @param asyncFn - The async function to wrap
	 * @returns Promise with the result of the async function
	 */
	const withLoading = useCallback(
		async <T>(asyncFn: () => Promise<T>): Promise<T> => {
			try {
				showLoading();
				return await asyncFn();
			} finally {
				hideLoading();
			}
		},
		[showLoading, hideLoading]
	);

	return {
		loading,
		showLoading,
		hideLoading,
		withLoading,
	};
}

export default useLoading;
