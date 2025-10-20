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
	SalesAnalytics,
	SalesPerformanceMetrics,
	SalesDashboardData,
	SalesReport,
	CreateSalesReportDto,
} from '@/types/sales.types';
import toast from 'react-hot-toast';

// ==================== INTERFACES ====================

export interface SalesState {
	// Client state
	clients: Client[];
	selectedClient: Client | null;
	clientSearchResults: ClientSearchResult | null;
	clientsLoading: boolean;
	clientsError: string | null;

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
		| 'analytics'
		| 'reports';
	showClientModal: boolean;
	showVisitModal: boolean;
	showInteractionModal: boolean;
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
	getSalesReports: () => Promise<void>;
	exportSalesData: (options: any) => Promise<void>;
	exportSalesReport: (reportId: string, format?: string) => Promise<void>;

	// UI actions
	setSelectedTab: (
		tab:
			| 'clients'
			| 'visits'
			| 'interactions'
			| 'analytics'
			| 'reports'
	) => void;
	setShowClientModal: (show: boolean) => void;
	setShowVisitModal: (show: boolean) => void;
	setShowInteractionModal: (show: boolean) => void;
	setShowReportModal: (show: boolean) => void;
	setFilters: (filters: Partial<ClientSearchFilters>) => void;
	setPagination: (pagination: Partial<SalesState['pagination']>) => void;

	// Error handling
	clearError: (
		type:
			| 'clients'
			| 'visits'
			| 'interactions'
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
							clientsError:
								error.message ||
								'Failed to fetch my clients',
							clientsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch my clients'
						);
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

				getSalesReports: async () => {
					set({
						reportsLoading: true,
						reportsError: null,
					});
					try {
						// This would need to be implemented in the API
						set({
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
export const useShowReportModal = () =>
	useSalesStore((state) => state.showReportModal);

// Filter and pagination selectors
export const useSalesFilters = () => useSalesStore((state) => state.filters);
export const useSalesPagination = () =>
	useSalesStore((state) => state.pagination);
