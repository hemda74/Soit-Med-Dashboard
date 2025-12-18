// Payment Store - Zustand store for payment module state management

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { paymentApi } from '@/services/payment/paymentApi';
import type {
	PaymentResponseDTO,
	CreatePaymentDTO,
	StripePaymentDTO,
	PayPalPaymentDTO,
	CashPaymentDTO,
	BankTransferDTO,
	RefundDTO,
	PaymentMethod,
	PaymentStatus,
} from '@/types/payment.types';
import toast from 'react-hot-toast';

// ==================== INTERFACES ====================

export interface PaymentState {
	// Payment state
	payments: PaymentResponseDTO[];
	selectedPayment: PaymentResponseDTO | null;
	customerPayments: PaymentResponseDTO[];
	paymentsLoading: boolean;
	paymentsError: string | null;

	// Payment processing state
	processingPayment: boolean;
	processingError: string | null;

	// Filters state
	filters: {
		status?: PaymentStatus;
		paymentMethod?: PaymentMethod;
		customerId?: string;
		fromDate?: string;
		toDate?: string;
	};

	// Pagination state
	pagination: {
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};

	// UI state
	showPaymentModal: boolean;
	showRefundModal: boolean;
}

export interface PaymentActions {
	// Payment actions
	createPayment: (data: CreatePaymentDTO) => Promise<void>;
	getPayment: (id: number) => Promise<void>;
	getCustomerPayments: () => Promise<void>;

	// Payment processing actions
	processStripePayment: (
		paymentId: number,
		data: StripePaymentDTO
	) => Promise<void>;
	processPayPalPayment: (
		paymentId: number,
		data: PayPalPaymentDTO
	) => Promise<void>;
	recordCashPayment: (
		paymentId: number,
		data: CashPaymentDTO
	) => Promise<void>;
	recordBankTransfer: (
		paymentId: number,
		data: BankTransferDTO
	) => Promise<void>;
	processRefund: (paymentId: number, data: RefundDTO) => Promise<void>;

	// UI actions
	setSelectedPayment: (payment: PaymentResponseDTO | null) => void;
	setShowPaymentModal: (show: boolean) => void;
	setShowRefundModal: (show: boolean) => void;
	setFilters: (filters: Partial<PaymentState['filters']>) => void;
	setPagination: (pagination: Partial<PaymentState['pagination']>) => void;

	// Error handling
	clearError: () => void;
	clearProcessingError: () => void;
}

export type PaymentStore = PaymentState & PaymentActions;

// ==================== INITIAL STATE ====================

const initialState: PaymentState = {
	payments: [],
	selectedPayment: null,
	customerPayments: [],
	paymentsLoading: false,
	paymentsError: null,
	processingPayment: false,
	processingError: null,
	filters: {},
	pagination: {
		page: 1,
		pageSize: 20,
		totalCount: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	},
	showPaymentModal: false,
	showRefundModal: false,
};

// ==================== STORE IMPLEMENTATION ====================

export const usePaymentStore = create<PaymentStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				...initialState,

				// ==================== PAYMENT ACTIONS ====================

				createPayment: async (data) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response = await paymentApi.createPayment(
							data
						);
						set((state) => ({
							payments: [response.data, ...state.payments],
							customerPayments: [
								response.data,
								...state.customerPayments,
							],
							paymentsLoading: false,
						}));
						toast.success('Payment created successfully');
					} catch (error: any) {
						set({
							paymentsError:
								error.message || 'Failed to create payment',
							paymentsLoading: false,
						});
						toast.error(
							error.message || 'Failed to create payment'
						);
					}
				},

				getPayment: async (id) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response = await paymentApi.getPayment(id);
						set({
							selectedPayment: response.data,
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							paymentsError:
								error.message || 'Failed to fetch payment',
							paymentsLoading: false,
						});
						toast.error(
							error.message || 'Failed to fetch payment'
						);
					}
				},

				getCustomerPayments: async () => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response =
							await paymentApi.getCustomerPayments();
						set({
							customerPayments: response.data || [],
							payments: response.data || [],
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							customerPayments: [],
							paymentsError:
								error.message ||
								'Failed to fetch customer payments',
							paymentsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch customer payments'
							);
						}
					}
				},

				// ==================== PAYMENT PROCESSING ACTIONS ====================

				processStripePayment: async (paymentId, data) => {
					set({
						processingPayment: true,
						processingError: null,
					});
					try {
						const response =
							await paymentApi.processStripePayment(
								paymentId,
								data
							);
						set((state) => ({
							payments: state.payments.map((p) =>
								p.id === paymentId ? response.data : p
							),
							selectedPayment:
								state.selectedPayment?.id === paymentId
									? response.data
									: state.selectedPayment,
							processingPayment: false,
						}));
						toast.success('Stripe payment processed successfully');
					} catch (error: any) {
						set({
							processingError:
								error.message ||
								'Failed to process Stripe payment',
							processingPayment: false,
						});
						toast.error(
							error.message ||
								'Failed to process Stripe payment'
						);
					}
				},

				processPayPalPayment: async (paymentId, data) => {
					set({
						processingPayment: true,
						processingError: null,
					});
					try {
						const response =
							await paymentApi.processPayPalPayment(
								paymentId,
								data
							);
						set((state) => ({
							payments: state.payments.map((p) =>
								p.id === paymentId ? response.data : p
							),
							selectedPayment:
								state.selectedPayment?.id === paymentId
									? response.data
									: state.selectedPayment,
							processingPayment: false,
						}));
						toast.success('PayPal payment processed successfully');
					} catch (error: any) {
						set({
							processingError:
								error.message ||
								'Failed to process PayPal payment',
							processingPayment: false,
						});
						toast.error(
							error.message ||
								'Failed to process PayPal payment'
						);
					}
				},

				recordCashPayment: async (paymentId, data) => {
					set({
						processingPayment: true,
						processingError: null,
					});
					try {
						const response =
							await paymentApi.recordCashPayment(
								paymentId,
								data
							);
						set((state) => ({
							payments: state.payments.map((p) =>
								p.id === paymentId ? response.data : p
							),
							selectedPayment:
								state.selectedPayment?.id === paymentId
									? response.data
									: state.selectedPayment,
							processingPayment: false,
						}));
						toast.success('Cash payment recorded successfully');
					} catch (error: any) {
						set({
							processingError:
								error.message ||
								'Failed to record cash payment',
							processingPayment: false,
						});
						toast.error(
							error.message || 'Failed to record cash payment'
						);
					}
				},

				recordBankTransfer: async (paymentId, data) => {
					set({
						processingPayment: true,
						processingError: null,
					});
					try {
						const response =
							await paymentApi.recordBankTransfer(
								paymentId,
								data
							);
						set((state) => ({
							payments: state.payments.map((p) =>
								p.id === paymentId ? response.data : p
							),
							selectedPayment:
								state.selectedPayment?.id === paymentId
									? response.data
									: state.selectedPayment,
							processingPayment: false,
						}));
						toast.success(
							'Bank transfer recorded successfully'
						);
					} catch (error: any) {
						set({
							processingError:
								error.message ||
								'Failed to record bank transfer',
							processingPayment: false,
						});
						toast.error(
							error.message ||
								'Failed to record bank transfer'
						);
					}
				},

				processRefund: async (paymentId, data) => {
					set({
						processingPayment: true,
						processingError: null,
					});
					try {
						const response = await paymentApi.processRefund(
							paymentId,
							data
						);
						set((state) => ({
							payments: state.payments.map((p) =>
								p.id === paymentId ? response.data : p
							),
							selectedPayment:
								state.selectedPayment?.id === paymentId
									? response.data
									: state.selectedPayment,
							processingPayment: false,
						}));
						toast.success('Refund processed successfully');
					} catch (error: any) {
						set({
							processingError:
								error.message || 'Failed to process refund',
							processingPayment: false,
						});
						toast.error(
							error.message || 'Failed to process refund'
						);
					}
				},

				// ==================== UI ACTIONS ====================

				setSelectedPayment: (payment) => {
					set({ selectedPayment: payment });
				},

				setShowPaymentModal: (show) => {
					set({ showPaymentModal: show });
				},

				setShowRefundModal: (show) => {
					set({ showRefundModal: show });
				},

				setFilters: (filters) => {
					set((state) => ({
						filters: {
							...state.filters,
							...filters,
						},
					}));
				},

				setPagination: (pagination) => {
					set((state) => ({
						pagination: {
							...state.pagination,
							...pagination,
						},
					}));
				},

				// ==================== ERROR HANDLING ====================

				clearError: () => {
					set({ paymentsError: null });
				},

				clearProcessingError: () => {
					set({ processingError: null });
				},
			}),
			{
				name: 'payment-storage',
				partialize: (state) => ({
					filters: state.filters,
					pagination: state.pagination,
				}),
			}
		)
	)
);

