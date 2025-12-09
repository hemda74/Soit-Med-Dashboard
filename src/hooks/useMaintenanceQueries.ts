// React Query hooks for Maintenance Module

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '@/services/maintenance';
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
} from '@/types/maintenance.types';
import toast from 'react-hot-toast';
import { getTranslation } from '@/utils/translations';

// Query keys
export const maintenanceQueryKeys = {
	all: ['maintenance'] as const,
	requests: () => [...maintenanceQueryKeys.all, 'requests'] as const,
	request: (id: number) => [...maintenanceQueryKeys.requests(), id] as const,
	customerRequests: () => [...maintenanceQueryKeys.requests(), 'customer'] as const,
	engineerRequests: () => [...maintenanceQueryKeys.requests(), 'engineer'] as const,
	pendingRequests: () => [...maintenanceQueryKeys.requests(), 'pending'] as const,
	visits: (requestId: number) => [...maintenanceQueryKeys.all, 'visits', requestId] as const,
	engineerVisits: (engineerId: string) => [...maintenanceQueryKeys.all, 'visits', 'engineer', engineerId] as const,
	attachments: (requestId: number) => [...maintenanceQueryKeys.all, 'attachments', requestId] as const,
	spareParts: () => [...maintenanceQueryKeys.all, 'spare-parts'] as const,
	sparePart: (id: number) => [...maintenanceQueryKeys.spareParts(), id] as const,
};

// Get maintenance request by ID
export const useMaintenanceRequest = (id: number) => {
	return useQuery({
		queryKey: maintenanceQueryKeys.request(id),
		queryFn: async () => {
			const response = await maintenanceApi.getMaintenanceRequest(id);
			return response.data;
		},
		enabled: !!id,
	});
};

// Get customer requests
export const useCustomerRequests = () => {
	return useQuery({
		queryKey: maintenanceQueryKeys.customerRequests(),
		queryFn: async () => {
			const response = await maintenanceApi.getCustomerRequests();
			return response.data;
		},
	});
};

// Get engineer assigned requests
export const useEngineerRequests = () => {
	return useQuery({
		queryKey: maintenanceQueryKeys.engineerRequests(),
		queryFn: async () => {
			const response = await maintenanceApi.getEngineerRequests();
			return response.data;
		},
	});
};

// Get pending requests (for Maintenance Support)
export const usePendingRequests = () => {
	return useQuery({
		queryKey: maintenanceQueryKeys.pendingRequests(),
		queryFn: async () => {
			const response = await maintenanceApi.getPendingRequests();
			return response.data;
		},
		refetchInterval: 30000, // Refetch every 30 seconds
	});
};

// Get visits by request
export const useVisitsByRequest = (requestId: number) => {
	return useQuery({
		queryKey: maintenanceQueryKeys.visits(requestId),
		queryFn: async () => {
			const response = await maintenanceApi.getVisitsByRequest(requestId);
			return response.data;
		},
		enabled: !!requestId,
	});
};

// Get visits by engineer
export const useVisitsByEngineer = (engineerId: string) => {
	return useQuery({
		queryKey: maintenanceQueryKeys.engineerVisits(engineerId),
		queryFn: async () => {
			const response = await maintenanceApi.getVisitsByEngineer(engineerId);
			return response.data;
		},
		enabled: !!engineerId,
	});
};

// Get attachments by request
export const useAttachmentsByRequest = (requestId: number) => {
	return useQuery({
		queryKey: maintenanceQueryKeys.attachments(requestId),
		queryFn: async () => {
			const response = await maintenanceApi.getAttachmentsByRequest(requestId);
			return response.data;
		},
		enabled: !!requestId,
	});
};

// Create maintenance request mutation
export const useCreateMaintenanceRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateMaintenanceRequestDTO) => {
			const response = await maintenanceApi.createMaintenanceRequest(data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.customerRequests() });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.pendingRequests() });
			toast.success(getTranslation('maintenanceRequestCreatedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to create maintenance request');
		},
	});
};

// Assign to engineer mutation
export const useAssignToEngineer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ requestId, data }: { requestId: number; data: AssignMaintenanceRequestDTO }) => {
			const response = await maintenanceApi.assignToEngineer(requestId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.request(variables.requestId) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.pendingRequests() });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.engineerRequests() });
			toast.success(getTranslation('requestAssignedToEngineerSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to assign request');
		},
	});
};

// Create maintenance visit mutation
export const useCreateMaintenanceVisit = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateMaintenanceVisitDTO) => {
			const response = await maintenanceApi.createMaintenanceVisit(data);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.visits(data.maintenanceRequestId) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.request(data.maintenanceRequestId) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.engineerRequests() });
			toast.success(getTranslation('maintenanceVisitCreatedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to create maintenance visit');
		},
	});
};

// Create spare part request mutation
export const useCreateSparePartRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateSparePartRequestDTO) => {
			const response = await maintenanceApi.createSparePartRequest(data);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.sparePart(data.id) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.request(data.maintenanceRequestId) });
			toast.success(getTranslation('sparePartRequestCreatedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to create spare part request');
		},
	});
};

// Set spare part price mutation
export const useSetSparePartPrice = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: UpdateSparePartPriceDTO }) => {
			const response = await maintenanceApi.setSparePartPrice(id, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.sparePart(variables.id) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.request(data.maintenanceRequestId) });
			toast.success(getTranslation('sparePartPriceSetSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to set spare part price');
		},
	});
};

// Customer spare part decision mutation
export const useCustomerSparePartDecision = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: CustomerSparePartDecisionDTO }) => {
			const response = await maintenanceApi.customerSparePartDecision(id, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.sparePart(variables.id) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.request(data.maintenanceRequestId) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.customerRequests() });
			toast.success(data.customerApproved ? 'Spare part approved' : 'Spare part rejected');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to process decision');
		},
	});
};

// Update maintenance request status mutation
export const useUpdateMaintenanceRequestStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ requestId, data }: { requestId: number; data: UpdateMaintenanceRequestStatusDTO }) => {
			const response = await maintenanceApi.updateStatus(requestId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.request(variables.requestId) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.pendingRequests() });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.engineerRequests() });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.customerRequests() });
			toast.success(getTranslation('statusUpdatedSuccessfully'));
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to update status');
		},
	});
};

// Cancel maintenance request mutation
export const useCancelMaintenanceRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ requestId, data }: { requestId: number; data: CancelMaintenanceRequestDTO }) => {
			const response = await maintenanceApi.cancelRequest(requestId, data);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.request(variables.requestId) });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.pendingRequests() });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.engineerRequests() });
			queryClient.invalidateQueries({ queryKey: maintenanceQueryKeys.customerRequests() });
			toast.success('Request cancelled successfully');
		},
		onError: (error: any) => {
			toast.error(error.message || 'Failed to cancel request');
		},
	});
};

