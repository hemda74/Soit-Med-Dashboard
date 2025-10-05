// Weekly Plan API services

import type {
	WeeklyPlan,
	CreateWeeklyPlanDto,
	UpdateWeeklyPlanDto,
	ReviewWeeklyPlanDto,
	FilterWeeklyPlansDto,
	PaginatedWeeklyPlansResponse,
	CreateTaskDto,
	UpdateTaskDto,
	WeeklyPlanTask,
	CreateDailyProgressDto,
	UpdateDailyProgressDto,
	DailyProgress,
	ApiResponse,
	PaginatedApiResponse,
} from '@/types/weeklyPlan.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117';

class WeeklyPlanApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const token = getAuthToken();
		if (!token) {
			throw new Error(
				'No authentication token found. Please log in again.'
			);
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({}));
			throw new Error(
				errorData.message ||
					`API request failed with status ${response.status}`
			);
		}

		return response.json();
	}

	// ==================== Weekly Plan Management ====================

	/**
	 * Create a new weekly plan
	 * @param data - Weekly plan data with optional tasks
	 * @returns Created weekly plan with tasks
	 */
	async createWeeklyPlan(
		data: CreateWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		console.log('Creating weekly plan:', data);
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Update an existing weekly plan
	 * @param id - Weekly plan ID
	 * @param data - Updated plan data
	 * @returns Updated weekly plan
	 */
	async updateWeeklyPlan(
		id: number,
		data: UpdateWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		console.log('Updating weekly plan:', id, data);
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.BY_ID(id),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Delete a weekly plan
	 * @param id - Weekly plan ID
	 */
	async deleteWeeklyPlan(id: number): Promise<ApiResponse<void>> {
		console.log('Deleting weekly plan:', id);
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.WEEKLY_PLAN.BY_ID(id),
			{
				method: 'DELETE',
			}
		);
	}

	/**
	 * Get a specific weekly plan by ID
	 * @param id - Weekly plan ID
	 * @returns Weekly plan with tasks and daily progresses
	 */
	async getWeeklyPlanById(id: number): Promise<ApiResponse<WeeklyPlan>> {
		console.log('Fetching weekly plan by ID:', id);
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.BY_ID(id),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get all weekly plans with filtering and pagination
	 * @param filters - Filter parameters
	 * @returns Paginated list of weekly plans
	 */
	async getWeeklyPlans(
		filters: FilterWeeklyPlansDto = {}
	): Promise<PaginatedApiResponse<PaginatedWeeklyPlansResponse>> {
		const queryParams = new URLSearchParams();

		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);
		if (filters.employeeId)
			queryParams.append('employeeId', filters.employeeId);
		if (filters.startDate)
			queryParams.append('startDate', filters.startDate);
		if (filters.endDate)
			queryParams.append('endDate', filters.endDate);
		if (filters.hasManagerReview !== undefined)
			queryParams.append(
				'hasManagerReview',
				filters.hasManagerReview.toString()
			);
		if (filters.minRating)
			queryParams.append(
				'minRating',
				filters.minRating.toString()
			);
		if (filters.maxRating)
			queryParams.append(
				'maxRating',
				filters.maxRating.toString()
			);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.WEEKLY_PLAN.BASE}?${queryString}`
			: API_ENDPOINTS.WEEKLY_PLAN.BASE;

		console.log(
			'Fetching weekly plans with filters:',
			`${API_BASE_URL}${endpoint}`
		);

		return this.makeRequest<
			PaginatedApiResponse<PaginatedWeeklyPlansResponse>
		>(endpoint, {
			method: 'GET',
		});
	}

	// ==================== Task Management ====================

	/**
	 * Add a task to a weekly plan
	 * @param weeklyPlanId - Weekly plan ID
	 * @param data - Task data
	 * @returns Created task
	 */
	async addTask(
		weeklyPlanId: number,
		data: CreateTaskDto
	): Promise<ApiResponse<WeeklyPlanTask>> {
		console.log('Adding task to weekly plan:', weeklyPlanId, data);
		return this.makeRequest<ApiResponse<WeeklyPlanTask>>(
			API_ENDPOINTS.WEEKLY_PLAN.TASKS(weeklyPlanId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Update a task
	 * @param weeklyPlanId - Weekly plan ID
	 * @param taskId - Task ID
	 * @param data - Updated task data
	 * @returns Updated task
	 */
	async updateTask(
		weeklyPlanId: number,
		taskId: number,
		data: UpdateTaskDto
	): Promise<ApiResponse<WeeklyPlanTask>> {
		console.log('Updating task:', weeklyPlanId, taskId, data);
		return this.makeRequest<ApiResponse<WeeklyPlanTask>>(
			API_ENDPOINTS.WEEKLY_PLAN.TASK_BY_ID(
				weeklyPlanId,
				taskId
			),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Delete a task
	 * @param weeklyPlanId - Weekly plan ID
	 * @param taskId - Task ID
	 */
	async deleteTask(
		weeklyPlanId: number,
		taskId: number
	): Promise<ApiResponse<void>> {
		console.log('Deleting task:', weeklyPlanId, taskId);
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.WEEKLY_PLAN.TASK_BY_ID(
				weeklyPlanId,
				taskId
			),
			{
				method: 'DELETE',
			}
		);
	}

	// ==================== Daily Progress Management ====================

	/**
	 * Add daily progress to a weekly plan
	 * @param weeklyPlanId - Weekly plan ID
	 * @param data - Daily progress data
	 * @returns Created daily progress
	 */
	async addDailyProgress(
		weeklyPlanId: number,
		data: CreateDailyProgressDto
	): Promise<ApiResponse<DailyProgress>> {
		console.log(
			'Adding daily progress to weekly plan:',
			weeklyPlanId,
			data
		);
		return this.makeRequest<ApiResponse<DailyProgress>>(
			API_ENDPOINTS.WEEKLY_PLAN.PROGRESS(weeklyPlanId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Update daily progress
	 * @param weeklyPlanId - Weekly plan ID
	 * @param progressId - Progress ID
	 * @param data - Updated progress data
	 * @returns Updated daily progress
	 */
	async updateDailyProgress(
		weeklyPlanId: number,
		progressId: number,
		data: UpdateDailyProgressDto
	): Promise<ApiResponse<DailyProgress>> {
		console.log(
			'Updating daily progress:',
			weeklyPlanId,
			progressId,
			data
		);
		return this.makeRequest<ApiResponse<DailyProgress>>(
			API_ENDPOINTS.WEEKLY_PLAN.PROGRESS_BY_ID(
				weeklyPlanId,
				progressId
			),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Delete daily progress
	 * @param weeklyPlanId - Weekly plan ID
	 * @param progressId - Progress ID
	 */
	async deleteDailyProgress(
		weeklyPlanId: number,
		progressId: number
	): Promise<ApiResponse<void>> {
		console.log(
			'Deleting daily progress:',
			weeklyPlanId,
			progressId
		);
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.WEEKLY_PLAN.PROGRESS_BY_ID(
				weeklyPlanId,
				progressId
			),
			{
				method: 'DELETE',
			}
		);
	}

	// ==================== Manager Review ====================

	/**
	 * Review and rate a weekly plan
	 * @param id - Weekly plan ID
	 * @param data - Review data (rating and/or comment)
	 * @returns Reviewed weekly plan
	 */
	async reviewWeeklyPlan(
		id: number,
		data: ReviewWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		console.log('Reviewing weekly plan:', id, data);
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.REVIEW(id),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}
}

export const weeklyPlanApi = new WeeklyPlanApiService();

