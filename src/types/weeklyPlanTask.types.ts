// Weekly Plan Task Types - Backend-aligned task management for visit planning

// ==================== TASK TYPES ====================

export interface WeeklyPlanTask {
	id: number;
	weeklyPlanId: number;
	taskType: 'Visit' | 'FollowUp';
	clientId?: number; // NULL for new clients
	clientStatus?: 'Old' | 'New';
	// For NEW clients - basic info
	clientName?: string;
	placeName?: string;
	placeType?: 'Hospital' | 'Clinic' | 'Lab' | 'Pharmacy';
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	// Client Classification
	clientClassification?: 'A' | 'B' | 'C' | 'D';
	// Task Planning
	plannedDate: string;
	plannedTime?: string;
	purpose?: string;
	notes?: string;
	priority: 'High' | 'Medium' | 'Low';
	status: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
	createdAt: string;
	updatedAt: string;
	// Navigation Properties (populated by API)
	client?: {
		id: number;
		name: string;
		type: string;
		location: string;
		phone: string;
		email: string;
	};
	progresses?: TaskProgressSummary[];
}

export interface CreateWeeklyPlanTaskDto {
	taskType: 'Visit' | 'FollowUp';
	clientId?: number; // NULL for new client
	clientStatus?: 'Old' | 'New';
	// For new clients
	clientName?: string;
	placeName?: string;
	placeType?: 'Hospital' | 'Clinic' | 'Lab' | 'Pharmacy';
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	clientClassification?: 'A' | 'B' | 'C' | 'D';
	plannedDate: string;
	plannedTime?: string;
	purpose?: string;
	notes?: string;
	priority: 'High' | 'Medium' | 'Low';
}

export interface UpdateWeeklyPlanTaskDto {
	taskType?: 'Visit' | 'FollowUp';
	plannedDate?: string;
	plannedTime?: string;
	purpose?: string;
	notes?: string;
	priority?: 'High' | 'Medium' | 'Low';
	status?: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
}

export interface TaskProgressSummary {
	id: number;
	progressDate: string;
	progressType: string;
	visitResult?: string;
	nextStep?: string;
	satisfactionRating?: number;
}

// ==================== CONSTANTS ====================

export const TaskTypeConstants = {
	Visit: 'Visit',
	FollowUp: 'FollowUp',
} as const;

export const ClientStatusConstants = {
	Old: 'Old',
	New: 'New',
} as const;

export const TaskPriorityConstants = {
	High: 'High',
	Medium: 'Medium',
	Low: 'Low',
} as const;

export const TaskStatusConstants = {
	Planned: 'Planned',
	InProgress: 'InProgress',
	Completed: 'Completed',
	Cancelled: 'Cancelled',
} as const;

export const PlaceTypeConstants = {
	Hospital: 'Hospital',
	Clinic: 'Clinic',
	Lab: 'Lab',
	Pharmacy: 'Pharmacy',
} as const;

export const ClientClassificationConstants = {
	A: 'A',
	B: 'B',
	C: 'C',
	D: 'D',
} as const;

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

export interface PaginatedApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

export interface PaginatedData<T> {
	data: T;
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface PaginatedApiResponseWithMeta<T> {
	success: boolean;
	message: string;
	data: PaginatedData<T>;
	timestamp: string;
}

// ==================== FILTERS ====================

export interface WeeklyPlanTaskFilters {
	weeklyPlanId?: number;
	clientId?: number;
	taskType?: 'Visit' | 'FollowUp';
	status?: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
	priority?: 'High' | 'Medium' | 'Low';
	plannedDateFrom?: string;
	plannedDateTo?: string;
	page?: number;
	pageSize?: number;
}

// ==================== FORM TYPES ====================

export interface WeeklyPlanTaskFormData {
	taskType: 'Visit' | 'FollowUp';
	clientId?: number;
	clientStatus: 'Old' | 'New';
	// For new clients
	clientName?: string;
	placeName?: string;
	placeType?: 'Hospital' | 'Clinic' | 'Lab' | 'Pharmacy';
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	clientClassification?: 'A' | 'B' | 'C' | 'D';
	plannedDate: string;
	plannedTime?: string;
	purpose?: string;
	notes?: string;
	priority: 'High' | 'Medium' | 'Low';
}




