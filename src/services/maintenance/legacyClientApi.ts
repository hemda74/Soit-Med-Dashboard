import { apiRequest } from '@/services/shared/apiClient';
import { getAuthToken } from '@/utils/authUtils';

// Types matching the TBS Legacy API DTOs
export interface LegacyClient {
	clientId: number;
	clientName: string;
	address?: string;
	phone?: string;
	machineCount: number;
	contractCount: number;
}

export interface LegacyClientSearchResponse {
	clients: LegacyClient[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export interface LegacyMachine {
	machineId: number;
	serialNumber: string;
	devicePlace?: string;
	modelName?: string;
	modelNameEn?: string;
	itemCode?: string;
	expirationDate?: string;
	visitCount: number;
	warrantyStatus?: string;
}

export interface LegacyCustomerMachines {
	customerId: number;
	customerName: string;
	customerAddress?: string;
	customerPhone?: string;
	machineCount: number;
	machines: LegacyMachine[];
}

export interface LegacyVisit {
	visitId: number;
	contractId?: number;
	customerId: number;
	customerName?: string;
	visitDate?: string;
	effectiveDate?: string;
	employeeCode?: number;
	visitTypeId: number;
	visitTypeName?: string;
	defectDescription?: string;
	notes?: string;
	isCancelled?: boolean;
	visitValue: number;
	billValue: number;
	reportDescription?: string;
	isApproved?: boolean;
	reportDate?: string;
	visitStatusId?: number;
	visitStatusName?: string;
}

export interface LegacyClientInfo {
	clientId: number;
	name: string;
	address?: string;
	phone?: string;
}

export interface LegacyVisitHistory {
	visitId: number;
	date?: string;
	type?: string;
	engineerCode?: number;
	reportSummary?: string;
	status?: string;
}

export interface LegacyMachineHistory {
	machineId: number;
	serialNumber: string;
	model?: string;
	modelEn?: string;
	devicePlace?: string;
	expirationDate?: string;
	warrantyStatus?: string;
	currentClient?: LegacyClientInfo;
	visitsHistory: LegacyVisitHistory[];
	totalVisits: number;
	lastVisitDate?: string;
}

// API Functions for TBS Legacy Database
export const legacyClientApi = {
	/**
	 * Get all clients from TBS database with pagination
	 */
	async getAllClients(pageNumber: number = 1, pageSize: number = 25): Promise<LegacyClientSearchResponse> {
		const token = getAuthToken();
		try {
			const response = await apiRequest<LegacyClientSearchResponse>(
				`/LegacyClient/clients?pageNumber=${pageNumber}&pageSize=${pageSize}`,
				{ method: 'GET' },
				token || undefined
			);
			return response;
		} catch (error) {
			console.error('Error fetching legacy clients:', error);
			return {
				clients: [],
				totalCount: 0,
				pageNumber,
				pageSize,
				totalPages: 0,
				hasPreviousPage: false,
				hasNextPage: false,
			};
		}
	},

	/**
	 * Search clients by name in TBS database
	 */
	async searchClients(searchTerm: string, pageNumber: number = 1, pageSize: number = 20): Promise<LegacyClientSearchResponse> {
		const token = getAuthToken();
		try {
			const response = await apiRequest<LegacyClientSearchResponse>(
				`/LegacyClient/clients/search?searchTerm=${encodeURIComponent(searchTerm)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
				{ method: 'GET' },
				token || undefined
			);
			return response;
		} catch (error) {
			console.error('Error searching legacy clients:', error);
			return {
				clients: [],
				totalCount: 0,
				pageNumber,
				pageSize,
				totalPages: 0,
				hasPreviousPage: false,
				hasNextPage: false,
			};
		}
	},

	/**
	 * Get all machines for a customer from TBS database
	 */
	async getCustomerMachines(customerId: number): Promise<LegacyCustomerMachines | null> {
		const token = getAuthToken();
		try {
			const response = await apiRequest<LegacyCustomerMachines>(
				`/LegacyClient/customers/${customerId}/machines`,
				{ method: 'GET' },
				token || undefined
			);
			return response;
		} catch (error) {
			console.error('Error fetching customer machines:', error);
			return null;
		}
	},

	/**
	 * Get all visits for a machine from TBS database
	 */
	async getMachineVisits(machineId: number): Promise<LegacyVisit[]> {
		const token = getAuthToken();
		try {
			const response = await apiRequest<LegacyVisit[]>(
				`/LegacyClient/machines/${machineId}/visits`,
				{ method: 'GET' },
				token || undefined
			);
			return response;
		} catch (error) {
			console.error('Error fetching machine visits:', error);
			return [];
		}
	},

	/**
	 * Get machine history from TBS database
	 */
	async getMachineHistory(machineId: number): Promise<LegacyMachineHistory | null> {
		const token = getAuthToken();
		try {
			const response = await apiRequest<LegacyMachineHistory>(
				`/LegacyClient/machines/${machineId}/history`,
				{ method: 'GET' },
				token || undefined
			);
			return response;
		} catch (error) {
			console.error('Error fetching machine history:', error);
			return null;
		}
	},
};
