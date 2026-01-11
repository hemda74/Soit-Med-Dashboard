import type {
	Client,
	CreateClientDto,
	UpdateClientDto,
	ClientSearchFilters,
	ClientSearchResult,
	ClientVisit,
	CreateClientVisitDto,
	UpdateClientVisitDto,
	ClientInteraction,
	CreateClientInteractionDto,
	SalesAnalytics,
	SalesPerformanceMetrics,
	SalesDashboardData,
	ApiResponse,
	PaginatedApiResponse,
	PaginatedApiResponseWithMeta,
	ExportOptions,
	ExportResult,
} from '@/types/sales.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';
import { performanceMonitor } from '@/utils/performance';
import { getApiBaseUrl } from '@/utils/apiConfig';

// Weekly Plan Types
interface WeeklyPlan {
	id: number;
	planTitle: string;
	weekStartDate: string;
	weekEndDate: string;
	status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
	employeeId: string;
	employeeName: string;
	createdAt: string;
	updatedAt: string;
	reviewedAt?: string;
	reviewedBy?: string;
	reviewerName?: string;
	reviewNotes?: string;
	tasks: WeeklyPlanItem[];
}

interface WeeklyPlanItem {
	id: number;
	weeklyPlanId: number;
	title: string;
	description: string;
	priority: 'High' | 'Medium' | 'Low';
	status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
	dueDate: string;
	completedAt?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

interface CreateWeeklyPlanDto {
	planTitle: string;
	weekStartDate: string;
	weekEndDate: string;
	tasks: CreateWeeklyPlanItemDto[];
}

interface CreateWeeklyPlanItemDto {
	title: string;
	description: string;
	priority: 'High' | 'Medium' | 'Low';
	dueDate: string;
	notes?: string;
}

interface UpdateWeeklyPlanDto {
	planTitle?: string;
	weekStartDate?: string;
	weekEndDate?: string;
	status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

interface ReviewWeeklyPlanDto {
	rating?: number; // 1-5, optional
	comment?: string; // Optional
}

// Request Workflow Types
interface RequestWorkflow {
	id: string;
	requestType:
		| 'ClientVisit'
		| 'ProductDemo'
		| 'SupportRequest'
		| 'QuoteRequest'
		| 'Other';
	title: string;
	description: string;
	clientId: string;
	clientName: string;
	requestedBy: string;
	requestedByName: string;
	assignedTo?: string;
	assignedToName?: string;
	status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
	priority: 'High' | 'Medium' | 'Low';
	createdAt: string;
	updatedAt: string;
	dueDate?: string;
	completedAt?: string;
	notes?: string;
	comments: RequestComment[];
}

interface RequestComment {
	id: string;
	requestId: string;
	comment: string;
	commentedBy: string;
	commentedByName: string;
	createdAt: string;
}

interface CreateRequestWorkflowDto {
	requestType:
		| 'ClientVisit'
		| 'ProductDemo'
		| 'SupportRequest'
		| 'QuoteRequest'
		| 'Other';
	title: string;
	description: string;
	clientId: string;
	priority: 'High' | 'Medium' | 'Low';
	dueDate?: string;
	notes?: string;
}

// Delivery & Payment Terms Types
interface DeliveryTerms {
	id: string;
	clientId: string;
	clientName: string;
	terms: string;
	validFrom: string;
	validTo?: string;
	createdBy: string;
	createdByName: string;
	createdAt: string;
	updatedAt: string;
}

interface PaymentTerms {
	id: string;
	clientId: string;
	clientName: string;
	terms: string;
	validFrom: string;
	validTo?: string;
	createdBy: string;
	createdByName: string;
	createdAt: string;
	updatedAt: string;
}

// Get API base URL - automatically detects network IP when accessed from network
const getApiBaseUrlForService = () => getApiBaseUrl();

class SalesApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		return performanceMonitor.measureApiCall(endpoint, async () => {
			const token = getAuthToken();
			if (!token) {
				throw new Error(
					'No authentication token found. Please log in again.'
				);
			}

			const fullUrl = `${getApiBaseUrlForService()}${endpoint}`;
			console.log(
				`[API Call] ${
					options.method || 'GET'
				} ${fullUrl}`
			);

			const response = await fetch(fullUrl, {
				...options,
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					...options.headers,
				},
			});

			if (!response.ok) {
				let errorData: any = {};
				const contentType = response.headers.get('content-type') || '';
				
				try {
					if (contentType.includes('application/json')) {
						errorData = await response.json();
					} else {
						// Try to get text response for non-JSON errors
						const textResponse = await response.text();
						try {
							// Try to parse as JSON in case it's JSON but wrong content-type
							errorData = JSON.parse(textResponse);
						} catch {
							// If not JSON, use the text as error message
							errorData = { message: textResponse || `Request failed with status ${response.status}` };
						}
					}
				} catch (parseError) {
					// If all parsing fails, create a generic error
					errorData = { message: `Request failed with status ${response.status}` };
				}

				const error: any = new Error(
					errorData.message ||
						errorData.error ||
						`API request failed with status ${response.status}`
				);
				error.status = response.status;
				error.statusText = response.statusText;
				error.response = errorData;
				
				// Log error for debugging
				console.error(`[API Error] ${options.method || 'GET'} ${endpoint}`, {
					status: response.status,
					statusText: response.statusText,
					error: errorData
				});
				
				throw error;
			}

			return response.json();
		});
	}

	// ==================== CLIENT MANAGEMENT ====================

	/**
	 * Search clients with filters and pagination
	 */
	async searchClients(
		filters: ClientSearchFilters = {}
	): Promise<PaginatedApiResponse<ClientSearchResult>> {
		const queryParams = new URLSearchParams();

		if (filters.query)
			queryParams.append('searchTerm', filters.query);
		if (filters.classification)
			queryParams.append(
				'classification',
				filters.classification
			);
		if (filters.assignedSalesManId)
			queryParams.append(
				'assignedSalesManId',
				filters.assignedSalesManId
			);
		if (filters.city) queryParams.append('city', filters.city);
		if (filters.governorateId)
			queryParams.append(
				'governorateId',
				filters.governorateId.toString()
			);
		// Handle multiple equipment categories
		if (
			filters.equipmentCategories &&
			filters.equipmentCategories.length > 0
		) {
			filters.equipmentCategories.forEach((category) => {
				queryParams.append(
					'equipmentCategories',
					category
				);
			});
		}
		if (filters.clientCategory)
			queryParams.append('clientCategory', filters.clientCategory);
		if (filters.createdFrom)
			queryParams.append('createdFrom', filters.createdFrom);
		if (filters.createdTo)
			queryParams.append('createdTo', filters.createdTo);
		if (filters.sortBy)
			queryParams.append('sortBy', filters.sortBy);
		if (filters.sortOrder)
			queryParams.append('sortOrder', filters.sortOrder);
		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.CLIENT.SEARCH}?${queryString}`
			: API_ENDPOINTS.SALES.CLIENT.SEARCH;

		// Debug logging
		console.log('[searchClients] Filters:', filters);
		console.log('[searchClients] Query String:', queryString);
		console.log(
			'[searchClients] Full URL:',
			`${getApiBaseUrl()}${endpoint}`
		);

		return this.makeRequest<
			PaginatedApiResponse<ClientSearchResult>
		>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Create a new client
	 */
	async createClient(
		data: CreateClientDto
	): Promise<ApiResponse<Client>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<Client>>(
			API_ENDPOINTS.SALES.CLIENT.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get client by ID
	 */
	async getClient(clientId: string): Promise<ApiResponse<Client>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<Client>>(
			API_ENDPOINTS.SALES.CLIENT.BY_ID(clientId),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Update client
	 */
	async updateClient(
		clientId: string,
		data: UpdateClientDto
	): Promise<ApiResponse<Client>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<Client>>(
			API_ENDPOINTS.SALES.CLIENT.BY_ID(clientId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Delete client
	 */
	async deleteClient(clientId: string): Promise<ApiResponse<void>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.SALES.CLIENT.BY_ID(clientId),
			{
				method: 'DELETE',
			}
		);
	}

	/**
	 * Get my clients (for current user)
	 * NOTE: This method is for SalesMan app, not used in this dashboard
	 * SalesManager/SuperAdmin use searchClients instead
	 */
	async getMyClients(
		filters: Omit<ClientSearchFilters, 'assignedSalesManId'> = {}
	): Promise<PaginatedApiResponse<ClientSearchResult>> {
		// For Sales Support, return empty result if no filters to avoid 400 error
		const hasAnyFilter = Object.keys(filters).length > 0;

		if (!hasAnyFilter) {
			return {
				success: true,
				message: 'No clients found',
				data: {
					clients: [],
					totalCount: 0,
					page: 1,
					pageSize: 20,
					totalPages: 0,
					hasNextPage: false,
					hasPreviousPage: false,
				},
				timestamp: new Date().toISOString(),
			};
		}

		const queryParams = new URLSearchParams();

		if (filters.query) queryParams.append('query', filters.query);
		if (filters.classification)
			queryParams.append(
				'classification',
				filters.classification
			);
		if (filters.city) queryParams.append('city', filters.city);
		if (filters.governorateId)
			queryParams.append(
				'governorateId',
				filters.governorateId.toString()
			);
		// Handle multiple equipment categories
		if (
			filters.equipmentCategories &&
			filters.equipmentCategories.length > 0
		) {
			filters.equipmentCategories.forEach((category) => {
				queryParams.append(
					'equipmentCategories',
					category
				);
			});
		}
		if (filters.clientCategory)
			queryParams.append('clientCategory', filters.clientCategory);
		if (filters.createdFrom)
			queryParams.append('createdFrom', filters.createdFrom);
		if (filters.createdTo)
			queryParams.append('createdTo', filters.createdTo);
		if (filters.sortBy)
			queryParams.append('sortBy', filters.sortBy);
		if (filters.sortOrder)
			queryParams.append('sortOrder', filters.sortOrder);
		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);

		const queryString = queryParams.toString();
		// NOTE: MY_CLIENTS endpoint is for SalesMan app, not used in this dashboard
		// SalesManager/SuperAdmin should use searchClients instead
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.CLIENT.SEARCH}?${queryString}`
			: API_ENDPOINTS.SALES.CLIENT.SEARCH;

		// Removed verbose console logs for production

		return this.makeRequest<
			PaginatedApiResponse<ClientSearchResult>
		>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Find or create client
	 */
	async findOrCreateClient(
		data: CreateClientDto
	): Promise<ApiResponse<Client>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<Client>>(
			API_ENDPOINTS.SALES.CLIENT.FIND_OR_CREATE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get clients needing follow-up
	 */
	async getClientsNeedingFollowUp(): Promise<ApiResponse<Client[]>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<Client[]>>(
			API_ENDPOINTS.SALES.CLIENT.FOLLOW_UP_NEEDED,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get client statistics
	 */
	async getClientStatistics(): Promise<ApiResponse<SalesAnalytics>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<SalesAnalytics>>(
			API_ENDPOINTS.SALES.CLIENT.STATISTICS,
			{
				method: 'GET',
			}
		);
	}

	// ==================== CLIENT VISITS ====================

	/**
	 * Create a new client visit
	 */
	async createClientVisit(
		data: CreateClientVisitDto
	): Promise<ApiResponse<ClientVisit>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<ClientVisit>>(
			API_ENDPOINTS.SALES.CLIENT_VISIT.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get client visits
	 */
	async getClientVisits(
		clientId: string,
		filters: {
			page?: number;
			pageSize?: number;
			visitType?: string;
			status?: string;
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<PaginatedApiResponse<ClientVisit[]>> {
		try {
			// Use TaskProgress endpoint instead of ClientVisit (which doesn't exist)
			// TaskProgress contains visit/interaction data
			const response = await this.getClientTaskProgress(
				clientId
			);

			// Backend returns ApiResponse<List<TaskProgressResponseDTO>>, data is directly an array
			const itemsArray = Array.isArray(response.data)
				? response.data
				: [];

			// Transform TaskProgress to ClientVisit format
			if (itemsArray.length > 0) {
				const visits = itemsArray.map(
					(progress: any) => ({
						id:
							progress.id?.toString() ||
							'',
						clientId:
							progress.clientId?.toString() ||
							clientId,
						visitType:
							progress.progressType ||
							'Visit',
						visitDate:
							progress.progressDate ||
							progress.createdAt,
						location:
							progress.description ||
							'',
						purpose:
							progress.description ||
							'',
						notes:
							progress.notes ||
							progress.description ||
							'',
						visitResult:
							progress.visitResult ||
							null,
						createdBy:
							progress.employeeId ||
							'',
						createdByName:
							progress.employeeName ||
							'',
						createdAt:
							progress.createdAt ||
							new Date().toISOString(),
					})
				);

				return {
					success: true,
					data: visits,
					message: 'Client visits retrieved successfully',
					timestamp: new Date().toISOString(),
				} as PaginatedApiResponse<ClientVisit[]>;
			}

			// Return empty result if no data
			return {
				success: true,
				data: [],
				message: 'No visits found',
				timestamp: new Date().toISOString(),
			} as PaginatedApiResponse<ClientVisit[]>;
		} catch (error: any) {
			// Handle 404 and other errors gracefully
			if (error.status === 404) {
				return {
					success: true,
					data: [],
					message: 'No visits found for this client',
					timestamp: new Date().toISOString(),
				} as PaginatedApiResponse<ClientVisit[]>;
			}
			// Re-throw other errors
			throw error;
		}
	}

	/**
	 * Update client visit
	 */
	async updateClientVisit(
		visitId: string,
		data: UpdateClientVisitDto
	): Promise<ApiResponse<ClientVisit>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<ClientVisit>>(
			API_ENDPOINTS.SALES.CLIENT_VISIT.BY_ID(visitId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Delete client visit
	 */
	async deleteClientVisit(visitId: string): Promise<ApiResponse<void>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.SALES.CLIENT_VISIT.BY_ID(visitId),
			{
				method: 'DELETE',
			}
		);
	}

	/**
	 * Get overdue visits
	 */
	async getOverdueVisits(): Promise<ApiResponse<ClientVisit[]>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<ClientVisit[]>>(
			API_ENDPOINTS.SALES.CLIENT_VISIT.OVERDUE,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get upcoming visits
	 */
	async getUpcomingVisits(
		days: number = 7
	): Promise<ApiResponse<ClientVisit[]>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<ClientVisit[]>>(
			`${API_ENDPOINTS.SALES.CLIENT_VISIT.UPCOMING}?days=${days}`,
			{
				method: 'GET',
			}
		);
	}

	// ==================== CLIENT INTERACTIONS ====================

	/**
	 * Create a new client interaction
	 */
	async createClientInteraction(
		data: CreateClientInteractionDto
	): Promise<ApiResponse<ClientInteraction>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<ClientInteraction>>(
			API_ENDPOINTS.SALES.CLIENT_INTERACTION.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get client interactions
	 */
	async getClientInteractions(
		clientId: string,
		filters: {
			page?: number;
			pageSize?: number;
			interactionType?: string;
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<PaginatedApiResponse<ClientInteraction[]>> {
		const queryParams = new URLSearchParams();

		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);
		if (filters.interactionType)
			queryParams.append(
				'interactionType',
				filters.interactionType
			);
		if (filters.startDate)
			queryParams.append('startDate', filters.startDate);
		if (filters.endDate)
			queryParams.append('endDate', filters.endDate);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.CLIENT_INTERACTION.BY_CLIENT(
					clientId
			  )}?${queryString}`
			: API_ENDPOINTS.SALES.CLIENT_INTERACTION.BY_CLIENT(
					clientId
			  );

		// Removed verbose console logs for production

		return this.makeRequest<
			PaginatedApiResponse<ClientInteraction[]>
		>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Update client interaction
	 */
	async updateClientInteraction(
		interactionId: string,
		data: Partial<CreateClientInteractionDto>
	): Promise<ApiResponse<ClientInteraction>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<ClientInteraction>>(
			API_ENDPOINTS.SALES.CLIENT_INTERACTION.BY_ID(
				interactionId
			),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Delete client interaction
	 */
	async deleteClientInteraction(
		interactionId: string
	): Promise<ApiResponse<void>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.SALES.CLIENT_INTERACTION.BY_ID(
				interactionId
			),
			{
				method: 'DELETE',
			}
		);
	}

	// ==================== SALES ANALYTICS ====================

	/**
	 * Get sales dashboard data
	 */
	async getSalesDashboard(): Promise<ApiResponse<SalesDashboardData>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<SalesDashboardData>>(
			API_ENDPOINTS.SALES.SALES_ANALYTICS.DASHBOARD,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get sales analytics
	 */
	async getSalesAnalytics(
		period: string = 'monthly'
	): Promise<ApiResponse<SalesAnalytics>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<SalesAnalytics>>(
			`${API_ENDPOINTS.SALES.SALES_ANALYTICS.BASE}?period=${period}`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get sales performance metrics
	 */
	async getSalesPerformance(
		salesmanId?: string,
		period: string = 'monthly'
	): Promise<ApiResponse<SalesPerformanceMetrics[]>> {
		const queryParams = new URLSearchParams();
		queryParams.append('period', period);
		if (salesmanId) queryParams.append('salesmanId', salesmanId);

		const endpoint = `${
			API_ENDPOINTS.SALES.SALES_ANALYTICS.PERFORMANCE
		}?${queryParams.toString()}`;

		// Removed verbose console logs for production

		return this.makeRequest<ApiResponse<SalesPerformanceMetrics[]>>(
			endpoint,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get sales trends
	 */
	async getSalesTrends(
		period: string = 'monthly'
	): Promise<ApiResponse<any>> {
		// Removed verbose console logs for production
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.SALES_ANALYTICS.TRENDS}?period=${period}`,
			{
				method: 'GET',
			}
		);
	}

	// ==================== WEEKLY PLANNING ====================

	/**
	 * Create weekly plan
	 */
	async createWeeklyPlan(
		data: CreateWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get weekly plans with pagination
	 */
	async getWeeklyPlans(
		filters: {
			page?: number;
			pageSize?: number;
			employeeId?: string;
			weekStartDate?: string;
			weekEndDate?: string;
			isViewed?: boolean;
		} = {}
	): Promise<PaginatedApiResponseWithMeta<WeeklyPlan[]>> {
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
		if (filters.weekStartDate)
			queryParams.append(
				'weekStartDate',
				filters.weekStartDate
			);
		if (filters.weekEndDate)
			queryParams.append('weekEndDate', filters.weekEndDate);
		if (filters.isViewed !== undefined)
			queryParams.append(
				'isViewed',
				filters.isViewed.toString()
			);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.WEEKLY_PLAN.BASE}?${queryString}`
			: API_ENDPOINTS.WEEKLY_PLAN.BASE;

		return this.makeRequest<
			PaginatedApiResponseWithMeta<WeeklyPlan[]>
		>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get weekly plan by ID
	 */
	async getWeeklyPlan(planId: number): Promise<ApiResponse<WeeklyPlan>> {
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.BY_ID(planId),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Update weekly plan
	 */
	async updateWeeklyPlan(
		planId: number,
		data: UpdateWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.BY_ID(planId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Submit weekly plan for review
	 */
	async submitWeeklyPlan(
		planId: number
	): Promise<ApiResponse<WeeklyPlan>> {
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			`${API_ENDPOINTS.WEEKLY_PLAN.BY_ID(planId)}/submit`,
			{
				method: 'POST',
			}
		);
	}

	/**
	 * Review weekly plan
	 */
	async reviewWeeklyPlan(
		planId: number,
		reviewData: ReviewWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			API_ENDPOINTS.WEEKLY_PLAN.REVIEW(planId),
			{
				method: 'POST',
				body: JSON.stringify({
					rating: reviewData.rating,
					comment: reviewData.comment,
				}),
			}
		);
	}

	/**
	 * Get all salesmen for dropdown/filter selection
	 */
	async getAllSalesmen(): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.WEEKLY_PLAN.SALESMEN,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get current weekly plan
	 */
	async getCurrentWeeklyPlan(): Promise<ApiResponse<WeeklyPlan>> {
		return this.makeRequest<ApiResponse<WeeklyPlan>>(
			`${API_ENDPOINTS.WEEKLY_PLAN.BASE}/current`,
			{
				method: 'GET',
			}
		);
	}

	// ==================== PLAN ITEMS ====================

	/**
	 * Create plan item
	 */
	async createPlanItem(
		itemData: CreateWeeklyPlanItemDto & { weeklyPlanId: number }
	): Promise<ApiResponse<WeeklyPlanItem>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem>>(
			API_ENDPOINTS.WEEKLY_PLAN.TASKS(itemData.weeklyPlanId),
			{
				method: 'POST',
				body: JSON.stringify(itemData),
			}
		);
	}

	/**
	 * Get plan items
	 */
	async getPlanItems(
		planId: number
	): Promise<ApiResponse<WeeklyPlanItem[]>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem[]>>(
			API_ENDPOINTS.WEEKLY_PLAN.TASKS(planId),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Update plan item
	 */
	async updatePlanItem(
		itemId: number,
		weeklyPlanId: number,
		itemData: Partial<CreateWeeklyPlanItemDto>
	): Promise<ApiResponse<WeeklyPlanItem>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem>>(
			API_ENDPOINTS.WEEKLY_PLAN.TASK_BY_ID(
				weeklyPlanId,
				itemId
			),
			{
				method: 'PUT',
				body: JSON.stringify(itemData),
			}
		);
	}

	/**
	 * Complete plan item
	 */
	async completePlanItem(
		itemId: number,
		weeklyPlanId: number,
		completionData: { notes?: string }
	): Promise<ApiResponse<WeeklyPlanItem>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem>>(
			`${API_ENDPOINTS.WEEKLY_PLAN.TASK_BY_ID(
				weeklyPlanId,
				itemId
			)}/complete`,
			{
				method: 'POST',
				body: JSON.stringify(completionData),
			}
		);
	}

	/**
	 * Cancel plan item
	 */
	async cancelPlanItem(
		itemId: number,
		weeklyPlanId: number,
		reason: string
	): Promise<ApiResponse<WeeklyPlanItem>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem>>(
			`${API_ENDPOINTS.WEEKLY_PLAN.TASK_BY_ID(
				weeklyPlanId,
				itemId
			)}/cancel`,
			{
				method: 'POST',
				body: JSON.stringify({ reason }),
			}
		);
	}

	/**
	 * Postpone plan item
	 */
	async postponePlanItem(
		itemId: number,
		weeklyPlanId: number,
		newDate: string,
		reason: string
	): Promise<ApiResponse<WeeklyPlanItem>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem>>(
			`${API_ENDPOINTS.WEEKLY_PLAN.TASK_BY_ID(
				weeklyPlanId,
				itemId
			)}/postpone`,
			{
				method: 'POST',
				body: JSON.stringify({ newDate, reason }),
			}
		);
	}

	/**
	 * Get overdue items
	 */
	async getOverdueItems(): Promise<ApiResponse<WeeklyPlanItem[]>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem[]>>(
			`${API_ENDPOINTS.WEEKLY_PLAN.BASE}/overdue`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get upcoming items
	 */
	async getUpcomingItems(
		days: number = 7
	): Promise<ApiResponse<WeeklyPlanItem[]>> {
		return this.makeRequest<ApiResponse<WeeklyPlanItem[]>>(
			`${API_ENDPOINTS.WEEKLY_PLAN.BASE}/upcoming?days=${days}`,
			{
				method: 'GET',
			}
		);
	}

	// ==================== REQUEST WORKFLOW ====================

	/**
	 * Create request workflow
	 */
	async createRequestWorkflow(
		data: CreateRequestWorkflowDto
	): Promise<ApiResponse<RequestWorkflow>> {
		return this.makeRequest<ApiResponse<RequestWorkflow>>(
			'/api/RequestWorkflows',
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get my requests
	 */
	async getMyRequests(
		filters: {
			page?: number;
			pageSize?: number;
			status?: string;
			requestType?: string;
		} = {}
	): Promise<PaginatedApiResponseWithMeta<RequestWorkflow[]>> {
		const queryParams = new URLSearchParams();
		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);
		if (filters.status)
			queryParams.append('status', filters.status);
		if (filters.requestType)
			queryParams.append('requestType', filters.requestType);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `/api/RequestWorkflows/sent?${queryString}`
			: '/api/RequestWorkflows/sent';

		return this.makeRequest<
			PaginatedApiResponseWithMeta<RequestWorkflow[]>
		>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Update request status
	 */
	async updateRequestStatus(
		requestId: string,
		data: {
			status:
				| 'Pending'
				| 'InProgress'
				| 'Completed'
				| 'Cancelled';
			notes?: string;
		}
	): Promise<ApiResponse<RequestWorkflow>> {
		return this.makeRequest<ApiResponse<RequestWorkflow>>(
			`/api/RequestWorkflows/${requestId}/status`,
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Assign request
	 */
	async assignRequest(
		requestId: string,
		assignToUserId: string
	): Promise<ApiResponse<RequestWorkflow>> {
		return this.makeRequest<ApiResponse<RequestWorkflow>>(
			`/api/RequestWorkflows/${requestId}/assign`,
			{
				method: 'PUT',
				body: JSON.stringify({ assignToUserId }),
			}
		);
	}

	// ==================== DELIVERY & PAYMENT TERMS ====================

	/**
	 * Create delivery terms
	 */
	async createDeliveryTerms(termsData: {
		clientId: string;
		terms: string;
		validFrom: string;
		validTo?: string;
	}): Promise<ApiResponse<DeliveryTerms>> {
		return this.makeRequest<ApiResponse<DeliveryTerms>>(
			'/api/DeliveryTerms',
			{
				method: 'POST',
				body: JSON.stringify(termsData),
			}
		);
	}

	/**
	 * Create payment terms
	 */
	async createPaymentTerms(termsData: {
		clientId: string;
		terms: string;
		validFrom: string;
		validTo?: string;
	}): Promise<ApiResponse<PaymentTerms>> {
		return this.makeRequest<ApiResponse<PaymentTerms>>(
			'/api/PaymentTerms',
			{
				method: 'POST',
				body: JSON.stringify(termsData),
			}
		);
	}

	/**
	 * Get delivery terms
	 */
	async getDeliveryTerms(
		termsId: string
	): Promise<ApiResponse<DeliveryTerms>> {
		return this.makeRequest<ApiResponse<DeliveryTerms>>(
			`/api/DeliveryTerms/${termsId}`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get payment terms
	 */
	async getPaymentTerms(
		termsId: string
	): Promise<ApiResponse<PaymentTerms>> {
		return this.makeRequest<ApiResponse<PaymentTerms>>(
			`/api/PaymentTerms/${termsId}`,
			{
				method: 'GET',
			}
		);
	}

	// ==================== SALES REPORTS ====================

	/**
	 * Get sales manager dashboard
	 * Uses /api/SalesManStatistics/all to get team statistics for dashboard
	 */
	async getSalesManagerDashboard(
		year?: number,
		quarter?: number
	): Promise<ApiResponse<any>> {
		const params = new URLSearchParams();
		if (year) {
			params.append('year', year.toString());
		} else {
			// Default to current year if not provided
			params.append(
				'year',
				new Date().getFullYear().toString()
			);
		}
		if (quarter) {
			params.append('quarter', quarter.toString());
		}

		// Use SalesManStatistics/all endpoint as per backend API docs
		return this.makeRequest<ApiResponse<any>>(
			`/api/SalesManStatistics/all?${params.toString()}`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Export sales data
	 */
	async exportSalesData(
		options: ExportOptions
	): Promise<ApiResponse<ExportResult>> {
		return this.makeRequest<ApiResponse<ExportResult>>(
			API_ENDPOINTS.SALES.SALES_ANALYTICS.EXPORT,
			{
				method: 'POST',
				body: JSON.stringify(options),
			}
		);
	}

	// ==================== ADDITIONAL METHODS ====================

	async getMyAssignedOffers() {
		return this.makeRequest<PaginatedApiResponseWithMeta<any[]>>(
			`${API_ENDPOINTS.SALES.OFFERS.BASE}/assigned`,
			{ method: 'GET' }
		);
	}

	// ==================== DEALS ====================

	async createDeal(data: any): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async getDeals(
		filters: { clientId?: string | number; [key: string]: any } = {}
	): Promise<ApiResponse<any[]>> {
		// If clientId is provided, use the by-client endpoint
		if (filters.clientId) {
			return this.getDealsByClient(filters.clientId);
		}

		const queryParams = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (
				value &&
				key !== 'clientId' &&
				key !== 'page' &&
				key !== 'pageSize'
			) {
				queryParams.append(key, value.toString());
			}
		});
		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.DEALS.BASE}?${queryString}`
			: API_ENDPOINTS.SALES.DEALS.BASE;
		// Backend returns List<DealResponseDTO>, not paginated
		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get deals by client ID
	 */
	async getDealsByClient(
		clientId: string | number
	): Promise<ApiResponse<any[]>> {
		try {
			const endpoint = API_ENDPOINTS.SALES.DEALS.BY_CLIENT(
				`${clientId}`
			);
			console.log('getDealsByClient calling:', endpoint);
			return await this.makeRequest<ApiResponse<any[]>>(
				endpoint,
				{ method: 'GET' }
			);
		} catch (error: any) {
			// Handle 404 gracefully
			if (
				error.status === 404 ||
				error.response?.status === 404
			) {
				return {
					success: true,
					data: [],
					message: 'No deals found for this client',
					timestamp: new Date().toISOString(),
				} as ApiResponse<any[]>;
			}
			throw error;
		}
	}

	async getDeal(dealId: string): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.BY_ID(dealId),
			{ method: 'GET' }
		);
	}

	async updateDeal(dealId: string, data: any): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.BY_ID(dealId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	async approveDeal(
		dealId: string,
		data: {
			approved: boolean;
			notes?: string;
			superAdminRequired?: boolean;
		}
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.MANAGER_APPROVAL(dealId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async superAdminApproval(
		dealId: string,
		data: {
			approved: boolean;
			notes?: string;
			superAdminRequired?: boolean;
		}
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.SUPERADMIN_APPROVAL(dealId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async completeDeal(
		dealId: string,
		data: { completionNotes: string }
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.COMPLETE(dealId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async failDeal(
		dealId: string,
		data: { failureNotes: string }
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.FAIL(dealId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async getPendingApprovals(): Promise<ApiResponse<any[]>> {
		// Use the correct endpoint according to backend API
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.SALES.DEALS.PENDING_MANAGER,
			{ method: 'GET' }
		);
	}

	async getPendingManagerApprovals(): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.SALES.DEALS.PENDING_MANAGER,
			{ method: 'GET' }
		);
	}

	async getPendingSuperAdminApprovals(): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.SALES.DEALS.PENDING_SUPERADMIN,
			{ method: 'GET' }
		);
	}

	async markClientAccountCreated(
		dealId: string | number
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.DEALS.BASE}/${dealId}/mark-account-created`,
			{ method: 'POST' }
		);
	}

	async submitSalesManReport(
		dealId: string | number,
		reportText: string,
		reportAttachments?: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.DEALS.BASE}/${dealId}/submit-report`,
			{
				method: 'POST',
				body: JSON.stringify({
					reportText,
					reportAttachments,
				}),
			}
		);
	}

	async getDealsForLegal(): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			`${API_ENDPOINTS.SALES.DEALS.BASE}/legal`,
			{ method: 'GET' }
		);
	}

	async getTotalDealsCount(): Promise<ApiResponse<{ totalCount: number }>> {
		return this.makeRequest<ApiResponse<{ totalCount: number }>>(
			`${API_ENDPOINTS.SALES.DEALS.BASE}/total-count`,
			{ method: 'GET' }
		);
	}

	async getDealStatistics(): Promise<ApiResponse<{
		totalDeals: number;
		totalDealValue: number;
		averageDealValue: number;
		dealsByStatus: Record<string, number>;
		dealValueByStatus: Record<string, number>;
	}>> {
		return this.makeRequest<ApiResponse<{
			totalDeals: number;
			totalDealValue: number;
			averageDealValue: number;
			dealsByStatus: Record<string, number>;
			dealValueByStatus: Record<string, number>;
		}>>(
			`${API_ENDPOINTS.SALES.DEALS.BASE}/statistics`,
			{ method: 'GET' }
		);
	}

	async markDealAsLegalReviewed(dealId: number): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.DEALS.BASE}/${dealId}/mark-as-reviewed`,
			{ method: 'POST' }
		);
	}

	async getDealsForLegalOld(): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			`${API_ENDPOINTS.SALES.DEALS.BASE}/legal`,
			{ method: 'GET' }
		);
	}

	/**
	 * Submit first salesman review
	 */
	async submitFirstSalesManReview(
		dealId: string | number,
		reviewText: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.SUBMIT_FIRST_REVIEW(String(dealId)),
			{
				method: 'POST',
				body: JSON.stringify({ reviewText }),
			}
		);
	}

	/**
	 * Submit second salesman review
	 */
	async submitSecondSalesManReview(
		dealId: string | number,
		reviewText: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.SUBMIT_SECOND_REVIEW(String(dealId)),
			{
				method: 'POST',
				body: JSON.stringify({ reviewText }),
			}
		);
	}

	/**
	 * Set client credentials (Admin only)
	 */
	async setClientCredentials(
		dealId: string | number,
		username: string,
		password: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.DEALS.SET_CREDENTIALS(String(dealId)),
			{
				method: 'POST',
				body: JSON.stringify({ username, password }),
			}
		);
	}

	/**
	 * Get deals awaiting reviews and account setup
	 */
	async getDealsAwaitingReviewsAndAccountSetup(): Promise<
		ApiResponse<any[]>
	> {
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.SALES.DEALS.AWAITING_REVIEWS_AND_SETUP,
			{ method: 'GET' }
		);
	}

	// ==================== OFFERS ====================

	async createOffer(data: any): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Create offer with items (preserves product images)
	 */
	async createOfferWithItems(data: any): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.OFFERS.BASE}/with-items`,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async getOffers(
		filters: {
			status?: string;
			clientId?: number | string;
			startDate?: string;
			endDate?: string;
			page?: number;
			pageSize?: number;
		} = {}
	): Promise<ApiResponse<any[]>> {
		const queryParams = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value) queryParams.append(key, value.toString());
		});
		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.OFFERS.BASE}?${queryString}`
			: API_ENDPOINTS.SALES.OFFERS.BASE;
		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get all offers with filters and pagination (SuperAdmin only)
	 */
	async getAllOffersWithFilters(
		filters: {
			status?: string;
			salesmanId?: string;
			page?: number;
			pageSize?: number;
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<
		ApiResponse<{
			offers: any[];
			totalCount: number;
			page: number;
			pageSize: number;
			totalPages: number;
			hasPreviousPage: boolean;
			hasNextPage: boolean;
		}>
	> {
		const queryParams = new URLSearchParams();
		if (filters.status)
			queryParams.append('status', filters.status);
		if (filters.salesmanId)
			queryParams.append('salesmanId', filters.salesmanId);
		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);
		if (filters.startDate)
			queryParams.append('startDate', filters.startDate);
		if (filters.endDate)
			queryParams.append('endDate', filters.endDate);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.OFFERS.ALL}?${queryString}`
			: API_ENDPOINTS.SALES.OFFERS.ALL;

		return this.makeRequest<
			ApiResponse<{
				offers: any[];
				totalCount: number;
				page: number;
				pageSize: number;
				totalPages: number;
				hasPreviousPage: boolean;
				hasNextPage: boolean;
			}>
		>(endpoint, {
			method: 'GET',
		});
	}

	async getOffer(offerId: string): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId),
			{ method: 'GET' }
		);
	}

	async updateOffer(
		offerId: string,
		data: any
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Update offer by SalesManager (PATCH) - allows partial updates regardless of status
	 */
	async updateOfferBySalesManager(
		offerId: string,
		data: Partial<{
			clientId?: number;
			assignedTo?: string;
			products?: string;
			totalAmount?: number;
			paymentTerms?: string[];
			deliveryTerms?: string[];
			warrantyTerms?: string[];
			validUntil?: string[];
			notes?: string;
			paymentType?: string;
			finalPrice?: number;
			offerDuration?: string;
		}>
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId),
			{
				method: 'PATCH',
				body: JSON.stringify(data),
			}
		);
	}

	async sendOfferToSalesMan(offerId: string): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.SEND_TO_SALESMAN(offerId),
			{
				method: 'POST',
			}
		);
	}

	async salesManagerApproval(
		offerId: string,
		data: {
			approved: boolean;
			comments?: string;
			rejectionReason?: string;
		}
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.SALESMANAGER_APPROVAL(
				offerId
			),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async getPendingSalesManagerApprovals(): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.SALES.OFFERS
				.PENDING_SALESMANAGER_APPROVALS,
			{
				method: 'GET',
			}
		);
	}

	async recordClientResponse(
		offerId: string,
		data: any
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.OFFERS.BY_ID(
				offerId
			)}/client-response`,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async completeOffer(
		offerId: string,
		completionNotes?: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId)}/complete`,
			{
				method: 'POST',
				body: JSON.stringify({ completionNotes }),
			}
		);
	}

	async markAsNeedsModification(
		offerId: string,
		reason?: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.OFFERS.BY_ID(
				offerId
			)}/needs-modification`,
			{
				method: 'POST',
				body: JSON.stringify({ reason }),
			}
		);
	}

	async markAsUnderReview(offerId: string): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.OFFERS.BY_ID(
				offerId
			)}/under-review`,
			{
				method: 'POST',
			}
		);
	}

	async resumeFromUnderReview(
		offerId: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.OFFERS.BY_ID(
				offerId
			)}/resume-from-review`,
			{
				method: 'POST',
			}
		);
	}

	async updateExpiredOffers(): Promise<
		ApiResponse<{ expiredCount: number }>
	> {
		return this.makeRequest<ApiResponse<{ expiredCount: number }>>(
			`${API_ENDPOINTS.SALES.OFFERS.BASE}/update-expired`,
			{
				method: 'POST',
			}
		);
	}

	async getRecentActivity(
		limit: number = 20
	): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			`${API_ENDPOINTS.SALES.OFFERS.BASE}/recent-activity?limit=${limit}`,
			{
				method: 'GET',
			}
		);
	}

	async getOffersByClient(clientId: string): Promise<ApiResponse<any[]>> {
		// Backend uses query parameter, not path parameter
		const endpoint = `${API_ENDPOINTS.SALES.OFFERS.BASE}?clientId=${clientId}`;
		console.log('getOffersByClient calling:', endpoint);
		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get my offers (offers I created)
	 */
	async getMyOffers(
		filters: {
			status?: string;
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<ApiResponse<any[]>> {
		const queryParams = new URLSearchParams();
		if (filters.status)
			queryParams.append('status', filters.status);
		if (filters.startDate)
			queryParams.append('startDate', filters.startDate);
		if (filters.endDate)
			queryParams.append('endDate', filters.endDate);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.OFFERS.MY_OFFERS}?${queryString}`
			: API_ENDPOINTS.SALES.OFFERS.MY_OFFERS;

		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	async getClientProfile(clientId: string): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.CLIENT.PROFILE(clientId),
			{ method: 'GET' }
		);
	}

	// ==================== OFFER REQUESTS ====================

	async createOfferRequest(data: any): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFER_REQUESTS.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async getOfferRequests(
		filters: {
			status?: string; // Single status or comma-separated statuses like 'Requested,Assigned,InProgress,Ready'
			requestedBy?: string;
			clientId?: string; // Filter by client ID
			page?: number;
			pageSize?: number;
		} = {}
	): Promise<ApiResponse<any[]>> {
		const queryParams = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (
				value &&
				key !== 'clientId' &&
				key !== 'page' &&
				key !== 'pageSize'
			) {
				queryParams.append(key, value.toString());
			}
		});
		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.OFFER_REQUESTS.BASE}?${queryString}`
			: API_ENDPOINTS.SALES.OFFER_REQUESTS.BASE;

		try {
			const response = await this.makeRequest<
				ApiResponse<any[]>
			>(endpoint, {
				method: 'GET',
			});

			// If clientId filter was provided, filter the results client-side
			if (
				filters.clientId &&
				response.data &&
				Array.isArray(response.data)
			) {
				response.data = response.data.filter(
					(req: any) =>
						req.clientId?.toString() ===
						filters.clientId?.toString()
				);
			}

			return response;
		} catch (error: any) {
			// Handle 404 gracefully
			if (error.status === 404) {
				return {
					success: true,
					data: [],
					message: 'No offer requests found',
					timestamp: new Date().toISOString(),
				} as ApiResponse<any[]>;
			}
			throw error;
		}
	}

	async getOfferRequest(
		requestId: string | number
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFER_REQUESTS.BY_ID(requestId),
			{ method: 'GET' }
		);
	}

	async updateOfferRequest(
		requestId: string | number,
		data: Partial<{
			requestedProducts: string;
			specialNotes: string;
			status:
				| 'Requested'
				| 'Assigned'
				| 'InProgress'
				| 'Ready'
				| 'Sent'
				| 'Cancelled';
		}>
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFER_REQUESTS.BY_ID(requestId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	async assignOfferRequest(
		requestId: string | number,
		data: { assignedTo: string }
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFER_REQUESTS.ASSIGN(requestId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Update offer request status
	 * @param requestId - Request ID
	 * @param data - Status update data
	 * @returns Updated offer request
	 */
	async updateOfferRequestStatus(
		requestId: string | number,
		data: {
			status:
				| 'Requested'
				| 'Assigned'
				| 'InProgress'
				| 'Ready'
				| 'Sent'
				| 'Cancelled';
			notes?: string;
		}
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFER_REQUESTS.STATUS(requestId),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get requests assigned to a specific support member
	 * @param supportId - SalesSupport user ID
	 * @param filters - Optional filters
	 * @returns List of assigned offer requests
	 */
	async getAssignedOfferRequests(
		supportId: string,
		filters: {
			status?:
				| 'Requested'
				| 'Assigned'
				| 'InProgress'
				| 'Ready'
				| 'Sent'
				| 'Cancelled';
		} = {}
	): Promise<ApiResponse<any[]>> {
		const queryParams = new URLSearchParams();
		if (filters.status)
			queryParams.append('status', filters.status);
		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.OFFER_REQUESTS.ASSIGNED(
					supportId
			  )}?${queryString}`
			: API_ENDPOINTS.SALES.OFFER_REQUESTS.ASSIGNED(
					supportId
			  );
		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get offer request details formatted for creating an offer
	 * @param requestId - Offer request ID
	 * @returns Offer request details
	 */
	async getOfferRequestDetails(
		requestId: string | number
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.REQUEST_DETAILS(requestId),
			{
				method: 'GET',
			}
		);
	}

	async getTaskProgress(
		filters = {}
	): Promise<PaginatedApiResponseWithMeta<any[]>> {
		const queryParams = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value) queryParams.append(key, value.toString());
		});
		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.TASK_PROGRESS.BASE}?${queryString}`
			: API_ENDPOINTS.SALES.TASK_PROGRESS.BASE;
		return this.makeRequest<PaginatedApiResponseWithMeta<any[]>>(
			endpoint,
			{ method: 'GET' }
		);
	}

	async createTaskProgress(data: any): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.TASK_PROGRESS.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async getTaskProgressById(
		taskProgressId: string
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.TASK_PROGRESS.BASE}/${taskProgressId}`,
			{ method: 'GET' }
		);
	}

	async updateTaskProgress(
		taskProgressId: string,
		data: any
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`${API_ENDPOINTS.SALES.TASK_PROGRESS.BASE}/${taskProgressId}`,
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	async getClientTaskProgress(
		clientId: string
	): Promise<ApiResponse<any[]>> {
		// Backend returns ApiResponse<List<TaskProgressResponseDTO>>, not paginated
		const endpoint =
			API_ENDPOINTS.SALES.TASK_PROGRESS.BY_CLIENT(clientId);
		console.log('getClientTaskProgress calling:', endpoint);
		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get task progress by employee
	 */
	async getTaskProgressByEmployee(
		employeeId: string,
		filters: {
			startDate?: string;
			endDate?: string;
		} = {}
	): Promise<ApiResponse<any[]>> {
		const queryParams = new URLSearchParams();
		if (filters.startDate)
			queryParams.append('startDate', filters.startDate);
		if (filters.endDate)
			queryParams.append('endDate', filters.endDate);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.TASK_PROGRESS.BY_EMPLOYEE(
					employeeId
			  )}?${queryString}`
			: API_ENDPOINTS.SALES.TASK_PROGRESS.BY_EMPLOYEE(
					employeeId
			  );

		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get task progress by task ID
	 */
	async getTaskProgressByTask(
		taskId: number
	): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.SALES.TASK_PROGRESS.BY_TASK(taskId),
			{ method: 'GET' }
		);
	}

	// ==================== ENHANCED OFFER FEATURES ====================

	/**
	 * List salesmen for assignment
	 * GET /api/Offer/salesmen?q=term
	 */
	async getOfferSalesmen(q?: string): Promise<
		ApiResponse<
			Array<{
				id: string;
				firstName: string;
				lastName: string;
				email: string;
				phoneNumber: string;
				userName: string;
				isActive: boolean;
			}>
		>
	> {
		const endpoint =
			q && q.trim()
				? `${
						API_ENDPOINTS.SALES.OFFERS
							.SALESMEN
				  }?q=${encodeURIComponent(q.trim())}`
				: API_ENDPOINTS.SALES.OFFERS.SALESMEN;
		return this.makeRequest<ApiResponse<Array<any>>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get offer equipment
	 */
	async getOfferEquipment(offerId: string | number): Promise<
		ApiResponse<
			Array<{
				id: number;
				offerId: number;
				name: string;
				model?: string;
				provider?: string; // Backend uses "Provider"
				providerImagePath?: string | null; // Provider logo/image path
				country?: string;
				year?: number;
				price: number; // Backend uses "Price" (decimal)
				description?: string;
				inStock: boolean; // Backend uses "InStock"
				imagePath?: string | null;
				// Legacy fields for backward compatibility
				manufacturer?: string;
				quantity?: number;
				unitPrice?: number;
				totalPrice?: number;
				specifications?: string;
				warrantyPeriod?: string;
			}>
		>
	> {
		return this.makeRequest<
			ApiResponse<
				Array<{
					id: number;
					offerId: number;
					name: string;
					model?: string;
					provider?: string;
					providerImagePath?: string | null; // Provider logo/image path
					country?: string;
					year?: number;
					price: number;
					description?: string;
					inStock: boolean;
					imagePath?: string | null;
					manufacturer?: string;
					quantity?: number;
					unitPrice?: number;
					totalPrice?: number;
					specifications?: string;
					warrantyPeriod?: string;
				}>
			>
		>(API_ENDPOINTS.SALES.OFFERS.EQUIPMENT(offerId), {
			method: 'GET',
		});
	}

	/**
	 * Get equipment image path
	 */
	async getEquipmentImage(
		offerId: string | number,
		equipmentId: number
	): Promise<
		ApiResponse<{
			imagePath: string;
			equipmentId: number;
			offerId: number;
		}>
	> {
		return this.makeRequest<
			ApiResponse<{
				imagePath: string;
				equipmentId: number;
				offerId: number;
			}>
		>(
			API_ENDPOINTS.SALES.OFFERS.EQUIPMENT_IMAGE(
				offerId,
				equipmentId
			),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Add equipment to offer
	 */
	async addOfferEquipment(
		offerId: string | number,
		equipmentData: {
			name: string;
			model?: string;
			manufacturer?: string;
			quantity: number;
			unitPrice: number;
			specifications?: string;
			warrantyPeriod?: string;
		}
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.EQUIPMENT(offerId),
			{
				method: 'POST',
				body: JSON.stringify(equipmentData),
			}
		);
	}

	/**
	 * Delete offer equipment
	 */
	async deleteOfferEquipment(
		offerId: string,
		equipmentId: number
	): Promise<ApiResponse<void>> {
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.SALES.OFFERS.EQUIPMENT_BY_ID(
				offerId,
				equipmentId
			),
			{ method: 'DELETE' }
		);
	}

	/**
	 * Upload equipment image
	 */
	async uploadEquipmentImage(
		offerId: string | number,
		equipmentId: number,
		file: File
	): Promise<
		ApiResponse<{
			imagePath: string;
			equipmentId: number;
			uploadedAt: string;
		}>
	> {
		const formData = new FormData();
		formData.append('file', file);

		const token = getAuthToken();
		if (!token) {
			throw new Error(
				'No authentication token found. Please log in again.'
			);
		}

		const response = await fetch(
			`${getApiBaseUrlForService()}${API_ENDPOINTS.SALES.OFFERS.UPLOAD_IMAGE(
				offerId,
				equipmentId
			)}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			}
		);

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({}));
			throw new Error(
				errorData.message ||
					`Upload failed with status ${response.status}`
			);
		}

		return response.json();
	}

	/**
	 * Get offer terms
	 */
	async getOfferTerms(
		offerId: string | number
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.TERMS(offerId),
			{ method: 'GET' }
		);
	}

	/**
	 * Add or update offer terms
	 */
	async updateOfferTerms(
		offerId: string | number,
		termsData: {
			warrantyPeriod?: string;
			deliveryTime?: string;
			installationIncluded?: boolean;
			trainingIncluded?: boolean;
			maintenanceTerms?: string;
			paymentTerms?: string;
			deliveryTerms?: string;
			returnPolicy?: string;
		}
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.OFFERS.TERMS(offerId),
			{
				method: 'POST',
				body: JSON.stringify(termsData),
			}
		);
	}

	/**
	 * Get installment plan
	 */
	async getInstallmentPlan(offerId: string | number): Promise<
		ApiResponse<{
			id: number;
			offerId: number;
			numberOfInstallments: number;
			totalAmount: number;
			installments: Array<{
				installmentNumber: number;
				amount: number;
				dueDate: string;
				status: 'Pending' | 'Paid' | 'Overdue';
			}>;
			createdAt: string;
		}>
	> {
		return this.makeRequest<
			ApiResponse<{
				id: number;
				offerId: number;
				numberOfInstallments: number;
				totalAmount: number;
				installments: Array<{
					installmentNumber: number;
					amount: number;
					dueDate: string;
					status: 'Pending' | 'Paid' | 'Overdue';
				}>;
				createdAt: string;
			}>
		>(API_ENDPOINTS.SALES.OFFERS.INSTALLMENTS(offerId), {
			method: 'GET',
		});
	}

	/**
	 * Create installment plan
	 * Data structure: { numberOfInstallments, firstPaymentAmount, firstPaymentDate, paymentFrequency, totalAmount }
	 */
	async createInstallmentPlan(
		offerId: string | number,
		installmentData: {
			numberOfInstallments: number;
			firstPaymentAmount: number;
			firstPaymentDate: string;
			paymentFrequency: 'Monthly' | 'Quarterly' | 'Yearly';
			totalAmount: number;
		}
	): Promise<
		ApiResponse<{
			id: number;
			offerId: number;
			numberOfInstallments: number;
			totalAmount: number;
			installments: Array<{
				installmentNumber: number;
				amount: number;
				dueDate: string;
				status: 'Pending' | 'Paid' | 'Overdue';
			}>;
			createdAt: string;
		}>
	> {
		return this.makeRequest<
			ApiResponse<{
				id: number;
				offerId: number;
				numberOfInstallments: number;
				totalAmount: number;
				installments: Array<{
					installmentNumber: number;
					amount: number;
					dueDate: string;
					status: 'Pending' | 'Paid' | 'Overdue';
				}>;
				createdAt: string;
			}>
		>(API_ENDPOINTS.SALES.OFFERS.INSTALLMENTS(offerId), {
			method: 'POST',
			body: JSON.stringify(installmentData),
		});
	}

	/**
	 * Record task progress with offer request
	 */
	async recordTaskProgressWithOfferRequest(
		data: any
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			API_ENDPOINTS.SALES.TASK_PROGRESS.WITH_OFFER_REQUEST,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	// ==================== SALESMAN STATISTICS ====================

	async getAllSalesManStatistics(
		year: number,
		quarter?: number
	): Promise<ApiResponse<any[]>> {
		const params = new URLSearchParams({ year: year.toString() });
		if (quarter) {
			params.append('quarter', quarter.toString());
		}
		return this.makeRequest<ApiResponse<any[]>>(
			`/api/SalesManStatistics/all?${params.toString()}`
		);
	}

	async getSalesManStatistics(
		salesmanId: string,
		year: number,
		quarter?: number
	): Promise<ApiResponse<any>> {
		const params = new URLSearchParams({ year: year.toString() });
		if (quarter) {
			params.append('quarter', quarter.toString());
		}
		return this.makeRequest<ApiResponse<any>>(
			`/api/SalesManStatistics/${salesmanId}?${params.toString()}`
		);
	}

	async getSalesManProgress(
		salesmanId: string,
		year: number,
		quarter?: number
	): Promise<ApiResponse<any>> {
		const params = new URLSearchParams({ year: year.toString() });
		if (quarter) {
			params.append('quarter', quarter.toString());
		}
		return this.makeRequest<ApiResponse<any>>(
			`/api/SalesManStatistics/${salesmanId}/progress?${params.toString()}`
		);
	}

	async createSalesManTarget(data: any): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			'/api/SalesManStatistics/targets',
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	async updateSalesManTarget(
		targetId: number,
		data: any
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`/api/SalesManStatistics/targets/${targetId}`,
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	async deleteSalesManTarget(
		targetId: number
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`/api/SalesManStatistics/targets/${targetId}`,
			{
				method: 'DELETE',
			}
		);
	}

	async getSalesManTargets(
		salesmanId: string,
		year: number
	): Promise<ApiResponse<any[]>> {
		const params = new URLSearchParams({ year: year.toString() });
		return this.makeRequest<ApiResponse<any[]>>(
			`/api/SalesManStatistics/targets/SalesMan/${salesmanId}?${params.toString()}`
		);
	}

	async getTeamTarget(
		year: number,
		quarter?: number
	): Promise<ApiResponse<any>> {
		const params = new URLSearchParams({ year: year.toString() });
		if (quarter) {
			params.append('quarter', quarter.toString());
		}
		return this.makeRequest<ApiResponse<any>>(
			`/api/SalesManStatistics/targets/team?${params.toString()}`
		);
	}

	/**
	 * Get my statistics (for current user)
	 */
	async getMyStatistics(
		year?: number,
		quarter?: number
	): Promise<ApiResponse<any>> {
		const params = new URLSearchParams();
		if (year) {
			params.append('year', year.toString());
		}
		if (quarter) {
			params.append('quarter', quarter.toString());
		}
		const queryString = params.toString();
		const endpoint = queryString
			? `/api/SalesManStatistics/my-statistics?${queryString}`
			: '/api/SalesManStatistics/my-statistics';
		return this.makeRequest<ApiResponse<any>>(endpoint);
	}

	/**
	 * Get my progress (for current user)
	 */
	async getMyProgress(
		year?: number,
		quarter?: number
	): Promise<ApiResponse<any>> {
		const params = new URLSearchParams();
		if (year) {
			params.append('year', year.toString());
		}
		if (quarter) {
			params.append('quarter', quarter.toString());
		}
		const queryString = params.toString();
		const endpoint = queryString
			? `/api/SalesManStatistics/my-progress?${queryString}`
			: '/api/SalesManStatistics/my-progress';
		return this.makeRequest<ApiResponse<any>>(endpoint);
	}

	/**
	 * Get my targets (for current user)
	 */
	async getMyTargets(year?: number): Promise<ApiResponse<any[]>> {
		const params = new URLSearchParams();
		if (year) {
			params.append('year', year.toString());
		}
		const queryString = params.toString();
		const endpoint = queryString
			? `/api/SalesManStatistics/my-targets?${queryString}`
			: '/api/SalesManStatistics/my-targets';
		return this.makeRequest<ApiResponse<any[]>>(endpoint);
	}

	/**
	 * Patch salesman target (partial update)
	 */
	async patchSalesManTarget(
		targetId: number,
		data: Partial<any>
	): Promise<ApiResponse<any>> {
		return this.makeRequest<ApiResponse<any>>(
			`/api/SalesManStatistics/targets/${targetId}`,
			{
				method: 'PATCH',
				body: JSON.stringify(data),
			}
		);
	}

	async getOffersBySalesMan(
		salesmanId: string
	): Promise<ApiResponse<any[]>> {
		return this.makeRequest<ApiResponse<any[]>>(
			API_ENDPOINTS.SALES.OFFERS.BY_SALESMAN(salesmanId),
			{ method: 'GET' }
		);
	}

	/**
	 * Get offer requests by salesman
	 */
	async getOfferRequestsBySalesMan(
		salesmanId: string,
		filters: { status?: string } = {}
	): Promise<ApiResponse<any[]>> {
		const queryParams = new URLSearchParams();
		if (filters.status)
			queryParams.append('status', filters.status);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.OFFER_REQUESTS.BY_SALESMAN(
					salesmanId
			  )}?${queryString}`
			: API_ENDPOINTS.SALES.OFFER_REQUESTS.BY_SALESMAN(
					salesmanId
			  );

		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get deals by salesman
	 */
	async getDealsBySalesMan(
		salesmanId: string,
		filters: { status?: string } = {}
	): Promise<ApiResponse<any[]>> {
		const queryParams = new URLSearchParams();
		if (filters.status)
			queryParams.append('status', filters.status);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.DEALS.BY_SALESMAN(
					salesmanId
			  )}?${queryString}`
			: API_ENDPOINTS.SALES.DEALS.BY_SALESMAN(salesmanId);

		return this.makeRequest<ApiResponse<any[]>>(endpoint, {
			method: 'GET',
		});
	}
}

export const salesApi = new SalesApiService();
