// API Configuration
export const API_CONFIG = {
	BASE_URL:
		import.meta.env.VITE_API_BASE_URL ||
		'http://localhost:5117/api',
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
