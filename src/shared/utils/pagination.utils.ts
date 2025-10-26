/**
 * Pagination utility functions
 * Helper functions to handle paginated API responses from backend
 */

export interface PagedResult<T> {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;
}

export interface ApiPagedResponse<T> {
	data: PagedResult<T>;
	message?: string;
	success?: boolean;
}

/**
 * Extract paginated data from API response
 */
export const extractPaginatedData = <T>(response: any): PagedResult<T> => {
	if (response?.data?.items) {
		// PagedResult format
		const data = response.data;
		return {
			items: data.items || [],
			page: data.page || 1,
			pageSize: data.pageSize || 20,
			totalCount: data.totalCount || 0,
			totalPages: data.totalPages || 0,
			hasPrevious: data.hasPrevious || false,
			hasNext: data.hasNext || false,
		};
	}

	// Non-paginated format
	return {
		items: Array.isArray(response?.data)
			? response.data
			: response?.data
			? [response.data]
			: [],
		page: 1,
		pageSize: response?.data?.length || 0,
		totalCount: Array.isArray(response?.data)
			? response.data.length
			: 1,
		totalPages: 1,
		hasPrevious: false,
		hasNext: false,
	};
};

/**
 * Create pagination parameters for API requests
 */
export const createPaginationParams = (
	page: number = 1,
	pageSize: number = 20,
	filters: Record<string, any> = {}
): Record<string, any> => {
	return {
		page,
		pageSize,
		...filters,
	};
};

/**
 * Calculate pagination information
 */
export const calculatePagination = (
	totalCount: number,
	page: number,
	pageSize: number
) => {
	const totalPages = Math.ceil(totalCount / pageSize);
	return {
		page,
		pageSize,
		totalCount,
		totalPages,
		hasPrevious: page > 1,
		hasNext: page < totalPages,
	};
};

/**
 * Get pagination display text
 */
export const getPaginationDisplay = (pagination: {
	page: number;
	pageSize: number;
	totalCount: number;
}) => {
	const startItem = (pagination.page - 1) * pagination.pageSize + 1;
	const endItem = Math.min(
		pagination.page * pagination.pageSize,
		pagination.totalCount
	);

	return {
		startItem,
		endItem,
		totalItems: pagination.totalCount,
		displayText: `Showing ${startItem} to ${endItem} of ${pagination.totalCount} results`,
	};
};
