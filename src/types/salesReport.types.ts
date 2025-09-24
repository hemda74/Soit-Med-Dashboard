// Sales Report Types for Sales Report API

export interface CreateSalesReportDto {
	title: string; // Required, max 100 characters
	body: string; // Required, max 2000 characters
	type: 'daily' | 'weekly'; // Required, only these values allowed
	reportDate: string; // Required, format: YYYY-MM-DD
}

export interface UpdateSalesReportDto {
	title?: string; // Optional, max 100 characters
	body?: string; // Optional, max 2000 characters
	type?: 'daily' | 'weekly'; // Optional, only these values allowed
	reportDate?: string; // Optional, format: YYYY-MM-DD
}

export interface RateSalesReportDto {
	rating: number; // Required, 1-5
	comment?: string; // Optional, max 500 characters
}

export interface FilterSalesReportsDto {
	page?: number; // Optional, default: 1
	pageSize?: number; // Optional, default: 10, max: 100
	type?: 'daily' | 'weekly'; // Optional filter
	startDate?: string; // Optional, format: YYYY-MM-DD
	endDate?: string; // Optional, format: YYYY-MM-DD
	employeeId?: string; // Optional, for managers to filter by employee
}

export interface SalesReportResponseDto {
	id: number;
	title: string;
	body: string;
	type: 'daily' | 'weekly';
	reportDate: string; // Format: YYYY-MM-DD
	rating?: number; // 1-5, only if rated
	comment?: string; // Manager's comment, only if rated
	employeeId: string;
	employeeName: string; // Format: "FirstName LastName"
	employeeEmail: string;
	createdAt: string; // ISO 8601 format
	updatedAt: string; // ISO 8601 format
}

export interface PaginatedSalesReportsResponseDto {
	data: SalesReportResponseDto[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

// API Response wrappers
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
