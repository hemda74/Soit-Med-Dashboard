// API Endpoints Configuration
export const API_ENDPOINTS = {
	// Auth endpoints
	AUTH: {
		LOGIN: '/auth/login',
		LOGOUT: '/auth/logout',
		REFRESH: '/auth/refresh',
		FORGOT_PASSWORD: '/auth/forgot-password',
		VERIFY_CODE: '/auth/verify-code',
		RESET_PASSWORD: '/auth/reset-password',
		CHANGE_PASSWORD: '/auth/change-password',
		PROFILE: '/auth/profile',
		CURRENT_USER: '/auth/current-user',
	},

	// User endpoints
	USER: {
		LIST: '/users',
		ALL: '/users/all',
		CREATE: '/users',
		GET_BY_ID: (id: number) => `/users/${id}`,
		UPDATE: (id: number) => `/users/${id}`,
		DELETE: (id: number) => `/users/${id}`,
		STATISTICS: '/users/statistics',
		ACTIVATE: (id: number) => `/users/${id}/activate`,
		DEACTIVATE: (id: number) => `/users/${id}/deactivate`,
		UPLOAD_IMAGE: (id: number) => `/users/${id}/upload-image`,
		DELETE_IMAGE: (id: number) => `/users/${id}/delete-image`,
	},

	// Dashboard endpoints
	DASHBOARD: {
		STATS: '/dashboard/stats',
		ANALYTICS: '/dashboard/analytics',
		RECENT_ACTIVITY: '/dashboard/recent-activity',
	},

	// Notifications endpoints
	NOTIFICATIONS: {
		LIST: '/notifications',
		MARK_READ: (id: number) => `/notifications/${id}/read`,
		MARK_ALL_READ: '/notifications/mark-all-read',
		DELETE: (id: number) => `/notifications/${id}`,
		CLEAR_ALL: '/notifications/clear-all',
	},

	// Sales endpoints
	SALES: {
		// Client Management
		CLIENT_SEARCH: '/client/search',
		CLIENT_CREATE: '/client',
		CLIENT_BY_ID: (id: number) => `/client/${id}`,
		CLIENT_PROFILE: (id: number) => `/client/${id}/profile`,
		MY_CLIENTS: '/client/my-clients',

		// Task Progress
		TASK_PROGRESS: '/taskprogress',
		TASK_PROGRESS_WITH_OFFER: '/taskprogress/with-offer-request',
		TASK_PROGRESS_BY_TASK: (taskId: number) =>
			`/taskprogress/task/${taskId}`,
		TASK_PROGRESS_BY_CLIENT: (clientId: number) =>
			`/taskprogress/by-client/${clientId}`,

		// Offer Requests
		OFFER_REQUEST: '/offerrequest',
		OFFER_REQUEST_BY_ID: (id: number) => `/offerrequest/${id}`,
		OFFER_REQUEST_ASSIGN: (id: number) =>
			`/offerrequest/${id}/assign`,
		OFFER_REQUEST_ASSIGNED: (supportId: string) =>
			`/offerrequest/assigned/${supportId}`,

		// Sales Offers
		OFFERS: '/offer',
		MY_OFFERS: '/offer/my-offers',
		OFFER_BY_ID: (id: number) => `/offer/${id}`,

		// Deals
		DEALS: '/deal',
		DEAL_BY_ID: (id: number) => `/deal/${id}`,
		DEAL_MANAGER_APPROVAL: (id: number) =>
			`/deal/${id}/manager-approval`,
		DEAL_SUPERADMIN_APPROVAL: (id: number) =>
			`/deal/${id}/superadmin-approval`,
		PENDING_MANAGER_APPROVALS: '/deal/pending-manager-approvals',
		PENDING_SUPERADMIN_APPROVALS:
			'/deal/pending-superadmin-approvals',

		// Sales Reports
		SALES_REPORT: '/salesreport',
		SALES_REPORT_BY_ID: (id: number) => `/salesreport/${id}`,
		SALES_REPORT_RATE: (id: number) => `/salesreport/${id}/rate`,
	},

	// Weekly plans endpoints
	WEEKLY_PLANS: {
		LIST: '/weekly-plans',
		CREATE: '/weekly-plans',
		GET_BY_ID: (id: number) => `/weekly-plans/${id}`,
		BY_ID: (id: number) => `/weekly-plans/${id}`,
		UPDATE: (id: number) => `/weekly-plans/${id}`,
		DELETE: (id: number) => `/weekly-plans/${id}`,
		REVIEW: (id: number) => `/weekly-plans/${id}/review`,
		SUBMIT: (id: number) => `/weekly-plans/${id}/submit`,
		CURRENT: '/weekly-plans/current',
		CREATE_ITEM: '/WeeklyPlanItem',
	},

	// Finance endpoints
	FINANCE: {
		BUDGETS: '/finance/budgets',
		EXPENSES: '/finance/expenses',
		REPORTS: '/finance/reports',
		ANALYTICS: '/finance/analytics',
	},

	// Admin endpoints
	ADMIN: {
		ROLES: '/admin/roles',
		PERMISSIONS: '/admin/permissions',
		SETTINGS: '/admin/settings',
		LOGS: '/admin/logs',
	},
} as const;
