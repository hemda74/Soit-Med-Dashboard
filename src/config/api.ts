import { getApiBaseUrl } from '@/utils/apiConfig';

// API Configuration
export const API_CONFIG = {
	get BASE_URL() {
		const base = getApiBaseUrl();
		// Append /api if not already present
		return base.endsWith('/api') ? base : `${base}/api`;
	},
	ENDPOINTS: {
		LOGIN: '/Account/login',
		USER_ME: '/User/me',
		AVAILABLE_ROLES: '/Role',
		USERS: '/User',
	},
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
	return `${API_CONFIG.BASE_URL}${endpoint}`;
};
