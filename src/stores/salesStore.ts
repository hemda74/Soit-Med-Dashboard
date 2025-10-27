// Sales Store - Zustand store for sales module state management

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { salesApi } from '@/services/sales/salesApi';
import type {
	Client,
	CreateClientDto,
	UpdateClientDto,
	ClientSearchFilters,
	ClientSearchResult,
	ClientVisit,
	CreateClientVisitDto,
	UpdateClientVisitDto,
	ClientInteraction,
	CreateClientInteractionDto,
	Deal,
	CreateDealDto,
	UpdateDealDto,
	DealApprovalDto,
	DealCompletionDto,
	DealFailureDto,
	OfferRequest,
	CreateOfferRequestDto,
	UpdateOfferRequestDto,
	AssignOfferRequestDto,
	Offer,
	CreateOfferDto,
	UpdateOfferDto,
	ClientResponseDto,
	ClientProfileDTO,
	TaskProgress,
	CreateTaskProgressDto,
	UpdateTaskProgressDto,
	SalesAnalytics,
	SalesPerformanceMetrics,
	SalesDashboardData,
	SalesReport,
	CreateSalesReportDto,
} from '@/types/sales.types';
import toast from 'react-hot-toast';

// Weekly Plan Types
interface WeeklyPlan {
	id: number;
	planTitle: string;
	weekStartDate: string;
	weekEndDate: string;
	status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
	employeeId: string;
	employeeName: string;
	createdAt: string;
	updatedAt: string;
	reviewedAt?: string;
	reviewedBy?: string;
	reviewerName?: string;
	reviewNotes?: string;
	tasks: WeeklyPlanItem[];
}

interface WeeklyPlanItem {
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

interface CreateWeeklyPlanDto {
	planTitle: string;
	weekStartDate: string;
	weekEndDate: string;
	tasks: CreateWeeklyPlanItemDto[];
}

interface CreateWeeklyPlanItemDto {
	title: string;
	description: string;
	priority: 'High' | 'Medium' | 'Low';
	dueDate: string;
	notes?: string;
}

interface UpdateWeeklyPlanDto {
	planTitle?: string;
	weekStartDate?: string;
	weekEndDate?: string;
	status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

interface ReviewWeeklyPlanDto {
	status: 'Approved' | 'Rejected';
	reviewNotes?: string;
}

// Request Workflow Types
interface RequestWorkflow {
	id: string;
	requestType:
		| 'ClientVisit'
		| 'ProductDemo'
		| 'SupportRequest'
		| 'QuoteRequest'
		| 'Other';
	title: string;
	description: string;
	clientId: string;
	clientName: string;
	requestedBy: string;
	requestedByName: string;
	assignedTo?: string;
	assignedToName?: string;
	status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
	priority: 'High' | 'Medium' | 'Low';
	createdAt: string;
	updatedAt: string;
	dueDate?: string;
	completedAt?: string;
	notes?: string;
	comments: RequestComment[];
}

interface RequestComment {
	id: string;
	requestId: string;
	comment: string;
	commentedBy: string;
	commentedByName: string;
	createdAt: string;
}

interface CreateRequestWorkflowDto {
	requestType:
		| 'ClientVisit'
		| 'ProductDemo'
		| 'SupportRequest'
		| 'QuoteRequest'
		| 'Other';
	title: string;
	description: string;
	clientId: string;
	priority: 'High' | 'Medium' | 'Low';
	dueDate?: string;
	notes?: string;
}

// Delivery & Payment Terms Types
interface DeliveryTerms {
	id: string;
	clientId: string;
	clientName: string;
	terms: string;
	validFrom: string;
	validTo?: string;
	createdBy: string;
	createdByName: string;
	createdAt: string;
	updatedAt: string;
}

interface PaymentTerms {
	id: string;
	clientId: string;
	clientName: string;
	terms: string;
	validFrom: string;
	validTo?: string;
	createdBy: string;
	createdByName: string;
	createdAt: string;
	updatedAt: string;
}

// ==================== INTERFACES ====================

export interface SalesState {
	// Client state
	clients: Client[];
	selectedClient: Client | null;
	clientSearchResults: ClientSearchResult | null;
	clientsLoading: boolean;
	clientsError: string | null;

	// Deal state
	deals: Deal[];
	selectedDeal: Deal | null;
	pendingApprovals: Deal[];
	dealsLoading: boolean;
	dealsError: string | null;

	// Offer state
	offers: Offer[];
	selectedOffer: Offer | null;
	offersByClient: Record<string, Offer[]>;
	offersLoading: boolean;
	offersError: string | null;

	// Offer request state
	offerRequests: OfferRequest[];
	selectedOfferRequest: OfferRequest | null;
	myAssignedOffers: OfferRequest[];
	offerRequestsLoading: boolean;
	offerRequestsError: string | null;

	// Client profile state
	clientProfiles: Record<string, ClientProfileDTO>;
	clientProfileLoading: boolean;
	clientProfileError: string | null;

	// Task progress state
	taskProgress: TaskProgress[];
	selectedTaskProgress: TaskProgress | null;
	taskProgressLoading: boolean;
	taskProgressError: string | null;

	// Client visits state
	clientVisits: ClientVisit[];
	upcomingVisits: ClientVisit[];
	overdueVisits: ClientVisit[];
	visitsLoading: boolean;
	visitsError: string | null;

	// Client interactions state
	clientInteractions: ClientInteraction[];
	interactionsLoading: boolean;
	interactionsError: string | null;

	// Weekly Plans state
	weeklyPlans: WeeklyPlan[];
	currentWeeklyPlan: WeeklyPlan | null;
	weeklyPlanItems: WeeklyPlanItem[];
	overdueItems: WeeklyPlanItem[];
	upcomingItems: WeeklyPlanItem[];
	weeklyPlansLoading: boolean;
	weeklyPlansError: string | null;

	// Request Workflows state
	requestWorkflows: RequestWorkflow[];
	myRequests: RequestWorkflow[];
	assignedRequests: RequestWorkflow[];
	requestWorkflowsLoading: boolean;
	requestWorkflowsError: string | null;

	// Delivery & Payment Terms state
	deliveryTerms: DeliveryTerms[];
	paymentTerms: PaymentTerms[];
	termsLoading: boolean;
	termsError: string | null;

	// Analytics state
	salesAnalytics: SalesAnalytics | null;
	salesPerformance: SalesPerformanceMetrics[];
	salesDashboard: SalesDashboardData | null;
	analyticsLoading: boolean;
	analyticsError: string | null;

	// Reports state
	salesReports: SalesReport[];
	reportsLoading: boolean;
	reportsError: string | null;

	// Pagination state
	pagination: {
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};

	// Filters state
	filters: ClientSearchFilters;

	// UI state
	selectedTab:
		| 'clients'
		| 'visits'
		| 'interactions'
		| 'weeklyPlans'
		| 'requestWorkflows'
		| 'analytics'
		| 'reports';
	showClientModal: boolean;
	showVisitModal: boolean;
	showInteractionModal: boolean;
	showWeeklyPlanModal: boolean;
	showRequestWorkflowModal: boolean;
	showReportModal: boolean;
}

export interface SalesActions {
	// Client actions
	searchClients: (filters?: ClientSearchFilters) => Promise<void>;
	createClient: (data: CreateClientDto) => Promise<void>;
	updateClient: (
		clientId: string,
		data: UpdateClientDto
	) => Promise<void>;
	deleteClient: (clientId: string) => Promise<void>;
	getClient: (clientId: string) => Promise<void>;
	getMyClients: (filters?: ClientSearchFilters) => Promise<void>;
	getClientsNeedingFollowUp: () => Promise<void>;
	findOrCreateClient: (data: CreateClientDto) => Promise<void>;
	setSelectedClient: (client: Client | null) => void;
	clearClientSearch: () => void;

	// Deal actions
	createDeal: (data: CreateDealDto) => Promise<void>;
	getDeals: (filters?: any) => Promise<void>;
	getDeal: (dealId: string) => Promise<void>;
	updateDeal: (dealId: string, data: UpdateDealDto) => Promise<void>;
	approveDeal: (dealId: string, data: DealApprovalDto) => Promise<void>;
	completeDeal: (
		dealId: string,
		data: DealCompletionDto
	) => Promise<void>;
	failDeal: (dealId: string, data: DealFailureDto) => Promise<void>;
	getPendingApprovals: () => Promise<void>;
	setSelectedDeal: (deal: Deal | null) => void;

	// Offer actions
	createOffer: (data: CreateOfferDto) => Promise<void>;
	getOffers: (filters?: any) => Promise<void>;
	getMyOffers: (filters?: { status?: string }) => Promise<void>;
	getOffer: (offerId: string) => Promise<void>;
	updateOffer: (offerId: string, data: UpdateOfferDto) => Promise<void>;
	sendOfferToSalesman: (offerId: string) => Promise<void>;
	recordClientResponse: (
		offerId: string,
		data: ClientResponseDto
	) => Promise<void>;
	getOffersByClient: (clientId: string) => Promise<void>;
	setSelectedOffer: (offer: Offer | null) => void;

	// Client profile actions
	getClientProfile: (clientId: string) => Promise<void>;

	// Offer request actions
	createOfferRequest: (data: CreateOfferRequestDto) => Promise<void>;
	getOfferRequests: (filters?: any) => Promise<void>;
	getOfferRequest: (offerRequestId: string) => Promise<void>;
	updateOfferRequest: (
		offerRequestId: string,
		data: UpdateOfferRequestDto
	) => Promise<void>;
	assignOfferRequest: (
		offerRequestId: string,
		data: AssignOfferRequestDto
	) => Promise<void>;
	getMyAssignedOffers: () => Promise<void>;
	setSelectedOfferRequest: (offerRequest: OfferRequest | null) => void;

	// Task progress actions
	createTaskProgress: (data: CreateTaskProgressDto) => Promise<void>;
	getTaskProgress: (filters?: any) => Promise<void>;
	getTaskProgressById: (progressId: string) => Promise<void>;
	updateTaskProgress: (
		progressId: string,
		data: UpdateTaskProgressDto
	) => Promise<void>;
	getClientTaskProgress: (clientId: string) => Promise<void>;
	setSelectedTaskProgress: (taskProgress: TaskProgress | null) => void;

	// Client visits actions
	createClientVisit: (data: CreateClientVisitDto) => Promise<void>;
	updateClientVisit: (
		visitId: string,
		data: UpdateClientVisitDto
	) => Promise<void>;
	deleteClientVisit: (visitId: string) => Promise<void>;
	getClientVisits: (clientId: string, filters?: any) => Promise<void>;
	getUpcomingVisits: (days?: number) => Promise<void>;
	getOverdueVisits: () => Promise<void>;

	// Client interactions actions
	createClientInteraction: (
		data: CreateClientInteractionDto
	) => Promise<void>;
	updateClientInteraction: (
		interactionId: string,
		data: Partial<CreateClientInteractionDto>
	) => Promise<void>;
	deleteClientInteraction: (interactionId: string) => Promise<void>;
	getClientInteractions: (
		clientId: string,
		filters?: any
	) => Promise<void>;

	// Weekly Plans actions
	createWeeklyPlan: (data: CreateWeeklyPlanDto) => Promise<void>;
	getWeeklyPlans: (page?: number, pageSize?: number) => Promise<void>;
	getWeeklyPlan: (planId: number) => Promise<void>;
	updateWeeklyPlan: (
		planId: number,
		data: UpdateWeeklyPlanDto
	) => Promise<void>;
	submitWeeklyPlan: (planId: number) => Promise<void>;
	reviewWeeklyPlan: (
		planId: number,
		data: ReviewWeeklyPlanDto
	) => Promise<void>;
	getCurrentWeeklyPlan: () => Promise<void>;
	createPlanItem: (
		itemData: CreateWeeklyPlanItemDto & { weeklyPlanId: number }
	) => Promise<void>;
	getPlanItems: (planId: number) => Promise<void>;
	updatePlanItem: (
		itemId: number,
		weeklyPlanId: number,
		itemData: Partial<CreateWeeklyPlanItemDto>
	) => Promise<void>;
	completePlanItem: (
		itemId: number,
		weeklyPlanId: number,
		completionData: { notes?: string }
	) => Promise<void>;
	cancelPlanItem: (
		itemId: number,
		weeklyPlanId: number,
		reason: string
	) => Promise<void>;
	postponePlanItem: (
		itemId: number,
		weeklyPlanId: number,
		newDate: string,
		reason: string
	) => Promise<void>;
	getOverdueItems: () => Promise<void>;
	getUpcomingItems: (days?: number) => Promise<void>;

	// Request Workflows actions
	createRequestWorkflow: (
		data: CreateRequestWorkflowDto
	) => Promise<void>;
	getMyRequests: (filters?: any) => Promise<void>;
	getAssignedRequests: (filters?: any) => Promise<void>;
	updateRequestStatus: (
		requestId: string,
		status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled',
		comment?: string
	) => Promise<void>;
	assignRequest: (
		requestId: string,
		assignToUserId: string
	) => Promise<void>;

	// Delivery & Payment Terms actions
	createDeliveryTerms: (termsData: {
		clientId: string;
		terms: string;
		validFrom: string;
		validTo?: string;
	}) => Promise<void>;
	createPaymentTerms: (termsData: {
		clientId: string;
		terms: string;
		validFrom: string;
		validTo?: string;
	}) => Promise<void>;
	getDeliveryTerms: (termsId: string) => Promise<void>;
	getPaymentTerms: (termsId: string) => Promise<void>;

	// Analytics actions
	getSalesAnalytics: (period?: string) => Promise<void>;
	getSalesPerformance: (
		salesmanId?: string,
		period?: string
	) => Promise<void>;
	getSalesDashboard: () => Promise<void>;
	getSalesTrends: (period?: string) => Promise<void>;

	// Reports actions
	generateSalesReport: (data: CreateSalesReportDto) => Promise<void>;
	getSalesReports: (filters?: any) => Promise<void>;
	getSalesManagerDashboard: () => Promise<void>;
	getSalesmanPerformance: (
		salesmanId: string,
		period?: string
	) => Promise<void>;
	getTopPerformers: (limit?: number) => Promise<void>;
	exportSalesData: (options: any) => Promise<void>;
	exportSalesReport: (reportId: string, format?: string) => Promise<void>;

	// UI actions
	setSelectedTab: (
		tab:
			| 'clients'
			| 'visits'
			| 'interactions'
			| 'weeklyPlans'
			| 'requestWorkflows'
			| 'analytics'
			| 'reports'
	) => void;
	setShowClientModal: (show: boolean) => void;
	setShowVisitModal: (show: boolean) => void;
	setShowInteractionModal: (show: boolean) => void;
	setShowWeeklyPlanModal: (show: boolean) => void;
	setShowRequestWorkflowModal: (show: boolean) => void;
	setShowReportModal: (show: boolean) => void;
	setFilters: (filters: Partial<ClientSearchFilters>) => void;
	setPagination: (pagination: Partial<SalesState['pagination']>) => void;

	// Error handling
	clearError: (
		type:
			| 'clients'
			| 'visits'
			| 'interactions'
			| 'weeklyPlans'
			| 'requestWorkflows'
			| 'terms'
			| 'analytics'
			| 'reports'
	) => void;
	clearAllErrors: () => void;
}

export type SalesStore = SalesState & SalesActions;

// ==================== INITIAL STATE ====================

const initialState: SalesState = {
	// Client state
	clients: [],
	selectedClient: null,
	clientSearchResults: null,
	clientsLoading: false,
	clientsError: null,

	// Deal state
	deals: [],
	selectedDeal: null,
	pendingApprovals: [],
	dealsLoading: false,
	dealsError: null,

	// Offer state
	offers: [],
	selectedOffer: null,
	offersByClient: {},
	offersLoading: false,
	offersError: null,

	// Offer request state
	offerRequests: [],
	selectedOfferRequest: null,
	myAssignedOffers: [],
	offerRequestsLoading: false,
	offerRequestsError: null,

	// Client profile state
	clientProfiles: {},
	clientProfileLoading: false,
	clientProfileError: null,

	// Task progress state
	taskProgress: [],
	selectedTaskProgress: null,
	taskProgressLoading: false,
	taskProgressError: null,

	// Client visits state
	clientVisits: [],
	upcomingVisits: [],
	overdueVisits: [],
	visitsLoading: false,
	visitsError: null,

	// Client interactions state
	clientInteractions: [],
	interactionsLoading: false,
	interactionsError: null,

	// Weekly Plans state
	weeklyPlans: [],
	currentWeeklyPlan: null,
	weeklyPlanItems: [],
	overdueItems: [],
	upcomingItems: [],
	weeklyPlansLoading: false,
	weeklyPlansError: null,

	// Request Workflows state
	requestWorkflows: [],
	myRequests: [],
	assignedRequests: [],
	requestWorkflowsLoading: false,
	requestWorkflowsError: null,

	// Delivery & Payment Terms state
	deliveryTerms: [],
	paymentTerms: [],
	termsLoading: false,
	termsError: null,

	// Analytics state
	salesAnalytics: null,
	salesPerformance: [],
	salesDashboard: null,
	analyticsLoading: false,
	analyticsError: null,

	// Reports state
	salesReports: [],
	reportsLoading: false,
	reportsError: null,

	// Pagination state
	pagination: {
		page: 1,
		pageSize: 20,
		totalCount: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	},

	// Filters state
	filters: {},

	// UI state
	selectedTab: 'clients',
	showClientModal: false,
	showVisitModal: false,
	showInteractionModal: false,
	showWeeklyPlanModal: false,
	showRequestWorkflowModal: false,
	showReportModal: false,
};

// ==================== STORE IMPLEMENTATION ====================

export const useSalesStore = create<SalesStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				...initialState,

				// ==================== CLIENT ACTIONS ====================

				searchClients: async (filters = {}) => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						const response =
							await salesApi.searchClients(
								filters
							);
						set({
							clientSearchResults:
								response.data,
							clients: response.data
								.clients,
							pagination: {
								page: response
									.data
									.page,
								pageSize: response
									.data
									.pageSize,
								totalCount: response
									.data
									.totalCount,
								totalPages: response
									.data
									.totalPages,
								hasNextPage:
									response
										.data
										.hasNextPage,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage,
							},
							clientsLoading: false,
						});
						toast.success(
							`Found ${response.data.clients.length} clients`
						);
					} catch (error: any) {
						set({
							clientsError:
								error.message ||
								'Failed to search clients',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to search clients'
						);
					}
				},

				createClient: async (data) => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						const response =
							await salesApi.createClient(
								data
							);
						set((state) => ({
							clients: [
								response.data,
								...state.clients,
							],
							clientsLoading: false,
						}));
						toast.success(
							'Client created successfully'
						);
					} catch (error: any) {
						set({
							clientsError:
								error.message ||
								'Failed to create client',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create client'
						);
					}
				},

				updateClient: async (clientId, data) => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						const response =
							await salesApi.updateClient(
								clientId,
								data
							);
						set((state) => ({
							clients: state.clients.map(
								(client) =>
									client.id ===
									clientId
										? response.data
										: client
							),
							selectedClient:
								state
									.selectedClient
									?.id ===
								clientId
									? response.data
									: state.selectedClient,
							clientsLoading: false,
						}));
						toast.success(
							'Client updated successfully'
						);
					} catch (error: any) {
						set({
							clientsError:
								error.message ||
								'Failed to update client',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to update client'
						);
					}
				},

				deleteClient: async (clientId) => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						await salesApi.deleteClient(
							clientId
						);
						set((state) => ({
							clients: state.clients.filter(
								(client) =>
									client.id !==
									clientId
							),
							selectedClient:
								state
									.selectedClient
									?.id ===
								clientId
									? null
									: state.selectedClient,
							clientsLoading: false,
						}));
						toast.success(
							'Client deleted successfully'
						);
					} catch (error: any) {
						set({
							clientsError:
								error.message ||
								'Failed to delete client',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to delete client'
						);
					}
				},

				getClient: async (clientId) => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						const response =
							await salesApi.getClient(
								clientId
							);
						set({
							selectedClient:
								response.data,
							clientsLoading: false,
						});
					} catch (error: any) {
						set({
							clientsError:
								error.message ||
								'Failed to fetch client',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch client'
						);
					}
				},

				getMyClients: async (filters = {}) => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						const response =
							await salesApi.getMyClients(
								filters
							);
						set({
							clients: response.data
								.clients,
							pagination: {
								page: response
									.data
									.page,
								pageSize: response
									.data
									.pageSize,
								totalCount: response
									.data
									.totalCount,
								totalPages: response
									.data
									.totalPages,
								hasNextPage:
									response
										.data
										.hasNextPage,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage,
							},
							clientsLoading: false,
						});
					} catch (error: any) {
						set({
							clients: [],
							clientsError:
								error.message ||
								'Failed to fetch my clients',
							clientsLoading: false,
						});
						// Don't show toast for 404 errors
						if (
							error.response
								?.status !== 404
						) {
							toast.error(
								error.message ||
									'Failed to fetch my clients'
							);
						}
					}
				},

				getClientsNeedingFollowUp: async () => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						const response =
							await salesApi.getClientsNeedingFollowUp();
						set({
							clients: response.data,
							clientsLoading: false,
						});
					} catch (error: any) {
						set({
							clientsError:
								error.message ||
								'Failed to fetch clients needing follow-up',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch clients needing follow-up'
						);
					}
				},

				findOrCreateClient: async (data) => {
					set({
						clientsLoading: true,
						clientsError: null,
					});
					try {
						const response =
							await salesApi.findOrCreateClient(
								data
							);
						set((state) => ({
							clients: [
								response.data,
								...state.clients,
							],
							selectedClient:
								response.data,
							clientsLoading: false,
						}));
						toast.success(
							'Client found or created successfully'
						);
					} catch (error: any) {
						set({
							clientsError:
								error.message ||
								'Failed to find or create client',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to find or create client'
						);
					}
				},

				setSelectedClient: (client) => {
					set({ selectedClient: client });
				},

				clearClientSearch: () => {
					set({
						clientSearchResults: null,
						clients: [],
						pagination: initialState.pagination,
					});
				},

				// ==================== DEAL ACTIONS ====================

				createDeal: async (data) => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.createDeal(
								data
							);
						set((state) => ({
							deals: [
								response.data,
								...state.deals,
							],
							dealsLoading: false,
						}));
						toast.success(
							'Deal created successfully'
						);
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to create deal',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create deal'
						);
					}
				},

				getDeals: async (filters = {}) => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.getDeals(
								filters
							);
						set({
							deals:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							dealsLoading: false,
						});
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to fetch deals',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch deals'
						);
					}
				},

				getDeal: async (dealId) => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.getDeal(
								dealId
							);
						set({
							selectedDeal:
								response.data,
							dealsLoading: false,
						});
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to fetch deal',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch deal'
						);
					}
				},

				updateDeal: async (dealId, data) => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.updateDeal(
								dealId,
								data
							);
						set((state) => ({
							deals: state.deals.map(
								(deal) =>
									deal.id ===
									dealId
										? response.data
										: deal
							),
							selectedDeal:
								state
									.selectedDeal
									?.id ===
								dealId
									? response.data
									: state.selectedDeal,
							dealsLoading: false,
						}));
						toast.success(
							'Deal updated successfully'
						);
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to update deal',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to update deal'
						);
					}
				},

				approveDeal: async (dealId, data) => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.approveDeal(
								dealId,
								data
							);
						set((state) => ({
							deals: state.deals.map(
								(deal) =>
									deal.id ===
									dealId
										? response.data
										: deal
							),
							selectedDeal:
								state
									.selectedDeal
									?.id ===
								dealId
									? response.data
									: state.selectedDeal,
							dealsLoading: false,
						}));
						toast.success(
							'Deal approved successfully'
						);
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to approve deal',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to approve deal'
						);
					}
				},

				completeDeal: async (dealId, data) => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.completeDeal(
								dealId,
								data
							);
						set((state) => ({
							deals: state.deals.map(
								(deal) =>
									deal.id ===
									dealId
										? response.data
										: deal
							),
							selectedDeal:
								state
									.selectedDeal
									?.id ===
								dealId
									? response.data
									: state.selectedDeal,
							dealsLoading: false,
						}));
						toast.success(
							'Deal completed successfully'
						);
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to complete deal',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to complete deal'
						);
					}
				},

				failDeal: async (dealId, data) => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.failDeal(
								dealId,
								data
							);
						set((state) => ({
							deals: state.deals.map(
								(deal) =>
									deal.id ===
									dealId
										? response.data
										: deal
							),
							selectedDeal:
								state
									.selectedDeal
									?.id ===
								dealId
									? response.data
									: state.selectedDeal,
							dealsLoading: false,
						}));
						toast.success(
							'Deal marked as failed'
						);
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to mark deal as failed',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to mark deal as failed'
						);
					}
				},

				getPendingApprovals: async () => {
					set({
						dealsLoading: true,
						dealsError: null,
					});
					try {
						const response =
							await salesApi.getPendingApprovals();
						set({
							pendingApprovals:
								response.data,
							dealsLoading: false,
						});
					} catch (error: any) {
						set({
							dealsError:
								error.message ||
								'Failed to fetch pending approvals',
							dealsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch pending approvals'
						);
					}
				},

				setSelectedDeal: (deal) => {
					set({ selectedDeal: deal });
				},

				// ==================== OFFER ACTIONS ====================

				createOffer: async (data) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.createOffer(
								data
							);
						set((state) => ({
							offers: [
								response.data,
								...state.offers,
							],
							offersLoading: false,
						}));
						toast.success(
							'Offer created successfully'
						);
					} catch (error: any) {
						set({
							offersError:
								error.message ||
								'Failed to create offer',
							offersLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create offer'
						);
					}
				},

				getOffers: async (filters = {}) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.getOffers(
								filters
							);
						set({
							offers:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							offersLoading: false,
						});
					} catch (error: any) {
						set({
							offersError:
								error.message ||
								'Failed to fetch offers',
							offersLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch offers'
						);
					}
				},

				getMyOffers: async (filters = {}) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.getMyOffers(
								filters
							);
						set({
							offers:
								response.data
									.data ||
								[],
							offersLoading: false,
						});
						toast.success(
							'Your offers loaded successfully'
						);
					} catch (error: any) {
						set({
							offers: [],
							offersError:
								error.message ||
								'Failed to fetch my offers',
							offersLoading: false,
						});
						// Don't show toast for 404 errors
						if (
							error.response
								?.status !== 404
						) {
							toast.error(
								error.message ||
									'Failed to fetch my offers'
							);
						}
					}
				},

				getOffer: async (offerId) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.getOffer(
								offerId
							);
						set({
							selectedOffer:
								response.data,
							offersLoading: false,
						});
					} catch (error: any) {
						set({
							offersError:
								error.message ||
								'Failed to fetch offer',
							offersLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch offer'
						);
					}
				},

				updateOffer: async (offerId, data) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.updateOffer(
								offerId,
								data
							);
						set((state) => ({
							offers: state.offers.map(
								(offer) =>
									offer.id ===
									offerId
										? response.data
										: offer
							),
							selectedOffer:
								state
									.selectedOffer
									?.id ===
								offerId
									? response.data
									: state.selectedOffer,
							offersLoading: false,
						}));
						toast.success(
							'Offer updated successfully'
						);
					} catch (error: any) {
						set({
							offersError:
								error.message ||
								'Failed to update offer',
							offersLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to update offer'
						);
					}
				},

				sendOfferToSalesman: async (offerId) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.sendOfferToSalesman(
								offerId
							);
						set((state) => ({
							offers: state.offers.map(
								(offer) =>
									offer.id ===
									offerId
										? response.data
										: offer
							),
							selectedOffer:
								state
									.selectedOffer
									?.id ===
								offerId
									? response.data
									: state.selectedOffer,
							offersLoading: false,
						}));
						toast.success(
							'Offer sent to salesman successfully'
						);
					} catch (error: any) {
						set({
							offersError:
								error.message ||
								'Failed to send offer to salesman',
							offersLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to send offer to salesman'
						);
					}
				},

				recordClientResponse: async (offerId, data) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.recordClientResponse(
								offerId,
								data
							);
						set((state) => ({
							offers: state.offers.map(
								(offer) =>
									offer.id ===
									offerId
										? response.data
										: offer
							),
							selectedOffer:
								state
									.selectedOffer
									?.id ===
								offerId
									? response.data
									: state.selectedOffer,
							offersLoading: false,
						}));
						toast.success(
							'Client response recorded successfully'
						);
					} catch (error: any) {
						set({
							offersError:
								error.message ||
								'Failed to record client response',
							offersLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to record client response'
						);
					}
				},

				getOffersByClient: async (clientId) => {
					set({
						offersLoading: true,
						offersError: null,
					});
					try {
						const response =
							await salesApi.getOffersByClient(
								clientId
							);
						set((state) => ({
							offersByClient: {
								...state.offersByClient,
								[clientId]: response.data,
							},
							offersLoading: false,
						}));
					} catch (error: any) {
						set({
							offersError:
								error.message ||
								'Failed to fetch offers by client',
							offersLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch offers by client'
						);
					}
				},

				setSelectedOffer: (offer) => {
					set({ selectedOffer: offer });
				},

				// ==================== CLIENT PROFILE ACTIONS ====================

				getClientProfile: async (clientId) => {
					set({
						clientProfileLoading: true,
						clientProfileError: null,
					});
					try {
						const response =
							await salesApi.getClientProfile(
								clientId
							);
						set((state) => ({
							clientProfiles: {
								...state.clientProfiles,
								[clientId]: response.data,
							},
							clientProfileLoading:
								false,
						}));
					} catch (error: any) {
						set({
							clientProfileError:
								error.message ||
								'Failed to fetch client profile',
							clientProfileLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch client profile'
						);
					}
				},

				// ==================== OFFER REQUEST ACTIONS ====================

				createOfferRequest: async (data) => {
					set({
						offerRequestsLoading: true,
						offerRequestsError: null,
					});
					try {
						const response =
							await salesApi.createOfferRequest(
								data
							);
						set((state) => ({
							offerRequests: [
								response.data,
								...state.offerRequests,
							],
							offerRequestsLoading:
								false,
						}));
						toast.success(
							'Offer request created successfully'
						);
					} catch (error: any) {
						set({
							offerRequestsError:
								error.message ||
								'Failed to create offer request',
							offerRequestsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to create offer request'
						);
					}
				},

				getOfferRequests: async (filters = {}) => {
					set({
						offerRequestsLoading: true,
						offerRequestsError: null,
					});
					try {
						const response =
							await salesApi.getOfferRequests(
								filters
							);
						set({
							offerRequests:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							offerRequestsLoading:
								false,
						});
					} catch (error: any) {
						set({
							offerRequestsError:
								error.message ||
								'Failed to fetch offer requests',
							offerRequestsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch offer requests'
						);
					}
				},

				getOfferRequest: async (offerRequestId) => {
					set({
						offerRequestsLoading: true,
						offerRequestsError: null,
					});
					try {
						const response =
							await salesApi.getOfferRequest(
								offerRequestId
							);
						set({
							selectedOfferRequest:
								response.data,
							offerRequestsLoading:
								false,
						});
					} catch (error: any) {
						set({
							offerRequestsError:
								error.message ||
								'Failed to fetch offer request',
							offerRequestsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch offer request'
						);
					}
				},

				updateOfferRequest: async (
					offerRequestId,
					data
				) => {
					set({
						offerRequestsLoading: true,
						offerRequestsError: null,
					});
					try {
						const response =
							await salesApi.updateOfferRequest(
								offerRequestId,
								data
							);
						set((state) => ({
							offerRequests:
								state.offerRequests.map(
									(
										request
									) =>
										request.id ===
										offerRequestId
											? response.data
											: request
								),
							selectedOfferRequest:
								state
									.selectedOfferRequest
									?.id ===
								offerRequestId
									? response.data
									: state.selectedOfferRequest,
							offerRequestsLoading:
								false,
						}));
						toast.success(
							'Offer request updated successfully'
						);
					} catch (error: any) {
						set({
							offerRequestsError:
								error.message ||
								'Failed to update offer request',
							offerRequestsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to update offer request'
						);
					}
				},

				assignOfferRequest: async (
					offerRequestId,
					data
				) => {
					set({
						offerRequestsLoading: true,
						offerRequestsError: null,
					});
					try {
						const response =
							await salesApi.assignOfferRequest(
								offerRequestId,
								data
							);
						set((state) => ({
							offerRequests:
								state.offerRequests.map(
									(
										request
									) =>
										request.id ===
										offerRequestId
											? response.data
											: request
								),
							selectedOfferRequest:
								state
									.selectedOfferRequest
									?.id ===
								offerRequestId
									? response.data
									: state.selectedOfferRequest,
							offerRequestsLoading:
								false,
						}));
						toast.success(
							'Offer request assigned successfully'
						);
					} catch (error: any) {
						set({
							offerRequestsError:
								error.message ||
								'Failed to assign offer request',
							offerRequestsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to assign offer request'
						);
					}
				},

				getMyAssignedOffers: async () => {
					set({
						offerRequestsLoading: true,
						offerRequestsError: null,
					});
					try {
						const response =
							await salesApi.getMyAssignedOffers();
						set({
							myAssignedOffers:
								response.data
									.data ||
								response.data,
							offerRequestsLoading:
								false,
						});
					} catch (error: any) {
						set({
							offerRequestsError:
								error.message ||
								'Failed to fetch assigned offers',
							offerRequestsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch assigned offers'
						);
					}
				},

				setSelectedOfferRequest: (offerRequest) => {
					set({
						selectedOfferRequest:
							offerRequest,
					});
				},

				// ==================== TASK PROGRESS ACTIONS ====================

				createTaskProgress: async (data) => {
					set({
						taskProgressLoading: true,
						taskProgressError: null,
					});
					try {
						const response =
							await salesApi.createTaskProgress(
								data
							);
						set((state) => ({
							taskProgress: [
								response.data,
								...state.taskProgress,
							],
							taskProgressLoading:
								false,
						}));
						toast.success(
							'Task progress created successfully'
						);
					} catch (error: any) {
						set({
							taskProgressError:
								error.message ||
								'Failed to create task progress',
							taskProgressLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to create task progress'
						);
					}
				},

				getTaskProgress: async (filters = {}) => {
					set({
						taskProgressLoading: true,
						taskProgressError: null,
					});
					try {
						const response =
							await salesApi.getTaskProgress(
								filters
							);
						set({
							taskProgress:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							taskProgressLoading:
								false,
						});
					} catch (error: any) {
						set({
							taskProgressError:
								error.message ||
								'Failed to fetch task progress',
							taskProgressLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch task progress'
						);
					}
				},

				getTaskProgressById: async (progressId) => {
					set({
						taskProgressLoading: true,
						taskProgressError: null,
					});
					try {
						const response =
							await salesApi.getTaskProgressById(
								progressId
							);
						set({
							selectedTaskProgress:
								response.data,
							taskProgressLoading:
								false,
						});
					} catch (error: any) {
						set({
							taskProgressError:
								error.message ||
								'Failed to fetch task progress',
							taskProgressLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch task progress'
						);
					}
				},

				updateTaskProgress: async (
					progressId,
					data
				) => {
					set({
						taskProgressLoading: true,
						taskProgressError: null,
					});
					try {
						const response =
							await salesApi.updateTaskProgress(
								progressId,
								data
							);
						set((state) => ({
							taskProgress:
								state.taskProgress.map(
									(
										progress
									) =>
										progress.id ===
										progressId
											? response.data
											: progress
								),
							selectedTaskProgress:
								state
									.selectedTaskProgress
									?.id ===
								progressId
									? response.data
									: state.selectedTaskProgress,
							taskProgressLoading:
								false,
						}));
						toast.success(
							'Task progress updated successfully'
						);
					} catch (error: any) {
						set({
							taskProgressError:
								error.message ||
								'Failed to update task progress',
							taskProgressLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to update task progress'
						);
					}
				},

				getClientTaskProgress: async (clientId) => {
					set({
						taskProgressLoading: true,
						taskProgressError: null,
					});
					try {
						const response =
							await salesApi.getClientTaskProgress(
								clientId
							);
						set({
							taskProgress:
								response.data
									.data ||
								response.data,
							taskProgressLoading:
								false,
						});
					} catch (error: any) {
						set({
							taskProgressError:
								error.message ||
								'Failed to fetch client task progress',
							taskProgressLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch client task progress'
						);
					}
				},

				setSelectedTaskProgress: (taskProgress) => {
					set({
						selectedTaskProgress:
							taskProgress,
					});
				},

				// ==================== CLIENT VISITS ACTIONS ====================

				createClientVisit: async (data) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await salesApi.createClientVisit(
								data
							);
						set((state) => ({
							clientVisits: [
								response.data,
								...state.clientVisits,
							],
							visitsLoading: false,
						}));
						toast.success(
							'Visit created successfully'
						);
					} catch (error: any) {
						set({
							visitsError:
								error.message ||
								'Failed to create visit',
							visitsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create visit'
						);
					}
				},

				updateClientVisit: async (visitId, data) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await salesApi.updateClientVisit(
								visitId,
								data
							);
						set((state) => ({
							clientVisits:
								state.clientVisits.map(
									(
										visit
									) =>
										visit.id ===
										visitId
											? response.data
											: visit
								),
							visitsLoading: false,
						}));
						toast.success(
							'Visit updated successfully'
						);
					} catch (error: any) {
						set({
							visitsError:
								error.message ||
								'Failed to update visit',
							visitsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to update visit'
						);
					}
				},

				deleteClientVisit: async (visitId) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						await salesApi.deleteClientVisit(
							visitId
						);
						set((state) => ({
							clientVisits:
								state.clientVisits.filter(
									(
										visit
									) =>
										visit.id !==
										visitId
								),
							visitsLoading: false,
						}));
						toast.success(
							'Visit deleted successfully'
						);
					} catch (error: any) {
						set({
							visitsError:
								error.message ||
								'Failed to delete visit',
							visitsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to delete visit'
						);
					}
				},

				getClientVisits: async (
					clientId,
					filters = {}
				) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await salesApi.getClientVisits(
								clientId,
								filters
							);
						set({
							clientVisits:
								response.data,
							visitsLoading: false,
						});
					} catch (error: any) {
						set({
							visitsError:
								error.message ||
								'Failed to fetch client visits',
							visitsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch client visits'
						);
					}
				},

				getUpcomingVisits: async (days = 7) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await salesApi.getUpcomingVisits(
								days
							);
						set({
							upcomingVisits:
								response.data,
							visitsLoading: false,
						});
					} catch (error: any) {
						set({
							visitsError:
								error.message ||
								'Failed to fetch upcoming visits',
							visitsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch upcoming visits'
						);
					}
				},

				getOverdueVisits: async () => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await salesApi.getOverdueVisits();
						set({
							overdueVisits:
								response.data,
							visitsLoading: false,
						});
					} catch (error: any) {
						set({
							visitsError:
								error.message ||
								'Failed to fetch overdue visits',
							visitsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch overdue visits'
						);
					}
				},

				// ==================== CLIENT INTERACTIONS ACTIONS ====================

				createClientInteraction: async (data) => {
					set({
						interactionsLoading: true,
						interactionsError: null,
					});
					try {
						const response =
							await salesApi.createClientInteraction(
								data
							);
						set((state) => ({
							clientInteractions: [
								response.data,
								...state.clientInteractions,
							],
							interactionsLoading:
								false,
						}));
						toast.success(
							'Interaction created successfully'
						);
					} catch (error: any) {
						set({
							interactionsError:
								error.message ||
								'Failed to create interaction',
							interactionsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to create interaction'
						);
					}
				},

				updateClientInteraction: async (
					interactionId,
					data
				) => {
					set({
						interactionsLoading: true,
						interactionsError: null,
					});
					try {
						const response =
							await salesApi.updateClientInteraction(
								interactionId,
								data
							);
						set((state) => ({
							clientInteractions:
								state.clientInteractions.map(
									(
										interaction
									) =>
										interaction.id ===
										interactionId
											? response.data
											: interaction
								),
							interactionsLoading:
								false,
						}));
						toast.success(
							'Interaction updated successfully'
						);
					} catch (error: any) {
						set({
							interactionsError:
								error.message ||
								'Failed to update interaction',
							interactionsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to update interaction'
						);
					}
				},

				deleteClientInteraction: async (
					interactionId
				) => {
					set({
						interactionsLoading: true,
						interactionsError: null,
					});
					try {
						await salesApi.deleteClientInteraction(
							interactionId
						);
						set((state) => ({
							clientInteractions:
								state.clientInteractions.filter(
									(
										interaction
									) =>
										interaction.id !==
										interactionId
								),
							interactionsLoading:
								false,
						}));
						toast.success(
							'Interaction deleted successfully'
						);
					} catch (error: any) {
						set({
							interactionsError:
								error.message ||
								'Failed to delete interaction',
							interactionsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to delete interaction'
						);
					}
				},

				getClientInteractions: async (
					clientId,
					filters = {}
				) => {
					set({
						interactionsLoading: true,
						interactionsError: null,
					});
					try {
						const response =
							await salesApi.getClientInteractions(
								clientId,
								filters
							);
						set({
							clientInteractions:
								response.data,
							interactionsLoading:
								false,
						});
					} catch (error: any) {
						set({
							interactionsError:
								error.message ||
								'Failed to fetch client interactions',
							interactionsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch client interactions'
						);
					}
				},

				// ==================== ANALYTICS ACTIONS ====================

				getSalesAnalytics: async (
					period = 'monthly'
				) => {
					set({
						analyticsLoading: true,
						analyticsError: null,
					});
					try {
						const response =
							await salesApi.getSalesAnalytics(
								period
							);
						set({
							salesAnalytics:
								response.data,
							analyticsLoading: false,
						});
					} catch (error: any) {
						set({
							analyticsError:
								error.message ||
								'Failed to fetch sales analytics',
							analyticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch sales analytics'
						);
					}
				},

				getSalesPerformance: async (
					salesmanId,
					period = 'monthly'
				) => {
					set({
						analyticsLoading: true,
						analyticsError: null,
					});
					try {
						const response =
							await salesApi.getSalesPerformance(
								salesmanId,
								period
							);
						set({
							salesPerformance:
								response.data,
							analyticsLoading: false,
						});
					} catch (error: any) {
						set({
							analyticsError:
								error.message ||
								'Failed to fetch sales performance',
							analyticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch sales performance'
						);
					}
				},

				getSalesDashboard: async () => {
					set({
						analyticsLoading: true,
						analyticsError: null,
					});
					try {
						const response =
							await salesApi.getSalesDashboard();
						set({
							salesDashboard:
								response.data,
							analyticsLoading: false,
						});
					} catch (error: any) {
						set({
							analyticsError:
								error.message ||
								'Failed to fetch sales dashboard',
							analyticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch sales dashboard'
						);
					}
				},

				getSalesTrends: async (period = 'monthly') => {
					set({
						analyticsLoading: true,
						analyticsError: null,
					});
					try {
						await salesApi.getSalesTrends(
							period
						);
						set({
							analyticsLoading: false,
						});
						// Handle trends data as needed
					} catch (error: any) {
						set({
							analyticsError:
								error.message ||
								'Failed to fetch sales trends',
							analyticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch sales trends'
						);
					}
				},

				// ==================== WEEKLY PLANS ACTIONS ====================

				createWeeklyPlan: async (data) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.createWeeklyPlan(
								data
							);
						set((state) => ({
							weeklyPlans: [
								response.data,
								...state.weeklyPlans,
							],
							currentWeeklyPlan:
								response.data,
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Weekly plan created successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to create weekly plan',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to create weekly plan'
						);
					}
				},

				getWeeklyPlans: async (
					page = 1,
					pageSize = 20
				) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.getWeeklyPlans(
								page,
								pageSize
							);
						set({
							weeklyPlans:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							weeklyPlansLoading:
								false,
						});
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to fetch weekly plans',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch weekly plans'
						);
					}
				},

				getWeeklyPlan: async (planId) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.getWeeklyPlan(
								planId
							);
						set({
							currentWeeklyPlan:
								response.data,
							weeklyPlansLoading:
								false,
						});
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to fetch weekly plan',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch weekly plan'
						);
					}
				},

				updateWeeklyPlan: async (planId, data) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.updateWeeklyPlan(
								planId,
								data
							);
						set((state) => ({
							weeklyPlans:
								state.weeklyPlans.map(
									(
										plan
									) =>
										plan.id ===
										planId
											? response.data
											: plan
								),
							currentWeeklyPlan:
								state
									.currentWeeklyPlan
									?.id ===
								planId
									? response.data
									: state.currentWeeklyPlan,
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Weekly plan updated successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to update weekly plan',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to update weekly plan'
						);
					}
				},

				submitWeeklyPlan: async (planId) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.submitWeeklyPlan(
								planId
							);
						set((state) => ({
							weeklyPlans:
								state.weeklyPlans.map(
									(
										plan
									) =>
										plan.id ===
										planId
											? response.data
											: plan
								),
							currentWeeklyPlan:
								state
									.currentWeeklyPlan
									?.id ===
								planId
									? response.data
									: state.currentWeeklyPlan,
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Weekly plan submitted successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to submit weekly plan',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to submit weekly plan'
						);
					}
				},

				reviewWeeklyPlan: async (planId, data) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.reviewWeeklyPlan(
								planId,
								data
							);
						set((state) => ({
							weeklyPlans:
								state.weeklyPlans.map(
									(
										plan
									) =>
										plan.id ===
										planId
											? response.data
											: plan
								),
							currentWeeklyPlan:
								state
									.currentWeeklyPlan
									?.id ===
								planId
									? response.data
									: state.currentWeeklyPlan,
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Weekly plan reviewed successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to review weekly plan',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to review weekly plan'
						);
					}
				},

				getCurrentWeeklyPlan: async () => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.getCurrentWeeklyPlan();
						set({
							currentWeeklyPlan:
								response.data,
							weeklyPlansLoading:
								false,
						});
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to fetch current weekly plan',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch current weekly plan'
						);
					}
				},

				createPlanItem: async (itemData) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.createPlanItem(
								itemData
							);
						set((state) => ({
							weeklyPlanItems: [
								...state.weeklyPlanItems,
								response.data,
							],
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Plan item created successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to create plan item',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to create plan item'
						);
					}
				},

				getPlanItems: async (planId) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.getPlanItems(
								planId
							);
						set({
							weeklyPlanItems:
								response.data,
							weeklyPlansLoading:
								false,
						});
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to fetch plan items',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch plan items'
						);
					}
				},

				updatePlanItem: async (
					itemId,
					weeklyPlanId,
					itemData
				) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.updatePlanItem(
								itemId,
								weeklyPlanId,
								itemData
							);
						set((state) => ({
							weeklyPlanItems:
								state.weeklyPlanItems.map(
									(
										item
									) =>
										item.id ===
										itemId
											? response.data
											: item
								),
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Plan item updated successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to update plan item',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to update plan item'
						);
					}
				},

				completePlanItem: async (
					itemId,
					weeklyPlanId,
					completionData
				) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.completePlanItem(
								itemId,
								weeklyPlanId,
								completionData
							);
						set((state) => ({
							weeklyPlanItems:
								state.weeklyPlanItems.map(
									(
										item
									) =>
										item.id ===
										itemId
											? response.data
											: item
								),
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Plan item completed successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to complete plan item',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to complete plan item'
						);
					}
				},

				cancelPlanItem: async (
					itemId,
					weeklyPlanId,
					reason
				) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.cancelPlanItem(
								itemId,
								weeklyPlanId,
								reason
							);
						set((state) => ({
							weeklyPlanItems:
								state.weeklyPlanItems.map(
									(
										item
									) =>
										item.id ===
										itemId
											? response.data
											: item
								),
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Plan item cancelled successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to cancel plan item',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to cancel plan item'
						);
					}
				},

				postponePlanItem: async (
					itemId,
					weeklyPlanId,
					newDate,
					reason
				) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.postponePlanItem(
								itemId,
								weeklyPlanId,
								newDate,
								reason
							);
						set((state) => ({
							weeklyPlanItems:
								state.weeklyPlanItems.map(
									(
										item
									) =>
										item.id ===
										itemId
											? response.data
											: item
								),
							weeklyPlansLoading:
								false,
						}));
						toast.success(
							'Plan item postponed successfully'
						);
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to postpone plan item',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to postpone plan item'
						);
					}
				},

				getOverdueItems: async () => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.getOverdueItems();
						set({
							overdueItems:
								response.data,
							weeklyPlansLoading:
								false,
						});
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to fetch overdue items',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch overdue items'
						);
					}
				},

				getUpcomingItems: async (days = 7) => {
					set({
						weeklyPlansLoading: true,
						weeklyPlansError: null,
					});
					try {
						const response =
							await salesApi.getUpcomingItems(
								days
							);
						set({
							upcomingItems:
								response.data,
							weeklyPlansLoading:
								false,
						});
					} catch (error: any) {
						set({
							weeklyPlansError:
								error.message ||
								'Failed to fetch upcoming items',
							weeklyPlansLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch upcoming items'
						);
					}
				},

				// ==================== REQUEST WORKFLOWS ACTIONS ====================

				createRequestWorkflow: async (data) => {
					set({
						requestWorkflowsLoading: true,
						requestWorkflowsError: null,
					});
					try {
						const response =
							await salesApi.createRequestWorkflow(
								data
							);
						set((state) => ({
							requestWorkflows: [
								response.data,
								...state.requestWorkflows,
							],
							requestWorkflowsLoading:
								false,
						}));
						toast.success(
							'Request workflow created successfully'
						);
					} catch (error: any) {
						set({
							requestWorkflowsError:
								error.message ||
								'Failed to create request workflow',
							requestWorkflowsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to create request workflow'
						);
					}
				},

				getMyRequests: async (filters = {}) => {
					set({
						requestWorkflowsLoading: true,
						requestWorkflowsError: null,
					});
					try {
						const response =
							await salesApi.getMyRequests(
								filters
							);
						set({
							myRequests:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							requestWorkflowsLoading:
								false,
						});
					} catch (error: any) {
						set({
							requestWorkflowsError:
								error.message ||
								'Failed to fetch my requests',
							requestWorkflowsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to fetch my requests'
						);
					}
				},

				getAssignedRequests: async (filters = {}) => {
					set({
						requestWorkflowsLoading: true,
						requestWorkflowsError: null,
					});
					try {
						const response =
							await salesApi.getAssignedRequests(
								filters
							);
						set({
							assignedRequests:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							requestWorkflowsLoading:
								false,
						});
					} catch (error: any) {
						set({
							assignedRequests: [],
							requestWorkflowsError:
								error.message ||
								'Failed to fetch assigned requests',
							requestWorkflowsLoading:
								false,
						});
						// Don't show toast for 404 errors
						if (
							error.response
								?.status !== 404
						) {
							toast.error(
								error.message ||
									'Failed to fetch assigned requests'
							);
						}
					}
				},

				updateRequestStatus: async (
					requestId,
					status,
					comment = ''
				) => {
					set({
						requestWorkflowsLoading: true,
						requestWorkflowsError: null,
					});
					try {
						const response =
							await salesApi.updateRequestStatus(
								requestId,
								status,
								comment
							);
						set((state) => ({
							requestWorkflows:
								state.requestWorkflows.map(
									(
										request
									) =>
										request.id ===
										requestId
											? response.data
											: request
								),
							myRequests: state.myRequests.map(
								(request) =>
									request.id ===
									requestId
										? response.data
										: request
							),
							assignedRequests:
								state.assignedRequests.map(
									(
										request
									) =>
										request.id ===
										requestId
											? response.data
											: request
								),
							requestWorkflowsLoading:
								false,
						}));
						toast.success(
							'Request status updated successfully'
						);
					} catch (error: any) {
						set({
							requestWorkflowsError:
								error.message ||
								'Failed to update request status',
							requestWorkflowsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to update request status'
						);
					}
				},

				assignRequest: async (
					requestId,
					assignToUserId
				) => {
					set({
						requestWorkflowsLoading: true,
						requestWorkflowsError: null,
					});
					try {
						const response =
							await salesApi.assignRequest(
								requestId,
								assignToUserId
							);
						set((state) => ({
							requestWorkflows:
								state.requestWorkflows.map(
									(
										request
									) =>
										request.id ===
										requestId
											? response.data
											: request
								),
							myRequests: state.myRequests.map(
								(request) =>
									request.id ===
									requestId
										? response.data
										: request
							),
							assignedRequests:
								state.assignedRequests.map(
									(
										request
									) =>
										request.id ===
										requestId
											? response.data
											: request
								),
							requestWorkflowsLoading:
								false,
						}));
						toast.success(
							'Request assigned successfully'
						);
					} catch (error: any) {
						set({
							requestWorkflowsError:
								error.message ||
								'Failed to assign request',
							requestWorkflowsLoading:
								false,
						});
						toast.error(
							error.message ||
								'Failed to assign request'
						);
					}
				},

				// ==================== DELIVERY & PAYMENT TERMS ACTIONS ====================

				createDeliveryTerms: async (termsData) => {
					set({
						termsLoading: true,
						termsError: null,
					});
					try {
						const response =
							await salesApi.createDeliveryTerms(
								termsData
							);
						set((state) => ({
							deliveryTerms: [
								response.data,
								...state.deliveryTerms,
							],
							termsLoading: false,
						}));
						toast.success(
							'Delivery terms created successfully'
						);
					} catch (error: any) {
						set({
							termsError:
								error.message ||
								'Failed to create delivery terms',
							termsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create delivery terms'
						);
					}
				},

				createPaymentTerms: async (termsData) => {
					set({
						termsLoading: true,
						termsError: null,
					});
					try {
						const response =
							await salesApi.createPaymentTerms(
								termsData
							);
						set((state) => ({
							paymentTerms: [
								response.data,
								...state.paymentTerms,
							],
							termsLoading: false,
						}));
						toast.success(
							'Payment terms created successfully'
						);
					} catch (error: any) {
						set({
							termsError:
								error.message ||
								'Failed to create payment terms',
							termsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create payment terms'
						);
					}
				},

				getDeliveryTerms: async (termsId) => {
					set({
						termsLoading: true,
						termsError: null,
					});
					try {
						await salesApi.getDeliveryTerms(
							termsId
						);
						set({
							termsLoading: false,
						});
						// Handle delivery terms data as needed
					} catch (error: any) {
						set({
							termsError:
								error.message ||
								'Failed to fetch delivery terms',
							termsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch delivery terms'
						);
					}
				},

				getPaymentTerms: async (termsId) => {
					set({
						termsLoading: true,
						termsError: null,
					});
					try {
						await salesApi.getPaymentTerms(
							termsId
						);
						set({
							termsLoading: false,
						});
						// Handle payment terms data as needed
					} catch (error: any) {
						set({
							termsError:
								error.message ||
								'Failed to fetch payment terms',
							termsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch payment terms'
						);
					}
				},

				// ==================== REPORTS ACTIONS ====================

				generateSalesReport: async (data) => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						const response =
							await salesApi.generateSalesReport(
								data
							);
						set((state) => ({
							salesReports: [
								response.data,
								...state.salesReports,
							],
							reportsLoading: false,
						}));
						toast.success(
							'Sales report generated successfully'
						);
					} catch (error: any) {
						set({
							reportsError:
								error.message ||
								'Failed to generate sales report',
							reportsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to generate sales report'
						);
					}
				},

				getSalesReports: async (filters = {}) => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						const response =
							await salesApi.getSalesReports(
								filters
							);
						set({
							salesReports:
								response.data
									.data ||
								[],
							pagination: {
								page:
									response
										.data
										.page ||
									1,
								pageSize:
									response
										.data
										.pageSize ||
									20,
								totalCount:
									response
										.data
										.totalCount ||
									0,
								totalPages:
									response
										.data
										.totalPages ||
									0,
								hasNextPage:
									response
										.data
										.hasNextPage ||
									false,
								hasPreviousPage:
									response
										.data
										.hasPreviousPage ||
									false,
							},
							reportsLoading: false,
						});
					} catch (error: any) {
						set({
							reportsError:
								error.message ||
								'Failed to fetch sales reports',
							reportsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch sales reports'
						);
					}
				},

				getSalesManagerDashboard: async () => {
					set({
						analyticsLoading: true,
						analyticsError: null,
					});
					try {
						const response =
							await salesApi.getSalesManagerDashboard();
						set({
							salesDashboard:
								response.data,
							analyticsLoading: false,
						});
					} catch (error: any) {
						set({
							analyticsError:
								error.message ||
								'Failed to fetch sales manager dashboard',
							analyticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch sales manager dashboard'
						);
					}
				},

				getSalesmanPerformance: async (
					salesmanId,
					period = 'monthly'
				) => {
					set({
						analyticsLoading: true,
						analyticsError: null,
					});
					try {
						const response =
							await salesApi.getSalesmanPerformance(
								salesmanId,
								period
							);
						set({
							salesPerformance: [
								response.data,
							],
							analyticsLoading: false,
						});
					} catch (error: any) {
						set({
							analyticsError:
								error.message ||
								'Failed to fetch salesman performance',
							analyticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch salesman performance'
						);
					}
				},

				getTopPerformers: async (limit = 10) => {
					set({
						analyticsLoading: true,
						analyticsError: null,
					});
					try {
						await salesApi.getTopPerformers(
							limit
						);
						set({
							analyticsLoading: false,
						});
						// Handle top performers data as needed
					} catch (error: any) {
						set({
							analyticsError:
								error.message ||
								'Failed to fetch top performers',
							analyticsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch top performers'
						);
					}
				},

				exportSalesData: async (options) => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						await salesApi.exportSalesData(
							options
						);
						// Handle export result
						set({
							reportsLoading: false,
						});
						toast.success(
							'Sales data exported successfully'
						);
					} catch (error: any) {
						set({
							reportsError:
								error.message ||
								'Failed to export sales data',
							reportsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to export sales data'
						);
					}
				},

				exportSalesReport: async (
					reportId,
					format = 'pdf'
				) => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						const blob =
							await salesApi.exportSalesReport(
								reportId,
								format as
									| 'pdf'
									| 'excel'
									| 'csv'
							);
						// Create download link
						const url =
							window.URL.createObjectURL(
								blob
							);
						const a =
							document.createElement(
								'a'
							);
						a.href = url;
						a.download = `sales-report-${reportId}.${format}`;
						document.body.appendChild(a);
						a.click();
						window.URL.revokeObjectURL(url);
						document.body.removeChild(a);
						set({
							reportsLoading: false,
						});
						toast.success(
							'Sales report exported successfully'
						);
					} catch (error: any) {
						set({
							reportsError:
								error.message ||
								'Failed to export sales report',
							reportsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to export sales report'
						);
					}
				},

				// ==================== UI ACTIONS ====================

				setSelectedTab: (tab) => {
					set({ selectedTab: tab });
				},

				setShowClientModal: (show) => {
					set({ showClientModal: show });
				},

				setShowVisitModal: (show) => {
					set({ showVisitModal: show });
				},

				setShowInteractionModal: (show) => {
					set({ showInteractionModal: show });
				},

				setShowWeeklyPlanModal: (show) => {
					set({ showWeeklyPlanModal: show });
				},

				setShowRequestWorkflowModal: (show) => {
					set({ showRequestWorkflowModal: show });
				},

				setShowReportModal: (show) => {
					set({ showReportModal: show });
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
						clientsError: null,
						visitsError: null,
						interactionsError: null,
						weeklyPlansError: null,
						requestWorkflowsError: null,
						termsError: null,
						analyticsError: null,
						reportsError: null,
					});
				},
			}),
			{
				name: 'sales-storage',
				partialize: (state) => ({
					selectedTab: state.selectedTab,
					filters: state.filters,
					pagination: state.pagination,
				}),
			}
		)
	)
);

// ==================== SELECTOR HOOKS ====================

// Client selectors
export const useClients = () => useSalesStore((state) => state.clients);
export const useSelectedClient = () =>
	useSalesStore((state) => state.selectedClient);
export const useClientSearchResults = () =>
	useSalesStore((state) => state.clientSearchResults);
export const useClientsLoading = () =>
	useSalesStore((state) => state.clientsLoading);
export const useClientsError = () =>
	useSalesStore((state) => state.clientsError);

// Visit selectors
export const useClientVisits = () =>
	useSalesStore((state) => state.clientVisits);
export const useUpcomingVisits = () =>
	useSalesStore((state) => state.upcomingVisits);
export const useOverdueVisits = () =>
	useSalesStore((state) => state.overdueVisits);
export const useVisitsLoading = () =>
	useSalesStore((state) => state.visitsLoading);
export const useVisitsError = () => useSalesStore((state) => state.visitsError);

// Interaction selectors
export const useClientInteractions = () =>
	useSalesStore((state) => state.clientInteractions);
export const useInteractionsLoading = () =>
	useSalesStore((state) => state.interactionsLoading);
export const useInteractionsError = () =>
	useSalesStore((state) => state.interactionsError);

// Weekly Plans selectors
export const useWeeklyPlans = () => useSalesStore((state) => state.weeklyPlans);
export const useCurrentWeeklyPlan = () =>
	useSalesStore((state) => state.currentWeeklyPlan);
export const useWeeklyPlanItems = () =>
	useSalesStore((state) => state.weeklyPlanItems);
export const useOverdueItems = () =>
	useSalesStore((state) => state.overdueItems);
export const useUpcomingItems = () =>
	useSalesStore((state) => state.upcomingItems);
export const useWeeklyPlansLoading = () =>
	useSalesStore((state) => state.weeklyPlansLoading);
export const useWeeklyPlansError = () =>
	useSalesStore((state) => state.weeklyPlansError);

// Request Workflows selectors
export const useRequestWorkflows = () =>
	useSalesStore((state) => state.requestWorkflows);
export const useMyRequests = () => useSalesStore((state) => state.myRequests);
export const useAssignedRequests = () =>
	useSalesStore((state) => state.assignedRequests);
export const useRequestWorkflowsLoading = () =>
	useSalesStore((state) => state.requestWorkflowsLoading);
export const useRequestWorkflowsError = () =>
	useSalesStore((state) => state.requestWorkflowsError);

// Delivery & Payment Terms selectors
export const useDeliveryTerms = () =>
	useSalesStore((state) => state.deliveryTerms);
export const usePaymentTerms = () =>
	useSalesStore((state) => state.paymentTerms);
export const useTermsLoading = () =>
	useSalesStore((state) => state.termsLoading);
export const useTermsError = () => useSalesStore((state) => state.termsError);

// Analytics selectors
export const useSalesAnalytics = () =>
	useSalesStore((state) => state.salesAnalytics);
export const useSalesPerformance = () =>
	useSalesStore((state) => state.salesPerformance);
export const useSalesDashboard = () =>
	useSalesStore((state) => state.salesDashboard);
export const useAnalyticsLoading = () =>
	useSalesStore((state) => state.analyticsLoading);
export const useAnalyticsError = () =>
	useSalesStore((state) => state.analyticsError);

// Reports selectors
export const useSalesReports = () =>
	useSalesStore((state) => state.salesReports);
export const useReportsLoading = () =>
	useSalesStore((state) => state.reportsLoading);
export const useReportsError = () =>
	useSalesStore((state) => state.reportsError);

// UI selectors
export const useSelectedTab = () => useSalesStore((state) => state.selectedTab);
export const useShowClientModal = () =>
	useSalesStore((state) => state.showClientModal);
export const useShowVisitModal = () =>
	useSalesStore((state) => state.showVisitModal);
export const useShowInteractionModal = () =>
	useSalesStore((state) => state.showInteractionModal);
export const useShowWeeklyPlanModal = () =>
	useSalesStore((state) => state.showWeeklyPlanModal);
export const useShowRequestWorkflowModal = () =>
	useSalesStore((state) => state.showRequestWorkflowModal);
export const useShowReportModal = () =>
	useSalesStore((state) => state.showReportModal);

// Deal selectors
export const useDeals = () => useSalesStore((state) => state.deals);
export const useSelectedDeal = () =>
	useSalesStore((state) => state.selectedDeal);
export const usePendingApprovals = () =>
	useSalesStore((state) => state.pendingApprovals);
export const useDealsLoading = () =>
	useSalesStore((state) => state.dealsLoading);
export const useDealsError = () => useSalesStore((state) => state.dealsError);

// Offer selectors
export const useOffers = () => useSalesStore((state) => state.offers);
export const useSelectedOffer = () =>
	useSalesStore((state) => state.selectedOffer);
export const useOffersByClient = () =>
	useSalesStore((state) => state.offersByClient);
export const useOffersLoading = () =>
	useSalesStore((state) => state.offersLoading);
export const useOffersError = () => useSalesStore((state) => state.offersError);

// Client profile selectors
export const useClientProfiles = () =>
	useSalesStore((state) => state.clientProfiles);
export const useClientProfileLoading = () =>
	useSalesStore((state) => state.clientProfileLoading);
export const useClientProfileError = () =>
	useSalesStore((state) => state.clientProfileError);

// Offer request selectors
export const useOfferRequests = () =>
	useSalesStore((state) => state.offerRequests);
export const useSelectedOfferRequest = () =>
	useSalesStore((state) => state.selectedOfferRequest);
export const useMyAssignedOffers = () =>
	useSalesStore((state) => state.myAssignedOffers);
export const useOfferRequestsLoading = () =>
	useSalesStore((state) => state.offerRequestsLoading);
export const useOfferRequestsError = () =>
	useSalesStore((state) => state.offerRequestsError);

// Task progress selectors
export const useTaskProgress = () =>
	useSalesStore((state) => state.taskProgress);
export const useSelectedTaskProgress = () =>
	useSalesStore((state) => state.selectedTaskProgress);
export const useTaskProgressLoading = () =>
	useSalesStore((state) => state.taskProgressLoading);
export const useTaskProgressError = () =>
	useSalesStore((state) => state.taskProgressError);

// Filter and pagination selectors
export const useSalesFilters = () => useSalesStore((state) => state.filters);
export const useSalesPagination = () =>
	useSalesStore((state) => state.pagination);
