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

export interface VisitSearchCriteria {
  dateFrom?: string;
  dateTo?: string;
  technicianId?: string;
  governorate?: string;
  status?: string;
  machineSerial?: string;
  page: number;
  pageSize: number;
}

export interface VisitSearchItem {
  visitId: number;
  visitDate: string;
  clientName: string;
  machineModel: string;
  machineSerial: string;
  technicianName: string;
  visitType: string;
  status: string;
  governorate: string;
  description: string;
  visitValue?: number;
}

export interface VisitSearchResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: VisitSearchItem[];
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
  private baseUrl = '/EnhancedMaintenance';

  // Customer Management
  async getCustomerEquipmentVisits(customerId: string, includeLegacy = true): Promise<CustomerEquipmentVisits> {
    try {
      const token = getAuthToken();
      const response = await apiRequest<any>(
        `${this.baseUrl}/customer/${customerId}/equipment-visits?includeLegacy=${includeLegacy}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Transform the response to match our expected format
      const transformedData: CustomerEquipmentVisits = {
        customer: response.data?.customer ? {
          id: response.data.customer.id?.toString() || '',
          name: response.data.customer.name || '',
          phone: response.data.customer.phone || '',
          email: response.data.customer.email || '',
          address: response.data.customer.address || '',
          source: response.data.customer.source || 'New'
        } : undefined,
        equipment: response.data?.equipment?.map((item: any) => ({
          id: item.id?.toString() || '',
          model: item.model || '',
          serialNumber: item.serialNumber || '',
          status: item.status || '',
          location: item.location || '',
          customerId: item.customerId?.toString() || '',
          source: item.source || 'New'
        })) || [],
        visits: response.data?.visits?.map((item: any) => ({
          id: item.id?.toString() || '',
          visitDate: item.visitDate || '',
          scheduledDate: item.scheduledDate || '',
          status: item.status || '',
          engineerName: item.engineerName || '',
          report: item.report || '',
          actionsTaken: item.actionsTaken || '',
          partsUsed: item.partsUsed || '',
          serviceFee: item.serviceFee,
          outcome: item.outcome || '',
          source: item.source || 'New'
        })) || []
      };

      return transformedData;
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

      const response = await apiRequest<any>(
        `${this.baseUrl}/customers/search?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Transform the response to match our expected format
      const transformedData: PagedResponse<EnhancedCustomer> = {
        items: response.data?.items?.map((customer: any) => ({
          id: customer.id?.toString() || '',
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || '',
          source: customer.source || 'New'
        })) || [],
        totalCount: response.data?.totalCount || 0,
        pageNumber: response.data?.pageNumber || criteria.pageNumber,
        pageSize: response.data?.pageSize || criteria.pageSize,
        totalPages: Math.ceil((response.data?.totalCount || 0) / criteria.pageSize),
        hasPreviousPage: (response.data?.pageNumber || criteria.pageNumber) > 1,
        hasNextPage: (response.data?.pageNumber || criteria.pageNumber) < Math.ceil((response.data?.totalCount || 0) / criteria.pageSize)
      };

      return transformedData;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Equipment Management
  async getEquipmentVisits(equipmentIdentifier: string, includeLegacy = true): Promise<EquipmentVisits> {
    try {
      const token = getAuthToken();
      const response = await apiRequest<any>(
        `${this.baseUrl}/equipment/${equipmentIdentifier}/visits?includeLegacy=${includeLegacy}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Transform the response to match our expected format
      const transformedData: EquipmentVisits = {
        equipment: response.data?.equipment ? {
          id: response.data.equipment.id?.toString() || '',
          model: response.data.equipment.model || '',
          serialNumber: response.data.equipment.serialNumber || '',
          status: response.data.equipment.status || '',
          location: response.data.equipment.location || '',
          customerId: response.data.equipment.customerId?.toString() || '',
          source: response.data.equipment.source || 'New'
        } : undefined,
        visits: response.data?.visits?.map((item: any) => ({
          id: item.id?.toString() || '',
          visitDate: item.visitDate || '',
          scheduledDate: item.scheduledDate || '',
          status: item.status || '',
          engineerName: item.engineerName || '',
          report: item.report || '',
          actionsTaken: item.actionsTaken || '',
          partsUsed: item.partsUsed || '',
          serviceFee: item.serviceFee,
          outcome: item.outcome || '',
          source: item.source || 'New'
        })) || []
      };

      return transformedData;
    } catch (error) {
      console.error('Error fetching equipment visits:', error);
      throw error;
    }
  }

  // Visit Management
  async completeVisit(request: CompleteVisitRequest): Promise<VisitCompletionResponse> {
    try {
      const token = getAuthToken();
      const response = await apiRequest<any>(
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

      const transformedData: VisitCompletionResponse = {
        success: response.data?.success || false,
        visitId: response.data?.visitId || request.visitId,
        completionDate: response.data?.completionDate,
        status: response.data?.status || 'Unknown',
        message: response.data?.message || 'Visit completion processed'
      };

      return transformedData;
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

  // Visit Search
  async searchVisits(criteria: VisitSearchCriteria): Promise<VisitSearchResponse> {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: criteria.page.toString(),
        pageSize: criteria.pageSize.toString(),
      });

      if (criteria.dateFrom) params.append('startDate', criteria.dateFrom);
      if (criteria.dateTo) params.append('endDate', criteria.dateTo);
      if (criteria.technicianId) params.append('technicianId', criteria.technicianId);
      if (criteria.governorate) params.append('governorate', criteria.governorate);
      if (criteria.status) params.append('status', criteria.status);
      if (criteria.machineSerial) params.append('machineSerial', criteria.machineSerial);

      const response = await apiRequest<any>(
        `${this.baseUrl}/visits/search?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const transformedData: VisitSearchResponse = {
        totalCount: response.data?.totalCount || 0,
        pageNumber: response.data?.pageNumber || criteria.page,
        pageSize: response.data?.pageSize || criteria.pageSize,
        totalPages: response.data?.totalPages || 0,
        data: response.data?.data?.map((visit: any) => ({
          visitId: visit.visitId || 0,
          visitDate: visit.visitDate || '',
          clientName: visit.clientName || '',
          machineModel: visit.machineModel || '',
          machineSerial: visit.machineSerial || '',
          technicianName: visit.technicianName || '',
          visitType: visit.visitType || '',
          status: visit.status || '',
          governorate: visit.governorate || '',
          description: visit.description || '',
          visitValue: visit.visitValue,
        })) || [],
      };

      return transformedData;
    } catch (error) {
      console.error('Error searching visits:', error);
      throw error;
    }
  }
}

export const enhancedMaintenanceApi = new EnhancedMaintenanceApi();
