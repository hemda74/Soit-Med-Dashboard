import { apiRequest } from '@/services/shared/apiClient';
import { getAuthToken } from '@/utils/authUtils';
import type { ApiResponse } from '@/services/shared/apiClient';

// Types
export interface Client {
	id: number;
	name: string;
	type?: string;
	specialization?: string;
	location?: string;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	governorate?: string;
	status?: string;
	priority?: string;
}

export interface Equipment {
	id: number;
	name: string;
	qrCode: string;
	description?: string;
	model?: string;
	manufacturer?: string;
	purchaseDate?: string;
	warrantyExpiry?: string;
	hospitalId?: string;
	hospitalName?: string;
	repairVisitCount?: number;
	status?: string;
	createdAt?: string;
	lastMaintenanceDate?: string;
	isActive?: boolean;
	qrToken?: string;
	isQrPrinted?: boolean;
}

export interface MaintenanceVisit {
	id: number;
	ticketNumber: string;
	maintenanceRequestId: number;
	customerId: string;
	deviceId: number;
	scheduledDate: string;
	visitDate: string;
	status: string;
	outcome: string;
	engineerId: string;
	engineerName?: string;
	report?: string;
	actionsTaken?: string;
	partsUsed?: string;
	serviceFee?: number;
	notes?: string;
	startedAt?: string;
	completedAt?: string;
}

export interface PaginatedClientsResponse {
	Clients: Client[]; // Backend returns uppercase
	TotalCount: number;
	PageNumber: number;
	PageSize: number;
	// Also support lowercase for compatibility
	clients?: Client[];
	totalCount?: number;
	pageNumber?: number;
	pageSize?: number;
}

export interface EquipmentResponse {
	clientId: number;
	equipmentCount: number;
	equipment: Equipment[];
}

export interface VisitsResponse {
	success: boolean;
	message: string;
	data: MaintenanceVisit[];
}

// API Functions
export const clientEquipmentApi = {
	/**
	 * Get all clients with pagination
	 */
	async getAllClients(pageNumber: number = 1, pageSize: number = 25): Promise<PaginatedClientsResponse> {
		const token = getAuthToken();
		try {
			const response = await apiRequest<ApiResponse<PaginatedClientsResponse>>(
				`/Client/all?pageNumber=${pageNumber}&pageSize=${pageSize}`,
				{
					method: 'GET',
				},
				token || undefined
			);
			
			// Backend returns { success: true, data: { Clients: [...], TotalCount: ..., ... } }
			const data = response.data;
			
			// Handle case where data might be null or undefined
			if (!data) {
				return {
					Clients: [],
					TotalCount: 0,
					PageNumber: pageNumber,
					PageSize: pageSize,
					clients: [],
					totalCount: 0,
					pageNumber: pageNumber,
					pageSize: pageSize,
				};
			}
			
			// Normalize to lowercase for frontend use
			const clients = data.Clients || data.clients || [];
			const totalCount = data.TotalCount ?? data.totalCount ?? 0;
			const respPageNumber = data.PageNumber ?? data.pageNumber ?? pageNumber;
			const respPageSize = data.PageSize ?? data.pageSize ?? pageSize;
			
			return {
				...data,
				Clients: clients,
				TotalCount: totalCount,
				PageNumber: respPageNumber,
				PageSize: respPageSize,
				clients: clients,
				totalCount: totalCount,
				pageNumber: respPageNumber,
				pageSize: respPageSize,
			};
		} catch (error) {
			console.error('Error fetching clients:', error);
			// Return empty response on error
			return {
				Clients: [],
				TotalCount: 0,
				PageNumber: pageNumber,
				PageSize: pageSize,
				clients: [],
				totalCount: 0,
				pageNumber: pageNumber,
				pageSize: pageSize,
			};
		}
	},

	/**
	 * Get all equipment for a client
	 */
	async getClientEquipment(clientId: number): Promise<EquipmentResponse> {
		const token = getAuthToken();
		const response = await apiRequest<EquipmentResponse>(
			`/Equipment/client/${clientId}`,
			{
				method: 'GET',
			},
			token || undefined
		);
		// Backend returns direct object, not wrapped
		return response;
	},

	/**
	 * Get all visits for an equipment
	 */
	async getEquipmentVisits(equipmentId: number): Promise<MaintenanceVisit[]> {
		const token = getAuthToken();
		const response = await apiRequest<ApiResponse<MaintenanceVisit[]>>(
			`/MaintenanceVisit/equipment/${equipmentId}`,
			{
				method: 'GET',
			},
			token || undefined
		);
		// Backend wraps in SuccessResponse which has data property
		return response.data || [];
	},
};

