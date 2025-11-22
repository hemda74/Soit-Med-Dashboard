import { getApiBaseUrl } from './apiConfig';

// Get API base URL - automatically detects network IP when accessed from network
export const getApiBaseUrlForConstants = () => {
	const base = getApiBaseUrl();
	return base.endsWith('/api') ? base : `${base}/api`;
};

export const STORAGE_KEYS = {
	AUTH_TOKEN: 'authToken',
	USER_DATA: 'userData',
} as const;

export const ROUTES = {
	LOGIN: '/login',
	REGISTER: '/register',
	DASHBOARD: '/dashboard',
	USERS: '/users/all',
	ROLES: '/roles',
} as const;
