// Accounting Store - Zustand store for accounting module state management

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { accountingApi } from '@/services/accounting/accountingApi';
import type {
	PaymentResponseDTO,
	ConfirmPaymentDTO,
	RejectPaymentDTO,
	FinancialReportDTO,
	PaymentMethodStatisticsDTO,
	PaymentFilters,
} from '@/types/payment.types';
import toast from 'react-hot-toast';

// ==================== INTERFACES ====================

export interface AccountingState {
	// Payments state
	pendingPayments: PaymentResponseDTO[];
	payments: PaymentResponseDTO[];
	selectedPayment: PaymentResponseDTO | null;
	outstandingPayments: PaymentResponseDTO[];
	maintenancePayments: PaymentResponseDTO[];
	sparePartsPayments: PaymentResponseDTO[];
	paymentsLoading: boolean;
	paymentsError: string | null;

	// Reports state
	dailyReport: FinancialReportDTO | null;
	monthlyReport: FinancialReportDTO | null;
	yearlyReport: FinancialReportDTO | null;
	reportsLoading: boolean;
	reportsError: string | null;

	// Statistics state
	paymentMethodStatistics: PaymentMethodStatisticsDTO[];
	statisticsLoading: boolean;
	statisticsError: string | null;

	// Filters state
	filters: PaymentFilters;

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
	selectedTab: 'payments' | 'reports' | 'statistics';
	showPaymentModal: boolean;
	showConfirmModal: boolean;
	showRejectModal: boolean;
}

export interface AccountingActions {
	// Payment management actions
	getPendingPayments: () => Promise<void>;
	getPayments: (filters?: PaymentFilters) => Promise<void>;
	getPaymentDetails: (id: number) => Promise<void>;
	confirmPayment: (
		paymentId: number,
		data: ConfirmPaymentDTO
	) => Promise<void>;
	rejectPayment: (
		paymentId: number,
		data: RejectPaymentDTO
	) => Promise<void>;
	getOutstandingPayments: () => Promise<void>;
	getMaintenancePayments: (filters?: PaymentFilters) => Promise<void>;
	getSparePartsPayments: (filters?: PaymentFilters) => Promise<void>;

	// Reports actions
	getDailyReport: (date?: string) => Promise<void>;
	getMonthlyReport: (year: number, month: number) => Promise<void>;
	getYearlyReport: (year: number) => Promise<void>;

	// Statistics actions
	getPaymentMethodStatistics: (
		from: string,
		to: string
	) => Promise<void>;

	// UI actions
	setSelectedPayment: (payment: PaymentResponseDTO | null) => void;
	setSelectedTab: (
		tab: 'payments' | 'reports' | 'statistics'
	) => void;
	setShowPaymentModal: (show: boolean) => void;
	setShowConfirmModal: (show: boolean) => void;
	setShowRejectModal: (show: boolean) => void;
	setFilters: (filters: Partial<PaymentFilters>) => void;
	setPagination: (pagination: Partial<AccountingState['pagination']>) => void;

	// Error handling
	clearError: (
		type: 'payments' | 'reports' | 'statistics'
	) => void;
	clearAllErrors: () => void;
}

export type AccountingStore = AccountingState & AccountingActions;

// ==================== INITIAL STATE ====================

const initialState: AccountingState = {
	pendingPayments: [],
	payments: [],
	selectedPayment: null,
	outstandingPayments: [],
	maintenancePayments: [],
	sparePartsPayments: [],
	paymentsLoading: false,
	paymentsError: null,
	dailyReport: null,
	monthlyReport: null,
	yearlyReport: null,
	reportsLoading: false,
	reportsError: null,
	paymentMethodStatistics: [],
	statisticsLoading: false,
	statisticsError: null,
	filters: {},
	pagination: {
		page: 1,
		pageSize: 20,
		totalCount: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	},
	selectedTab: 'payments',
	showPaymentModal: false,
	showConfirmModal: false,
	showRejectModal: false,
};

// ==================== STORE IMPLEMENTATION ====================

export const useAccountingStore = create<AccountingStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				...initialState,

				// ==================== PAYMENT MANAGEMENT ACTIONS ====================

				getPendingPayments: async () => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response =
							await accountingApi.getPendingPayments();
						set({
							pendingPayments: response.data || [],
							payments: response.data || [],
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							pendingPayments: [],
							paymentsError:
								error.message ||
								'Failed to fetch pending payments',
							paymentsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch pending payments'
							);
						}
					}
				},

				getPayments: async (filters = {}) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response = await accountingApi.getPayments(
							filters
						);
						set({
							payments: response.data || [],
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							payments: [],
							paymentsError:
								error.message || 'Failed to fetch payments',
							paymentsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message || 'Failed to fetch payments'
							);
						}
					}
				},

				getPaymentDetails: async (id) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response =
							await accountingApi.getPaymentDetails(id);
						set({
							selectedPayment: response.data,
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							paymentsError:
								error.message ||
								'Failed to fetch payment details',
							paymentsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch payment details'
						);
					}
				},

				confirmPayment: async (paymentId, data) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response = await accountingApi.confirmPayment(
							paymentId,
							data
						);
						set((state) => ({
							pendingPayments: state.pendingPayments.filter(
								(p) => p.id !== paymentId
							),
							payments: state.payments.map((p) =>
								p.id === paymentId ? response.data : p
							),
							selectedPayment:
								state.selectedPayment?.id === paymentId
									? response.data
									: state.selectedPayment,
							paymentsLoading: false,
						}));
						toast.success('Payment confirmed successfully');
					} catch (error: any) {
						set({
							paymentsError:
								error.message || 'Failed to confirm payment',
							paymentsLoading: false,
						});
						toast.error(
							error.message || 'Failed to confirm payment'
						);
					}
				},

				rejectPayment: async (paymentId, data) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response = await accountingApi.rejectPayment(
							paymentId,
							data
						);
						set((state) => ({
							pendingPayments: state.pendingPayments.filter(
								(p) => p.id !== paymentId
							),
							payments: state.payments.map((p) =>
								p.id === paymentId ? response.data : p
							),
							selectedPayment:
								state.selectedPayment?.id === paymentId
									? response.data
									: state.selectedPayment,
							paymentsLoading: false,
						}));
						toast.success('Payment rejected successfully');
					} catch (error: any) {
						set({
							paymentsError:
								error.message || 'Failed to reject payment',
							paymentsLoading: false,
						});
						toast.error(
							error.message || 'Failed to reject payment'
						);
					}
				},

				getOutstandingPayments: async () => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response =
							await accountingApi.getOutstandingPayments();
						set({
							outstandingPayments: response.data || [],
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							outstandingPayments: [],
							paymentsError:
								error.message ||
								'Failed to fetch outstanding payments',
							paymentsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch outstanding payments'
							);
						}
					}
				},

				getMaintenancePayments: async (filters = {}) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response =
							await accountingApi.getMaintenancePayments(
								filters
							);
						set({
							maintenancePayments: response.data || [],
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							maintenancePayments: [],
							paymentsError:
								error.message ||
								'Failed to fetch maintenance payments',
							paymentsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch maintenance payments'
							);
						}
					}
				},

				getSparePartsPayments: async (filters = {}) => {
					set({
						paymentsLoading: true,
						paymentsError: null,
					});
					try {
						const response =
							await accountingApi.getSparePartsPayments(
								filters
							);
						set({
							sparePartsPayments: response.data || [],
							paymentsLoading: false,
						});
					} catch (error: any) {
						set({
							sparePartsPayments: [],
							paymentsError:
								error.message ||
								'Failed to fetch spare parts payments',
							paymentsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch spare parts payments'
							);
						}
					}
				},

				// ==================== REPORTS ACTIONS ====================

				getDailyReport: async (date) => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						const response = await accountingApi.getDailyReport(
							date
						);
						set({
							dailyReport: response.data,
							reportsLoading: false,
						});
					} catch (error: any) {
						set({
							reportsError:
								error.message ||
								'Failed to fetch daily report',
							reportsLoading: false,
						});
						toast.error(
							error.message || 'Failed to fetch daily report'
						);
					}
				},

				getMonthlyReport: async (year, month) => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						const response =
							await accountingApi.getMonthlyReport(year, month);
						set({
							monthlyReport: response.data,
							reportsLoading: false,
						});
					} catch (error: any) {
						set({
							reportsError:
								error.message ||
								'Failed to fetch monthly report',
							reportsLoading: false,
						});
						toast.error(
							error.message || 'Failed to fetch monthly report'
						);
					}
				},

				getYearlyReport: async (year) => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						const response =
							await accountingApi.getYearlyReport(year);
						set({
							yearlyReport: response.data,
							reportsLoading: false,
						});
					} catch (error: any) {
						set({
							reportsError:
								error.message ||
								'Failed to fetch yearly report',
							reportsLoading: false,
						});
						toast.error(
							error.message || 'Failed to fetch yearly report'
						);
					}
				},

				// ==================== STATISTICS ACTIONS ====================

				getPaymentMethodStatistics: async (from, to) => {
					set({
						statisticsLoading: true,
						statisticsError: null,
					});
					try {
						const response =
							await accountingApi.getPaymentMethodStatistics(
								from,
								to
							);
						set({
							paymentMethodStatistics: response.data || [],
							statisticsLoading: false,
						});
					} catch (error: any) {
						set({
							paymentMethodStatistics: [],
							statisticsError:
								error.message ||
								'Failed to fetch payment method statistics',
							statisticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch payment method statistics'
						);
					}
				},

				// ==================== UI ACTIONS ====================

				setSelectedPayment: (payment) => {
					set({ selectedPayment: payment });
				},

				setSelectedTab: (tab) => {
					set({ selectedTab: tab });
				},

				setShowPaymentModal: (show) => {
					set({ showPaymentModal: show });
				},

				setShowConfirmModal: (show) => {
					set({ showConfirmModal: show });
				},

				setShowRejectModal: (show) => {
					set({ showRejectModal: show });
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

				clearError: (type) => {
					set({
						[`${type}Error`]: null,
					} as any);
				},

				clearAllErrors: () => {
					set({
						paymentsError: null,
						reportsError: null,
						statisticsError: null,
					});
				},
			}),
			{
				name: 'accounting-storage',
				partialize: (state) => ({
					selectedTab: state.selectedTab,
					filters: state.filters,
					pagination: state.pagination,
				}),
			}
		)
	)
);

