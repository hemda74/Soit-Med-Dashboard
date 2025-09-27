import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/utils/loadingUtils';

export function useNavigationLoading() {
	const location = useLocation();
	const { showLoading, hideLoading } = useLoading();

	useEffect(() => {
		// Show loading when route changes
		showLoading();

		// Hide loading after a short delay to ensure smooth transition
		const timer = setTimeout(() => {
			hideLoading();
		}, 300); // Reduced timing for better UX

		return () => clearTimeout(timer);
	}, [location.pathname, showLoading, hideLoading]);
}

export default useNavigationLoading;
