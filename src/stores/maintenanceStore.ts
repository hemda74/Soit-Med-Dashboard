// Maintenance Store - Zustand store for maintenance module state management

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { maintenanceApi } from '@/services/maintenance/maintenanceApi';
import type {
	MaintenanceRequestResponseDTO,
	CreateMaintenanceRequestDTO,
	AssignMaintenanceRequestDTO,
	UpdateMaintenanceRequestStatusDTO,
	CancelMaintenanceRequestDTO,
	MaintenanceVisitResponseDTO,
	CreateMaintenanceVisitDTO,
	SparePartRequestResponseDTO,
	CreateSparePartRequestDTO,
	UpdateSparePartPriceDTO,
	CustomerSparePartDecisionDTO,
	MaintenanceRequestAttachmentResponseDTO,
	CreateMaintenanceRequestAttachmentDTO,
	MaintenanceRequestStatus,
} from '@/types/maintenance.types';
import toast from 'react-hot-toast';

// ==================== INTERFACES ====================

export interface MaintenanceState {
	// Maintenance Requests state
	requests: MaintenanceRequestResponseDTO[];
	selectedRequest: MaintenanceRequestResponseDTO | null;
	customerRequests: MaintenanceRequestResponseDTO[];
	engineerRequests: MaintenanceRequestResponseDTO[];
	pendingRequests: MaintenanceRequestResponseDTO[];
	requestsLoading: boolean;
	requestsError: string | null;

	// Maintenance Visits state
	visits: MaintenanceVisitResponseDTO[];
	visitsByRequest: Record<number, MaintenanceVisitResponseDTO[]>;
	visitsByEngineer: Record<string, MaintenanceVisitResponseDTO[]>;
	selectedVisit: MaintenanceVisitResponseDTO | null;
	visitsLoading: boolean;
	visitsError: string | null;

	// Spare Part Requests state
	sparePartRequests: SparePartRequestResponseDTO[];
	selectedSparePartRequest: SparePartRequestResponseDTO | null;
	sparePartRequestsLoading: boolean;
	sparePartRequestsError: string | null;

	// Attachments state
	attachments: Record<number, MaintenanceRequestAttachmentResponseDTO[]>;
	attachmentsLoading: boolean;
	attachmentsError: string | null;

	// Filters state
	filters: {
		status?: MaintenanceRequestStatus;
		engineerId?: string;
		customerId?: string;
		equipmentId?: number;
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
	selectedTab: 'requests' | 'visits' | 'spareParts';
	showRequestModal: boolean;
	showVisitModal: boolean;
	showSparePartModal: boolean;
}

export interface MaintenanceActions {
	// Maintenance Request actions
	createMaintenanceRequest: (
		data: CreateMaintenanceRequestDTO
	) => Promise<void>;
	getMaintenanceRequest: (id: number) => Promise<void>;
	getCustomerRequests: () => Promise<void>;
	getEngineerRequests: () => Promise<void>;
	getPendingRequests: () => Promise<void>;
	assignToEngineer: (
		requestId: number,
		data: AssignMaintenanceRequestDTO
	) => Promise<void>;
	updateRequestStatus: (
		requestId: number,
		data: UpdateMaintenanceRequestStatusDTO
	) => Promise<void>;
	cancelRequest: (
		requestId: number,
		data: CancelMaintenanceRequestDTO
	) => Promise<void>;
	setSelectedRequest: (
		request: MaintenanceRequestResponseDTO | null
	) => void;

	// Maintenance Visit actions
	createMaintenanceVisit: (data: CreateMaintenanceVisitDTO) => Promise<void>;
	getVisitsByRequest: (requestId: number) => Promise<void>;
	getVisitsByEngineer: (engineerId: string) => Promise<void>;
	setSelectedVisit: (visit: MaintenanceVisitResponseDTO | null) => void;

	// Spare Part Request actions
	createSparePartRequest: (
		data: CreateSparePartRequestDTO
	) => Promise<void>;
	getSparePartRequest: (id: number) => Promise<void>;
	checkSparePartAvailability: (
		id: number,
		isLocalAvailable: boolean
	) => Promise<void>;
	setSparePartPrice: (
		id: number,
		data: UpdateSparePartPriceDTO
	) => Promise<void>;
	customerSparePartDecision: (
		id: number,
		data: CustomerSparePartDecisionDTO
	) => Promise<void>;
	setSelectedSparePartRequest: (
		request: SparePartRequestResponseDTO | null
	) => void;

	// Attachment actions
	uploadAttachment: (
		data: CreateMaintenanceRequestAttachmentDTO
	) => Promise<void>;
	getAttachmentsByRequest: (requestId: number) => Promise<void>;
	deleteAttachment: (id: number) => Promise<void>;

	// UI actions
	setSelectedTab: (
		tab: 'requests' | 'visits' | 'spareParts'
	) => void;
	setShowRequestModal: (show: boolean) => void;
	setShowVisitModal: (show: boolean) => void;
	setShowSparePartModal: (show: boolean) => void;
	setFilters: (filters: Partial<MaintenanceState['filters']>) => void;
	setPagination: (
		pagination: Partial<MaintenanceState['pagination']>
	) => void;

	// Error handling
	clearError: (
		type: 'requests' | 'visits' | 'spareParts' | 'attachments'
	) => void;
	clearAllErrors: () => void;
}

export type MaintenanceStore = MaintenanceState & MaintenanceActions;

// ==================== INITIAL STATE ====================

const initialState: MaintenanceState = {
	// Maintenance Requests state
	requests: [],
	selectedRequest: null,
	customerRequests: [],
	engineerRequests: [],
	pendingRequests: [],
	requestsLoading: false,
	requestsError: null,

	// Maintenance Visits state
	visits: [],
	visitsByRequest: {},
	visitsByEngineer: {},
	selectedVisit: null,
	visitsLoading: false,
	visitsError: null,

	// Spare Part Requests state
	sparePartRequests: [],
	selectedSparePartRequest: null,
	sparePartRequestsLoading: false,
	sparePartRequestsError: null,

	// Attachments state
	attachments: {},
	attachmentsLoading: false,
	attachmentsError: null,

	// Filters state
	filters: {},

	// Pagination state
	pagination: {
		page: 1,
		pageSize: 20,
		totalCount: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	},

	// UI state
	selectedTab: 'requests',
	showRequestModal: false,
	showVisitModal: false,
	showSparePartModal: false,
};

// ==================== STORE IMPLEMENTATION ====================

export const useMaintenanceStore = create<MaintenanceStore>()(
	subscribeWithSelector(
		persist(
			(set, get) => ({
				...initialState,

				// ==================== MAINTENANCE REQUEST ACTIONS ====================

				createMaintenanceRequest: async (data) => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.createMaintenanceRequest(
								data
							);
						set((state) => ({
							requests: [
								response.data,
								...state.requests,
							],
							customerRequests: [
								response.data,
								...state.customerRequests,
							],
							requestsLoading: false,
						}));
						toast.success(
							'Maintenance request created successfully'
						);
					} catch (error: any) {
						set({
							requestsError:
								error.message ||
								'Failed to create maintenance request',
							requestsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create maintenance request'
						);
					}
				},

				getMaintenanceRequest: async (id) => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.getMaintenanceRequest(
								id
							);
						set({
							selectedRequest: response.data,
							requestsLoading: false,
						});
					} catch (error: any) {
						set({
							requestsError:
								error.message ||
								'Failed to fetch maintenance request',
							requestsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch maintenance request'
						);
					}
				},

				getCustomerRequests: async () => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.getCustomerRequests();
						set({
							customerRequests: response.data || [],
							requests: response.data || [],
							requestsLoading: false,
						});
					} catch (error: any) {
						set({
							customerRequests: [],
							requestsError:
								error.message ||
								'Failed to fetch customer requests',
							requestsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch customer requests'
							);
						}
					}
				},

				getEngineerRequests: async () => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.getEngineerRequests();
						set({
							engineerRequests: response.data || [],
							requests: response.data || [],
							requestsLoading: false,
						});
					} catch (error: any) {
						set({
							engineerRequests: [],
							requestsError:
								error.message ||
								'Failed to fetch engineer requests',
							requestsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch engineer requests'
							);
						}
					}
				},

				getPendingRequests: async () => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.getPendingRequests();
						set({
							pendingRequests: response.data || [],
							requests: response.data || [],
							requestsLoading: false,
						});
					} catch (error: any) {
						set({
							pendingRequests: [],
							requestsError:
								error.message ||
								'Failed to fetch pending requests',
							requestsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch pending requests'
							);
						}
					}
				},

				assignToEngineer: async (requestId, data) => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.assignToEngineer(
								requestId,
								data
							);
						set((state) => ({
							requests: state.requests.map((req) =>
								req.id === requestId
									? response.data
									: req
							),
							pendingRequests: state.pendingRequests.filter(
								(req) => req.id !== requestId
							),
							selectedRequest:
								state.selectedRequest?.id === requestId
									? response.data
									: state.selectedRequest,
							requestsLoading: false,
						}));
						toast.success(
							'Request assigned to engineer successfully'
						);
					} catch (error: any) {
						set({
							requestsError:
								error.message ||
								'Failed to assign request to engineer',
							requestsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to assign request to engineer'
						);
					}
				},

				updateRequestStatus: async (requestId, data) => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.updateStatus(
								requestId,
								data
							);
						set((state) => ({
							requests: state.requests.map((req) =>
								req.id === requestId
									? response.data
									: req
							),
							selectedRequest:
								state.selectedRequest?.id === requestId
									? response.data
									: state.selectedRequest,
							requestsLoading: false,
						}));
						toast.success('Request status updated successfully');
					} catch (error: any) {
						set({
							requestsError:
								error.message ||
								'Failed to update request status',
							requestsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to update request status'
						);
					}
				},

				cancelRequest: async (requestId, data) => {
					set({
						requestsLoading: true,
						requestsError: null,
					});
					try {
						const response =
							await maintenanceApi.cancelRequest(
								requestId,
								data
							);
						set((state) => ({
							requests: state.requests.map((req) =>
								req.id === requestId
									? response.data
									: req
							),
							selectedRequest:
								state.selectedRequest?.id === requestId
									? response.data
									: state.selectedRequest,
							requestsLoading: false,
						}));
						toast.success('Request cancelled successfully');
					} catch (error: any) {
						set({
							requestsError:
								error.message ||
								'Failed to cancel request',
							requestsLoading: false,
						});
						toast.error(
							error.message || 'Failed to cancel request'
						);
					}
				},

				setSelectedRequest: (request) => {
					set({ selectedRequest: request });
				},

				// ==================== MAINTENANCE VISIT ACTIONS ====================

				createMaintenanceVisit: async (data) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await maintenanceApi.createMaintenanceVisit(
								data
							);
						set((state) => ({
							visits: [response.data, ...state.visits],
							visitsByRequest: {
								...state.visitsByRequest,
								[data.maintenanceRequestId]: [
									response.data,
									...(state.visitsByRequest[
										data.maintenanceRequestId
									] || []),
								],
							},
							visitsLoading: false,
						}));
						toast.success('Maintenance visit created successfully');
					} catch (error: any) {
						set({
							visitsError:
								error.message ||
								'Failed to create maintenance visit',
							visitsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create maintenance visit'
						);
					}
				},

				getVisitsByRequest: async (requestId) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await maintenanceApi.getVisitsByRequest(
								requestId
							);
						set((state) => ({
							visitsByRequest: {
								...state.visitsByRequest,
								[requestId]: response.data || [],
							},
							visitsLoading: false,
						}));
					} catch (error: any) {
						set({
							visitsByRequest: {
								...get().visitsByRequest,
								[requestId]: [],
							},
							visitsError:
								error.message ||
								'Failed to fetch visits',
							visitsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message || 'Failed to fetch visits'
							);
						}
					}
				},

				getVisitsByEngineer: async (engineerId) => {
					set({
						visitsLoading: true,
						visitsError: null,
					});
					try {
						const response =
							await maintenanceApi.getVisitsByEngineer(
								engineerId
							);
						set((state) => ({
							visitsByEngineer: {
								...state.visitsByEngineer,
								[engineerId]: response.data || [],
							},
							visits: response.data || [],
							visitsLoading: false,
						}));
					} catch (error: any) {
						set({
							visitsByEngineer: {
								...get().visitsByEngineer,
								[engineerId]: [],
							},
							visitsError:
								error.message ||
								'Failed to fetch engineer visits',
							visitsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch engineer visits'
							);
						}
					}
				},

				setSelectedVisit: (visit) => {
					set({ selectedVisit: visit });
				},

				// ==================== SPARE PART REQUEST ACTIONS ====================

				createSparePartRequest: async (data) => {
					set({
						sparePartRequestsLoading: true,
						sparePartRequestsError: null,
					});
					try {
						const response =
							await maintenanceApi.createSparePartRequest(
								data
							);
						set((state) => ({
							sparePartRequests: [
								response.data,
								...state.sparePartRequests,
							],
							sparePartRequestsLoading: false,
						}));
						toast.success(
							'Spare part request created successfully'
						);
					} catch (error: any) {
						set({
							sparePartRequestsError:
								error.message ||
								'Failed to create spare part request',
							sparePartRequestsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to create spare part request'
						);
					}
				},

				getSparePartRequest: async (id) => {
					set({
						sparePartRequestsLoading: true,
						sparePartRequestsError: null,
					});
					try {
						const response =
							await maintenanceApi.getSparePartRequest(
								id
							);
						set({
							selectedSparePartRequest: response.data,
							sparePartRequestsLoading: false,
						});
					} catch (error: any) {
						set({
							sparePartRequestsError:
								error.message ||
								'Failed to fetch spare part request',
							sparePartRequestsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to fetch spare part request'
						);
					}
				},

				checkSparePartAvailability: async (id, isLocalAvailable) => {
					set({
						sparePartRequestsLoading: true,
						sparePartRequestsError: null,
					});
					try {
						const response =
							await maintenanceApi.checkSparePartAvailability(
								id,
								isLocalAvailable
							);
						set((state) => ({
							sparePartRequests: state.sparePartRequests.map(
								(req) =>
									req.id === id ? response.data : req
							),
							selectedSparePartRequest:
								state.selectedSparePartRequest?.id === id
									? response.data
									: state.selectedSparePartRequest,
							sparePartRequestsLoading: false,
						}));
						toast.success('Availability updated successfully');
					} catch (error: any) {
						set({
							sparePartRequestsError:
								error.message ||
								'Failed to update availability',
							sparePartRequestsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to update availability'
						);
					}
				},

				setSparePartPrice: async (id, data) => {
					set({
						sparePartRequestsLoading: true,
						sparePartRequestsError: null,
					});
					try {
						const response =
							await maintenanceApi.setSparePartPrice(
								id,
								data
							);
						set((state) => ({
							sparePartRequests: state.sparePartRequests.map(
								(req) =>
									req.id === id ? response.data : req
							),
							selectedSparePartRequest:
								state.selectedSparePartRequest?.id === id
									? response.data
									: state.selectedSparePartRequest,
							sparePartRequestsLoading: false,
						}));
						toast.success('Price set successfully');
					} catch (error: any) {
						set({
							sparePartRequestsError:
								error.message || 'Failed to set price',
							sparePartRequestsLoading: false,
						});
						toast.error(
							error.message || 'Failed to set price'
						);
					}
				},

				customerSparePartDecision: async (id, data) => {
					set({
						sparePartRequestsLoading: true,
						sparePartRequestsError: null,
					});
					try {
						const response =
							await maintenanceApi.customerSparePartDecision(
								id,
								data
							);
						set((state) => ({
							sparePartRequests: state.sparePartRequests.map(
								(req) =>
									req.id === id ? response.data : req
							),
							selectedSparePartRequest:
								state.selectedSparePartRequest?.id === id
									? response.data
									: state.selectedSparePartRequest,
							sparePartRequestsLoading: false,
						}));
						toast.success('Decision recorded successfully');
					} catch (error: any) {
						set({
							sparePartRequestsError:
								error.message ||
								'Failed to record decision',
							sparePartRequestsLoading: false,
						});
						toast.error(
							error.message || 'Failed to record decision'
						);
					}
				},

				setSelectedSparePartRequest: (request) => {
					set({ selectedSparePartRequest: request });
				},

				// ==================== ATTACHMENT ACTIONS ====================

				uploadAttachment: async (data) => {
					set({
						attachmentsLoading: true,
						attachmentsError: null,
					});
					try {
						const response =
							await maintenanceApi.uploadAttachment(
								data
							);
						set((state) => ({
							attachments: {
								...state.attachments,
								[data.maintenanceRequestId]: [
									...(state.attachments[
										data.maintenanceRequestId
									] || []),
									response.data,
								],
							},
							attachmentsLoading: false,
						}));
						toast.success('Attachment uploaded successfully');
					} catch (error: any) {
						set({
							attachmentsError:
								error.message ||
								'Failed to upload attachment',
							attachmentsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to upload attachment'
						);
					}
				},

				getAttachmentsByRequest: async (requestId) => {
					set({
						attachmentsLoading: true,
						attachmentsError: null,
					});
					try {
						const response =
							await maintenanceApi.getAttachmentsByRequest(
								requestId
							);
						set((state) => ({
							attachments: {
								...state.attachments,
								[requestId]: response.data || [],
							},
							attachmentsLoading: false,
						}));
					} catch (error: any) {
						set({
							attachments: {
								...get().attachments,
								[requestId]: [],
							},
							attachmentsError:
								error.message ||
								'Failed to fetch attachments',
							attachmentsLoading: false,
						});
						if (error.response?.status !== 404) {
							toast.error(
								error.message ||
									'Failed to fetch attachments'
							);
						}
					}
				},

				deleteAttachment: async (id) => {
					set({
						attachmentsLoading: true,
						attachmentsError: null,
					});
					try {
						await maintenanceApi.deleteAttachment(id);
						set((state) => {
							const newAttachments = { ...state.attachments };
							for (const requestId in newAttachments) {
								newAttachments[requestId] =
									newAttachments[requestId].filter(
										(att) => att.id !== id
									);
							}
							return {
								attachments: newAttachments,
								attachmentsLoading: false,
							};
						});
						toast.success('Attachment deleted successfully');
					} catch (error: any) {
						set({
							attachmentsError:
								error.message ||
								'Failed to delete attachment',
							attachmentsLoading: false,
						});
						toast.error(
							error.message ||
								'Failed to delete attachment'
						);
					}
				},

				// ==================== UI ACTIONS ====================

				setSelectedTab: (tab) => {
					set({ selectedTab: tab });
				},

				setShowRequestModal: (show) => {
					set({ showRequestModal: show });
				},

				setShowVisitModal: (show) => {
					set({ showVisitModal: show });
				},

				setShowSparePartModal: (show) => {
					set({ showSparePartModal: show });
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
						requestsError: null,
						visitsError: null,
						sparePartRequestsError: null,
						attachmentsError: null,
					});
				},
			}),
			{
				name: 'maintenance-storage',
				partialize: (state) => ({
					selectedTab: state.selectedTab,
					filters: state.filters,
					pagination: state.pagination,
				}),
			}
		)
	)
);


