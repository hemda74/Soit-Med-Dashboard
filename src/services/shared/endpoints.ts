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
		FORGOT_PASSWORD: '/Account/forgot-password',
		VERIFY_CODE: '/Account/verify-code',
		RESET_PASSWORD: '/Account/reset-password',
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
		DELETE: (userId: string) => `/User/${userId}`,
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
		MAINTENANCE_MANAGER: '/RoleSpecificUser/maintenance-manager',
		MAINTENANCE_SUPPORT: '/RoleSpecificUser/maintenance-support',
	},

	// Sales Reports (Legacy - kept for backward compatibility)
	SALES_REPORT: {
		BASE: '/api/SalesReport',
		BY_ID: (id: number) => `/api/SalesReport/${id}`,
		RATE: (id: number) => `/api/SalesReport/${id}/rate`,
	},

	// Weekly Plan (New To-Do List System)
	WEEKLY_PLAN: {
		BASE: '/api/WeeklyPlan',
		BY_ID: (id: number) => `/api/WeeklyPlan/${id}`,
		REVIEW: (id: number) => `/api/WeeklyPlan/${id}/review`,
		TASKS: (weeklyPlanId: number) =>
			`/api/WeeklyPlan/${weeklyPlanId}/tasks`,
		TASK_BY_ID: (weeklyPlanId: number, taskId: number) =>
			`/api/WeeklyPlan/${weeklyPlanId}/tasks/${taskId}`,
		PROGRESS: (weeklyPlanId: number) =>
			`/api/WeeklyPlan/${weeklyPlanId}/progress`,
		PROGRESS_BY_ID: (weeklyPlanId: number, progressId: number) =>
			`/api/WeeklyPlan/${weeklyPlanId}/progress/${progressId}`,
	},

	// Dashboard
	DASHBOARD: {
		STATS: '/api/Dashboard/stats',
	},

	// Sales Module
	SALES: {
		// Client Management
		CLIENT: {
			BASE: '/api/Client',
			BY_ID: (id: string) => `/api/Client/${id}`,
			SEARCH: '/api/Client/search',
			MY_CLIENTS: '/api/Client/my-clients',
			FOLLOW_UP_NEEDED: '/api/Client/follow-up-needed',
			STATISTICS: '/api/Client/statistics',
			FIND_OR_CREATE: '/api/Client/find-or-create',
		},
		// Client Visits
		CLIENT_VISIT: {
			BASE: '/api/ClientVisit',
			BY_ID: (id: string) => `/api/ClientVisit/${id}`,
			BY_CLIENT: (clientId: string) =>
				`/api/ClientVisit/client/${clientId}`,
			OVERDUE: '/api/ClientVisit/overdue',
			UPCOMING: '/api/ClientVisit/upcoming',
		},
		// Client Interactions
		CLIENT_INTERACTION: {
			BASE: '/api/ClientInteraction',
			BY_ID: (id: string) => `/api/ClientInteraction/${id}`,
			BY_CLIENT: (clientId: string) =>
				`/api/ClientInteraction/client/${clientId}`,
		},
		// Sales Analytics
		SALES_ANALYTICS: {
			BASE: '/api/SalesAnalytics',
			DASHBOARD: '/api/SalesAnalytics/dashboard',
			PERFORMANCE: '/api/SalesAnalytics/performance',
			TRENDS: '/api/SalesAnalytics/trends',
			EXPORT: '/api/SalesAnalytics/export',
		},
		// Sales Reports
		SALES_REPORT: {
			BASE: '/api/SalesReport',
			BY_ID: (id: string) => `/api/SalesReport/${id}`,
			GENERATE: '/api/SalesReport/generate',
			EXPORT: (id: string) => `/api/SalesReport/${id}/export`,
		},
	},
} as const;
