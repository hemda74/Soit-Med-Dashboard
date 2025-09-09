import { useAppStore } from '@/stores/appStore';

/**
 * Utility hook for managing loading states
 * Provides convenient methods to show/hide loading with the Logo Loader.gif
 */
export function useLoading() {
	const { setLoading, loading } = useAppStore();

	const showLoading = () => setLoading(true);
	const hideLoading = () => setLoading(false);

	/**
	 * Wraps an async function with loading state management
	 * @param asyncFn - The async function to wrap
	 * @returns Promise with the result of the async function
	 */
	const withLoading = async <T>(
		asyncFn: () => Promise<T>
	): Promise<T> => {
		try {
			showLoading();
			return await asyncFn();
		} finally {
			hideLoading();
		}
	};

	return {
		loading,
		showLoading,
		hideLoading,
		withLoading,
	};
}

export default useLoading;
