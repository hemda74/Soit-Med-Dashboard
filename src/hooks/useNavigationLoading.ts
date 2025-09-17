import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

export function useNavigationLoading() {
	const location = useLocation();
	const { setLoading } = useAppStore();

	useEffect(() => {
		// Show loading when route changes
		setLoading(true);

		// Hide loading after a short delay to ensure smooth transition
		const timer = setTimeout(() => {
			setLoading(false);
		}, 500); // Adjust timing as needed

		return () => clearTimeout(timer);
	}, [location.pathname, setLoading]);
}

export default useNavigationLoading;
