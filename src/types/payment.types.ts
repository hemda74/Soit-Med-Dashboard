// Payment Module TypeScript Types

// Enums
export enum PaymentMethod {
	Stripe = 'Stripe',
	PayPal = 'PayPal',
	LocalGateway = 'LocalGateway',
	Cash = 'Cash',
	BankTransfer = 'BankTransfer',
}

export enum PaymentStatus {
	Pending = 'Pending',
	Processing = 'Processing',
	Completed = 'Completed',
	Failed = 'Failed',
	Refunded = 'Refunded',
}

// Payment Types
export interface CreatePaymentDTO {
	maintenanceRequestId?: number;
	sparePartRequestId?: number;
	amount: number;
	paymentMethod: PaymentMethod;
}

export interface PaymentResponseDTO {
	id: number;
	maintenanceRequestId?: number;
	sparePartRequestId?: number;
	customerId: string;
	customerName: string;
	amount: number;
	paymentMethod: PaymentMethod;
	paymentMethodName: string;
	status: PaymentStatus;
	statusName: string;
	transactionId?: string;
	paymentReference?: string;
	processedByAccountantId?: string;
	processedByAccountantName?: string;
	processedAt?: string;
	accountingNotes?: string;
	createdAt: string;
	paidAt?: string;
	confirmedAt?: string;
}

// Payment Processing Types
export interface ProcessPaymentDTO {
	paymentReference?: string;
}

export interface CashPaymentDTO extends ProcessPaymentDTO {
	receiptNumber?: string;
}

export interface BankTransferDTO extends ProcessPaymentDTO {
	bankName: string;
	bankReference?: string;
	accountNumber?: string;
}

export interface StripePaymentDTO {
	token: string;
	description?: string;
}

export interface PayPalPaymentDTO {
	paymentId: string;
	description?: string;
}

export interface LocalGatewayPaymentDTO {
	gatewayName: string;
	paymentToken: string;
	description?: string;
}

// Accounting Types
export interface ConfirmPaymentDTO {
	notes?: string;
}

export interface RejectPaymentDTO {
	reason: string;
}

export interface RefundDTO {
	amount?: number; // If null, full refund
	reason?: string;
}

// Financial Reports Types
export interface FinancialReportDTO {
	reportDate: string;
	totalRevenue: number;
	totalPayments: number;
	outstandingPayments: number;
	totalTransactions: number;
	revenueByPaymentMethod: Record<string, number>;
	countByPaymentMethod: Record<string, number>;
}

export interface PaymentMethodStatisticsDTO {
	paymentMethod: PaymentMethod;
	paymentMethodName: string;
	count: number;
	totalAmount: number;
	averageAmount: number;
	successCount: number;
	failedCount: number;
	successRate: number;
}

// Payment Filters
export interface PaymentFilters {
	status?: PaymentStatus;
	paymentMethod?: PaymentMethod;
	customerId?: string;
	fromDate?: string;
	toDate?: string;
	maintenanceRequestId?: number;
	sparePartRequestId?: number;
	page?: number;
	pageSize?: number;
}

// API Response Types
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

export interface PaginatedApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}
