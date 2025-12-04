// Sales Module Types - Comprehensive type definitions for sales management

// ==================== CLIENT MANAGEMENT ====================

export interface Client {
	id: string;
	name: string;
	phone?: string;
	organizationName?: string;
	classification?: 'A' | 'B' | 'C' | 'D';
	city?: string;
	governorate?: string;
	governorateId?: number;
	createdBy: string;
	assignedTo?: string;
	assignedToName?: string; // For display purposes - salesman name
	assignedSalesmanName?: string; // Legacy - kept for backward compatibility
	createdAt: string;
	updatedAt: string;
	// Sales tracking - Updated to match new business logic
	totalVisits: number;
	totalOffers: number;
	successfulDeals: number;
	failedDeals: number;
	totalRevenue: number;
	averageSatisfaction: number;
	lastInteractionDate?: string;
	conversionRate?: number;
	interestedEquipmentCategories?: string[]; // Equipment categories the client is interested in
}

export interface CreateClientDto {
	name: string;
	phone?: string;
	organizationName?: string;
	classification?: 'A' | 'B' | 'C' | 'D';
	assignedTo?: string;
	interestedEquipmentCategories?: string[]; // Equipment categories the client is interested in
}

export interface UpdateClientDto {
	name?: string;
	phone?: string;
	organizationName?: string;
	classification?: 'A' | 'B' | 'C' | 'D';
	assignedTo?: string;
	interestedEquipmentCategories?: string[]; // Equipment categories the client is interested in
}

export interface ClientSearchFilters {
	query?: string;
	classification?: 'A' | 'B' | 'C' | 'D';
	assignedSalesmanId?: string;
	city?: string;
	governorateId?: number;
	equipmentCategories?: string[]; // Filter by multiple equipment categories (e.g., ["Mobile X Ray", "Ultrasound"])
	createdFrom?: string;
	createdTo?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
}

export interface ClientSearchResult {
	clients: Client[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface Salesman {
	id: string;
	firstName?: string;
	lastName?: string;
	userName?: string;
	email?: string;
	phoneNumber?: string;
	isActive?: boolean;
}

export interface Governorate {
	governorateId?: number;
	id?: number;
	name: string;
}

// ==================== DEAL MANAGEMENT ====================

export interface Deal {
	id: string;
	offerId: string;
	clientId: string;
	clientName: string;
	dealValue: number;
	dealDescription: string;
	expectedCloseDate: string;
	status:
		| 'PendingManagerApproval'
		| 'PendingSuperAdminApproval'
		| 'Approved'
		| 'Success'
		| 'Failed'
		| 'Rejected';
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	createdByName: string;
	// Approval information
	managerApprovedAt?: string;
	managerApprovedBy?: string;
	managerApprovedByName?: string;
	managerApprovalNotes?: string;
	managerRejectionReason?: 'Money' | 'CashFlow' | 'OtherNeeds';
	superAdminApprovedAt?: string;
	superAdminApprovedBy?: string;
	superAdminApprovedByName?: string;
	superAdminApprovalNotes?: string;
	superAdminRejectionReason?: 'Money' | 'CashFlow' | 'OtherNeeds';
	// Completion information
	completedAt?: string;
	completedBy?: string;
	completedByName?: string;
	completionNotes?: string;
	failureReason?: string;
}

export interface CreateDealDto {
	offerId: string;
	clientId: string;
	dealValue: number;
	dealDescription: string;
	expectedCloseDate: string;
}

export interface UpdateDealDto {
	dealValue?: number;
	dealDescription?: string;
	expectedCloseDate?: string;
}

export interface DealApprovalDto {
	approved: boolean;
	notes?: string;
	superAdminRequired?: boolean;
	rejectionReason?: string; // Required when rejecting: "Money", "CashFlow", "OtherNeeds"
}

export interface DealCompletionDto {
	completionNotes: string;
}

export interface DealFailureDto {
	failureReason: string;
	failureNotes: string;
}

// ==================== OFFER REQUEST MANAGEMENT ====================

export interface OfferRequest {
	id: number;
	followUpNotes?: string;
	requestedBy: string;
	requestedByName: string;
	clientId: number;
	clientName: string;
	requestedProducts: string;
	specialNotes?: string;
	requestDate: string;
	status:
		| 'Requested'
		| 'Assigned'
		| 'InProgress'
		| 'Ready'
		| 'Sent'
		| 'Cancelled';
	assignedTo?: string;
	assignedToName?: string;
	createdOfferId?: number | null;
	priority?: 'Low' | 'Medium' | 'High';
	createdAt?: string;
	assignedAt?: string;
	taskProgressId?: string;
	offerDescription?: string;
	offerValue?: number;
	offerValidUntil?: string;
	completionNotes?: string;
}

export interface CreateOfferRequestDto {
	clientId: string;
	requestedProducts: string;
	priority: 'Low' | 'Medium' | 'High';
	taskProgressId?: string;
}

export interface UpdateOfferRequestDto {
	requestedProducts?: string;
	priority?: 'Low' | 'Medium' | 'High';
	status?:
		| 'Requested'
		| 'Assigned'
		| 'InProgress'
		| 'Ready'
		| 'Sent'
		| 'Cancelled';
	offerDescription?: string;
	offerValue?: number;
	offerValidUntil?: string;
	completionNotes?: string;
}

export interface AssignOfferRequestDto {
	assignedTo: string;
}

// ==================== TASK PROGRESS MANAGEMENT ====================

export interface TaskProgress {
	id: string;
	clientId: string;
	clientName: string;
	taskId: string;
	employeeId: string;
	employeeName: string;
	progressType: 'Visit' | 'Call' | 'Email' | 'Meeting';
	description: string;
	progressDate: string;
	visitResult?: 'Interested' | 'NotInterested';
	notInterestedComment?: string;
	nextStep?: 'NeedsOffer' | 'NeedsDeal';
	followUpDate?: string;
	followUpNotes?: string;
	satisfactionRating?: number; // 1-5 scale
	feedback?: string;
	attachments?: string; // JSON array of file paths
	voiceDescriptionUrl?: string; // URL to voice recording file
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	createdByName: string;
	// Related entities
	offerRequestId?: string;
	offerId?: string;
	dealId?: string;
}

export interface CreateTaskProgressDto {
	clientId: string;
	taskId: string;
	progressType: 'Visit' | 'Call' | 'Email' | 'Meeting';
	description: string;
	progressDate: string;
	visitResult?: 'Interested' | 'NotInterested';
	notInterestedComment?: string;
	nextStep?: 'NeedsOffer' | 'NeedsDeal';
	followUpDate?: string;
	followUpNotes?: string;
	satisfactionRating?: number;
	feedback?: string;
	attachments?: string;
	createOfferRequest?: boolean;
	requestedProducts?: string;
	priority?: 'Low' | 'Medium' | 'High';
}

export interface UpdateTaskProgressDto {
	progressType?: 'Visit' | 'Call' | 'Email' | 'Meeting';
	description?: string;
	progressDate?: string;
	visitResult?: 'Interested' | 'NotInterested';
	notInterestedComment?: string;
	nextStep?: 'NeedsOffer' | 'NeedsDeal';
	followUpDate?: string;
	followUpNotes?: string;
	satisfactionRating?: number;
	feedback?: string;
	attachments?: string;
}

// ==================== CLIENT VISITS ====================

export interface ClientVisit {
	id: string;
	clientId: string;
	clientName: string;
	visitDate: string;
	visitType: 'Visit' | 'Call' | 'Email' | 'Meeting';
	location: string;
	purpose: string;
	notes: string;
	results: string;
	nextVisitDate?: string;
	status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	createdByName: string;
	// Visit outcomes - Updated to match new business logic
	visitResult?: 'Interested' | 'NotInterested' | 'FollowUp' | 'NoAnswer';
	nextStep?: 'NeedsOffer' | 'NeedsDeal' | 'FollowUp' | 'Close';
	satisfactionRating?: number; // 1-5 scale
	// Follow-up information
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	// Visit duration and logistics
	duration?: number; // in minutes
	travelDistance?: number; // in km
	travelCost?: number;
	// Related offer request
	offerRequestId?: string;
}

export interface CreateClientVisitDto {
	clientId: string;
	visitDate: string;
	visitType: 'Visit' | 'Call' | 'Email' | 'Meeting';
	location: string;
	purpose: string;
	notes: string;
	results?: string;
	nextVisitDate?: string;
	visitResult?: 'Interested' | 'NotInterested' | 'FollowUp' | 'NoAnswer';
	nextStep?: 'NeedsOffer' | 'NeedsDeal' | 'FollowUp' | 'Close';
	satisfactionRating?: number;
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	duration?: number;
	travelDistance?: number;
	travelCost?: number;
	createOfferRequest?: boolean;
	requestedProducts?: string;
	priority?: 'Low' | 'Medium' | 'High';
}

export interface UpdateClientVisitDto {
	visitDate?: string;
	visitType?: 'Visit' | 'Call' | 'Email' | 'Meeting';
	location?: string;
	purpose?: string;
	notes?: string;
	results?: string;
	nextVisitDate?: string;
	status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';
	visitResult?: 'Interested' | 'NotInterested' | 'FollowUp' | 'NoAnswer';
	nextStep?: 'NeedsOffer' | 'NeedsDeal' | 'FollowUp' | 'Close';
	satisfactionRating?: number;
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	duration?: number;
	travelDistance?: number;
	travelCost?: number;
}

// ==================== CLIENT INTERACTIONS ====================

export interface ClientInteraction {
	id: string;
	clientId: string;
	clientName: string;
	interactionType:
		| 'Call'
		| 'Email'
		| 'Meeting'
		| 'Video Call'
		| 'WhatsApp'
		| 'Other';
	subject: string;
	description: string;
	interactionDate: string;
	duration?: number; // in minutes
	status: 'Completed' | 'Scheduled' | 'Cancelled';
	createdAt: string;
	createdBy: string;
	createdByName: string;
	// Interaction details
	participants?: string[];
	location?: string;
	notes?: string;
	// Follow-up
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	// Outcome
	outcome?: 'Positive' | 'Neutral' | 'Negative';
	nextSteps?: string;
}

export interface CreateClientInteractionDto {
	clientId: string;
	interactionType:
		| 'Call'
		| 'Email'
		| 'Meeting'
		| 'Video Call'
		| 'WhatsApp'
		| 'Other';
	subject: string;
	description: string;
	interactionDate: string;
	duration?: number;
	participants?: string[];
	location?: string;
	notes?: string;
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	outcome?: 'Positive' | 'Neutral' | 'Negative';
	nextSteps?: string;
}

// ==================== SALES ANALYTICS ====================

export interface SalesAnalytics {
	period: string;
	totalClients: number;
	activeClients: number;
	potentialClients: number;
	inactiveClients: number;
	totalVisits: number;
	completedVisits: number;
	upcomingVisits: number;
	overdueVisits: number;
	totalOffers: number;
	totalDeals: number;
	successfulDeals: number;
	failedDeals: number;
	totalRevenue: number;
	conversionRate: number;
	averageVisitDuration: number;
	averageSatisfaction: number;
	totalTravelDistance: number;
	totalTravelCost: number;
	// Performance metrics
	visitsPerClient: number;
	clientsPerSalesman: number;
	successRate: number;
	offerConversionRate: number;
	dealConversionRate: number;
	// Revenue metrics
	averageDealValue: number;
	revenuePerClient: number;
	// Time-based metrics
	visitsThisWeek: number;
	visitsThisMonth: number;
	visitsThisQuarter: number;
	// Client status breakdown
	clientsByStatus: {
		Potential: number;
		Active: number;
		Inactive: number;
	};
	// Visit type breakdown
	visitsByType: {
		Visit: number;
		Call: number;
		Email: number;
		Meeting: number;
	};
	// Deal status breakdown
	dealsByStatus: {
		PendingManagerApproval: number;
		PendingSuperAdminApproval: number;
		Approved: number;
		Success: number;
		Failed: number;
		Rejected: number;
	};
	// Offer request status breakdown
	offersByStatus: {
		Requested: number;
		InProgress: number;
		Ready: number;
		Sent: number;
		Cancelled: number;
	};
	// Top performing salesmen
	topSalesmen: Array<{
		salesmanId: string;
		salesmanName: string;
		visitsCount: number;
		clientsCount: number;
		dealsCount: number;
		successRate: number;
		totalRevenue: number;
	}>;
	// Recent activity
	recentVisits: ClientVisit[];
	recentInteractions: ClientInteraction[];
	recentDeals: Deal[];
	recentOffers: OfferRequest[];
}

export interface SalesPerformanceMetrics {
	salesmanId: string;
	salesmanName: string;
	period: string;
	// Client metrics
	totalClients: number;
	potentialClients: number;
	activeClients: number;
	inactiveClients: number;
	// Visit metrics
	totalVisits: number;
	completedVisits: number;
	upcomingVisits: number;
	overdueVisits: number;
	// Offer metrics
	totalOffers: number;
	completedOffers: number;
	// Deal metrics
	totalDeals: number;
	successfulDeals: number;
	failedDeals: number;
	pendingDeals: number;
	// Performance metrics
	conversionRate: number;
	successRate: number;
	offerConversionRate: number;
	dealConversionRate: number;
	averageVisitDuration: number;
	averageSatisfaction: number;
	// Revenue metrics
	totalRevenue: number;
	averageDealValue: number;
	revenuePerClient: number;
	// Efficiency metrics
	visitsPerDay: number;
	clientsPerWeek: number;
	totalTravelDistance: number;
	totalTravelCost: number;
	// Goals and targets
	monthlyTarget: number;
	quarterlyTarget: number;
	yearlyTarget: number;
	targetAchievement: number;
}

// ==================== SALES DASHBOARD ====================

export interface SalesDashboardData {
	// Overview metrics
	overview: {
		totalClients: number;
		activeClients: number;
		potentialClients: number;
		newClientsThisMonth: number;
		totalVisitsThisMonth: number;
		totalOffersThisMonth: number;
		totalDealsThisMonth: number;
		revenueThisMonth: number;
		conversionRate: number;
		teamPerformance: number;
	};
	// Recent activity
	recentActivity: Array<{
		id: string;
		type:
			| 'visit'
			| 'interaction'
			| 'client_created'
			| 'client_updated'
			| 'deal_created'
			| 'offer_requested'
			| 'deal_approved'
			| 'deal_completed';
		description: string;
		timestamp: string;
		salesmanName: string;
		clientName?: string;
	}>;
	// Upcoming events
	upcomingVisits: Array<{
		id: string;
		clientName: string;
		visitDate: string;
		visitType: string;
		salesmanName: string;
		location: string;
	}>;
	// Overdue items
	overdueItems: Array<{
		id: string;
		type:
			| 'visit'
			| 'follow_up'
			| 'deal_approval'
			| 'offer_completion';
		description: string;
		dueDate: string;
		clientName: string;
		salesmanName: string;
		priority: 'High' | 'Medium' | 'Low';
	}>;
	// Pending approvals
	pendingApprovals: Array<{
		id: string;
		type: 'deal_manager_approval' | 'deal_superadmin_approval';
		description: string;
		clientName: string;
		salesmanName: string;
		dealValue: number;
		createdAt: string;
	}>;
	// Team performance
	teamPerformance: Array<{
		salesmanId: string;
		salesmanName: string;
		clientsCount: number;
		visitsCount: number;
		dealsCount: number;
		offersCount: number;
		successRate: number;
		revenue: number;
		lastActivity: string;
	}>;
	// Charts data
	visitsTrend: Array<{
		date: string;
		visits: number;
		completed: number;
	}>;
	clientsTrend: Array<{
		date: string;
		total: number;
		potential: number;
		active: number;
	}>;
	dealsTrend: Array<{
		date: string;
		created: number;
		approved: number;
		completed: number;
	}>;
	revenueTrend: Array<{
		date: string;
		revenue: number;
		target: number;
	}>;
}

// ==================== API RESPONSES ====================

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
}

export interface PaginatedData<T> {
	data: T;
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface PaginatedApiResponseWithMeta<T> {
	success: boolean;
	message: string;
	data: PaginatedData<T>;
	timestamp: string;
}

// ==================== SALESMAN STATISTICS ====================

export interface SalesmanStatisticsDTO {
	salesmanId: string;
	salesmanName: string;
	year: number;
	quarter?: number;

	// Visit Statistics
	totalVisits: number;
	successfulVisits: number; // VisitResult = "Interested"
	failedVisits: number; // VisitResult = "NotInterested"
	successRate: number; // percentage

	// Offer Statistics
	totalOffers: number;
	acceptedOffers: number;
	rejectedOffers: number;
	offerAcceptanceRate: number; // percentage

	// Deal Statistics
	totalDeals: number;
	totalDealValue: number;
}

export enum TargetType {
	Money = 1,
	Activity = 2,
}

export interface SalesmanTargetDTO {
	id: number;
	salesmanId: string | null;
	salesmanName: string;
	year: number;
	quarter?: number;
	targetType: TargetType;

	// Activity targets (visits/offers/deals)
	targetVisits: number;
	targetSuccessfulVisits: number;
	targetOffers: number;
	targetDeals: number;
	targetOfferAcceptanceRate?: number; // 0-100

	// Money target
	targetRevenue?: number;

	isTeamTarget: boolean;
	notes?: string;
	createdAt: string; // ISO 8601
	createdByManagerName?: string;
	createdBySalesmanName?: string; // For self-set targets
}

export interface SalesmanProgressDTO {
	currentStatistics: SalesmanStatisticsDTO;
	individualMoneyTarget?: SalesmanTargetDTO;
	individualActivityTarget?: SalesmanTargetDTO;
	teamMoneyTarget?: SalesmanTargetDTO;
	teamActivityTarget?: SalesmanTargetDTO;

	// Progress Percentages (0-100, can exceed 100%)
	visitsProgress: number;
	successfulVisitsProgress: number;
	offersProgress: number;
	dealsProgress: number;
	offerAcceptanceRateProgress?: number;
	revenueProgress?: number;
}

export interface CreateSalesmanTargetDTO {
	salesmanId?: string; // null or omit for team target
	year: number;
	quarter?: number; // 1-4, omit for yearly
	targetType: TargetType; // Money (manager) or Activity (salesman)

	// Activity targets (visits/offers/deals) - set by salesman
	// Nullable for PATCH support - null/undefined means field not provided
	targetVisits?: number | null;
	targetSuccessfulVisits?: number | null;
	targetOffers?: number | null;
	targetDeals?: number | null;
	targetOfferAcceptanceRate?: number | null; // 0-100

	// Money target - set by manager
	targetRevenue?: number | null;

	isTeamTarget: boolean;
	notes?: string | null;
}

// ==================== FILTERS AND PAGINATION ====================

export interface PaginationParams {
	page: number;
	pageSize: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface DateRangeFilter {
	startDate?: string;
	endDate?: string;
}

export interface SalesmanFilter {
	salesmanId?: string;
	salesmanName?: string;
}

// ==================== OFFER MANAGEMENT ====================

export interface Offer {
	id: number;
	offerRequestId: number;
	clientId: number;
	clientName: string;
	createdBy: string;
	createdByName: string;
	assignedTo: string;
	assignedToName: string;
	products: string;
	totalAmount: number;
	paymentTerms?: string[]; // Array of payment terms
	deliveryTerms?: string[]; // Array of delivery terms
	warrantyTerms?: string[]; // Array of warranty terms
	validUntil?: string[]; // Array of date strings (ISO format: "YYYY-MM-DD")
	status:
		| 'Draft'
		| 'PendingSalesManagerApproval'
		| 'Sent'
		| 'Accepted'
		| 'Rejected'
		| 'UnderReview'
		| 'NeedsModification'
		| 'Expired'
		| 'Completed';
	sentToClientAt?: string | null;
	clientResponse?: string | null;
	createdAt: string;
	paymentType?: 'Cash' | 'Installments' | 'Other';
	finalPrice?: number;
	offerDuration?: string;
	notes?: string;
	// SalesManager Approval/Rejection fields
	salesManagerApprovedBy?: string;
	salesManagerApprovedAt?: string;
	salesManagerComments?: string;
	salesManagerRejectionReason?: string;
	isSalesManagerApproved?: boolean;
	canSendToSalesman?: boolean;
}

// ==================== ENHANCED OFFER FEATURES ====================

export interface OfferEquipment {
	id: number;
	offerId: number;
	name: string;
	model?: string;
	provider?: string; // Backend uses "Provider" instead of "manufacturer"
	providerImagePath?: string | null;
	country?: string;
	year?: number;
	price?: number; // Backend uses "Price" (single price, not unitPrice/totalPrice)
	description?: string; // Backend uses "Description" instead of "specifications"
	inStock?: boolean;
	imagePath?: string | null;
	// Legacy fields for backward compatibility
	manufacturer?: string;
	quantity?: number;
	unitPrice?: number;
	totalPrice?: number;
	specifications?: string;
	warrantyPeriod?: string;
}

export interface OfferTerms {
	id: number;
	offerId: number;
	warrantyPeriod?: string;
	deliveryTime?: string;
	installationIncluded?: boolean;
	trainingIncluded?: boolean;
	maintenanceTerms?: string;
	paymentTerms?: string;
	deliveryTerms?: string;
	returnPolicy?: string;
}

export interface InstallmentPlan {
	id: number;
	offerId: number;
	numberOfInstallments: number;
	totalAmount: number;
	installments: InstallmentPlanItem[];
	createdAt?: string;
}

export interface InstallmentPlanItem {
	id: number;
	installmentNumber: number;
	amount: number;
	dueDate: string;
	status: 'Pending' | 'Paid' | 'Overdue';
	notes?: string | null;
}

export interface CreateEquipmentDto {
	name: string;
	model?: string;
	manufacturer?: string;
	quantity: number;
	unitPrice: number;
	specifications?: string;
	warrantyPeriod?: string;
}

export interface CreateTermsDto {
	warrantyPeriod?: string;
	deliveryTime?: string;
	installationIncluded?: boolean;
	trainingIncluded?: boolean;
	maintenanceTerms?: string;
	paymentTerms?: string;
	deliveryTerms?: string;
	returnPolicy?: string;
}

export interface CreateInstallmentDto {
	numberOfInstallments: number;
	firstPaymentAmount: number;
	firstPaymentDate: string;
	paymentFrequency: 'Monthly' | 'Quarterly' | 'Yearly';
	totalAmount: number;
}

// ==================== WEEKLY PLAN ENHANCEMENTS ====================

export interface WeeklyPlanTask {
	id: number;
	weeklyPlanId: number;
	title: string;
	taskType: 'Visit' | 'FollowUp' | 'Call' | 'Email' | 'Meeting';
	clientId?: number;
	clientName?: string;
	status: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
	priority: 'High' | 'Medium' | 'Low';
	plannedDate: string;
	completedAt?: string;
	notes?: string;
	equipmentCategories?: string[]; // Equipment categories relevant to this task
}

export interface CreateOfferDto {
	offerRequestId?: number;
	clientId: number;
	assignedTo: string;
	products: string;
	totalAmount: number;
	paymentTerms?: string[]; // Array of payment terms
	deliveryTerms?: string[]; // Array of delivery terms
	warrantyTerms?: string[]; // Array of warranty terms
	validUntil?: string[]; // Array of date strings (ISO format: "YYYY-MM-DD")
	notes?: string;
	paymentType?: 'Cash' | 'Installments' | 'Other';
	finalPrice?: number;
	offerDuration?: string;
	discountAmount?: number; // Added for completeness
}

export interface UpdateOfferDto {
	products?: string;
	totalAmount?: number;
	paymentTerms?: string;
	deliveryTerms?: string;
	validUntil?: string;
	notes?: string;
}

export interface SendOfferDto {
	message?: string;
}

export interface ClientResponseDto {
	response: string;
	accepted: boolean;
}

// ==================== CLIENT PROFILE TYPES ====================

export interface ClientProfileDTO {
	clientInfo: ClientResponseDTO;
	allVisits: TaskProgressSummaryDTO[];
	allOffers: OfferSummaryDTO[];
	allDeals: DealSummaryDTO[];
	statistics: ClientStatisticsDTO;
}

export interface ClientResponseDTO {
	id: string;
	name: string;
	phone?: string;
	organizationName?: string;
	classification?: string; // A, B, C, or D
	createdBy: string;
	assignedTo?: string;
	interestedEquipmentCategories?: string[]; // Equipment categories the client is interested in
	createdAt: string;
	updatedAt: string;
}

export interface ClientStatisticsDTO {
	TotalVisits: number;
	totalVisits: number;
	totalOffers: number;
	successfulDeals: number;
	failedDeals: number;
	totalRevenue: number;
	averageSatisfaction: number;
	TotalOffers: number;
	SuccessfulDeals: number;
	FailedDeals: number;
	TotalRevenue: number;
	AverageSatisfaction: number;
}

export interface TaskProgressSummaryDTO {
	id: string;
	progressDate: string;
	progressType: string;
	visitResult?: string;
	nextStep?: string;
	satisfactionRating?: number;
}

export interface OfferSummaryDTO {
	id: string;
	createdAt: string;
	totalAmount: number;
	status: string;
	validUntil: string;
}

export interface DealSummaryDTO {
	id: string;
	closedDate: string;
	dealValue: number;
	status: string;
}

// ==================== EXPORT TYPES ====================

export interface ExportOptions {
	format: 'pdf' | 'excel' | 'csv';
	includeCharts: boolean;
	includeDetails: boolean;
	filters?: ClientSearchFilters;
}

export interface ExportResult {
	downloadUrl: string;
	fileName: string;
	fileSize: number;
	expiresAt: string;
}

// ==================== REQUEST WORKFLOW ====================

export interface RequestWorkflow {
	id: string;
	title: string;
	description: string;
	requestType:
		| 'ClientVisit'
		| 'ProductDemo'
		| 'SupportRequest'
		| 'QuoteRequest';
	clientId: string;
	clientName: string;
	requestedBy: string;
	requestedByName: string;
	assignedTo?: string;
	assignedToName?: string;
	priority: 'High' | 'Medium' | 'Low';
	status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
	dueDate?: string;
	notes?: string;
	comments?: Array<{
		id: string;
		comment: string;
		commentedBy: string;
		commentedByName: string;
		createdAt: string;
	}>;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRequestWorkflowDto {
	title: string;
	description: string;
	requestType:
		| 'ClientVisit'
		| 'ProductDemo'
		| 'SupportRequest'
		| 'QuoteRequest';
	clientId: string;
	priority: 'High' | 'Medium' | 'Low';
	dueDate?: string;
	notes?: string;
}

// ==================== DELIVERY TERMS ====================

export interface DeliveryTerms {
	id: string;
	clientId: string;
	terms: string;
	validFrom: string;
	validTo?: string;
	createdAt: string;
	updatedAt: string;
}

// ==================== PAYMENT TERMS ====================

export interface PaymentTerms {
	id: string;
	clientId: string;
	terms: string;
	validFrom: string;
	validTo?: string;
	createdAt: string;
	updatedAt: string;
}

// ==================== WEEKLY PLAN ====================

export interface WeeklyPlan {
	id: number;
	employeeId: string;
	employeeName: string;
	planTitle: string;
	weekStartDate: string;
	weekEndDate: string;
	status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
	submittedAt?: string;
	approvedAt?: string;
	rejectedAt?: string;
	reviewNotes?: string;
	reviewedBy?: string;
	reviewedByName?: string;
	createdAt: string;
	updatedAt: string;
	tasks?: WeeklyPlanItem[];
}

export interface WeeklyPlanItem {
	id: number;
	weeklyPlanId: number;
	title: string;
	description: string;
	priority: 'High' | 'Medium' | 'Low';
	status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
	dueDate: string;
	completedAt?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateWeeklyPlanDto {
	planTitle: string;
	weekStartDate: string;
	weekEndDate: string;
	tasks: CreateWeeklyPlanItemDto[];
}

export interface CreateWeeklyPlanItemDto {
	title: string;
	description: string;
	priority: 'High' | 'Medium' | 'Low';
	dueDate: string;
	notes?: string;
}

export interface UpdateWeeklyPlanDto {
	planTitle?: string;
	weekStartDate?: string;
	weekEndDate?: string;
}

export interface ReviewWeeklyPlanDto {
	status: 'Approved' | 'Rejected';
	reviewNotes?: string;
}

// ==================== PRODUCTS CATALOG ====================

export interface Product {
	id: number;
	name: string;
	model?: string;
	provider?: string;
	providerImagePath?: string | null;
	country?: string;
	category?: string;
	description?: string;
	imagePath?: string | null;
	dataSheetPath?: string | null;
	catalogPath?: string | null;
	year?: number;
	inventoryQuantity?: number;
	createdBy?: string;
	createdByName?: string;
	basePrice?: number;
	inStock?: boolean;
}

export interface CreateProductDto {
	name: string;
	model?: string;
	provider?: string;
	providerImagePath?: string | null;
	country?: string;
	category?: string;
	description?: string;
	year?: number;
}

export interface UpdateProductDto {
	name?: string;
	model?: string;
	provider?: string;
	providerImagePath?: string | null;
	country?: string;
	category?: string;
	description?: string;
	year?: number;
	inventoryQuantity?: number;
}

export interface UpdateInventoryDto {
	inventoryQuantity: number;
}

// ==================== PRODUCT CATEGORIES ====================

export interface ProductCategory {
	id: number;
	name: string;
	nameAr?: string;
	description?: string;
	descriptionAr?: string;
	iconPath?: string;
	parentCategoryId?: number;
	parentCategoryName?: string;
	displayOrder: number;
	isActive: boolean;
	subCategories?: ProductCategory[];
	productCount: number;
}

export interface CreateProductCategoryDto {
	name: string;
	nameAr?: string;
	description?: string;
	descriptionAr?: string;
	parentCategoryId?: number;
	displayOrder?: number;
	isActive?: boolean;
}

export interface UpdateProductCategoryDto {
	name?: string;
	nameAr?: string;
	description?: string;
	descriptionAr?: string;
	parentCategoryId?: number;
	displayOrder?: number;
	isActive?: boolean;
}

export interface CategoryHierarchy {
	id: number;
	name: string;
	nameAr?: string;
	iconPath?: string;
	productCount: number;
	subCategories: CategoryHierarchy[];
}

export interface ProductSearchParams {
	category?: string;
	inStock?: boolean;
	searchTerm?: string;
}
