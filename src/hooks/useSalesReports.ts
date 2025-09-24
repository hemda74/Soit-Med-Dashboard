import { useState, useEffect, useCallback } from 'react';
import type {
	SalesReportResponseDto,
	CreateSalesReportDto,
	UpdateSalesReportDto,
	RateSalesReportDto,
	FilterSalesReportsDto,
} from '@/types/salesReport.types';
import { salesReportApi } from '@/services';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export interface UseSalesReportsReturn {
	// State
	reports: SalesReportResponseDto[];
	loading: boolean;
	error: string | null;
	pagination: {
		page: number;
		pageSize: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		totalCount: number;
	};
	filters: FilterSalesReportsDto;

	// Actions
	createReport: (data: CreateSalesReportDto) => Promise<boolean>;
	updateReport: (
		id: number,
		data: UpdateSalesReportDto
	) => Promise<boolean>;
	deleteReport: (id: number) => Promise<boolean>;
	rateReport: (id: number, data: RateSalesReportDto) => Promise<boolean>;
	fetchReports: (newFilters?: FilterSalesReportsDto) => Promise<void>;
	refreshReports: () => Promise<void>;
	setFilters: (filters: FilterSalesReportsDto) => void;
	clearError: () => void;

	// Role checks
	canCreate: boolean;
	canEdit: (report: SalesReportResponseDto) => boolean;
	canDelete: (report: SalesReportResponseDto) => boolean;
	canRate: boolean;
}

export function useSalesReports(): UseSalesReportsReturn {
	const { user, hasAnyRole } = useAuthStore();

	// Check if user has access to sales reports
	const hasAccess = hasAnyRole([
		'Salesman', // Sales Employee
		'SalesManager', // Sales Manager
		'SuperAdmin',
	]);

	// Role-based permissions
	const canCreate = hasAnyRole(['Salesman', 'SuperAdmin']); // Sales Employee and Super Admin can create
	const canRate = hasAnyRole(['SalesManager', 'SuperAdmin']); // Sales Manager and Super Admin can rate

	const canEdit = useCallback(
		(report: SalesReportResponseDto) => {
			if (hasAnyRole(['SuperAdmin'])) return true;
			if (
				hasAnyRole(['Salesman']) && // Sales Employee can edit their own reports
				report.employeeId === user?.id
			)
				return true;
			return false;
		},
		[user?.id, hasAnyRole]
	);

	const canDelete = useCallback(
		(report: SalesReportResponseDto) => {
			if (hasAnyRole(['SuperAdmin'])) return true;
			if (
				hasAnyRole(['Salesman']) && // Sales Employee can delete their own reports
				report.employeeId === user?.id
			)
				return true;
			return false;
		},
		[user?.id, hasAnyRole]
	);

	const [state, setState] = useState({
		reports: [] as SalesReportResponseDto[],
		loading: false,
		error: null as string | null,
		pagination: {
			page: 1,
			pageSize: 10,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false,
			totalCount: 0,
		},
		filters: {} as FilterSalesReportsDto,
	});

	// Fetch reports
	const fetchReports = useCallback(
		async (newFilters?: FilterSalesReportsDto) => {
			if (!hasAccess) {
				setState((prev) => ({
					...prev,
					error: 'Access denied. You do not have permission to view sales reports.',
				}));
				return;
			}

			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				const filters = newFilters || state.filters;

				console.log(
					'Fetching sales reports with filters:',
					filters
				);
				console.log('User roles:', user?.roles);
				console.log('Has access:', hasAccess);

				// Use single endpoint - backend handles role-based filtering
				const response =
					await salesReportApi.getReports(
						filters
					);

				console.log('API Response:', response);

				if (response.success && response.data) {
					setState((prev) => ({
						...prev,
						reports:
							response.data.data ||
							[],
						pagination: {
							page:
								response.data
									.page ||
								1,
							pageSize:
								response.data
									.pageSize ||
								10,
							totalPages:
								response.data
									.totalPages ||
								0,
							hasNextPage:
								response.data
									.hasNextPage ||
								false,
							hasPreviousPage:
								response.data
									.hasPreviousPage ||
								false,
							totalCount:
								response.data
									.totalCount ||
								0,
						},
						filters:
							newFilters ||
							prev.filters, // Only update filters if newFilters provided
					}));
				} else {
					throw new Error(
						response.message ||
							'Failed to fetch reports'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to fetch reports';
				setState((prev) => ({
					...prev,
					error: errorMessage,
				}));
				toast.error(errorMessage);
			} finally {
				setState((prev) => ({
					...prev,
					loading: false,
				}));
			}
		},
		[hasAccess, user?.roles] // Removed state.filters from dependencies to prevent infinite re-renders
	);

	// Create report
	const createReport = useCallback(
		async (data: CreateSalesReportDto): Promise<boolean> => {
			if (!canCreate) {
				toast.error(
					'You do not have permission to create reports'
				);
				return false;
			}

			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				const response =
					await salesReportApi.createReport(data);

				if (response.success) {
					toast.success(
						'Report created successfully'
					);
					await fetchReports();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to create report'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to create report';
				setState((prev) => ({
					...prev,
					error: errorMessage,
				}));
				toast.error(errorMessage);
				return false;
			} finally {
				setState((prev) => ({
					...prev,
					loading: false,
				}));
			}
		},
		[canCreate, fetchReports]
	);

	// Update report
	const updateReport = useCallback(
		async (
			id: number,
			data: UpdateSalesReportDto
		): Promise<boolean> => {
			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				const response =
					await salesReportApi.updateReport(
						id,
						data
					);

				if (response.success) {
					toast.success(
						'Report updated successfully'
					);
					await fetchReports();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to update report'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to update report';
				setState((prev) => ({
					...prev,
					error: errorMessage,
				}));
				toast.error(errorMessage);
				return false;
			} finally {
				setState((prev) => ({
					...prev,
					loading: false,
				}));
			}
		},
		[fetchReports]
	);

	// Delete report
	const deleteReport = useCallback(
		async (id: number): Promise<boolean> => {
			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				const response =
					await salesReportApi.deleteReport(id);

				if (response.success) {
					toast.success(
						'Report deleted successfully'
					);
					await fetchReports();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to delete report'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to delete report';
				setState((prev) => ({
					...prev,
					error: errorMessage,
				}));
				toast.error(errorMessage);
				return false;
			} finally {
				setState((prev) => ({
					...prev,
					loading: false,
				}));
			}
		},
		[fetchReports]
	);

	// Rate report
	const rateReport = useCallback(
		async (
			id: number,
			data: RateSalesReportDto
		): Promise<boolean> => {
			if (!canRate) {
				toast.error(
					'You do not have permission to rate reports'
				);
				return false;
			}

			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				const response =
					await salesReportApi.rateReport(
						id,
						data
					);

				if (response.success) {
					toast.success(
						'Report rated successfully'
					);
					await fetchReports();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to rate report'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to rate report';
				setState((prev) => ({
					...prev,
					error: errorMessage,
				}));
				toast.error(errorMessage);
				return false;
			} finally {
				setState((prev) => ({
					...prev,
					loading: false,
				}));
			}
		},
		[canRate, fetchReports]
	);

	// Refresh reports
	const refreshReports = useCallback(async () => {
		await fetchReports();
	}, [fetchReports]);

	// Set filters
	const setFilters = useCallback((filters: FilterSalesReportsDto) => {
		setState((prev) => ({ ...prev, filters }));
	}, []);

	// Clear error
	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	// Load reports on mount
	useEffect(() => {
		if (hasAccess) {
			fetchReports();
		}
	}, [hasAccess, fetchReports]);

	return {
		reports: state.reports,
		loading: state.loading,
		error: state.error,
		pagination: state.pagination,
		filters: state.filters,
		createReport,
		updateReport,
		deleteReport,
		rateReport,
		fetchReports,
		refreshReports,
		setFilters,
		clearError,
		canCreate,
		canEdit,
		canDelete,
		canRate,
	};
}
