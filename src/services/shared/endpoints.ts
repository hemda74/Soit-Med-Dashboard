// Shared API endpoints configuration

export const API_ENDPOINTS = {
	// Authentication
	AUTH: {
		LOGIN: '/Account/login',
		REFRESH: '/Account/refresh',
		CURRENT_USER: '/User/me',
		CHANGE_PASSWORD: '/Account/change-password',
		SUPERADMIN_UPDATE_PASSWORD:
			'/Account/superadmin-update-password',
	},

	// User Management
	USER: {
		ALL: '/User/all',
		BY_ID: (id: string) => `/User/${id}`,
		BY_DEPARTMENT: (id: number) => `/User/department/${id}`,
		BY_USERNAME: (username: string) =>
			`/User/username/${encodeURIComponent(username)}`,
		BY_ROLE: (role: string) =>
			`/User/role/${encodeURIComponent(role)}`,
		ACTIVATE_DEACTIVATE: '/User/activate-deactivate',
		DELETE: (userId: string) => `/User?userId=${userId}`,
		IMAGE: '/User/image',
		STATISTICS: '/User/statistics',
		COUNTS: '/User/counts',
	},

	// Role Management
	ROLE: {
		ALL: '/Role',
		FIELDS: '/Role/fields',
	},

	// Department Management
	DEPARTMENT: {
		ALL: '/Department',
	},

	// Hospital Management
	HOSPITAL: {
		ALL: '/Hospital',
	},

	// Governorate Management
	GOVERNORATE: {
		ALL: '/Governorate',
	},

	// Role-Specific User Creation
	ROLE_SPECIFIC_USER: {
		BASE: '/RoleSpecificUser',
		DOCTOR: '/RoleSpecificUser/doctor',
		ENGINEER: '/RoleSpecificUser/engineer',
		TECHNICIAN: '/RoleSpecificUser/technician',
		ADMIN: '/RoleSpecificUser/admin',
		FINANCE_MANAGER: '/RoleSpecificUser/finance-manager',
		FINANCE_EMPLOYEE: '/RoleSpecificUser/finance-employee',
		LEGAL_MANAGER: '/RoleSpecificUser/legal-manager',
		LEGAL_EMPLOYEE: '/RoleSpecificUser/legal-employee',
		SALESMAN: '/RoleSpecificUser/salesman',
		SALES_MANAGER: '/RoleSpecificUser/sales-manager',
	},

	// Sales Reports
	SALES_REPORT: {
		BASE: '/api/SalesReport',
		BY_ID: (id: number) => `/api/SalesReport/${id}`,
		RATE: (id: number) => `/api/SalesReport/${id}/rate`,
	},

	// Dashboard
	DASHBOARD: {
		STATS: '/api/Dashboard/stats',
	},
} as const;
