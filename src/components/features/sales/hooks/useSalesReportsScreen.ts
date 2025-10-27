import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSalesReports } from '@/hooks/useSalesReports';
// import { useUsersForFilter } from '@/hooks/useUsersForFilter'; // Disabled - SalesManager doesn't have access
import type {
	SalesReportResponseDto,
	FilterSalesReportsDto,
} from '@/types/salesReport.types';

export const useSalesReportsScreen = () => {
	const { hasAnyRole } = useAuthStore();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingReport, setEditingReport] =
		useState<SalesReportResponseDto | null>(null);
	const [ratingReport, setRatingReport] =
		useState<SalesReportResponseDto | null>(null);
	const [deletingReport, setDeletingReport] =
		useState<SalesReportResponseDto | null>(null);

	// Check if user has access to sales reports
	const hasAccess = hasAnyRole([
		'Salesman',
		'SalesManager',
		'SuperAdmin',
	]);

	const {
		reports,
		loading,
		error,
		pagination,
		filters,
		canCreate,
		canEdit,
		canDelete,
		canRate,
		createReport,
		updateReport,
		deleteReport,
		rateReport,
		fetchReports,
		setFilters,
		clearError,
	} = useSalesReports();

	// Get users for employee filter
	// Note: Disabled as SalesManager doesn't have access to /api/User/all
	// const {
	// 	users: availableUsers,
	// 	loading: usersLoading,
	// 	error: usersError,
	// } = useUsersForFilter();
	const availableUsers: any[] = [];
	const usersLoading = false;
	const usersError = null;

	const handleFilterChange = useCallback(
		(newFilters: Partial<FilterSalesReportsDto>) => {
			const updatedFilters = {
				...filters,
				...newFilters,
			};
			setFilters(updatedFilters);
		},
		[filters, setFilters]
	);

	const handlePageChange = useCallback(
		(page: number) => {
			setFilters({ ...filters, page });
		},
		[filters, setFilters]
	);

	const handleCreateReport = useCallback(() => {
		setShowCreateModal(true);
	}, []);

	const handleEditReport = useCallback(
		(report: SalesReportResponseDto) => {
			setEditingReport(report);
		},
		[]
	);

	const handleDeleteReport = useCallback(
		(report: SalesReportResponseDto) => {
			setDeletingReport(report);
		},
		[]
	);

	const handleRateReport = useCallback(
		(report: SalesReportResponseDto) => {
			setRatingReport(report);
		},
		[]
	);

	const handleViewComments = useCallback(
		(report: SalesReportResponseDto) => {
			// TODO: Implement comments functionality
			console.log('View comments for report:', report.id);
		},
		[]
	);

	const handleCloseCreateModal = useCallback(() => {
		setShowCreateModal(false);
	}, []);

	const handleCloseEditModal = useCallback(() => {
		setEditingReport(null);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeletingReport(null);
	}, []);

	const handleCloseRateModal = useCallback(() => {
		setRatingReport(null);
	}, []);

	// Use reports directly since search is handled by the API
	const filteredReports = reports;

	// Star rating helper function
	const getStarRating = useCallback((rating: number | null) => {
		if (rating === null) return null;

		const stars = Array.from({ length: 5 }, (_, index) => ({
			index,
			filled: index < rating,
		}));

		return {
			rating,
			stars,
		};
	}, []);

	return {
		// Access control
		hasAccess,

		// Data
		reports: filteredReports,
		filters,
		isLoading: loading,
		error,
		totalPages: pagination?.totalPages || 0,
		currentPage: pagination?.page || 1,
		totalReports: pagination?.totalCount || 0,

		// User filter data
		availableUsers,
		usersLoading,
		usersError,

		// Modal states
		showCreateModal,
		editingReport,
		ratingReport,
		deletingReport,

		// Permissions
		canCreate,
		canEdit,
		canDelete,
		canRate,

		// Handlers
		onFilterChange: handleFilterChange,
		onPageChange: handlePageChange,
		onCreateReport: handleCreateReport,
		onEditReport: handleEditReport,
		onDeleteReport: handleDeleteReport,
		onRateReport: handleRateReport,
		onViewComments: handleViewComments,
		onClearError: clearError,

		// Modal handlers
		onCloseCreateModal: handleCloseCreateModal,
		onCloseEditModal: handleCloseEditModal,
		onCloseDeleteModal: handleCloseDeleteModal,
		onCloseRateModal: handleCloseRateModal,

		// API handlers
		createReport,
		updateReport,
		deleteReport,
		rateReport,
		fetchReports,

		// Utilities
		getStarRating,
	};
};
