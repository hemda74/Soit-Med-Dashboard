import { apiRequest } from '@/services/shared/apiClient';

// =============================================
// Comprehensive Maintenance API Types
// =============================================

// Base Types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Customer Types
export interface CustomerDTO extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

export interface CustomerSearchCriteria {
  searchTerm?: string;
  page: number;
  pageSize: number;
}

// Equipment Types
export interface EquipmentDTO extends BaseEntity {
  serialNumber: string;
  model: string;
  manufacturer?: string;
  customerId: string;
  customerName?: string;
  installationDate?: string;
  warrantyExpiryDate?: string;
  status: string;
  location?: string;
  maintenanceVisitsCount?: number;
}

export interface CreateEquipmentRequest {
  serialNumber: string;
  model: string;
  manufacturer?: string;
  customerId: string;
  installationDate?: string;
  warrantyExpiryDate?: string;
  location?: string;
}

export interface UpdateEquipmentRequest {
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  installationDate?: string;
  warrantyExpiryDate?: string;
  status?: string;
  location?: string;
}

// Visit Types
export enum VisitType {
  Installation = 1,
  Preventive = 2,
  Emergency = 3,
  Repair = 4,
  Inspection = 5
}

export enum VisitStatus {
  Scheduled = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
  Postponed = 5
}

export interface MaintenanceVisitDTO extends BaseEntity {
  equipmentId: string;
  equipmentSerialNumber?: string;
  visitDate: string;
  visitType: VisitType;
  status: VisitStatus;
  engineerId?: string;
  engineerName?: string;
  report?: string;
  completionDate?: string;
}

export interface CreateVisitRequest {
  equipmentId: string;
  visitDate: string;
  visitType: VisitType;
  engineerId?: string;
  report?: string;
}

export interface UpdateVisitRequest {
  visitDate?: string;
  visitType?: VisitType;
  status?: VisitStatus;
  engineerId?: string;
  report?: string;
  completionDate?: string;
}

export interface VisitSearchCriteria {
  status?: VisitStatus;
  visitType?: VisitType;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export interface CompleteVisitRequest {
  report: string;
}

export interface VisitCompletionResponse {
  success: boolean;
  message: string;
  completedAt?: string;
}

// Contract Types
export enum ContractStatus {
  Draft = 1,
  Active = 2,
  Expired = 3,
  Terminated = 4,
  Suspended = 5
}

export interface MaintenanceContractDTO extends BaseEntity {
  contractNumber: string;
  clientId: string;
  clientName?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  status: ContractStatus;
  contractType?: string;
  paymentTerms?: string;
  contractItems?: ContractItemDTO[];
}

export interface ContractItemDTO extends BaseEntity {
  contractId: string;
  equipmentId: string;
  equipmentSerialNumber?: string;
  serviceType: string;
  frequency?: string;
  price: number;
}

export interface CreateContractRequest {
  contractNumber: string;
  clientId: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  contractType?: string;
  paymentTerms?: string;
}

export interface UpdateContractRequest {
  contractNumber?: string;
  startDate?: string;
  endDate?: string;
  contractValue?: number;
  status?: ContractStatus;
  contractType?: string;
  paymentTerms?: string;
}

// Statistics Types
export interface CustomerVisitStats {
  customerId: string;
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  emergencyVisits: number;
  preventiveVisits: number;
  installationVisits: number;
  lastVisitDate?: string;
  nextScheduledDate?: string;
}

export interface MaintenanceDashboardStats {
  totalCustomers: number;
  totalEquipment: number;
  totalVisits: number;
  monthlyVisits: number;
  pendingVisits: number;
  completedVisits: number;
  activeContracts: number;
  visitCompletionRate: number;
}

// Combined Types for Frontend
export interface CustomerEquipmentVisitsDTO {
  customer: CustomerDTO;
  equipment: EquipmentDTO[];
  visits: MaintenanceVisitDTO[];
}

// Pagination Types
export interface PagedRequest {
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// =============================================
// Comprehensive Maintenance API Service
// =============================================

export class ComprehensiveMaintenanceApi {
  private baseUrl = '/api/ComprehensiveMaintenance';

  // =============================================
  // Customer Management
  // =============================================

  async getCustomerEquipmentVisits(customerId: string, includeLegacy = true): Promise<CustomerEquipmentVisitsDTO> {
    return await apiRequest<CustomerEquipmentVisitsDTO>(
      `${this.baseUrl}/customers/${customerId}/equipment-visits?includeLegacy=${includeLegacy}`,
      { method: 'GET' }
    );
  }

  async searchCustomers(criteria: CustomerSearchCriteria): Promise<PagedResult<CustomerDTO>> {
    return await apiRequest<PagedResult<CustomerDTO>>(
      `${this.baseUrl}/customers/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria)
      }
    );
  }

  async createCustomer(request: CreateCustomerRequest): Promise<CustomerDTO> {
    return await apiRequest<CustomerDTO>(
      `${this.baseUrl}/customers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async updateCustomer(customerId: string, request: UpdateCustomerRequest): Promise<CustomerDTO> {
    return await apiRequest<CustomerDTO>(
      `${this.baseUrl}/customers/${customerId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    await apiRequest(`${this.baseUrl}/customers/${customerId}`, { method: 'DELETE' });
    return true;
  }

  async getCustomerStatistics(customerId: string, startDate?: string, endDate?: string): Promise<CustomerVisitStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await apiRequest<CustomerVisitStats>(
      `${this.baseUrl}/customers/${customerId}/statistics?${params.toString()}`,
      { method: 'GET' }
    );
  }

  // =============================================
  // Equipment Management
  // =============================================

  async getEquipment(equipmentId: string): Promise<EquipmentDTO> {
    return await apiRequest<EquipmentDTO>(
      `${this.baseUrl}/equipment/${equipmentId}`,
      { method: 'GET' }
    );
  }

  async getCustomerEquipment(customerId: string, request: PagedRequest): Promise<PagedResult<EquipmentDTO>> {
    const params = new URLSearchParams({
      page: request.page.toString(),
      pageSize: request.pageSize.toString()
    });
    
    return await apiRequest<PagedResult<EquipmentDTO>>(
      `${this.baseUrl}/customers/${customerId}/equipment?${params.toString()}`,
      { method: 'GET' }
    );
  }

  async createEquipment(request: CreateEquipmentRequest): Promise<EquipmentDTO> {
    return await apiRequest<EquipmentDTO>(
      `${this.baseUrl}/equipment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async updateEquipment(equipmentId: string, request: UpdateEquipmentRequest): Promise<EquipmentDTO> {
    return await apiRequest<EquipmentDTO>(
      `${this.baseUrl}/equipment/${equipmentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async deleteEquipment(equipmentId: string): Promise<boolean> {
    await apiRequest(`${this.baseUrl}/equipment/${equipmentId}`, { method: 'DELETE' });
    return true;
  }

  // =============================================
  // Visit Management
  // =============================================

  async getVisit(visitId: string): Promise<MaintenanceVisitDTO> {
    return await apiRequest<MaintenanceVisitDTO>(
      `${this.baseUrl}/visits/${visitId}`,
      { method: 'GET' }
    );
  }

  async getEquipmentVisits(equipmentId: string, criteria: VisitSearchCriteria): Promise<PagedResult<MaintenanceVisitDTO>> {
    const params = new URLSearchParams({
      page: criteria.page.toString(),
      pageSize: criteria.pageSize.toString()
    });
    
    if (criteria.status !== undefined) params.append('status', criteria.status.toString());
    if (criteria.visitType !== undefined) params.append('visitType', criteria.visitType.toString());
    if (criteria.startDate) params.append('startDate', criteria.startDate);
    if (criteria.endDate) params.append('endDate', criteria.endDate);
    
    return await apiRequest<PagedResult<MaintenanceVisitDTO>>(
      `${this.baseUrl}/equipment/${equipmentId}/visits?${params.toString()}`,
      { method: 'GET' }
    );
  }

  async createVisit(request: CreateVisitRequest): Promise<MaintenanceVisitDTO> {
    return await apiRequest<MaintenanceVisitDTO>(
      `${this.baseUrl}/visits`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async updateVisit(visitId: string, request: UpdateVisitRequest): Promise<MaintenanceVisitDTO> {
    return await apiRequest<MaintenanceVisitDTO>(
      `${this.baseUrl}/visits/${visitId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async deleteVisit(visitId: string): Promise<boolean> {
    await apiRequest(`${this.baseUrl}/visits/${visitId}`, { method: 'DELETE' });
    return true;
  }

  async completeVisit(visitId: string, request: CompleteVisitRequest): Promise<VisitCompletionResponse> {
    return await apiRequest<VisitCompletionResponse>(
      `${this.baseUrl}/visits/${visitId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  // =============================================
  // Contract Management
  // =============================================

  async getContract(contractId: string): Promise<MaintenanceContractDTO> {
    return await apiRequest<MaintenanceContractDTO>(
      `${this.baseUrl}/contracts/${contractId}`,
      { method: 'GET' }
    );
  }

  async getCustomerContracts(customerId: string, request: PagedRequest): Promise<PagedResult<MaintenanceContractDTO>> {
    const params = new URLSearchParams({
      page: request.page.toString(),
      pageSize: request.pageSize.toString()
    });
    
    return await apiRequest<PagedResult<MaintenanceContractDTO>>(
      `${this.baseUrl}/customers/${customerId}/contracts?${params.toString()}`,
      { method: 'GET' }
    );
  }

  async createContract(request: CreateContractRequest): Promise<MaintenanceContractDTO> {
    return await apiRequest<MaintenanceContractDTO>(
      `${this.baseUrl}/contracts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async updateContract(contractId: string, request: UpdateContractRequest): Promise<MaintenanceContractDTO> {
    return await apiRequest<MaintenanceContractDTO>(
      `${this.baseUrl}/contracts/${contractId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      }
    );
  }

  async deleteContract(contractId: string): Promise<boolean> {
    await apiRequest(`${this.baseUrl}/contracts/${contractId}`, { method: 'DELETE' });
    return true;
  }

  // =============================================
  // Dashboard & Statistics
  // =============================================

  async getDashboardStatistics(): Promise<MaintenanceDashboardStats> {
    return await apiRequest<MaintenanceDashboardStats>(
      `${this.baseUrl}/dashboard/statistics`,
      { method: 'GET' }
    );
  }

  // =============================================
  // Utility Methods
  // =============================================

  async testConnection(): Promise<{ message: string; timestamp: string }> {
    return await apiRequest<{ message: string; timestamp: string }>(
      `${this.baseUrl}/test`,
      { method: 'GET' }
    );
  }

  // Helper method to format visit type for display
  static getVisitTypeDisplay(visitType: VisitType): string {
    switch (visitType) {
      case VisitType.Installation:
        return 'Installation';
      case VisitType.Preventive:
        return 'Preventive Maintenance';
      case VisitType.Emergency:
        return 'Emergency Repair';
      case VisitType.Repair:
        return 'Repair';
      case VisitType.Inspection:
        return 'Inspection';
      default:
        return 'Unknown';
    }
  }

  // Helper method to format visit status for display
  static getVisitStatusDisplay(status: VisitStatus): string {
    switch (status) {
      case VisitStatus.Scheduled:
        return 'Scheduled';
      case VisitStatus.InProgress:
        return 'In Progress';
      case VisitStatus.Completed:
        return 'Completed';
      case VisitStatus.Cancelled:
        return 'Cancelled';
      case VisitStatus.Postponed:
        return 'Postponed';
      default:
        return 'Unknown';
    }
  }

  // Helper method to format contract status for display
  static getContractStatusDisplay(status: ContractStatus): string {
    switch (status) {
      case ContractStatus.Draft:
        return 'Draft';
      case ContractStatus.Active:
        return 'Active';
      case ContractStatus.Expired:
        return 'Expired';
      case ContractStatus.Terminated:
        return 'Terminated';
      case ContractStatus.Suspended:
        return 'Suspended';
      default:
        return 'Unknown';
    }
  }

  // Helper method to get status color for UI
  static getVisitStatusColor(status: VisitStatus): string {
    switch (status) {
      case VisitStatus.Scheduled:
        return 'blue';
      case VisitStatus.InProgress:
        return 'orange';
      case VisitStatus.Completed:
        return 'green';
      case VisitStatus.Cancelled:
        return 'red';
      case VisitStatus.Postponed:
        return 'yellow';
      default:
        return 'gray';
    }
  }

  static getContractStatusColor(status: ContractStatus): string {
    switch (status) {
      case ContractStatus.Active:
        return 'green';
      case ContractStatus.Draft:
        return 'gray';
      case ContractStatus.Expired:
        return 'red';
      case ContractStatus.Terminated:
        return 'red';
      case ContractStatus.Suspended:
        return 'orange';
      default:
        return 'gray';
    }
  }
}

// Export singleton instance
export const comprehensiveMaintenanceApi = new ComprehensiveMaintenanceApi();
