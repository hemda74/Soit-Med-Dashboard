// Sales Reports API services

import type {
	CreateSalesReportDto,
	UpdateSalesReportDto,
	RateSalesReportDto,
	FilterSalesReportsDto,
	SalesReportResponseDto,
	PaginatedSalesReportsResponseDto,
	ApiResponse,
	PaginatedApiResponse,
} from '@/types/salesReport.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';
import { getApiBaseUrl } from '@/utils/apiConfig';

class SalesReportApiService {
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

		const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
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

	// Create a new sales report
	async createReport(
		data: CreateSalesReportDto
	): Promise<ApiResponse<SalesReportResponseDto>> {
		return this.makeRequest<ApiResponse<SalesReportResponseDto>>(
			API_ENDPOINTS.SALES_REPORT.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	// Get sales reports (all users - role-based filtering on backend)
	async getReports(
		filters: FilterSalesReportsDto = {}
	): Promise<PaginatedApiResponse<PaginatedSalesReportsResponseDto>> {
		const queryParams = new URLSearchParams();

		if (filters.page)
			queryParams.append('page', filters.page.toString());
		if (filters.pageSize)
			queryParams.append(
				'pageSize',
				filters.pageSize.toString()
			);
		if (filters.type) queryParams.append('type', filters.type);
		if (filters.startDate)
			queryParams.append('startDate', filters.startDate);
		if (filters.endDate)
			queryParams.append('endDate', filters.endDate);
		if (filters.employeeId)
			queryParams.append('employeeId', filters.employeeId);
		if (filters.searchTerm)
			queryParams.append('searchTerm', filters.searchTerm);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.SALES_REPORT.BASE}?${queryString}`
			: API_ENDPOINTS.SALES_REPORT.BASE;

		return this.makeRequest<
			PaginatedApiResponse<PaginatedSalesReportsResponseDto>
		>(endpoint, {
			method: 'GET',
		});
	}

	// Update a sales report
	async updateReport(
		id: number,
		data: UpdateSalesReportDto
	): Promise<ApiResponse<SalesReportResponseDto>> {
		return this.makeRequest<ApiResponse<SalesReportResponseDto>>(
			API_ENDPOINTS.SALES_REPORT.BY_ID(id),
			{
				method: 'PUT',
				body: JSON.stringify(data),
			}
		);
	}

	// Delete a sales report
	async deleteReport(id: number): Promise<ApiResponse<void>> {
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.SALES_REPORT.BY_ID(id),
			{
				method: 'DELETE',
			}
		);
	}

	// Rate a sales report
	async rateReport(
		id: number,
		data: RateSalesReportDto
	): Promise<ApiResponse<SalesReportResponseDto>> {
		return this.makeRequest<ApiResponse<SalesReportResponseDto>>(
			API_ENDPOINTS.SALES_REPORT.RATE(id),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}
}

export const salesReportApi = new SalesReportApiService();
