// Hook for managing Weekly Plans (To-Do List System)

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { weeklyPlanApi } from '@/services/weeklyPlan/weeklyPlanApi';
import { useAuthStore } from '@/stores/authStore';
import type {
	WeeklyPlan,
	FilterWeeklyPlansDto,
	CreateWeeklyPlanDto,
	UpdateWeeklyPlanDto,
	ReviewWeeklyPlanDto,
	CreateTaskDto,
	UpdateTaskDto,
	CreateDailyProgressDto,
	UpdateDailyProgressDto,
} from '@/types/weeklyPlan.types';

interface PaginationState {
	page: number;
	pageSize: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	totalCount: number;
}

interface UseWeeklyPlansState {
	plans: WeeklyPlan[];
	currentPlan: WeeklyPlan | null;
	loading: boolean;
	error: string | null;
	pagination: PaginationState;
	filters: FilterWeeklyPlansDto;
}

interface UseWeeklyPlansReturn extends UseWeeklyPlansState {
	// Plan operations
	fetchPlans: (newFilters?: FilterWeeklyPlansDto) => Promise<void>;
	fetchPlanById: (id: number) => Promise<void>;
	createPlan: (data: CreateWeeklyPlanDto) => Promise<boolean>;
	updatePlan: (id: number, data: UpdateWeeklyPlanDto) => Promise<boolean>;
	deletePlan: (id: number) => Promise<boolean>;
	reviewPlan: (id: number, data: ReviewWeeklyPlanDto) => Promise<boolean>;

	// Task operations
	addTask: (
		weeklyPlanId: number,
		data: CreateTaskDto
	) => Promise<boolean>;
	updateTask: (
		weeklyPlanId: number,
		taskId: number,
		data: UpdateTaskDto
	) => Promise<boolean>;
	deleteTask: (weeklyPlanId: number, taskId: number) => Promise<boolean>;

	// Daily progress operations
	addDailyProgress: (
		weeklyPlanId: number,
		data: CreateDailyProgressDto
	) => Promise<boolean>;
	updateDailyProgress: (
		weeklyPlanId: number,
		progressId: number,
		data: UpdateDailyProgressDto
	) => Promise<boolean>;
	deleteDailyProgress: (
		weeklyPlanId: number,
		progressId: number
	) => Promise<boolean>;

	// UI helpers
	setFilters: (filters: FilterWeeklyPlansDto) => void;
	clearError: () => void;
	hasAccess: boolean;
	canCreate: boolean;
	canReview: boolean;
}

export function useWeeklyPlans(): UseWeeklyPlansReturn {
	const { hasAnyRole } = useAuthStore();

	// Check access permissions
	const hasAccess = hasAnyRole([
		'Salesman',
		'SalesManager',
		'SuperAdmin',
	]);
	const canCreate = hasAnyRole(['Salesman']);
	const canReview = hasAnyRole(['SalesManager', 'SuperAdmin']);

	const [state, setState] = useState<UseWeeklyPlansState>({
		plans: [],
		currentPlan: null,
		loading: false,
		error: null,
		pagination: {
			page: 1,
			pageSize: 20,
			totalPages: 0,
			hasNextPage: false, // Computed from page < totalPages
			hasPreviousPage: false, // Computed from page > 1
			totalCount: 0,
		},
		filters: {} as FilterWeeklyPlansDto,
	});

	// Fetch plans with filters
	const fetchPlans = useCallback(
		async (newFilters?: FilterWeeklyPlansDto) => {
			if (!hasAccess) {
				setState((prev) => ({
					...prev,
					error: 'Access denied. You do not have permission to view weekly plans.',
				}));
				return;
			}

			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				// Always use newFilters if provided, otherwise use default pagination
				const filters = newFilters || {
					page: 1,
					pageSize: 20,
				};

				console.log(
					'Fetching weekly plans with filters:',
					filters
				);

				const response =
					await weeklyPlanApi.getWeeklyPlans(
						filters
					);

				if (response.success && response.data) {
					// Handle new API response format: { plans: [], pagination: {} }
					const plans = response.data.plans || [];
					const pagination =
						response.data.pagination || {};

					const currentPage =
						pagination.page || 1;
					const totalPages =
						pagination.totalPages || 0;

					setState((prev) => ({
						...prev,
						plans: plans,
						pagination: {
							page: currentPage,
							pageSize:
								pagination.pageSize ||
								20,
							totalPages: totalPages,
							hasNextPage:
								currentPage <
								totalPages,
							hasPreviousPage:
								currentPage > 1,
							totalCount:
								pagination.totalCount ||
								0,
						},
						filters: filters, // Use the actual filters that were sent to the API
					}));
				} else {
					throw new Error(
						response.message ||
							'Failed to fetch plans'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to fetch plans';
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
		[hasAccess]
	);

	// Fetch a single plan by ID
	const fetchPlanById = useCallback(async (id: number) => {
		setState((prev) => ({
			...prev,
			loading: true,
			error: null,
		}));

		try {
			const response = await weeklyPlanApi.getWeeklyPlanById(
				id
			);

			if (response.success && response.data) {
				setState((prev) => ({
					...prev,
					currentPlan: response.data,
				}));
			} else {
				throw new Error(
					response.message ||
						'Failed to fetch plan'
				);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch plan';
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
	}, []);

	// Create a new plan
	const createPlan = useCallback(
		async (data: CreateWeeklyPlanDto): Promise<boolean> => {
			if (!canCreate) {
				toast.error(
					'You do not have permission to create weekly plans.'
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
					await weeklyPlanApi.createWeeklyPlan(
						data
					);

				if (response.success) {
					toast.success(
						'Weekly plan created successfully!'
					);
					await fetchPlans();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to create plan'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to create plan';
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
		[canCreate, fetchPlans]
	);

	// Update a plan
	const updatePlan = useCallback(
		async (
			id: number,
			data: UpdateWeeklyPlanDto
		): Promise<boolean> => {
			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				const response =
					await weeklyPlanApi.updateWeeklyPlan(
						id,
						data
					);

				if (response.success) {
					toast.success(
						'Weekly plan updated successfully!'
					);
					await fetchPlans();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to update plan'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to update plan';
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
		[fetchPlans]
	);

	// Delete a plan
	const deletePlan = useCallback(
		async (id: number): Promise<boolean> => {
			setState((prev) => ({
				...prev,
				loading: true,
				error: null,
			}));

			try {
				const response =
					await weeklyPlanApi.deleteWeeklyPlan(
						id
					);

				if (response.success) {
					toast.success(
						'Weekly plan deleted successfully!'
					);
					await fetchPlans();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to delete plan'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to delete plan';
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
		[fetchPlans]
	);

	// Review a plan
	const reviewPlan = useCallback(
		async (
			id: number,
			data: ReviewWeeklyPlanDto
		): Promise<boolean> => {
			if (!canReview) {
				toast.error(
					'You do not have permission to review weekly plans.'
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
					await weeklyPlanApi.reviewWeeklyPlan(
						id,
						data
					);

				if (response.success) {
					toast.success(
						'Weekly plan reviewed successfully!'
					);
					await fetchPlans();
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to review plan'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to review plan';
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
		[canReview, fetchPlans]
	);

	// Add a task
	const addTask = useCallback(
		async (
			weeklyPlanId: number,
			data: CreateTaskDto
		): Promise<boolean> => {
			try {
				const response = await weeklyPlanApi.addTask(
					weeklyPlanId,
					data
				);

				if (response.success) {
					toast.success(
						'Task added successfully!'
					);
					await fetchPlanById(weeklyPlanId);
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to add task'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to add task';
				toast.error(errorMessage);
				return false;
			}
		},
		[fetchPlanById]
	);

	// Update a task
	const updateTask = useCallback(
		async (
			weeklyPlanId: number,
			taskId: number,
			data: UpdateTaskDto
		): Promise<boolean> => {
			try {
				const response = await weeklyPlanApi.updateTask(
					weeklyPlanId,
					taskId,
					data
				);

				if (response.success) {
					toast.success(
						'Task updated successfully!'
					);
					await fetchPlanById(weeklyPlanId);
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to update task'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to update task';
				toast.error(errorMessage);
				return false;
			}
		},
		[fetchPlanById]
	);

	// Delete a task
	const deleteTask = useCallback(
		async (
			weeklyPlanId: number,
			taskId: number
		): Promise<boolean> => {
			try {
				const response = await weeklyPlanApi.deleteTask(
					weeklyPlanId,
					taskId
				);

				if (response.success) {
					toast.success(
						'Task deleted successfully!'
					);
					await fetchPlanById(weeklyPlanId);
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to delete task'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to delete task';
				toast.error(errorMessage);
				return false;
			}
		},
		[fetchPlanById]
	);

	// Add daily progress
	const addDailyProgress = useCallback(
		async (
			weeklyPlanId: number,
			data: CreateDailyProgressDto
		): Promise<boolean> => {
			try {
				const response =
					await weeklyPlanApi.addDailyProgress(
						weeklyPlanId,
						data
					);

				if (response.success) {
					toast.success(
						'Daily progress added successfully!'
					);
					await fetchPlanById(weeklyPlanId);
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to add daily progress'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to add daily progress';
				toast.error(errorMessage);
				return false;
			}
		},
		[fetchPlanById]
	);

	// Update daily progress
	const updateDailyProgress = useCallback(
		async (
			weeklyPlanId: number,
			progressId: number,
			data: UpdateDailyProgressDto
		): Promise<boolean> => {
			try {
				const response =
					await weeklyPlanApi.updateDailyProgress(
						weeklyPlanId,
						progressId,
						data
					);

				if (response.success) {
					toast.success(
						'Daily progress updated successfully!'
					);
					await fetchPlanById(weeklyPlanId);
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to update daily progress'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to update daily progress';
				toast.error(errorMessage);
				return false;
			}
		},
		[fetchPlanById]
	);

	// Delete daily progress
	const deleteDailyProgress = useCallback(
		async (
			weeklyPlanId: number,
			progressId: number
		): Promise<boolean> => {
			try {
				const response =
					await weeklyPlanApi.deleteDailyProgress(
						weeklyPlanId,
						progressId
					);

				if (response.success) {
					toast.success(
						'Daily progress deleted successfully!'
					);
					await fetchPlanById(weeklyPlanId);
					return true;
				} else {
					throw new Error(
						response.message ||
							'Failed to delete daily progress'
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to delete daily progress';
				toast.error(errorMessage);
				return false;
			}
		},
		[fetchPlanById]
	);

	// Set filters
	const setFilters = useCallback((filters: FilterWeeklyPlansDto) => {
		setState((prev) => ({
			...prev,
			filters,
		}));
	}, []);

	// Clear error
	const clearError = useCallback(() => {
		setState((prev) => ({
			...prev,
			error: null,
		}));
	}, []);

	return {
		...state,
		fetchPlans,
		fetchPlanById,
		createPlan,
		updatePlan,
		deletePlan,
		reviewPlan,
		addTask,
		updateTask,
		deleteTask,
		addDailyProgress,
		updateDailyProgress,
		deleteDailyProgress,
		setFilters,
		clearError,
		hasAccess,
		canCreate,
		canReview,
	};
}
