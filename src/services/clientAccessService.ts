import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117/api';

export interface ClientAccessDTO {
  clientId: string;
  clientName: string;
  clientType?: string;
  clientEmail?: string;
  clientPhone?: string;
  role: string;
  isActive: boolean;
  grantedAt: string;
  clientStatus: string;
}

export interface UserAccessDTO {
  userId: string;
  userName?: string;
  userEmail?: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  grantedAt: string;
  grantedByName?: string;
}

export interface OrphanedClientDTO {
  clientId: string;
  clientName: string;
  clientType?: string;
  clientEmail?: string;
  clientPhone?: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export interface LinkUserToClientRequest {
  userId: string;
  clientId: string;
  role: string;
}

export interface RevokeAccessRequest {
  userId: string;
  clientId: string;
}

export interface UpdateRoleRequest {
  userId: string;
  clientId: string;
  newRole: string;
}

const clientAccessService = {
  // Link a user to a client
  linkUserToClient: async (request: LinkUserToClientRequest) => {
    const response = await axios.post(`${API_BASE_URL}/ClientAccess/link`, request);
    return response.data;
  },

  // Revoke user access to a client
  revokeAccess: async (request: RevokeAccessRequest) => {
    const response = await axios.post(`${API_BASE_URL}/ClientAccess/revoke`, request);
    return response.data;
  },

  // Restore user access
  restoreAccess: async (request: RevokeAccessRequest) => {
    const response = await axios.post(`${API_BASE_URL}/ClientAccess/restore`, request);
    return response.data;
  },

  // Update user role
  updateRole: async (request: UpdateRoleRequest) => {
    const response = await axios.put(`${API_BASE_URL}/ClientAccess/role`, request);
    return response.data;
  },

  // Get user's accessible clients
  getAccessibleClients: async (userId: string, activeOnly: boolean = true): Promise<ClientAccessDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/ClientAccess/user/${userId}/clients`, {
      params: { activeOnly }
    });
    return response.data.data;
  },

  // Get client's users
  getClientUsers: async (clientId: string, activeOnly: boolean = true): Promise<UserAccessDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/ClientAccess/client/${clientId}/users`, {
      params: { activeOnly }
    });
    return response.data.data;
  },

  // Check if user has access
  checkAccess: async (userId: string, clientId: string): Promise<boolean> => {
    const response = await axios.get(`${API_BASE_URL}/ClientAccess/check-access`, {
      params: { userId, clientId }
    });
    return response.data.hasAccess;
  },

  // Get orphaned clients
  getOrphanedClients: async (): Promise<OrphanedClientDTO[]> => {
    const response = await axios.get(`${API_BASE_URL}/ClientAccess/clients/orphaned`);
    return response.data.data;
  }
};

export default clientAccessService;
