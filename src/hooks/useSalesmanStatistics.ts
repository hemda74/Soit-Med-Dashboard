import { useQuery } from '@tanstack/react-query';
import { salesApi } from '@/services/sales/salesApi';
import type {
	SalesManStatisticsDTO,
	SalesManProgressDTO,
} from '@/types/sales.types';

// Query keys
export const salesmanStatisticsKeys = {
	all: ['salesmanStatistics'] as const,
	allStatistics: (year?: number, quarter?: number) =>
		[...salesmanStatisticsKeys.all, 'all', year, quarter] as const,
	salesman: (salesmanId: string, year?: number, quarter?: number) =>
		[
			...salesmanStatisticsKeys.all,
			'salesman',
			salesmanId,
			year,
			quarter,
		] as const,
	progress: (salesmanId: string, year?: number, quarter?: number) =>
		[
			...salesmanStatisticsKeys.all,
			'progress',
			salesmanId,
			year,
			quarter,
		] as const,
	myStatistics: (year?: number, quarter?: number) =>
		[
			...salesmanStatisticsKeys.all,
			'my-statistics',
			year,
			quarter,
		] as const,
	myProgress: (year?: number, quarter?: number) =>
		[
			...salesmanStatisticsKeys.all,
			'my-progress',
			year,
			quarter,
		] as const,
	myTargets: (year?: number) =>
		[...salesmanStatisticsKeys.all, 'my-targets', year] as const,
	salesmanTargets: (salesmanId: string, year?: number) =>
		[
			...salesmanStatisticsKeys.all,
			'targets',
			'salesman',
			salesmanId,
			year,
		] as const,
	teamTargets: (year?: number, quarter?: number) =>
		[
			...salesmanStatisticsKeys.all,
			'targets',
			'team',
			year,
			quarter,
		] as const,
};

/**
 * Get all salesman statistics
 */
export const useAllSalesManStatistics = (year: number, quarter?: number) => {
	return useQuery<SalesManStatisticsDTO[]>({
		queryKey: salesmanStatisticsKeys.allStatistics(year, quarter),
		queryFn: async () => {
			const response =
				await salesApi.getAllSalesManStatistics(
					year,
					quarter
				);
			if (response.success && Array.isArray(response.data)) {
				// Some backends return statistics for every system user.
				// Keep only entries that contain a valid salesmanId (string) to match SalesMan users.
				// Handle different casing from API (salesmanId, salesManId, SalesManId)
				return response.data
					.filter((stat: any) => {
						if (!stat) return false;
						const id = stat.salesmanId || stat.salesManId || stat.SalesManId;
						return id && typeof id === 'string' && id.trim().length > 0;
					})
					.map((stat: any) => ({
						...stat,
						salesmanId: stat.salesmanId || stat.salesManId || stat.SalesManId,
						salesmanName: stat.salesmanName || stat.salesManName || stat.SalesManName,
					}));
			}
			throw new Error(
				response.message || 'Failed to fetch statistics'
			);
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		retry: 2,
	});
};

/**
 * Get specific salesman statistics
 */
export const useSalesManStatistics = (
	salesmanId: string,
	year: number,
	quarter?: number
) => {
	return useQuery<SalesManStatisticsDTO>({
		queryKey: salesmanStatisticsKeys.salesman(
			salesmanId,
			year,
			quarter
		),
		queryFn: async () => {
			const response = await salesApi.getSalesManStatistics(
				salesmanId,
				year,
				quarter
			);
			if (response.success) {
				return response.data;
			}
			throw new Error(
				response.message || 'Failed to fetch statistics'
			);
		},
		enabled: !!salesmanId,
		staleTime: 2 * 60 * 1000,
		retry: 2,
	});
};

/**
 * Get salesman progress with targets
 */
export const useSalesManProgress = (
	salesmanId: string,
	year: number,
	quarter?: number
) => {
	return useQuery<SalesManProgressDTO>({
		queryKey: salesmanStatisticsKeys.progress(
			salesmanId,
			year,
			quarter
		),
		queryFn: async () => {
			const response = await salesApi.getSalesManProgress(
				salesmanId,
				year,
				quarter
			);
			if (response.success) {
				return response.data;
			}
			throw new Error(
				response.message || 'Failed to fetch progress'
			);
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
	return useQuery<SalesManStatisticsDTO>({
		queryKey: salesmanStatisticsKeys.myStatistics(year, quarter),
		queryFn: async () => {
			const response = await salesApi.getMyStatistics(
				year,
				quarter
			);
			if (response.success) {
				return response.data;
			}
			throw new Error(
				response.message || 'Failed to fetch statistics'
			);
		},
		staleTime: 2 * 60 * 1000,
		retry: 2,
	});
};

/**
 * Get my progress (current user)
 */
export const useMyProgress = (year?: number, quarter?: number) => {
	return useQuery<SalesManProgressDTO>({
		queryKey: salesmanStatisticsKeys.myProgress(year, quarter),
		queryFn: async () => {
			const response = await salesApi.getMyProgress(
				year,
				quarter
			);
			if (response.success) {
				return response.data;
			}
			throw new Error(
				response.message || 'Failed to fetch progress'
			);
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
			throw new Error(
				response.message || 'Failed to fetch targets'
			);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes (targets change less frequently)
		retry: 2,
	});
};

/**
 * Get salesman targets
 */
export const useSalesManTargets = (salesmanId: string, year?: number) => {
	return useQuery({
		queryKey: salesmanStatisticsKeys.salesmanTargets(
			salesmanId,
			year
		),
		queryFn: async () => {
			const response = await salesApi.getSalesManTargets(
				salesmanId,
				year || new Date().getFullYear()
			);
			if (response.success) {
				return response.data;
			}
			throw new Error(
				response.message || 'Failed to fetch targets'
			);
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
			const response = await salesApi.getTeamTarget(
				year,
				quarter
			);
			if (response.success) {
				return response.data;
			}
			throw new Error(
				response.message ||
					'Failed to fetch team targets'
			);
		},
		staleTime: 5 * 60 * 1000,
		retry: 2,
	});
};
