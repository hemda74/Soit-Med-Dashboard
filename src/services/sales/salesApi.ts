// Sales API Service - Comprehensive sales module API integration

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
	SalesReport,
	CreateSalesReportDto,
	ApiResponse,
	PaginatedApiResponse,
	ExportOptions,
	ExportResult,
} from '@/types/sales.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117';

class SalesApiService {
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

	// ==================== CLIENT MANAGEMENT ====================

	/**
	 * Search clients with filters and pagination
	 */
	async searchClients(
		filters: ClientSearchFilters = {}
	): Promise<PaginatedApiResponse<ClientSearchResult>> {
		const queryParams = new URLSearchParams();

		if (filters.query) queryParams.append('query', filters.query);
		if (filters.type) queryParams.append('type', filters.type);
		if (filters.specialization)
			queryParams.append(
				'specialization',
				filters.specialization
			);
		if (filters.location)
			queryParams.append('location', filters.location);
		if (filters.status)
			queryParams.append('status', filters.status);
		if (filters.assignedSalesmanId)
			queryParams.append(
				'assignedSalesmanId',
				filters.assignedSalesmanId
			);
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

        // Removed verbose console logs for production

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
	 */
	async getMyClients(
		filters: Omit<ClientSearchFilters, 'assignedSalesmanId'> = {}
	): Promise<PaginatedApiResponse<ClientSearchResult>> {
		const queryParams = new URLSearchParams();

		if (filters.query) queryParams.append('query', filters.query);
		if (filters.type) queryParams.append('type', filters.type);
		if (filters.specialization)
			queryParams.append(
				'specialization',
				filters.specialization
			);
		if (filters.location)
			queryParams.append('location', filters.location);
		if (filters.status)
			queryParams.append('status', filters.status);
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
			? `${API_ENDPOINTS.SALES.CLIENT.MY_CLIENTS}?${queryString}`
			: API_ENDPOINTS.SALES.CLIENT.MY_CLIENTS;

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
		const queryParams = new URLSearchParams();

		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);
		if (filters.visitType)
			queryParams.append('visitType', filters.visitType);
		if (filters.status)
			queryParams.append('status', filters.status);
		if (filters.startDate)
			queryParams.append('startDate', filters.startDate);
		if (filters.endDate)
			queryParams.append('endDate', filters.endDate);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES.CLIENT_VISIT.BY_CLIENT(
					clientId
			  )}?${queryString}`
			: API_ENDPOINTS.SALES.CLIENT_VISIT.BY_CLIENT(clientId);

        // Removed verbose console logs for production

		return this.makeRequest<PaginatedApiResponse<ClientVisit[]>>(
			endpoint,
			{
				method: 'GET',
			}
		);
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

	// ==================== SALES REPORTS ====================

	/**
	 * Generate sales report
	 */
	async generateSalesReport(
		data: CreateSalesReportDto
	): Promise<ApiResponse<SalesReport>> {
        // Removed verbose console logs for production
		return this.makeRequest<ApiResponse<SalesReport>>(
			API_ENDPOINTS.SALES.SALES_REPORT.GENERATE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get sales report by ID
	 */
	async getSalesReport(
		reportId: string
	): Promise<ApiResponse<SalesReport>> {
        // Removed verbose console logs for production
		return this.makeRequest<ApiResponse<SalesReport>>(
			API_ENDPOINTS.SALES.SALES_REPORT.BY_ID(reportId),
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
        // Removed verbose console logs for production
		return this.makeRequest<ApiResponse<ExportResult>>(
			API_ENDPOINTS.SALES.SALES_ANALYTICS.EXPORT,
			{
				method: 'POST',
				body: JSON.stringify(options),
			}
		);
	}

	/**
	 * Export sales report
	 */
	async exportSalesReport(
		reportId: string,
		format: 'pdf' | 'excel' | 'csv' = 'pdf'
	): Promise<Blob> {
        // Removed verbose console logs for production
		const token = getAuthToken();
		if (!token) {
			throw new Error(
				'No authentication token found. Please log in again.'
			);
		}

		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.SALES.SALES_REPORT.EXPORT(
				reportId
			)}?format=${format}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(
				`Export failed with status ${response.status}`
			);
		}

		return response.blob();
	}
}

export const salesApi = new SalesApiService();

