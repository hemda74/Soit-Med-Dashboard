// Maintenance API Service

import type {
	CreateMaintenanceRequestDTO,
	MaintenanceRequestResponseDTO,
	CreateMaintenanceVisitDTO,
	MaintenanceVisitResponseDTO,
	CreateSparePartRequestDTO,
	SparePartRequestResponseDTO,
	UpdateSparePartPriceDTO,
	CustomerSparePartDecisionDTO,
	AssignMaintenanceRequestDTO,
	MaintenanceRequestAttachmentResponseDTO,
	CreateMaintenanceRequestAttachmentDTO,
	ApiResponse,
} from '@/types/maintenance.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';
import { performanceMonitor } from '@/utils/performance';
import { getApiBaseUrl } from '@/utils/apiConfig';

class MaintenanceApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		return performanceMonitor.measureApiCall(endpoint, async () => {
			const token = getAuthToken();
			if (!token) {
				throw new Error(
					'No authentication token found. Please log in again.'
				);
			}

			const response = await fetch(
				`${getApiBaseUrl()}${endpoint}`,
				{
					...options,
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type':
							'application/json',
						...options.headers,
					},
				}
			);

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({}));
				const error: any = new Error(
					errorData.message ||
						`API request failed with status ${response.status}`
				);
				error.status = response.status;
				error.response = errorData;
				throw error;
			}

			return response.json();
		});
	}

	private async makeFormDataRequest<T>(
		endpoint: string,
		formData: FormData
	): Promise<T> {
		return performanceMonitor.measureApiCall(endpoint, async () => {
			const token = getAuthToken();
			if (!token) {
				throw new Error(
					'No authentication token found. Please log in again.'
				);
			}

			const response = await fetch(
				`${getApiBaseUrl()}${endpoint}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						// Don't set Content-Type for FormData, browser will set it with boundary
					},
					body: formData,
				}
			);

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({}));
				const error: any = new Error(
					errorData.message ||
						`API request failed with status ${response.status}`
				);
				error.status = response.status;
				error.response = errorData;
				throw error;
			}

			return response.json();
		});
	}

	// ==================== MAINTENANCE REQUESTS ====================

	/**
	 * Create a new maintenance request
	 */
	async createMaintenanceRequest(
		data: CreateMaintenanceRequestDTO
	): Promise<ApiResponse<MaintenanceRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.REQUEST.BASE, {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	/**
	 * Get maintenance request by ID
	 */
	async getMaintenanceRequest(
		id: number
	): Promise<ApiResponse<MaintenanceRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.REQUEST.BY_ID(id), {
			method: 'GET',
		});
	}

	/**
	 * Get customer's maintenance requests
	 */
	async getCustomerRequests(): Promise<
		ApiResponse<MaintenanceRequestResponseDTO[]>
	> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestResponseDTO[]>
		>(API_ENDPOINTS.MAINTENANCE.REQUEST.CUSTOMER_MY_REQUESTS, {
			method: 'GET',
		});
	}

	/**
	 * Get engineer's assigned requests
	 */
	async getEngineerRequests(): Promise<
		ApiResponse<MaintenanceRequestResponseDTO[]>
	> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestResponseDTO[]>
		>(API_ENDPOINTS.MAINTENANCE.REQUEST.ENGINEER_MY_ASSIGNED, {
			method: 'GET',
		});
	}

	/**
	 * Get pending maintenance requests (for Maintenance Support)
	 */
	async getPendingRequests(): Promise<
		ApiResponse<MaintenanceRequestResponseDTO[]>
	> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestResponseDTO[]>
		>(API_ENDPOINTS.MAINTENANCE.REQUEST.PENDING, {
			method: 'GET',
		});
	}

	/**
	 * Assign maintenance request to engineer
	 */
	async assignToEngineer(
		requestId: number,
		data: AssignMaintenanceRequestDTO
	): Promise<ApiResponse<MaintenanceRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.REQUEST.ASSIGN(requestId), {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	// ==================== MAINTENANCE VISITS ====================

	/**
	 * Create a maintenance visit
	 */
	async createMaintenanceVisit(
		data: CreateMaintenanceVisitDTO
	): Promise<ApiResponse<MaintenanceVisitResponseDTO>> {
		return this.makeRequest<
			ApiResponse<MaintenanceVisitResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.VISIT.BASE, {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	/**
	 * Get visits for a maintenance request
	 */
	async getVisitsByRequest(
		requestId: number
	): Promise<ApiResponse<MaintenanceVisitResponseDTO[]>> {
		return this.makeRequest<
			ApiResponse<MaintenanceVisitResponseDTO[]>
		>(API_ENDPOINTS.MAINTENANCE.VISIT.BY_REQUEST(requestId), {
			method: 'GET',
		});
	}

	/**
	 * Get visits by engineer
	 */
	async getVisitsByEngineer(
		engineerId: string
	): Promise<ApiResponse<MaintenanceVisitResponseDTO[]>> {
		return this.makeRequest<
			ApiResponse<MaintenanceVisitResponseDTO[]>
		>(API_ENDPOINTS.MAINTENANCE.VISIT.BY_ENGINEER(engineerId), {
			method: 'GET',
		});
	}

	// ==================== MAINTENANCE ATTACHMENTS ====================

	/**
	 * Upload attachment for maintenance request
	 */
	async uploadAttachment(
		data: CreateMaintenanceRequestAttachmentDTO
	): Promise<ApiResponse<MaintenanceRequestAttachmentResponseDTO>> {
		const formData = new FormData();
		formData.append(
			'MaintenanceRequestId',
			data.maintenanceRequestId.toString()
		);
		formData.append('File', data.file);
		formData.append('AttachmentType', data.attachmentType);
		if (data.description) {
			formData.append('Description', data.description);
		}

		return this.makeFormDataRequest<
			ApiResponse<MaintenanceRequestAttachmentResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.ATTACHMENT.UPLOAD, formData);
	}

	/**
	 * Get attachment by ID
	 */
	async getAttachment(
		id: number
	): Promise<ApiResponse<MaintenanceRequestAttachmentResponseDTO>> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestAttachmentResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.ATTACHMENT.BY_ID(id), {
			method: 'GET',
		});
	}

	/**
	 * Get attachments for a maintenance request
	 */
	async getAttachmentsByRequest(
		requestId: number
	): Promise<ApiResponse<MaintenanceRequestAttachmentResponseDTO[]>> {
		return this.makeRequest<
			ApiResponse<MaintenanceRequestAttachmentResponseDTO[]>
		>(API_ENDPOINTS.MAINTENANCE.ATTACHMENT.BY_REQUEST(requestId), {
			method: 'GET',
		});
	}

	/**
	 * Delete attachment
	 */
	async deleteAttachment(id: number): Promise<ApiResponse<void>> {
		return this.makeRequest<ApiResponse<void>>(
			API_ENDPOINTS.MAINTENANCE.ATTACHMENT.DELETE(id),
			{
				method: 'DELETE',
			}
		);
	}

	// ==================== SPARE PART REQUESTS ====================

	/**
	 * Create spare part request
	 */
	async createSparePartRequest(
		data: CreateSparePartRequestDTO
	): Promise<ApiResponse<SparePartRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<SparePartRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.SPARE_PART.BASE, {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	/**
	 * Get spare part request by ID
	 */
	async getSparePartRequest(
		id: number
	): Promise<ApiResponse<SparePartRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<SparePartRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.SPARE_PART.BY_ID(id), {
			method: 'GET',
		});
	}

	/**
	 * Check spare part availability
	 */
	async checkSparePartAvailability(
		id: number,
		isLocalAvailable: boolean
	): Promise<ApiResponse<SparePartRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<SparePartRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.SPARE_PART.CHECK_AVAILABILITY(id), {
			method: 'PUT',
			body: JSON.stringify({ isLocalAvailable }),
		});
	}

	/**
	 * Set spare part price (Maintenance Manager)
	 */
	async setSparePartPrice(
		id: number,
		data: UpdateSparePartPriceDTO
	): Promise<ApiResponse<SparePartRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<SparePartRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.SPARE_PART.SET_PRICE(id), {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	/**
	 * Customer approval/rejection for spare part
	 */
	async customerSparePartDecision(
		id: number,
		data: CustomerSparePartDecisionDTO
	): Promise<ApiResponse<SparePartRequestResponseDTO>> {
		return this.makeRequest<
			ApiResponse<SparePartRequestResponseDTO>
		>(API_ENDPOINTS.MAINTENANCE.SPARE_PART.CUSTOMER_APPROVAL(id), {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}
}

export const maintenanceApi = new MaintenanceApiService();
