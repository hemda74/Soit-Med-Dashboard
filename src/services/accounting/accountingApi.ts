// Accounting API Service

import type {
	PaymentResponseDTO,
	ConfirmPaymentDTO,
	RejectPaymentDTO,
	FinancialReportDTO,
	PaymentMethodStatisticsDTO,
	PaymentFilters,
	ApiResponse,
} from '@/types/payment.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';
import { performanceMonitor } from '@/utils/performance';

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117';

class AccountingApiService {
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

			const response = await fetch(
				`${API_BASE_URL}${endpoint}`,
				{
					...options,
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type':
							'application/json',
						...options.headers,
					},
				}
			);

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({}));
				const error: any = new Error(
					errorData.message ||
						`API request failed with status ${response.status}`
				);
				error.status = response.status;
				error.response = errorData;
				throw error;
			}

			return response.json();
		});
	}

	// ==================== PAYMENT MANAGEMENT ====================

	/**
	 * Get pending payments
	 */
	async getPendingPayments(): Promise<ApiResponse<PaymentResponseDTO[]>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO[]>>(
			API_ENDPOINTS.ACCOUNTING.PAYMENTS_PENDING,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get payments with filters
	 */
	async getPayments(
		filters?: PaymentFilters
	): Promise<ApiResponse<PaymentResponseDTO[]>> {
		const queryParams = new URLSearchParams();

		if (filters) {
			if (filters.status)
				queryParams.append('status', filters.status);
			if (filters.paymentMethod)
				queryParams.append(
					'paymentMethod',
					filters.paymentMethod
				);
			if (filters.customerId)
				queryParams.append(
					'customerId',
					filters.customerId
				);
			if (filters.fromDate)
				queryParams.append(
					'fromDate',
					filters.fromDate
				);
			if (filters.toDate)
				queryParams.append('toDate', filters.toDate);
			if (filters.maintenanceRequestId)
				queryParams.append(
					'maintenanceRequestId',
					filters.maintenanceRequestId.toString()
				);
			if (filters.sparePartRequestId)
				queryParams.append(
					'sparePartRequestId',
					filters.sparePartRequestId.toString()
				);
			if (filters.page)
				queryParams.append(
					'page',
					filters.page.toString()
				);
			if (filters.pageSize)
				queryParams.append(
					'pageSize',
					filters.pageSize.toString()
				);
		}

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.ACCOUNTING.PAYMENTS}?${queryString}`
			: API_ENDPOINTS.ACCOUNTING.PAYMENTS;

		return this.makeRequest<ApiResponse<PaymentResponseDTO[]>>(
			endpoint,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get payment details by ID
	 */
	async getPaymentDetails(
		id: number
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.ACCOUNTING.PAYMENT_BY_ID(id),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Confirm payment
	 */
	async confirmPayment(
		paymentId: number,
		data: ConfirmPaymentDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.ACCOUNTING.CONFIRM_PAYMENT(paymentId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Reject payment
	 */
	async rejectPayment(
		paymentId: number,
		data: RejectPaymentDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.ACCOUNTING.REJECT_PAYMENT(paymentId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	// ==================== FINANCIAL REPORTS ====================

	/**
	 * Get daily financial report
	 */
	async getDailyReport(
		date?: string
	): Promise<ApiResponse<FinancialReportDTO>> {
		const queryParams = new URLSearchParams();
		if (date) queryParams.append('date', date);

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.ACCOUNTING.REPORTS_DAILY}?${queryString}`
			: API_ENDPOINTS.ACCOUNTING.REPORTS_DAILY;

		return this.makeRequest<ApiResponse<FinancialReportDTO>>(
			endpoint,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get monthly financial report
	 */
	async getMonthlyReport(
		year: number,
		month: number
	): Promise<ApiResponse<FinancialReportDTO>> {
		const queryParams = new URLSearchParams();
		queryParams.append('year', year.toString());
		queryParams.append('month', month.toString());

		const endpoint = `${
			API_ENDPOINTS.ACCOUNTING.REPORTS_MONTHLY
		}?${queryParams.toString()}`;

		return this.makeRequest<ApiResponse<FinancialReportDTO>>(
			endpoint,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get yearly financial report
	 */
	async getYearlyReport(
		year: number
	): Promise<ApiResponse<FinancialReportDTO>> {
		const queryParams = new URLSearchParams();
		queryParams.append('year', year.toString());

		const endpoint = `${
			API_ENDPOINTS.ACCOUNTING.REPORTS_YEARLY
		}?${queryParams.toString()}`;

		return this.makeRequest<ApiResponse<FinancialReportDTO>>(
			endpoint,
			{
				method: 'GET',
			}
		);
	}

	// ==================== STATISTICS ====================

	/**
	 * Get payment method statistics
	 */
	async getPaymentMethodStatistics(
		from: string,
		to: string
	): Promise<ApiResponse<PaymentMethodStatisticsDTO[]>> {
		const queryParams = new URLSearchParams();
		queryParams.append('from', from);
		queryParams.append('to', to);

		const endpoint = `${
			API_ENDPOINTS.ACCOUNTING.STATISTICS_PAYMENT_METHODS
		}?${queryParams.toString()}`;

		return this.makeRequest<
			ApiResponse<PaymentMethodStatisticsDTO[]>
		>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * Get outstanding payments
	 */
	async getOutstandingPayments(): Promise<
		ApiResponse<PaymentResponseDTO[]>
	> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO[]>>(
			API_ENDPOINTS.ACCOUNTING.STATISTICS_OUTSTANDING,
			{
				method: 'GET',
			}
		);
	}

	// ==================== MAINTENANCE PAYMENTS ====================

	/**
	 * Get maintenance payments
	 */
	async getMaintenancePayments(
		filters?: PaymentFilters
	): Promise<ApiResponse<PaymentResponseDTO[]>> {
		const queryParams = new URLSearchParams();

		if (filters) {
			if (filters.status)
				queryParams.append('status', filters.status);
			if (filters.paymentMethod)
				queryParams.append(
					'paymentMethod',
					filters.paymentMethod
				);
			if (filters.fromDate)
				queryParams.append(
					'fromDate',
					filters.fromDate
				);
			if (filters.toDate)
				queryParams.append('toDate', filters.toDate);
			if (filters.page)
				queryParams.append(
					'page',
					filters.page.toString()
				);
			if (filters.pageSize)
				queryParams.append(
					'pageSize',
					filters.pageSize.toString()
				);
		}

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.ACCOUNTING.MAINTENANCE_PAYMENTS}?${queryString}`
			: API_ENDPOINTS.ACCOUNTING.MAINTENANCE_PAYMENTS;

		return this.makeRequest<ApiResponse<PaymentResponseDTO[]>>(
			endpoint,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get spare parts payments
	 */
	async getSparePartsPayments(
		filters?: PaymentFilters
	): Promise<ApiResponse<PaymentResponseDTO[]>> {
		const queryParams = new URLSearchParams();

		if (filters) {
			if (filters.status)
				queryParams.append('status', filters.status);
			if (filters.paymentMethod)
				queryParams.append(
					'paymentMethod',
					filters.paymentMethod
				);
			if (filters.fromDate)
				queryParams.append(
					'fromDate',
					filters.fromDate
				);
			if (filters.toDate)
				queryParams.append('toDate', filters.toDate);
			if (filters.page)
				queryParams.append(
					'page',
					filters.page.toString()
				);
			if (filters.pageSize)
				queryParams.append(
					'pageSize',
					filters.pageSize.toString()
				);
		}

		const queryString = queryParams.toString();
		const endpoint = queryString
			? `${API_ENDPOINTS.ACCOUNTING.SPARE_PARTS_PAYMENTS}?${queryString}`
			: API_ENDPOINTS.ACCOUNTING.SPARE_PARTS_PAYMENTS;

		return this.makeRequest<ApiResponse<PaymentResponseDTO[]>>(
			endpoint,
			{
				method: 'GET',
			}
		);
	}
}

export const accountingApi = new AccountingApiService();
