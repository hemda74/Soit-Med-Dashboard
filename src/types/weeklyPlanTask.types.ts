// Weekly Plan Task Types - Backend-aligned task management for visit planning

// ==================== TASK TYPES ====================

export interface WeeklyPlanTask {
	id: number;
	weeklyPlanId: number;
	title: string;
	clientId?: number; // NULL for new clients
	clientStatus?: 'Old' | 'New';
	clientName?: string;
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	clientClassification?: 'A' | 'B' | 'C' | 'D';
	plannedDate: string;
	notes?: string; // Description
	isActive?: boolean;
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
	title: string;
	clientId?: number; // NULL for new client
	clientStatus?: 'Old' | 'New';
	clientName?: string;
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	clientClassification?: 'A' | 'B' | 'C' | 'D';
	plannedDate: string;
	notes?: string; // Description
}

export interface UpdateWeeklyPlanTaskDto {
	title?: string;
	clientName?: string;
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	clientClassification?: string;
	plannedDate?: string;
	notes?: string; // Description
}

export interface TaskProgressSummary {
	id: number;
	progressDate: string;
	progressType: string;
	visitResult?: string;
	nextStep?: string;
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
	plannedDateFrom?: string;
	plannedDateTo?: string;
	page?: number;
	pageSize?: number;
}

// ==================== FORM TYPES ====================

export interface WeeklyPlanTaskFormData {
	title: string;
	clientId?: number;
	clientStatus: 'Old' | 'New';
	clientName?: string;
	clientPhone?: string;
	clientAddress?: string;
	clientLocation?: string;
	clientClassification?: 'A' | 'B' | 'C' | 'D';
	plannedDate: string;
	notes?: string; // Description
}
