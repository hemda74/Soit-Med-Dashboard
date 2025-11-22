import { useQuery } from '@tanstack/react-query';
import { salesApi } from '@/services/sales/salesApi';
import type { SalesmanStatisticsDTO, SalesmanProgressDTO } from '@/types/sales.types';

// Query keys
export const salesmanStatisticsKeys = {
	all: ['salesmanStatistics'] as const,
	allStatistics: (year?: number, quarter?: number) =>
		[...salesmanStatisticsKeys.all, 'all', year, quarter] as const,
	salesman: (salesmanId: string, year?: number, quarter?: number) =>
		[...salesmanStatisticsKeys.all, 'salesman', salesmanId, year, quarter] as const,
	progress: (salesmanId: string, year?: number, quarter?: number) =>
		[...salesmanStatisticsKeys.all, 'progress', salesmanId, year, quarter] as const,
	myStatistics: (year?: number, quarter?: number) =>
		[...salesmanStatisticsKeys.all, 'my-statistics', year, quarter] as const,
	myProgress: (year?: number, quarter?: number) =>
		[...salesmanStatisticsKeys.all, 'my-progress', year, quarter] as const,
	myTargets: (year?: number) =>
		[...salesmanStatisticsKeys.all, 'my-targets', year] as const,
	salesmanTargets: (salesmanId: string, year?: number) =>
		[...salesmanStatisticsKeys.all, 'targets', 'salesman', salesmanId, year] as const,
	teamTargets: (year?: number, quarter?: number) =>
		[...salesmanStatisticsKeys.all, 'targets', 'team', year, quarter] as const,
};

/**
 * Get all salesman statistics
 */
export const useAllSalesmanStatistics = (year: number, quarter?: number) => {
	return useQuery<SalesmanStatisticsDTO[]>({
		queryKey: salesmanStatisticsKeys.allStatistics(year, quarter),
		queryFn: async () => {
			const response = await salesApi.getAllSalesmanStatistics(year, quarter);
			if (response.success && Array.isArray(response.data)) {
				// Some backends return statistics for every system user.
				// Keep only entries that contain a valid salesmanId (string) to match Salesman users.
				return response.data.filter(
					(stat: SalesmanStatisticsDTO | null | undefined) =>
						!!stat?.salesmanId && typeof stat.salesmanId === 'string' && stat.salesmanId.trim().length > 0
				);
			}
			throw new Error(response.message || 'Failed to fetch statistics');
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		retry: 2,
	});
};

/**
 * Get specific salesman statistics
 */
export const useSalesmanStatistics = (
	salesmanId: string,
	year: number,
	quarter?: number
) => {
	return useQuery<SalesmanStatisticsDTO>({
		queryKey: salesmanStatisticsKeys.salesman(salesmanId, year, quarter),
		queryFn: async () => {
			const response = await salesApi.getSalesmanStatistics(salesmanId, year, quarter);
			if (response.success) {
				return response.data;
			}
			throw new Error(response.message || 'Failed to fetch statistics');
		},
		enabled: !!salesmanId,
		staleTime: 2 * 60 * 1000,
		retry: 2,
	});
};

/**
 * Get salesman progress with targets
 */
export const useSalesmanProgress = (
	salesmanId: string,
	year: number,
	quarter?: number
) => {
	return useQuery<SalesmanProgressDTO>({
		queryKey: salesmanStatisticsKeys.progress(salesmanId, year, quarter),
		queryFn: async () => {
			const response = await salesApi.getSalesmanProgress(salesmanId, year, quarter);
			if (response.success) {
				return response.data;
			}
			throw new Error(response.message || 'Failed to fetch progress');
		},
		enabled: !!salesmanId,
		staleTime: 2 * 60 * 1000,
		retry: 2,
	});
};

/**
 * Get my statistics (current user)
 */
export const useMyStatistics = (year?: number, quarter?: number) => {
	return useQuery<SalesmanStatisticsDTO>({
		queryKey: salesmanStatisticsKeys.myStatistics(year, quarter),
		queryFn: async () => {
			const response = await salesApi.getMyStatistics(year, quarter);
			if (response.success) {
				return response.data;
			}
			throw new Error(response.message || 'Failed to fetch statistics');
		},
		staleTime: 2 * 60 * 1000,
		retry: 2,
	});
};

/**
 * Get my progress (current user)
 */
export const useMyProgress = (year?: number, quarter?: number) => {
	return useQuery<SalesmanProgressDTO>({
		queryKey: salesmanStatisticsKeys.myProgress(year, quarter),
		queryFn: async () => {
			const response = await salesApi.getMyProgress(year, quarter);
			if (response.success) {
				return response.data;
			}
			throw new Error(response.message || 'Failed to fetch progress');
		},
		staleTime: 2 * 60 * 1000,
		retry: 2,
	});
};

/**
 * Get my targets (current user)
 */
export const useMyTargets = (year?: number) => {
	return useQuery({
		queryKey: salesmanStatisticsKeys.myTargets(year),
		queryFn: async () => {
			const response = await salesApi.getMyTargets(year);
			if (response.success) {
				return response.data;
			}
			throw new Error(response.message || 'Failed to fetch targets');
		},
		staleTime: 5 * 60 * 1000, // 5 minutes (targets change less frequently)
		retry: 2,
	});
};

/**
 * Get salesman targets
 */
export const useSalesmanTargets = (salesmanId: string, year?: number) => {
	return useQuery({
		queryKey: salesmanStatisticsKeys.salesmanTargets(salesmanId, year),
		queryFn: async () => {
			const response = await salesApi.getSalesmanTargets(salesmanId, year || new Date().getFullYear());
			if (response.success) {
				return response.data;
			}
			throw new Error(response.message || 'Failed to fetch targets');
		},
		enabled: !!salesmanId,
		staleTime: 5 * 60 * 1000,
		retry: 2,
	});
};

/**
 * Get team targets
 */
export const useTeamTargets = (year: number, quarter?: number) => {
	return useQuery({
		queryKey: salesmanStatisticsKeys.teamTargets(year, quarter),
		queryFn: async () => {
			const response = await salesApi.getTeamTarget(year, quarter);
			if (response.success) {
				return response.data;
			}
			throw new Error(response.message || 'Failed to fetch team targets');
		},
		staleTime: 5 * 60 * 1000,
		retry: 2,
	});
};

