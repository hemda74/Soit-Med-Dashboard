// Payment API Service

import type {
	CreatePaymentDTO,
	PaymentResponseDTO,
	StripePaymentDTO,
	PayPalPaymentDTO,
	CashPaymentDTO,
	BankTransferDTO,
	RefundDTO,
	ApiResponse,
} from '@/types/payment.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';
import { performanceMonitor } from '@/utils/performance';
import { getApiBaseUrl } from '@/utils/apiConfig';

class PaymentApiService {
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
				`${getApiBaseUrl()}${endpoint}`,
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

	// ==================== PAYMENT OPERATIONS ====================

	/**
	 * Create a new payment
	 */
	async createPayment(
		data: CreatePaymentDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.PAYMENT.BASE,
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Get payment by ID
	 */
	async getPayment(id: number): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.PAYMENT.BY_ID(id),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get customer's payments
	 */
	async getCustomerPayments(): Promise<
		ApiResponse<PaymentResponseDTO[]>
	> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO[]>>(
			API_ENDPOINTS.PAYMENT.CUSTOMER_MY_PAYMENTS,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Process Stripe payment
	 */
	async processStripePayment(
		paymentId: number,
		data: StripePaymentDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.PAYMENT.STRIPE(paymentId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Process PayPal payment
	 */
	async processPayPalPayment(
		paymentId: number,
		data: PayPalPaymentDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.PAYMENT.PAYPAL(paymentId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Record cash payment
	 */
	async recordCashPayment(
		paymentId: number,
		data: CashPaymentDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.PAYMENT.CASH(paymentId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Record bank transfer payment
	 */
	async recordBankTransfer(
		paymentId: number,
		data: BankTransferDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.PAYMENT.BANK_TRANSFER(paymentId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}

	/**
	 * Process refund (Finance Manager, SuperAdmin only)
	 */
	async processRefund(
		paymentId: number,
		data: RefundDTO
	): Promise<ApiResponse<PaymentResponseDTO>> {
		return this.makeRequest<ApiResponse<PaymentResponseDTO>>(
			API_ENDPOINTS.PAYMENT.REFUND(paymentId),
			{
				method: 'POST',
				body: JSON.stringify(data),
			}
		);
	}
}

export const paymentApi = new PaymentApiService();
