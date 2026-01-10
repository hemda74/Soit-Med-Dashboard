import { API_ENDPOINTS } from '../shared/endpoints';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { getAuthToken } from '@/utils/authUtils';

export type ContractTypeFilter = 'all' | 'mainContracts' | 'activeContracts' | 'expiredContracts' | 'cancelledContracts';

export type ContractFilter = {
	searchTerm?: string;
	status?: string;
	contractType?: ContractTypeFilter;
	clientId?: number;
	dealId?: number;
	startDateFrom?: string;
	startDateTo?: string;
	endDateFrom?: string;
	endDateTo?: string;
	hasInstallments?: boolean;
	isLegacy?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
};

export type ContractEquipment = {
	machineId: number;
	itemId: number;
	serialNumber: string;
	modelName?: string;
	modelNameEn?: string;
	devicePlace?: string;
	itemCode?: string;
	expirationDate?: string;
	visitCount: number;
};

export type ContractMediaFile = {
	fileName: string;
	filePath: string;
	fileType?: string;
	mimeType?: string;
	fileSize?: number;
	fileSizeFormatted?: string;
	isImage: boolean;
	isPdf: boolean;
	canPreview: boolean;
	isAvailable: boolean;
	availabilityMessage?: string;
};

export type Contract = {
	id: number;
	contractNumber: string;
	title: string;
	contractContent?: string;
	documentUrl?: string;
	status: string | number; // Can be enum (number) or string
	statusDisplay: string;
	draftedAt?: string;
	sentToCustomerAt?: string;
	signedAt?: string;
	cancelledAt?: string;
	cancellationReason?: string;
	clientId: number;
	clientName: string;
	clientPhone?: string;
	clientEmail?: string;
	dealId?: number;
	dealTitle?: string;
	cashAmount?: number;
	installmentAmount?: number;
	interestRate?: number;
	latePenaltyRate?: number;
	installmentDurationMonths?: number;
	hasInstallments: boolean;
	installmentCount: number;
	paidInstallmentCount: number;
	overdueInstallmentCount: number;
	draftedBy: string;
	drafterName?: string;
	customerSignedBy?: string;
	customerSignerName?: string;
	legacyContractId?: number;
	isLegacy: boolean;
	createdAt: string;
	updatedAt: string;
	isExpired: boolean;
	daysUntilExpiry?: number;
	totalAmount?: number;
	isMainContract?: boolean;
	mainContractId?: number;
	contractTypeDisplay?: string;
};

export type DetailedContract = Contract & {
	equipment: ContractEquipment[];
	equipmentCount: number;
	mediaFiles: ContractMediaFile[];
	mediaFileCount: number;
};

export type PaginatedContractResponse = {
	contracts: Contract[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
};

// Customer Machines Types (matching Media API format)
export type CustomerMachinesMediaFile = {
	fileName: string;
	fileUrl: string;
	fileType?: string;
	isImage: boolean;
	isPdf: boolean;
};

export type CustomerMachine = {
	machineId: number;
	serialNumber?: string;
	modelName?: string;
	modelNameEn?: string;
	itemCode?: string;
	visitCount: number;
	mediaFiles: CustomerMachinesMediaFile[];
};

export type CustomerMachinesResponse = {
	customerId: number;
	customerName: string;
	customerAddress?: string;
	customerPhone?: string;
	machineCount: number;
	machines: CustomerMachine[];
};

class ContractApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const token = getAuthToken();
		const baseUrl = getApiBaseUrl();
		const url = `${baseUrl}${endpoint}`;

		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				Authorization: token ? `Bearer ${token}` : '',
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({
				message: `Request failed with status ${response.status}`,
			}));
			throw new Error(errorData.message || `Request failed with status ${response.status}`);
		}

		return response.json();
	}

	/**
	 * Get contracts with pagination, search, and filters
	 */
	async getContracts(filter: ContractFilter = {}): Promise<{
		success: boolean;
		message: string;
		data: PaginatedContractResponse;
	}> {
		const params = new URLSearchParams();
		
		if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
		if (filter.status) params.append('status', filter.status);
		if (filter.contractType && filter.contractType !== 'all') {
			// Map frontend filter to backend enum
			const contractTypeMap: Record<string, number> = {
				mainContracts: 1,
				activeContracts: 2,
				expiredContracts: 3,
				cancelledContracts: 4,
			};
			const contractTypeValue = contractTypeMap[filter.contractType];
			if (contractTypeValue !== undefined) {
				params.append('contractType', contractTypeValue.toString());
				console.log('Adding contractType filter:', filter.contractType, '->', contractTypeValue);
			}
		}
		if (filter.clientId) params.append('clientId', filter.clientId.toString());
		if (filter.dealId) params.append('dealId', filter.dealId.toString());
		if (filter.startDateFrom) params.append('startDateFrom', filter.startDateFrom);
		if (filter.startDateTo) params.append('startDateTo', filter.startDateTo);
		if (filter.endDateFrom) params.append('endDateFrom', filter.endDateFrom);
		if (filter.endDateTo) params.append('endDateTo', filter.endDateTo);
		if (filter.hasInstallments !== undefined) params.append('hasInstallments', filter.hasInstallments.toString());
		if (filter.isLegacy !== undefined) params.append('isLegacy', filter.isLegacy.toString());
		if (filter.sortBy) params.append('sortBy', filter.sortBy);
		if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
		params.append('page', (filter.page || 1).toString());
		params.append('pageSize', (filter.pageSize || 20).toString());

		const response = await this.makeRequest<{
			success: boolean;
			message: string;
			data: {
				contracts: Contract[];
				totalCount: number;
				page: number;
				pageSize: number;
				totalPages: number;
				hasPreviousPage: boolean;
				hasNextPage: boolean;
			};
		}>(`${API_ENDPOINTS.CONTRACT.SEARCH}?${params.toString()}`, {
			method: 'GET',
		});

		if (!response.success || !response.data) {
			return {
				success: false,
				message: response.message || 'Failed to retrieve contracts',
				data: {
					contracts: [],
					totalCount: 0,
					page: 1,
					pageSize: 20,
					totalPages: 0,
					hasPreviousPage: false,
					hasNextPage: false,
				},
			};
		}

		return {
			success: response.success,
			message: response.message || 'Contracts retrieved successfully',
			data: {
				contracts: response.data.contracts || [],
				totalCount: response.data.totalCount || 0,
				page: response.data.page || 1,
				pageSize: response.data.pageSize || 20,
				totalPages: response.data.totalPages || 0,
				hasPreviousPage: response.data.hasPreviousPage || false,
				hasNextPage: response.data.hasNextPage || false,
			},
		};
	}

	/**
	 * Get contract by ID
	 */
	async getContractById(id: number): Promise<{
		success: boolean;
		message: string;
		data: Contract;
	}> {
		const response = await this.makeRequest<{
			success: boolean;
			message: string;
			data: Contract;
		}>(API_ENDPOINTS.CONTRACT.BY_ID(id), {
			method: 'GET',
		});

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to retrieve contract');
		}

		return {
			success: response.success,
			message: response.message || 'Contract retrieved successfully',
			data: response.data,
		};
	}

	/**
	 * Get contract with details (equipment and media files)
	 */
	async getContractWithDetails(id: number): Promise<{
		success: boolean;
		message: string;
		data: DetailedContract;
	}> {
		const response = await this.makeRequest<{
			success: boolean;
			message: string;
			data: DetailedContract;
		}>(API_ENDPOINTS.CONTRACT.DETAILS(id), {
			method: 'GET',
		});

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to retrieve contract details');
		}

		return {
			success: response.success,
			message: response.message || 'Contract details retrieved successfully',
			data: response.data,
		};
	}

	/**
	 * Get all machines for a customer
	 * Replaces Media API endpoint: GET /api/Contracts/customers/{customerId}/machines
	 */
	async getCustomerMachines(customerId: number): Promise<CustomerMachinesResponse> {
		const response = await this.makeRequest<CustomerMachinesResponse>(
			API_ENDPOINTS.CONTRACT.CUSTOMER_MACHINES(customerId),
			{
				method: 'GET',
			}
		);

		return response;
	}
}

export const contractApi = new ContractApiService();

