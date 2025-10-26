// Sales API - New Sales Module
// This file contains API functions for the new sales module including client management,
// sales activities, and performance tracking

import { apiClient } from '../shared/apiClient';

// Types
export interface Client {
	id: string;
	name: string;
	company: string;
	email: string;
	phone: string;
	address: string;
	status: 'active' | 'inactive' | 'prospect';
	lastContact: string;
	notes?: string;
	industry?: string;
	revenue?: string;
	employees?: number;
	website?: string;
	contactPerson?: string;
	createdAt: string;
	updatedAt: string;
}

export interface SalesActivity {
	id: string;
	clientId: string;
	type: 'call' | 'meeting' | 'email' | 'demo' | 'proposal';
	description: string;
	outcome?: string;
	nextAction?: string;
	scheduledDate?: string;
	completedDate?: string;
	value?: number;
	status: 'scheduled' | 'completed' | 'cancelled';
	createdAt: string;
	updatedAt: string;
}

export interface SalesDeal {
	id: string;
	clientId: string;
	title: string;
	value: number;
	stage:
		| 'prospect'
		| 'qualification'
		| 'proposal'
		| 'negotiation'
		| 'closed_won'
		| 'closed_lost';
	probability: number;
	expectedCloseDate: string;
	actualCloseDate?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface SalesMetrics {
	totalRevenue: number;
	monthlyTarget: number;
	activeClients: number;
	newLeads: number;
	conversionRate: number;
	avgDealSize: number;
	pipelineValue: number;
	closedDeals: number;
	callsMade: number;
	emailsSent: number;
}

export interface CreateClientRequest {
	name: string;
	company: string;
	email: string;
	phone: string;
	address: string;
	industry?: string;
	revenue?: string;
	employees?: number;
	website?: string;
	contactPerson?: string;
	notes?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
	id: string;
	status?: 'active' | 'inactive' | 'prospect';
}

export interface CreateActivityRequest {
	clientId: string;
	type: 'call' | 'meeting' | 'email' | 'demo' | 'proposal';
	description: string;
	outcome?: string;
	nextAction?: string;
	scheduledDate?: string;
	value?: number;
}

export interface CreateDealRequest {
	clientId: string;
	title: string;
	value: number;
	stage:
		| 'prospect'
		| 'qualification'
		| 'proposal'
		| 'negotiation'
		| 'closed_won'
		| 'closed_lost';
	probability: number;
	expectedCloseDate: string;
	notes?: string;
}

// Client Management API
export const clientApi = {
	// Get all clients
	getClients: async (): Promise<Client[]> => {
		try {
			const response = await apiClient.get('/sales/clients');
			return response.data as Client[];
		} catch (error) {
			console.error('Error fetching clients:', error);
			throw error;
		}
	},

	// Get client by ID
	getClient: async (id: string): Promise<Client> => {
		try {
			const response = await apiClient.get(
				`/sales/clients/${id}`
			);
			return response.data as Client;
		} catch (error) {
			console.error('Error fetching client:', error);
			throw error;
		}
	},

	// Search clients
	searchClients: async (query: string): Promise<Client[]> => {
		try {
			const response = await apiClient.get(
				`/sales/clients/search?q=${encodeURIComponent(
					query
				)}`
			);
			return response.data as Client[];
		} catch (error) {
			console.error('Error searching clients:', error);
			throw error;
		}
	},

	// Create new client
	createClient: async (
		clientData: CreateClientRequest
	): Promise<Client> => {
		try {
			const response = await apiClient.post(
				'/sales/clients',
				clientData
			);
			return response.data as Client[];
		} catch (error) {
			console.error('Error creating client:', error);
			throw error;
		}
	},

	// Update client
	updateClient: async (
		clientData: UpdateClientRequest
	): Promise<Client> => {
		try {
			const response = await apiClient.put(
				`/sales/clients/${clientData.id}`,
				clientData
			);
			return response.data as Client[];
		} catch (error) {
			console.error('Error updating client:', error);
			throw error;
		}
	},

	// Delete client
	deleteClient: async (id: string): Promise<void> => {
		try {
			await apiClient.delete(`/sales/clients/${id}`);
		} catch (error) {
			console.error('Error deleting client:', error);
			throw error;
		}
	},
};

// Sales Activities API
export const activityApi = {
	// Get activities for a client
	getClientActivities: async (
		clientId: string
	): Promise<SalesActivity[]> => {
		try {
			const response = await apiClient.get(
				`/sales/clients/${clientId}/activities`
			);
			return response.data as SalesActivity[];
		} catch (error) {
			console.error(
				'Error fetching client activities:',
				error
			);
			throw error;
		}
	},

	// Get all activities
	getActivities: async (): Promise<SalesActivity[]> => {
		try {
			const response = await apiClient.get(
				'/sales/activities'
			);
			return response.data as SalesActivity[];
		} catch (error) {
			console.error('Error fetching activities:', error);
			throw error;
		}
	},

	// Create new activity
	createActivity: async (
		activityData: CreateActivityRequest
	): Promise<SalesActivity> => {
		try {
			const response = await apiClient.post(
				'/sales/activities',
				activityData
			);
			return response.data as SalesActivity;
		} catch (error) {
			console.error('Error creating activity:', error);
			throw error;
		}
	},

	// Update activity
	updateActivity: async (
		id: string,
		activityData: Partial<SalesActivity>
	): Promise<SalesActivity> => {
		try {
			const response = await apiClient.put(
				`/sales/activities/${id}`,
				activityData
			);
			return response.data as SalesActivity;
		} catch (error) {
			console.error('Error updating activity:', error);
			throw error;
		}
	},

	// Complete activity
	completeActivity: async (
		id: string,
		outcome?: string
	): Promise<SalesActivity> => {
		try {
			const response = await apiClient.patch(
				`/sales/activities/${id}/complete`,
				{ outcome }
			);
			return response.data as SalesActivity;
		} catch (error) {
			console.error('Error completing activity:', error);
			throw error;
		}
	},
};

// Sales Deals API
export const dealApi = {
	// Get all deals
	getDeals: async (): Promise<SalesDeal[]> => {
		try {
			const response = await apiClient.get('/sales/deals');
			return response.data as SalesDeal[];
		} catch (error) {
			console.error('Error fetching deals:', error);
			throw error;
		}
	},

	// Get deals for a client
	getClientDeals: async (clientId: string): Promise<SalesDeal[]> => {
		try {
			const response = await apiClient.get(
				`/sales/clients/${clientId}/deals`
			);
			return response.data as SalesDeal[];
		} catch (error) {
			console.error('Error fetching client deals:', error);
			throw error;
		}
	},

	// Create new deal
	createDeal: async (dealData: CreateDealRequest): Promise<SalesDeal> => {
		try {
			const response = await apiClient.post(
				'/sales/deals',
				dealData
			);
			return response.data as SalesDeal;
		} catch (error) {
			console.error('Error creating deal:', error);
			throw error;
		}
	},

	// Update deal
	updateDeal: async (
		id: string,
		dealData: Partial<SalesDeal>
	): Promise<SalesDeal> => {
		try {
			const response = await apiClient.put(
				`/sales/deals/${id}`,
				dealData
			);
			return response.data as SalesDeal;
		} catch (error) {
			console.error('Error updating deal:', error);
			throw error;
		}
	},

	// Close deal (won or lost)
	closeDeal: async (
		id: string,
		stage: 'closed_won' | 'closed_lost',
		actualCloseDate?: string
	): Promise<SalesDeal> => {
		try {
			const response = await apiClient.patch(
				`/sales/deals/${id}/close`,
				{ stage, actualCloseDate }
			);
			return response.data as SalesDeal;
		} catch (error) {
			console.error('Error closing deal:', error);
			throw error;
		}
	},
};

// Sales Metrics API
export const metricsApi = {
	// Get sales metrics
	getMetrics: async (): Promise<SalesMetrics> => {
		try {
			const response = await apiClient.get('/sales/metrics');
			return response.data as SalesMetrics;
		} catch (error) {
			console.error('Error fetching sales metrics:', error);
			throw error;
		}
	},

	// Get team performance metrics
	getTeamMetrics: async (): Promise<any[]> => {
		try {
			const response = await apiClient.get(
				'/sales/metrics/team'
			);
			return response.data as any[];
		} catch (error) {
			console.error('Error fetching team metrics:', error);
			throw error;
		}
	},

	// Get pipeline metrics
	getPipelineMetrics: async (): Promise<any> => {
		try {
			const response = await apiClient.get(
				'/sales/metrics/pipeline'
			);
			return response.data as Client[];
		} catch (error) {
			console.error(
				'Error fetching pipeline metrics:',
				error
			);
			throw error;
		}
	},
};

// Main sales API object
export const salesApi = {
	clients: clientApi,
	activities: activityApi,
	deals: dealApi,
	metrics: metricsApi,
};

// Export individual APIs for backward compatibility
// Note: These are already exported above, so we don't need to re-export them
