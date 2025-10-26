/**
 * Sales API Types
 * Type definitions for all sales module API requests and responses
 */

export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;
}

export interface PaginatedResponse<T> {
	success: boolean;
	data: {
		items: T[];
		pagination: PaginationInfo;
	};
	message: string;
	timestamp: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message: string;
	timestamp: string;
}

export interface ApiErrorResponse {
	success: false;
	message: string;
	errors?: string[];
	timestamp: string;
}

// ==================== CLIENT TYPES ====================

export interface Client {
	id: number;
	name: string;
	type: string;
	specialization: string;
	status: 'Active' | 'Inactive';
	priority?: 'High' | 'Medium' | 'Low';
	location: string;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	governorate?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface ClientSearchParams {
	searchTerm?: string;
	status?: string;
	priority?: string;
	page?: number;
	pageSize?: number;
}

export interface CreateClientDto {
	name: string;
	type: string;
	specialization: string;
	location: string;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	governorate?: string;
	status: 'Active' | 'Inactive';
	priority?: 'High' | 'Medium' | 'Low';
}

export interface ClientProfile {
	client: Client;
	history: {
		tasks: TaskProgress[];
		offers: SalesOffer[];
		deals: Deal[];
		visits: any[];
	};
	statistics: {
		totalTasks: number;
		totalOffers: number;
		totalDeals: number;
		totalValue: number;
	};
}

// ==================== TASK PROGRESS TYPES ====================

export interface TaskProgress {
	id: number;
	taskId: number;
	clientId: number;
	progressDate: string;
	progressType: 'Visit' | 'Call' | 'Email' | 'Meeting' | 'Other';
	description: string;
	visitResult?: 'Interested' | 'NotInterested' | 'FollowUp' | 'Converted';
	nextStep?:
		| 'NeedsOffer'
		| 'NeedsFollowUp'
		| 'NeedsApproval'
		| 'Completed';
	nextFollowUpDate?: string;
	status: 'Completed' | 'InProgress' | 'Cancelled';
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateTaskProgressDto {
	taskId: number;
	clientId?: number;
	progressDate: string;
	progressType: 'Visit' | 'Call' | 'Email' | 'Meeting' | 'Other';
	description: string;
	visitResult?: 'Interested' | 'NotInterested' | 'FollowUp' | 'Converted';
	nextStep?:
		| 'NeedsOffer'
		| 'NeedsFollowUp'
		| 'NeedsApproval'
		| 'Completed';
	nextFollowUpDate?: string;
}

export interface CreateTaskProgressWithOfferRequestDto
	extends CreateTaskProgressDto {
	requestedProducts: string;
	specialNotes?: string;
}

export interface TaskProgressFilters {
	startDate?: string;
	endDate?: string;
}

// ==================== OFFER REQUEST TYPES ====================

export interface OfferRequest {
	id: number;
	clientId: number;
	requestedBy: string;
	requestedProducts: string;
	status: 'Requested' | 'InProgress' | 'Completed' | 'Cancelled';
	assignedTo?: string;
	specialNotes?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface CreateOfferRequestDto {
	clientId: number;
	requestedProducts: string;
	specialNotes?: string;
}

export interface AssignOfferRequestDto {
	assignedTo: string;
}

export interface OfferRequestFilters {
	status?: string;
	requestedBy?: string;
}

// ==================== SALES OFFER TYPES ====================

export interface OfferEquipment {
	id: number;
	name: string;
	description?: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

export interface InstallmentPlan {
	id: number;
	installmentNumber: number;
	amount: number;
	dueDate: string;
	status?: 'Pending' | 'Paid' | 'Overdue';
}

export interface OfferTerms {
	id: number;
	paymentCondition?: string;
	deliveryCondition?: string;
	installationCondition?: string;
	warrantyCondition?: string;
	maintenanceCondition?: string;
	validityPeriod?: number; // in days
	notes?: string;
}

export interface SalesOffer {
	id: number;
	offerRequestId: number;
	clientId: number;
	clientName?: string;
	assignedTo?: string;
	createdBy?: string;
	products: string;
	totalAmount: number;
	paymentTerms?: string;
	deliveryTerms?: string;
	validUntil?: string;
	status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
	notes?: string;

	// Enhanced fields for detailed offers
	equipment?: OfferEquipment[];
	terms?: OfferTerms;
	installmentPlans?: InstallmentPlan[];

	createdAt?: string;
	updatedAt?: string;
}

export interface CreateSalesOfferDto {
	offerRequestId: number;
	clientId: number;
	assignedTo: string;
	products: string;
	totalAmount: number;
	paymentTerms?: string;
	deliveryTerms?: string;
	validUntil?: string;
	status?: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
	notes?: string;

	// Enhanced fields for detailed offers
	equipment?: Omit<OfferEquipment, 'id'>[];
	terms?: Omit<OfferTerms, 'id'>;
	installmentPlans?: Omit<InstallmentPlan, 'id'>[];
}

export interface SalesOfferFilters {
	status?: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
	clientId?: number;
}

// ==================== DEAL TYPES ====================

export interface Deal {
	id: number;
	offerId: number;
	clientId: number;
	salesmanId: string;
	dealValue: number;
	paymentTerms?: string;
	deliveryTerms?: string;
	status:
		| 'PendingManagerApproval'
		| 'PendingSuperAdminApproval'
		| 'Approved'
		| 'Rejected';
	managerApprovedBy?: string;
	managerApprovedAt?: string;
	managerComments?: string;
	superAdminApprovedBy?: string;
	superAdminApprovedAt?: string;
	superAdminComments?: string;
	notes?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateDealDto {
	offerId: number;
	clientId: number;
	dealValue: number;
	paymentTerms?: string;
	deliveryTerms?: string;
	notes?: string;
}

export interface ManagerApprovalDto {
	approved: boolean;
	comments?: string;
}

export interface DealFilters {
	status?: string;
	salesmanId?: string;
}

// ==================== SALES REPORT TYPES ====================

export interface SalesReport {
	id: number;
	title: string;
	body: string;
	type: 'Daily' | 'Weekly' | 'Monthly';
	reportDate: string;
	employeeId: string;
	rating?: number;
	comments?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateSalesReportDto {
	title: string;
	body: string;
	type: 'Daily' | 'Weekly' | 'Monthly';
	reportDate: string;
}

export interface RateSalesReportDto {
	rating: number;
	comments?: string;
}

export interface SalesReportFilters {
	type?: string;
	reportDate?: string;
	page?: number;
	pageSize?: number;
}

// ==================== WEEKLY PLAN TYPES ====================

export interface WeeklyPlan {
	id: number;
	title: string;
	description?: string;
	weekStartDate: string;
	weekEndDate: string;
	status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
	reviewComments?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateWeeklyPlanDto {
	title: string;
	description?: string;
	weekStartDate: string;
	weekEndDate: string;
}

export interface ReviewWeeklyPlanDto {
	reviewed: boolean;
	reviewComments?: string;
}

export interface WeeklyPlanFilters {
	page?: number;
	pageSize?: number;
}
