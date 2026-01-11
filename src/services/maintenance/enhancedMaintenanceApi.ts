import { apiRequest } from '@/services/shared/apiClient';
import { getAuthToken } from '@/utils/authUtils';

// Enhanced Types for New API
export interface EnhancedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  source: 'New' | 'Legacy';
}

export interface EnhancedEquipment {
  id: string;
  model: string;
  serialNumber: string;
  status: string;
  location: string;
  customerId: string;
  source: 'New' | 'Legacy';
}

export interface EnhancedVisit {
  id: string;
  visitDate: string;
  scheduledDate: string;
  status: string;
  engineerName: string;
  report: string;
  actionsTaken: string;
  partsUsed: string;
  serviceFee?: number;
  outcome: string;
  source: 'New' | 'Legacy';
}

export interface CustomerEquipmentVisits {
  customer?: EnhancedCustomer;
  equipment: EnhancedEquipment[];
  visits: EnhancedVisit[];
}

export interface EquipmentVisits {
  equipment?: EnhancedEquipment;
  visits: EnhancedVisit[];
}

export interface CustomerVisitStats {
  customerId: string;
  startDate: string;
  endDate: string;
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  cancelledVisits: number;
  totalRevenue: number;
  completionRate: number;
}

export interface CompleteVisitRequest {
  visitId: string;
  source: string;
  report?: string;
  actionsTaken?: string;
  partsUsed?: string;
  serviceFee?: number;
  outcome?: string;
  notes?: string;
}

export interface VisitCompletionResponse {
  success: boolean;
  visitId: string;
  completionDate?: string;
  status: string;
  message: string;
}

export interface CustomerSearchCriteria {
  searchTerm: string;
  pageNumber: number;
  pageSize: number;
  includeLegacy: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponseEnhanced<T> {
  success: boolean;
  data?: T;
  message: string;
  errors: string[];
}

// Enhanced Maintenance API Service
class EnhancedMaintenanceApi {
  private baseUrl = '/api/EnhancedMaintenance';

  // Customer Management
  async getCustomerEquipmentVisits(customerId: string, includeLegacy = true): Promise<CustomerEquipmentVisits> {
    try {
      const token = getAuthToken();
      const response = await apiRequest<ApiResponseEnhanced<CustomerEquipmentVisits>>(
        `${this.baseUrl}/customer/${customerId}/equipment-visits?includeLegacy=${includeLegacy}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data!;
    } catch (error) {
      console.error('Error fetching customer equipment visits:', error);
      throw error;
    }
  }

  async searchCustomers(criteria: CustomerSearchCriteria): Promise<PagedResponse<EnhancedCustomer>> {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        searchTerm: criteria.searchTerm,
        pageNumber: criteria.pageNumber.toString(),
        pageSize: criteria.pageSize.toString(),
        includeLegacy: criteria.includeLegacy.toString(),
      });

      const response = await apiRequest<ApiResponseEnhanced<PagedResponse<EnhancedCustomer>>>(
        `${this.baseUrl}/customers/search?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data!;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Equipment Management
  async getEquipmentVisits(equipmentIdentifier: string, includeLegacy = true): Promise<EquipmentVisits> {
    try {
      const token = getAuthToken();
      const response = await apiRequest<ApiResponseEnhanced<EquipmentVisits>>(
        `${this.baseUrl}/equipment/${equipmentIdentifier}/visits?includeLegacy=${includeLegacy}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data!;
    } catch (error) {
      console.error('Error fetching equipment visits:', error);
      throw error;
    }
  }

  // Visit Management
  async completeVisit(request: CompleteVisitRequest): Promise<VisitCompletionResponse> {
    try {
      const token = getAuthToken();
      const response = await apiRequest<ApiResponseEnhanced<VisitCompletionResponse>>(
        `${this.baseUrl}/visits/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      return response.data!;
    } catch (error) {
      console.error('Error completing visit:', error);
      throw error;
    }
  }

  async getCustomerVisitStats(
    customerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CustomerVisitStats> {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${this.baseUrl}/customer/${customerId}/visit-stats${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest<ApiResponseEnhanced<CustomerVisitStats>>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data!;
    } catch (error) {
      console.error('Error fetching customer visit stats:', error);
      throw error;
    }
  }

  // Administrative
  async verifyDataConsistency(): Promise<ApiResponseEnhanced<any>> {
    try {
      const token = getAuthToken();
      const response = await apiRequest<any>(
        `${this.baseUrl}/admin/data-consistency`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error verifying data consistency:', error);
      throw error;
    }
  }

  async testWorkflow(customerId?: string): Promise<ApiResponseEnhanced<any>> {
    try {
      const token = getAuthToken();
      const params = customerId ? `?customerId=${customerId}` : '';
      const response = await apiRequest<any>(
        `${this.baseUrl}/test/workflow${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error testing workflow:', error);
      throw error;
    }
  }

  // Utility methods
  async getCustomersWithEquipmentAndVisits(searchTerm = '', includeLegacy = true): Promise<EnhancedCustomer[]> {
    const criteria: CustomerSearchCriteria = {
      searchTerm,
      pageNumber: 1,
      pageSize: 100,
      includeLegacy,
    };

    const response = await this.searchCustomers(criteria);
    return response.items || [];
  }

  async getVisitHistoryForCustomer(customerId: string): Promise<EnhancedVisit[]> {
    const response = await this.getCustomerEquipmentVisits(customerId, true);
    return response.visits || [];
  }

  async getVisitHistoryForEquipment(equipmentIdentifier: string): Promise<EnhancedVisit[]> {
    const response = await this.getEquipmentVisits(equipmentIdentifier, true);
    return response.visits || [];
  }

  async getCustomerStatistics(customerId: string, months = 12): Promise<CustomerVisitStats | null> {
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString();

    const response = await this.getCustomerVisitStats(customerId, startDateStr, endDate);
    return response || null;
  }
}

export const enhancedMaintenanceApi = new EnhancedMaintenanceApi();
