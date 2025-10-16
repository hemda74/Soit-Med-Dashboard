// Weekly Plan Types for Weekly Plan API (To-Do List System)

// ==================== Task Types ====================
export interface WeeklyPlanTask {
	id: number;
	weeklyPlanId: number;
	title: string;
	description: string;
	isCompleted: boolean;
	displayOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTaskDto {
	title: string; // Required, max 200 characters
	description?: string; // Optional, max 1000 characters
	displayOrder: number; // Required
}

export interface UpdateTaskDto {
	title?: string; // Optional, max 200 characters
	description?: string; // Optional, max 1000 characters
	isCompleted?: boolean; // Optional
	displayOrder?: number; // Optional
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
export interface WeeklyPlan {
	id: number;
	title: string;
	description: string;
	weekStartDate: string; // Format: YYYY-MM-DD
	weekEndDate: string; // Format: YYYY-MM-DD
	employeeId: string;
	employeeName: string;
	rating: number | null; // 1-5, null if not rated yet
	managerComment: string | null;
	managerReviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	tasks: WeeklyPlanTask[];
	dailyProgresses: DailyProgress[];
	totalTasks: number;
	completedTasks: number;
	completionPercentage: number;
}

export interface CreateWeeklyPlanDto {
	title: string; // Required, max 200 characters
	description?: string; // Optional, max 1000 characters
	weekStartDate: string; // Required, format: YYYY-MM-DD
	weekEndDate: string; // Required, format: YYYY-MM-DD, must be after weekStartDate
	tasks?: CreateTaskDto[]; // Optional, array of tasks to create with the plan
}

export interface UpdateWeeklyPlanDto {
	title?: string; // Optional, max 200 characters
	description?: string; // Optional, max 1000 characters
}

export interface ReviewWeeklyPlanDto {
	rating?: number; // Optional, 1-5
	managerComment?: string; // Optional, max 1000 characters
	// Note: Must provide at least rating or managerComment
}

// ==================== Filter & Pagination Types ====================
export interface FilterWeeklyPlansDto {
	employeeId?: string; // Optional, filter by employee ID
	startDate?: string; // Optional, format: YYYY-MM-DD
	endDate?: string; // Optional, format: YYYY-MM-DD
	hasManagerReview?: boolean; // Optional, filter by review status
	minRating?: number; // Optional, 1-5
	maxRating?: number; // Optional, 1-5
	page?: number; // Optional, default: 1
	pageSize?: number; // Optional, default: 10, max: 100
}

export interface PaginatedWeeklyPlansResponse {
	data: WeeklyPlan[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
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




