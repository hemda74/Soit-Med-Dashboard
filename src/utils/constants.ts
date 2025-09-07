export const API_BASE_URL =
	process.env.REACT_APP_API_BASE_URL || 'https://localhost:5117/api';

export const STORAGE_KEYS = {
	AUTH_TOKEN: 'authToken',
	USER_DATA: 'userData',
} as const;

export const ROUTES = {
	LOGIN: '/login',
	REGISTER: '/register',
	DASHBOARD: '/dashboard',
	USERS: '/users',
	ROLES: '/roles',
} as const;
