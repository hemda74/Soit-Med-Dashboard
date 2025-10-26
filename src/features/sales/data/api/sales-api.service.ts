/**
 * Sales API Service
 * Complete integration with backend sales API endpoints
 */

import { apiRequest } from '@core/api/client';
import { API_CONFIG } from '@core/config';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
	Client,
	ClientSearchParams,
	CreateClientDto,
	ClientProfile,
	TaskProgress,
	CreateTaskProgressDto,
	CreateTaskProgressWithOfferRequestDto,
	TaskProgressFilters,
	OfferRequest,
	CreateOfferRequestDto,
	AssignOfferRequestDto,
	OfferRequestFilters,
	SalesOffer,
	CreateSalesOfferDto,
	SalesOfferFilters,
	Deal,
	CreateDealDto,
	ManagerApprovalDto,
	DealFilters,
	SalesReport,
	CreateSalesReportDto,
	RateSalesReportDto,
	SalesReportFilters,
	WeeklyPlan,
	CreateWeeklyPlanDto,
	ReviewWeeklyPlanDto,
	WeeklyPlanFilters,
	ApiResponse,
	PaginatedResponse,
} from '../models/api.types';

class SalesApiService {
	// ==================== CLIENT MANAGEMENT ====================

	async searchClients(
		params: ClientSearchParams
	): Promise<PaginatedResponse<Client>> {
		return apiRequest<PaginatedResponse<Client>>({
			url: API_ENDPOINTS.SALES.CLIENT_SEARCH,
			method: 'GET',
			params,
		});
	}

	async createClient(
		data: CreateClientDto
	): Promise<ApiResponse<Client>> {
		return apiRequest<ApiResponse<Client>>({
			url: API_ENDPOINTS.SALES.CLIENT_CREATE,
			method: 'POST',
			data,
		});
	}

	async getClientById(id: number): Promise<ApiResponse<Client>> {
		const url = API_ENDPOINTS.SALES.CLIENT_BY_ID(id);
		return apiRequest<ApiResponse<Client>>({
			url,
			method: 'GET',
		});
	}

	async getClientProfile(
		id: number
	): Promise<ApiResponse<ClientProfile>> {
		const url = API_ENDPOINTS.SALES.CLIENT_PROFILE(id);
		return apiRequest<ApiResponse<ClientProfile>>({
			url,
			method: 'GET',
		});
	}

	async getMyClients(): Promise<ApiResponse<Client[]>> {
		return apiRequest<ApiResponse<Client[]>>({
			url: API_ENDPOINTS.SALES.MY_CLIENTS,
			method: 'GET',
		});
	}

	// ==================== TASK PROGRESS ====================

	async createTaskProgress(
		data: CreateTaskProgressDto
	): Promise<ApiResponse<TaskProgress>> {
		return apiRequest<ApiResponse<TaskProgress>>({
			url: API_ENDPOINTS.SALES.TASK_PROGRESS,
			method: 'POST',
			data,
		});
	}

	async createTaskProgressWithOfferRequest(
		data: CreateTaskProgressWithOfferRequestDto
	): Promise<ApiResponse<TaskProgress>> {
		return apiRequest<ApiResponse<TaskProgress>>({
			url: API_ENDPOINTS.SALES.TASK_PROGRESS_WITH_OFFER,
			method: 'POST',
			data,
		});
	}

	async getAllTaskProgress(
		filters?: TaskProgressFilters
	): Promise<ApiResponse<TaskProgress[]>> {
		return apiRequest<ApiResponse<TaskProgress[]>>({
			url: API_ENDPOINTS.SALES.TASK_PROGRESS,
			method: 'GET',
			params: filters,
		});
	}

	async getProgressByTaskId(
		taskId: number
	): Promise<ApiResponse<TaskProgress[]>> {
		const url = API_ENDPOINTS.SALES.TASK_PROGRESS_BY_TASK(taskId);
		return apiRequest<ApiResponse<TaskProgress[]>>({
			url,
			method: 'GET',
		});
	}

	async getProgressByClientId(
		clientId: number
	): Promise<ApiResponse<TaskProgress[]>> {
		const url =
			API_ENDPOINTS.SALES.TASK_PROGRESS_BY_CLIENT(clientId);
		return apiRequest<ApiResponse<TaskProgress[]>>({
			url,
			method: 'GET',
		});
	}

	// ==================== OFFER REQUEST ====================

	async createOfferRequest(
		data: CreateOfferRequestDto
	): Promise<ApiResponse<OfferRequest>> {
		return apiRequest<ApiResponse<OfferRequest>>({
			url: API_ENDPOINTS.SALES.OFFER_REQUEST,
			method: 'POST',
			data,
		});
	}

	async getAllOfferRequests(
		filters?: OfferRequestFilters
	): Promise<ApiResponse<OfferRequest[]>> {
		return apiRequest<ApiResponse<OfferRequest[]>>({
			url: API_ENDPOINTS.SALES.OFFER_REQUEST,
			method: 'GET',
			params: filters,
		});
	}

	async getOfferRequestById(
		id: number
	): Promise<ApiResponse<OfferRequest>> {
		const url = API_ENDPOINTS.SALES.OFFER_REQUEST_BY_ID(id);
		return apiRequest<ApiResponse<OfferRequest>>({
			url,
			method: 'GET',
		});
	}

	async assignOfferRequest(
		id: number,
		data: AssignOfferRequestDto
	): Promise<ApiResponse<OfferRequest>> {
		const url = API_ENDPOINTS.SALES.OFFER_REQUEST_ASSIGN(id);
		return apiRequest<ApiResponse<OfferRequest>>({
			url,
			method: 'PUT',
			data,
		});
	}

	async getAssignedOfferRequests(
		supportId: string,
		filters?: OfferRequestFilters
	): Promise<ApiResponse<OfferRequest[]>> {
		const url =
			API_ENDPOINTS.SALES.OFFER_REQUEST_ASSIGNED(supportId);
		return apiRequest<ApiResponse<OfferRequest[]>>({
			url,
			method: 'GET',
			params: filters,
		});
	}

	// ==================== SALES OFFER ====================

	async getAllOffers(
		filters?: SalesOfferFilters
	): Promise<ApiResponse<SalesOffer[]>> {
		return apiRequest<ApiResponse<SalesOffer[]>>({
			url: API_ENDPOINTS.SALES.OFFERS,
			method: 'GET',
			params: filters,
		});
	}

	async getMyOffers(
		filters?: SalesOfferFilters
	): Promise<ApiResponse<SalesOffer[]>> {
		return apiRequest<ApiResponse<SalesOffer[]>>({
			url: API_ENDPOINTS.SALES.MY_OFFERS,
			method: 'GET',
			params: filters,
		});
	}

	async getOfferById(id: number): Promise<ApiResponse<SalesOffer>> {
		const url = API_ENDPOINTS.SALES.OFFER_BY_ID(id);
		return apiRequest<ApiResponse<SalesOffer>>({
			url,
			method: 'GET',
		});
	}

	async createOffer(
		data: CreateSalesOfferDto
	): Promise<ApiResponse<SalesOffer>> {
		return apiRequest<ApiResponse<SalesOffer>>({
			url: API_ENDPOINTS.SALES.OFFERS,
			method: 'POST',
			data,
		});
	}

	// ==================== DEAL MANAGEMENT ====================

	async createDeal(data: CreateDealDto): Promise<ApiResponse<Deal>> {
		return apiRequest<ApiResponse<Deal>>({
			url: API_ENDPOINTS.SALES.DEALS,
			method: 'POST',
			data,
		});
	}

	async getAllDeals(filters?: DealFilters): Promise<ApiResponse<Deal[]>> {
		return apiRequest<ApiResponse<Deal[]>>({
			url: API_ENDPOINTS.SALES.DEALS,
			method: 'GET',
			params: filters,
		});
	}

	async getDealById(id: number): Promise<ApiResponse<Deal>> {
		const url = API_ENDPOINTS.SALES.DEAL_BY_ID(id);
		return apiRequest<ApiResponse<Deal>>({
			url,
			method: 'GET',
		});
	}

	async managerApproval(
		id: number,
		data: ManagerApprovalDto
	): Promise<ApiResponse<Deal>> {
		const url = API_ENDPOINTS.SALES.DEAL_MANAGER_APPROVAL(id);
		return apiRequest<ApiResponse<Deal>>({
			url,
			method: 'POST',
			data,
		});
	}

	async superAdminApproval(id: number): Promise<ApiResponse<Deal>> {
		const url = API_ENDPOINTS.SALES.DEAL_SUPERADMIN_APPROVAL(id);
		return apiRequest<ApiResponse<Deal>>({
			url,
			method: 'POST',
		});
	}

	async getPendingManagerApprovals(): Promise<ApiResponse<Deal[]>> {
		return apiRequest<ApiResponse<Deal[]>>({
			url: API_ENDPOINTS.SALES.PENDING_MANAGER_APPROVALS,
			method: 'GET',
		});
	}

	async getPendingSuperAdminApprovals(): Promise<ApiResponse<Deal[]>> {
		return apiRequest<ApiResponse<Deal[]>>({
			url: API_ENDPOINTS.SALES.PENDING_SUPERADMIN_APPROVALS,
			method: 'GET',
		});
	}

	// ==================== SALES REPORT ====================

	async createSalesReport(
		data: CreateSalesReportDto
	): Promise<ApiResponse<SalesReport>> {
		return apiRequest<ApiResponse<SalesReport>>({
			url: API_ENDPOINTS.SALES.SALES_REPORT,
			method: 'POST',
			data,
		});
	}

	async getAllSalesReports(
		filters?: SalesReportFilters
	): Promise<PaginatedResponse<SalesReport>> {
		return apiRequest<PaginatedResponse<SalesReport>>({
			url: API_ENDPOINTS.SALES.SALES_REPORT,
			method: 'GET',
			params: filters,
		});
	}

	async getSalesReportById(
		id: number
	): Promise<ApiResponse<SalesReport>> {
		const url = API_ENDPOINTS.SALES.SALES_REPORT_BY_ID(id);
		return apiRequest<ApiResponse<SalesReport>>({
			url,
			method: 'GET',
		});
	}

	async rateSalesReport(
		id: number,
		data: RateSalesReportDto
	): Promise<ApiResponse<SalesReport>> {
		const url = API_ENDPOINTS.SALES.SALES_REPORT_RATE(id);
		return apiRequest<ApiResponse<SalesReport>>({
			url,
			method: 'POST',
			data,
		});
	}

	// ==================== WEEKLY PLAN ====================

	async createWeeklyPlan(
		data: CreateWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		return apiRequest<ApiResponse<WeeklyPlan>>({
			url: API_ENDPOINTS.WEEKLY_PLANS.CREATE,
			method: 'POST',
			data,
		});
	}

	async getWeeklyPlans(
		filters?: WeeklyPlanFilters
	): Promise<PaginatedResponse<WeeklyPlan>> {
		return apiRequest<PaginatedResponse<WeeklyPlan>>({
			url: API_ENDPOINTS.WEEKLY_PLANS.LIST,
			method: 'GET',
			params: filters,
		});
	}

	async getWeeklyPlanById(id: number): Promise<ApiResponse<WeeklyPlan>> {
		const url = API_ENDPOINTS.WEEKLY_PLANS.GET_BY_ID(id);
		return apiRequest<ApiResponse<WeeklyPlan>>({
			url,
			method: 'GET',
		});
	}

	async submitWeeklyPlan(id: number): Promise<ApiResponse<WeeklyPlan>> {
		const url = API_ENDPOINTS.WEEKLY_PLANS.SUBMIT(id);
		return apiRequest<ApiResponse<WeeklyPlan>>({
			url,
			method: 'POST',
		});
	}

	async reviewWeeklyPlan(
		id: number,
		data: ReviewWeeklyPlanDto
	): Promise<ApiResponse<WeeklyPlan>> {
		const url = API_ENDPOINTS.WEEKLY_PLANS.REVIEW(id);
		return apiRequest<ApiResponse<WeeklyPlan>>({
			url,
			method: 'POST',
			data,
		});
	}
}

export const salesApiService = new SalesApiService();
export default salesApiService;
