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
		BASE: '/api/salesreport',
		BY_ID: (id: number) => `/api/salesreport/${id}`,
		RATE: (id: number) => `/api/salesreport/${id}/rate`,
	},

	// Weekly Plan (New To-Do List System)
	WEEKLY_PLAN: {
		BASE: '/api/WeeklyPlan',
		BY_ID: (id: number) => `/api/WeeklyPlan/${id}`,
		CURRENT: '/api/WeeklyPlan/current',
		SALESMEN: '/api/WeeklyPlan/salesmen',
		SUBMIT: (id: number) => `/api/WeeklyPlan/${id}/submit`,
		REVIEW: (id: number) => `/api/WeeklyPlan/${id}/review`,
		TASKS: (id: number) => `/api/WeeklyPlan/${id}/tasks`,
		TASK_BY_ID: (planId: number, taskId: number) =>
			`/api/WeeklyPlan/${planId}/tasks/${taskId}`,
		PROGRESS: (planId: number) =>
			`/api/WeeklyPlan/${planId}/progress`,
		PROGRESS_BY_ID: (planId: number, progressId: number) =>
			`/api/WeeklyPlan/${planId}/progress/${progressId}`,
	},

	// Dashboard
	DASHBOARD: {
		STATS: '/api/Dashboard/stats',
	},

	// Sales Module
	SALES: {
		// Client Management
		CLIENT: {
			BASE: '/api/client',
			BY_ID: (id: string) => `/api/client/${id}`,
			SEARCH: '/api/client/search',
			PROFILE: (id: string) => `/api/client/${id}/profile`,
			FIND_OR_CREATE: '/api/client/find-or-create',
			FOLLOW_UP_NEEDED: '/api/client/follow-up-needed',
			STATISTICS: '/api/client/statistics',
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
		// Client Tracking
		CLIENT_TRACKING: {
			VISITS: (clientId: string) =>
				`/api/ClientTracking/${clientId}/visits`,
			INTERACTIONS: (clientId: string) =>
				`/api/ClientTracking/${clientId}/interactions`,
			ANALYTICS: (clientId: string) =>
				`/api/ClientTracking/${clientId}/analytics`,
			SUMMARY: (clientId: string) =>
				`/api/ClientTracking/${clientId}/summary`,
			TIMELINE: (clientId: string) =>
				`/api/ClientTracking/${clientId}/timeline`,
			EXPORT: (clientId: string) =>
				`/api/ClientTracking/${clientId}/export`,
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
			DASHBOARD: '/api/SalesReport/dashboard',
			TRENDS: '/api/SalesReport/trends',
			TOP_PERFORMERS: '/api/SalesReport/top-performers',
		},
		// Request Workflows
		REQUEST_WORKFLOWS: {
			BASE: '/api/RequestWorkflows',
			BY_ID: (id: string) => `/api/RequestWorkflows/${id}`,
			SENT: '/api/RequestWorkflows/sent',
			ASSIGNED: '/api/RequestWorkflows/assigned',
			STATUS: (id: string) =>
				`/api/RequestWorkflows/${id}/status`,
			ASSIGN: (id: string) =>
				`/api/RequestWorkflows/${id}/assign`,
		},
		// Delivery Terms
		DELIVERY_TERMS: {
			BASE: '/api/DeliveryTerms',
			BY_ID: (id: string) => `/api/DeliveryTerms/${id}`,
		},
		// Payment Terms
		PAYMENT_TERMS: {
			BASE: '/api/PaymentTerms',
			BY_ID: (id: string) => `/api/PaymentTerms/${id}`,
		},
		// Deals (NEW)
		DEALS: {
			BASE: '/api/Deal',
			BY_ID: (id: string) => `/api/Deal/${id}`,
			MANAGER_APPROVAL: (id: string) =>
				`/api/Deal/${id}/manager-approval`,
			SUPERADMIN_APPROVAL: (id: string) =>
				`/api/Deal/${id}/superadmin-approval`,
			PENDING_MANAGER: '/api/Deal/pending-manager-approvals',
			PENDING_SUPERADMIN:
				'/api/Deal/pending-superadmin-approvals',
			BY_SALESMAN: (salesmanId: string) =>
				`/api/Deal/by-salesman/${salesmanId}`,
			COMPLETE: (id: string) => `/api/Deal/${id}/complete`,
			FAIL: (id: string) => `/api/Deal/${id}/fail`,
		},
		// Offers (ENHANCED) - For SalesManager/SuperAdmin only
		OFFERS: {
			BASE: '/api/Offer',
			BY_ID: (id: number | string) => `/api/Offer/${id}`,
			MY_OFFERS: '/api/Offer/my-offers',
			SALESMEN: '/api/Offer/salesmen',
			BY_SALESMAN: (salesmanId: string) =>
				`/api/Offer/by-salesman/${salesmanId}`,
			REQUEST_DETAILS: (requestId: number | string) =>
				`/api/Offer/request/${requestId}/details`,
			// Enhanced Offer Features
			EQUIPMENT: (id: number | string) =>
				`/api/Offer/${id}/equipment`,
			EQUIPMENT_BY_ID: (
				id: number | string,
				equipmentId: number
			) => `/api/Offer/${id}/equipment/${equipmentId}`,
			UPLOAD_IMAGE: (
				id: number | string,
				equipmentId: number
			) =>
				`/api/Offer/${id}/equipment/${equipmentId}/upload-image`,
			TERMS: (id: number | string) =>
				`/api/Offer/${id}/terms`,
			INSTALLMENTS: (id: number | string) =>
				`/api/Offer/${id}/installments`,
			SEND_TO_SALESMAN: (id: number | string) =>
				`/api/Offer/${id}/send-to-salesman`,
			EXPORT_PDF: (id: number | string) =>
				`/api/Offer/${id}/export-pdf`,
		},
		// Offer Requests (NEW)
		OFFER_REQUESTS: {
			BASE: '/api/OfferRequest',
			BY_ID: (id: number | string) =>
				`/api/OfferRequest/${id}`,
			ASSIGN: (id: number | string) =>
				`/api/OfferRequest/${id}/assign`,
			STATUS: (id: number | string) =>
				`/api/OfferRequest/${id}/status`,
			ASSIGNED: (supportId: string) =>
				`/api/OfferRequest/assigned/${supportId}`,
			BY_SALESMAN: (salesmanId: string) =>
				`/api/OfferRequest/salesman/${salesmanId}`,
		},
		// Task Progress (NEW)
		TASK_PROGRESS: {
			BASE: '/api/TaskProgress',
			BY_ID: (id: string) => `/api/TaskProgress/${id}`,
			BY_TASK: (taskId: number) =>
				`/api/TaskProgress/task/${taskId}`,
			BY_CLIENT: (clientId: string) =>
				`/api/TaskProgress/by-client/${clientId}`,
			BY_EMPLOYEE: (employeeId: string) =>
				`/api/TaskProgress/employee/${employeeId}`,
			WITH_OFFER_REQUEST:
				'/api/TaskProgress/with-offer-request',
		},
		// Products Catalog
		PRODUCTS: {
			BASE: '/api/Product',
			BY_ID: (id: number) => `/api/Product/${id}`,
			BY_CATEGORY: (category: string) =>
				`/api/Product/category/${encodeURIComponent(
					category
				)}`,
			SEARCH: '/api/Product/search',
			UPLOAD_IMAGE: (id: number) =>
				`/api/Product/${id}/upload-image`,
		},
		// Notifications
		NOTIFICATION: {
			BASE: '/api/Notification',
			UNREAD_COUNT: '/api/Notification/unread-count',
			MARK_READ: (id: number) =>
				`/api/Notification/${id}/read`,
			MARK_ALL_READ: '/api/Notification/mark-all-read', // Guide shows /read-all, but backend uses /mark-all-read
		},
		// Weekly Plan Tasks (removed - use WEEKLY_PLAN.TASKS instead)
		// WEEKLY_PLAN_TASKS has been removed in favor of WEEKLY_PLAN.TASKS
	},
} as const;
