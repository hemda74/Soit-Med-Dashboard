export const API_BASE_URL = 'http://localhost:5117/api';

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
