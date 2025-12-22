// Shared API endpoints configuration

export const API_ENDPOINTS = {
	// Authentication
	AUTH: {
		LOGIN: '/Account/login',
		REFRESH: '/Account/refresh',
		CURRENT_USER: '/User/me',
		CHANGE_PASSWORD: '/Account/change-password',
		SUPERADMIN_UPDATE_PASSWORD:
			'/Account/superAdmin-update-password',
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
		DOCTOR: '/RoleSpecificUser/Doctor',
		ENGINEER: '/RoleSpecificUser/Engineer',
		TECHNICIAN: '/RoleSpecificUser/Technician',
		ADMIN: '/RoleSpecificUser/Admin',
		FINANCE_MANAGER: '/RoleSpecificUser/FinanceManager',
		FINANCE_EMPLOYEE: '/RoleSpecificUser/FinanceEmployee',
		LEGAL_MANAGER: '/RoleSpecificUser/LegalManager',
		LegalEmployee: '/RoleSpecificUser/LegalEmployee',
		SALESMAN: '/RoleSpecificUser/SalesMan',
		SALES_MANAGER: '/RoleSpecificUser/SalesManager',
		MAINTENANCE_MANAGER: '/RoleSpecificUser/MaintenanceManager',
		MAINTENANCE_SUPPORT: '/RoleSpecificUser/MaintenanceSupport',
		SPARE_PARTS_COORDINATOR:
			'/RoleSpecificUser/SparePartsCoordinator',
		INVENTORY_MANAGER: '/RoleSpecificUser/InventoryManager',
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
			BY_CLIENT: (clientId: string) =>
				`/api/Deal/by-client/${clientId}`,
			MANAGER_APPROVAL: (id: string) =>
				`/api/Deal/${id}/manager-approval`,
			SUPERADMIN_APPROVAL: (id: string) =>
				`/api/Deal/${id}/superAdmin-approval`,
			PENDING_MANAGER: '/api/Deal/pending-manager-approvals',
			PENDING_SUPERADMIN:
				'/api/Deal/pending-superAdmin-approvals',
			BY_SALESMAN: (salesmanId: string) =>
				`/api/Deal/by-SalesMan/${salesmanId}`,
			COMPLETE: (id: string) => `/api/Deal/${id}/complete`,
			FAIL: (id: string) => `/api/Deal/${id}/fail`,
			SUBMIT_FIRST_REVIEW: (id: string) =>
				`/api/Deal/${id}/submit-first-review`,
			SUBMIT_SECOND_REVIEW: (id: string) =>
				`/api/Deal/${id}/submit-second-review`,
			SET_CREDENTIALS: (id: string) =>
				`/api/Deal/${id}/set-credentials`,
			AWAITING_REVIEWS_AND_SETUP:
				'/api/Deal/awaiting-reviews-and-setup',
		},
		// Offers (ENHANCED) - For SalesManager/SuperAdmin only
		OFFERS: {
			BASE: '/api/Offer',
			ALL: '/api/Offer/all', // SuperAdmin only - with filters and pagination
			BY_ID: (id: number | string) => `/api/Offer/${id}`,
			MY_OFFERS: '/api/Offer/my-offers',
			SALESMEN: '/api/Offer/salesmen',
			BY_SALESMAN: (salesmanId: string) =>
				`/api/Offer/by-SalesMan/${salesmanId}`,
			REQUEST_DETAILS: (requestId: number | string) =>
				`/api/Offer/request/${requestId}/details`,
			// Enhanced Offer Features
			EQUIPMENT: (id: number | string) =>
				`/api/Offer/${id}/equipment`,
			EQUIPMENT_BY_ID: (
				id: number | string,
				equipmentId: number
			) => `/api/Offer/${id}/equipment/${equipmentId}`,
			EQUIPMENT_IMAGE: (
				id: number | string,
				equipmentId: number
			) => `/api/Offer/${id}/equipment/${equipmentId}/image`,
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
			SALESMANAGER_APPROVAL: (id: number | string) =>
				`/api/Offer/${id}/salesmanager-approval`,
			PENDING_SALESMANAGER_APPROVALS:
				'/api/Offer/pending-salesmanager-approvals',
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
				`/api/OfferRequest/SalesMan/${salesmanId}`,
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
		// Product Categories
		PRODUCT_CATEGORIES: {
			BASE: '/api/ProductCategory',
			BY_ID: (id: number) => `/api/ProductCategory/${id}`,
			HIERARCHY: '/api/ProductCategory/hierarchy',
			MAIN: '/api/ProductCategory/main',
			SUBCATEGORIES: (id: number) =>
				`/api/ProductCategory/${id}/subcategories`,
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

	// Maintenance Module
	MAINTENANCE: {
		// Maintenance Requests
		REQUEST: {
			BASE: '/api/MaintenanceRequest',
			BY_ID: (id: number) => `/api/MaintenanceRequest/${id}`,
			CUSTOMER_MY_REQUESTS:
				'/api/MaintenanceRequest/customer/my-requests',
			ENGINEER_MY_ASSIGNED:
				'/api/MaintenanceRequest/Engineer/my-assigned',
			PENDING: '/api/MaintenanceRequest/pending',
			ASSIGN: (id: number) =>
				`/api/MaintenanceRequest/${id}/assign`,
			UPDATE_STATUS: (id: number) =>
				`/api/MaintenanceRequest/${id}/status`,
			CANCEL: (id: number) =>
				`/api/MaintenanceRequest/${id}/cancel`,
		},
		// Maintenance Visits
		VISIT: {
			BASE: '/api/MaintenanceVisit',
			BY_REQUEST: (requestId: number) =>
				`/api/MaintenanceVisit/request/${requestId}`,
			BY_ENGINEER: (EngineerId: string) =>
				`/api/MaintenanceVisit/Engineer/${EngineerId}`,
		},
		// Maintenance Attachments
		ATTACHMENT: {
			UPLOAD: '/api/MaintenanceAttachment/upload',
			BY_ID: (id: number) =>
				`/api/MaintenanceAttachment/${id}`,
			BY_REQUEST: (requestId: number) =>
				`/api/MaintenanceAttachment/request/${requestId}`,
			DELETE: (id: number) =>
				`/api/MaintenanceAttachment/${id}`,
		},
		// Spare Part Requests
		SPARE_PART: {
			BASE: '/api/SparePartRequest',
			BY_ID: (id: number) => `/api/SparePartRequest/${id}`,
			CHECK_AVAILABILITY: (id: number) =>
				`/api/SparePartRequest/${id}/check-availability`,
			SET_PRICE: (id: number) =>
				`/api/SparePartRequest/${id}/set-price`,
			CUSTOMER_APPROVAL: (id: number) =>
				`/api/SparePartRequest/${id}/customer-approval`,
		},
	},

	// Payment Module
	PAYMENT: {
		BASE: '/api/Payment',
		BY_ID: (id: number) => `/api/Payment/${id}`,
		CUSTOMER_MY_PAYMENTS: '/api/Payment/customer/my-payments',
		STRIPE: (id: number) => `/api/Payment/${id}/stripe`,
		PAYPAL: (id: number) => `/api/Payment/${id}/paypal`,
		CASH: (id: number) => `/api/Payment/${id}/cash`,
		BANK_TRANSFER: (id: number) =>
			`/api/Payment/${id}/bank-transfer`,
		REFUND: (id: number) => `/api/Payment/${id}/refund`,
	},

	// Accounting Module
	ACCOUNTING: {
		PAYMENTS_PENDING: '/api/Accounting/payments/pending',
		PAYMENTS: '/api/Accounting/payments',
		PAYMENT_BY_ID: (id: number) => `/api/Accounting/payments/${id}`,
		CONFIRM_PAYMENT: (id: number) =>
			`/api/Accounting/payments/${id}/confirm`,
		REJECT_PAYMENT: (id: number) =>
			`/api/Accounting/payments/${id}/reject`,
		REPORTS_DAILY: '/api/Accounting/reports/daily',
		REPORTS_MONTHLY: '/api/Accounting/reports/monthly',
		REPORTS_YEARLY: '/api/Accounting/reports/yearly',
		STATISTICS_PAYMENT_METHODS:
			'/api/Accounting/statistics/payment-methods',
		STATISTICS_OUTSTANDING:
			'/api/Accounting/statistics/outstanding',
		MAINTENANCE_PAYMENTS: '/api/Accounting/maintenance/payments',
		SPARE_PARTS_PAYMENTS: '/api/Accounting/spare-parts/payments',
	},
} as const;
