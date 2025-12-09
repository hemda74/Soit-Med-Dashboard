// React Query hooks for Payment Module

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '@/services/payment';
import { accountingApi } from '@/services/accounting';
import type {
	PaymentResponseDTO,
	CreatePaymentDTO,
	StripePaymentDTO,
	PayPalPaymentDTO,
	CashPaymentDTO,
	BankTransferDTO,
	ConfirmPaymentDTO,
	RejectPaymentDTO,
	PaymentFilters,
	FinancialReportDTO,
	PaymentMethodStatisticsDTO,
} from '@/types/payment.types';
import toast from 'react-hot-toast';
import { getTranslation } from '@/utils/translations';

// Query keys
export const paymentQueryKeys = {
	all: ['payment'] as const,
	payments: () => [...paymentQueryKeys.all, 'payments'] as const,
	payment: (id: number) => [...paymentQueryKeys.payments(), id] as const,
	customerPayments: () => [...paymentQueryKeys.payments(), 'customer'] as const,
	pendingPayments: () => [...paymentQueryKeys.payments(), 'pending'] as const,
	reports: () => [...paymentQueryKeys.all, 'reports'] as const,
	dailyReport: (date?: string) => [...paymentQueryKeys.reports(), 'daily', date] as const,
	monthlyReport: (year: number, month: number) => [...paymentQueryKeys.reports(), 'monthly', year, month] as const,
	yearlyReport: (year: number) => [...paymentQueryKeys.reports(), 'yearly', year] as const,
	statistics: () => [...paymentQueryKeys.all, 'statistics'] as const,
	paymentMethodStats: (from: string, to: string) => [...paymentQueryKeys.statistics(), 'methods', from, to] as const,
	outstandingPayments: () => [...paymentQueryKeys.payments(), 'outstanding'] as const,
	maintenancePayments: () => [...paymentQueryKeys.payments(), 'maintenance'] as const,
	sparePartsPayments: () => [...paymentQueryKeys.payments(), 'spare-parts'] as const,
};

// Get payment by ID
export const usePayment = (id: number) => {
	return useQuery({
		queryKey: paymentQueryKeys.payment(id),
		queryFn: async () => {
			const response = await paymentApi.getPayment(id);
			return response.data;
		},
		enabled: !!id,
	});
};

// Get customer payments
export const useCustomerPayments = () => {
	return useQuery({
		queryKey: paymentQueryKeys.customerPayments(),
		queryFn: async () => {
			const response = await paymentApi.getCustomerPayments();
			return response.data;
		},
	});
};

// Get pending payments (for Accounting)
export const usePendingPayments = () => {
	return useQuery({
		queryKey: paymentQueryKeys.pendingPayments(),
		queryFn: async () => {
			const response = await accountingApi.getPendingPayments();
			return response.data;
		},
		refetchInterval: 30000, // Refetch every 30 seconds
	});
};

// Get payments with filters
export const usePayments = (filters?: PaymentFilters) => {
	return useQuery({
		queryKey: [...paymentQueryKeys.payments(), filters],
		queryFn: async () => {
			const response = await accountingApi.getPayments(filters);
			return response.data;
		},
	});
};

// Get daily report
export const useDailyReport = (date?: string) => {
	return useQuery({
		queryKey: paymentQueryKeys.dailyReport(date),
		queryFn: async () => {
			const response = await accountingApi.getDailyReport(date);
			return response.data;
		},
	});
};

// Get monthly report
export const useMonthlyReport = (year: number, month: number) => {
	return useQuery({
		queryKey: paymentQueryKeys.monthlyReport(year, month),
		queryFn: async () => {
			const response = await accountingApi.getMonthlyReport(year, month);
			return response.data;
		},
		enabled: !!year && !!month,
	});
};

// Get yearly report
export const useYearlyReport = (year: number) => {
	return useQuery({
		queryKey: paymentQueryKeys.yearlyReport(year),
		queryFn: async () => {
			const response = await accountingApi.getYearlyReport(year);
			return response.data;
		},
		enabled: !!year,
	});
};

// Get payment method statistics
export const usePaymentMethodStatistics = (from: string, to: string) => {
	return useQuery({
		queryKey: paymentQueryKeys.paymentMethodStats(from, to),
		queryFn: async () => {
			const response = await accountingApi.getPaymentMethodStatistics(from, to);
			return response.data;
		},
		enabled: !!from && !!to,
	});
};

// Get outstanding payments
export const useOutstandingPayments = () => {
	return useQuery({
		queryKey: paymentQueryKeys.outstandingPayments(),
		queryFn: async () => {
			const response = await accountingApi.getOutstandingPayments();
			return response.data;
		},
	});
};

// Get maintenance payments
export const useMaintenancePayments = (filters?: PaymentFilters) => {
	return useQuery({
		queryKey: [...paymentQueryKeys.maintenancePayments(), filters],
		queryFn: async () => {
			const response = await accountingApi.getMaintenancePayments(filters);
			return response.data;
		},
	});
};

// Get spare parts payments
export const useSparePartsPayments = (filters?: PaymentFilters) => {
	return useQuery({
		queryKey: [...paymentQueryKeys.sparePartsPayments(), filters],
		queryFn: async () => {
			const response = await accountingApi.getSparePartsPayments(filters);
			return response.data;
		},
	});
};

// Create payment mutation
export const useCreatePayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePaymentDTO) => {
			const response = await paymentApi.createPayment(data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.customerPayments() });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.pendingPayments() });
			toast.success(getTranslation('paymentCreatedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to create payment');
		},
	});
};

// Process Stripe payment mutation
export const useProcessStripePayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ paymentId, data }: { paymentId: number; data: StripePaymentDTO }) => {
			const response = await paymentApi.processStripePayment(paymentId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payment(variables.paymentId) });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.customerPayments() });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.pendingPayments() });
			toast.success(getTranslation('paymentProcessedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to process payment');
		},
	});
};

// Process PayPal payment mutation
export const useProcessPayPalPayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ paymentId, data }: { paymentId: number; data: PayPalPaymentDTO }) => {
			const response = await paymentApi.processPayPalPayment(paymentId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payment(variables.paymentId) });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.customerPayments() });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.pendingPayments() });
			toast.success(getTranslation('paymentProcessedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to process payment');
		},
	});
};

// Record cash payment mutation
export const useRecordCashPayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ paymentId, data }: { paymentId: number; data: CashPaymentDTO }) => {
			const response = await paymentApi.recordCashPayment(paymentId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payment(variables.paymentId) });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.customerPayments() });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.pendingPayments() });
			toast.success(getTranslation('cashPaymentRecordedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to record cash payment');
		},
	});
};

// Record bank transfer mutation
export const useRecordBankTransfer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ paymentId, data }: { paymentId: number; data: BankTransferDTO }) => {
			const response = await paymentApi.recordBankTransfer(paymentId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payment(variables.paymentId) });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.customerPayments() });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.pendingPayments() });
			toast.success(getTranslation('bankTransferRecordedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to record bank transfer');
		},
	});
};

// Confirm payment mutation
export const useConfirmPayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ paymentId, data }: { paymentId: number; data: ConfirmPaymentDTO }) => {
			const response = await accountingApi.confirmPayment(paymentId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payment(variables.paymentId) });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.pendingPayments() });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payments() });
			toast.success(getTranslation('paymentConfirmedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to confirm payment');
		},
	});
};

// Reject payment mutation
export const useRejectPayment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ paymentId, data }: { paymentId: number; data: RejectPaymentDTO }) => {
			const response = await accountingApi.rejectPayment(paymentId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payment(variables.paymentId) });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.pendingPayments() });
			queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payments() });
			toast.success(getTranslation('paymentRejected'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to reject payment');
		},
	});
};

