// Maintenance Module TypeScript Types

import type { PaymentResponseDTO } from './payment.types';

// Enums
export enum MaintenanceRequestStatus {
	Pending = 'Pending',
	Assigned = 'Assigned',
	InProgress = 'InProgress',
	NeedsSecondVisit = 'NeedsSecondVisit',
	NeedsSparePart = 'NeedsSparePart',
	WaitingForSparePart = 'WaitingForSparePart',
	WaitingForCustomerApproval = 'WaitingForCustomerApproval',
	Completed = 'Completed',
	Cancelled = 'Cancelled',
	OnHold = 'OnHold',
}

export enum MaintenanceVisitOutcome {
	Completed = 'Completed',
	NeedsSecondVisit = 'NeedsSecondVisit',
	NeedsSparePart = 'NeedsSparePart',
	CannotComplete = 'CannotComplete',
}

export enum VisitStatus {
	PendingApproval = 'PendingApproval',
	Scheduled = 'Scheduled',
	InProgress = 'InProgress',
	NeedsSpareParts = 'NeedsSpareParts',
	Completed = 'Completed',
	Rescheduled = 'Rescheduled',
	Cancelled = 'Cancelled',
}

export enum VisitOrigin {
	CustomerApp = 'CustomerApp',
	CallCenter = 'CallCenter',
	ManualSales = 'ManualSales',
	AutoContract = 'AutoContract',
}

export enum SparePartAvailabilityStatus {
	Pending = 'Pending',
	LocalAvailable = 'LocalAvailable',
	GlobalRequired = 'GlobalRequired',
	PriceSet = 'PriceSet',
	WaitingForCustomerApproval = 'WaitingForCustomerApproval',
	CustomerApproved = 'CustomerApproved',
	CustomerRejected = 'CustomerRejected',
	ReadyForEngineer = 'ReadyForEngineer',
	DeliveredToEngineer = 'DeliveredToEngineer',
}

export enum AttachmentType {
	Image = 'Image',
	Video = 'Video',
	Audio = 'Audio',
	Document = 'Document',
}

export enum PaymentStatus {
	Pending = 'Pending',
	Processing = 'Processing',
	Completed = 'Completed',
	Failed = 'Failed',
	Refunded = 'Refunded',
}

// Maintenance Request Types
export interface CreateMaintenanceRequestDTO {
	equipmentId: number;
	description: string;
	symptoms?: string;
}

export interface MaintenanceRequestResponseDTO {
	id: number;
	customerId: string;
	customerName: string;
	customerType: string;
	hospitalId?: string;
	hospitalName?: string;
	equipmentId: number;
	equipmentName: string;
	equipmentQRCode: string;
	description: string;
	symptoms?: string;
	status: MaintenanceRequestStatus;
	assignedToEngineerId?: string;
	assignedToEngineerName?: string;
	paymentStatus: PaymentStatus;
	totalAmount?: number;
	paidAmount?: number;
	remainingAmount?: number;
	createdAt: string;
	startedAt?: string;
	completedAt?: string;
	attachments: MaintenanceRequestAttachmentResponseDTO[];
	visits: MaintenanceVisitResponseDTO[];
	payments: PaymentResponseDTO[];
}

// Maintenance Visit Types
export interface CreateMaintenanceVisitDTO {
	maintenanceRequestId: number;
	qrCode?: string;
	serialCode?: string;
	report?: string;
	actionsTaken?: string;
	partsUsed?: string;
	serviceFee?: number;
	outcome: MaintenanceVisitOutcome;
	notes?: string;
}

export interface MaintenanceVisitResponseDTO {
	id: number;
	ticketNumber: string;
	maintenanceRequestId: number;
	customerId: string;
	customerName: string;
	deviceId: number;
	deviceName: string;
	scheduledDate: string;
	origin: VisitOrigin;
	status: VisitStatus;
	parentVisitId?: number;
	isPaidVisit: boolean;
	cost?: number;
	EngineerId: string;
	EngineerName: string;
	assignedEngineerIds?: string[];
	assignedEngineerNames?: string[];
	qrCode?: string;
	serialCode?: string;
	report?: string;
	actionsTaken?: string;
	partsUsed?: string;
	serviceFee?: number;
	outcome: MaintenanceVisitOutcome;
	sparePartRequestId?: number;
	visitDate: string;
	startedAt?: string;
	completedAt?: string;
	notes?: string;
}

// Spare Part Request Types
export interface CreateSparePartRequestDTO {
	maintenanceRequestId: number;
	maintenanceVisitId?: number;
	partName: string;
	partNumber?: string;
	description?: string;
	manufacturer?: string;
}

export interface SparePartRequestResponseDTO {
	id: number;
	maintenanceRequestId: number;
	maintenanceVisitId?: number;
	partName: string;
	partNumber?: string;
	description?: string;
	manufacturer?: string;
	originalPrice?: number;
	companyPrice?: number;
	customerPrice?: number;
	status: SparePartAvailabilityStatus;
	assignedToCoordinatorId?: string;
	assignedToCoordinatorName?: string;
	assignedToInventoryManagerId?: string;
	assignedToInventoryManagerName?: string;
	priceSetByManagerId?: string;
	priceSetByManagerName?: string;
	customerApproved?: boolean;
	customerApprovedAt?: string;
	customerRejectionReason?: string;
	createdAt: string;
	checkedAt?: string;
	priceSetAt?: string;
	readyAt?: string;
	deliveredToEngineerAt?: string;
}

export interface UpdateSparePartPriceDTO {
	companyPrice: number;
	customerPrice: number;
}

export interface CustomerSparePartDecisionDTO {
	approved: boolean;
	rejectionReason?: string;
}

// Maintenance Request Attachment Types
export interface MaintenanceRequestAttachmentResponseDTO {
	id: number;
	maintenanceRequestId: number;
	filePath: string;
	fileName: string;
	fileType?: string;
	fileSize?: number;
	attachmentType: AttachmentType;
	description?: string;
	uploadedAt: string;
}

export interface CreateMaintenanceRequestAttachmentDTO {
	maintenanceRequestId: number;
	file: File;
	attachmentType: AttachmentType;
	description?: string;
}

// Maintenance Request Rating Types
export interface CreateMaintenanceRequestRatingDTO {
	maintenanceRequestId: number;
	rating: number; // 1-5
	comment?: string;
}

export interface MaintenanceRequestRatingResponseDTO {
	id: number;
	maintenanceRequestId: number;
	customerId: string;
	customerName: string;
	EngineerId: string;
	EngineerName: string;
	rating: number;
	comment?: string;
	createdAt: string;
}

// Assignment Types
export interface AssignMaintenanceRequestDTO {
	EngineerId: string;
}

// Status Update Types
export interface UpdateMaintenanceRequestStatusDTO {
	status: MaintenanceRequestStatus;
	notes?: string;
}

// Cancel Request Types
export interface CancelMaintenanceRequestDTO {
	reason?: string;
}

// Filters
export interface MaintenanceRequestFilters {
	status?: MaintenanceRequestStatus;
	customerId?: string;
	EngineerId?: string;
	equipmentId?: number;
	hospitalId?: string;
	fromDate?: string;
	toDate?: string;
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
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
