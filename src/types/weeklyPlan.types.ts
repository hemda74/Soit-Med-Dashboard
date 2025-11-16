// Weekly Plan Types for Weekly Plan API (To-Do List System)

// ==================== Task Types ====================
export interface TaskProgress {
	id: number;
	progressDate: string;
	progressType: string;
	description: string;
	visitResult?: string;
	nextStep?: string;
	offerRequestId?: number | null;
}

export interface TaskOfferRequest {
	id: number;
	requestedProducts: string;
	requestDate: string;
	status: string;
	createdOfferId?: number | null;
}

export interface TaskOffer {
	id: number;
	products: string;
	totalAmount: number;
	validUntil: string;
	status: string;
	sentToClientAt?: string | null;
}

export interface TaskDeal {
	id: number;
	dealValue: number;
	closedDate?: string | null;
	status: string;
	managerApprovedAt?: string | null;
	superAdminApprovedAt?: string | null;
}

export interface WeeklyPlanTask {
	id: number;
	weeklyPlanId: number;
	title: string;
	clientId?: number;
	clientName?: string;
	clientStatus?: string;
	clientClassification?: string;
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	plannedDate?: string;
	notes?: string; // Description
	progressCount?: number;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
	// Nested data (populated by backend)
	progresses?: TaskProgress[];
	offerRequests?: TaskOfferRequest[];
	offers?: TaskOffer[];
	deals?: TaskDeal[];
}

export interface CreateTaskDto {
	title: string;
	clientId?: number;
	clientName?: string;
	clientStatus?: string;
	clientClassification?: string;
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	plannedDate: string; // Required
	notes?: string; // Description
}

export interface UpdateTaskDto {
	title?: string;
	clientName?: string;
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	clientClassification?: string;
	plannedDate?: string;
	notes?: string; // Description
}

// ==================== Daily Progress Types ====================
export interface DailyProgress {
	id: number;
	weeklyPlanId: number;
	progressDate: string; // Format: YYYY-MM-DD
	notes: string;
	tasksWorkedOn: number[]; // Array of task IDs
	createdAt: string;
	updatedAt: string;
}

export interface CreateDailyProgressDto {
	progressDate: string; // Required, format: YYYY-MM-DD
	notes: string; // Required, max 2000 characters
	tasksWorkedOn?: number[]; // Optional, array of task IDs
}

export interface UpdateDailyProgressDto {
	notes?: string; // Optional, max 2000 characters
	tasksWorkedOn?: number[]; // Optional, array of task IDs
}

// ==================== Weekly Plan Types ====================
export interface EmployeeInfo {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber?: string | null;
	userName: string;
}

export interface WeeklyPlan {
	id: number;
	employeeId: string;
	employee?: EmployeeInfo | null; // Only populated for SalesManager/SuperAdmin
	weekStartDate: string; // Format: ISO 8601
	weekEndDate: string; // Format: ISO 8601
	title: string;
	description: string;
	isActive: boolean;
	rating: number | null; // 1-5, null if not rated yet
	managerComment: string | null;
	managerReviewedAt: string | null;
	// New view tracking fields
	managerViewedAt?: string | null; // Timestamp when plan was viewed by manager
	viewedBy?: string | null; // User ID of the manager who viewed the plan
	isViewed?: boolean; // Whether the plan has been viewed (calculated)
	createdAt: string;
	updatedAt: string;
	tasks: WeeklyPlanTask[];
}

export interface CreateWeeklyPlanDto {
	title: string; // Required
	description: string; // Required
	weekStartDate: string; // Required, ISO 8601 format
	weekEndDate: string; // Required, ISO 8601 format
	tasks?: CreateTaskDto[]; // Optional, array of tasks to create with the plan
}

export interface UpdateWeeklyPlanDto {
	title?: string; // Optional
	description?: string; // Optional
	isActive?: boolean; // Optional
}

export interface ReviewWeeklyPlanDto {
	rating: number; // Required, 1-5
	managerComment?: string; // Optional
}

// ==================== Filter & Pagination Types ====================
export interface FilterWeeklyPlansDto {
	employeeId?: string; // Optional, filter by employee ID
	weekStartDate?: string; // Optional, format: DateTime (>=)
	weekEndDate?: string; // Optional, format: DateTime (<=)
	isViewed?: boolean; // Optional, filter by viewed status (true = viewed, false = not viewed)
	hasManagerReview?: boolean; // Optional, filter by review status (deprecated, use isViewed instead)
	minRating?: number; // Optional, 1-5
	maxRating?: number; // Optional, 1-5
	page?: number; // Optional, default: 1
	pageSize?: number; // Optional, default: 20, max: 100
}

export interface PaginatedWeeklyPlansResponse {
	plans: WeeklyPlan[];
	pagination: {
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

export interface PaginatedApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

// ==================== UI Helper Types ====================
export interface UserOption {
	id: string;
	name: string;
	email: string;
}

export interface WeekDates {
	weekStartDate: string;
	weekEndDate: string;
}

// ==================== Form State Types ====================
export interface WeeklyPlanFormData {
	title: string;
	description: string;
	weekStartDate: string;
	weekEndDate: string;
	tasks: TaskFormData[];
}

export interface TaskFormData {
	id?: number; // Optional, only for existing tasks
	title: string;
	description: string;
	displayOrder: number;
	isCompleted?: boolean;
}

export interface DailyProgressFormData {
	progressDate: string;
	notes: string;
	tasksWorkedOn: number[];
}
