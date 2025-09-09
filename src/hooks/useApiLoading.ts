import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

export function useApiLoading() {
	const { setLoading } = useAppStore();

	const withLoading = useCallback(
		async <T>(apiCall: () => Promise<T>): Promise<T> => {
			try {
				setLoading(true);
				const result = await apiCall();
				return result;
			} finally {
				setLoading(false);
			}
		},
		[setLoading]
	);

	return { withLoading };
}

export default useApiLoading;
