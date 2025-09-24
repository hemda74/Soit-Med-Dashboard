// Dashboard API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { DashboardStats } from '@/types/dashboard.types';
import type { UserStatistics } from '@/types/api.types';

// Fetch dashboard statistics
export const fetchDashboardStats = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<DashboardStats> => {
	try {
		setLoading?.(true);
		console.log('Fetching dashboard statistics...');

		const response = await apiRequest<DashboardStats>(
			API_ENDPOINTS.DASHBOARD.STATS,
			{
				method: 'GET',
			},
			token
		);

		console.log('Dashboard stats fetched successfully:', response);
		return response;
	} catch (error) {
		console.error('Failed to fetch dashboard stats:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Fetch user statistics (legacy function for backward compatibility)
export const fetchUserStatistics = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserStatistics> => {
	try {
		setLoading?.(true);
		console.log('Fetching user statistics...');

		const response = await apiRequest<UserStatistics>(
			API_ENDPOINTS.DASHBOARD.STATS,
			{
				method: 'GET',
			},
			token
		);

		console.log('User statistics fetched successfully:', response);
		return response;
	} catch (error) {
		console.error('Failed to fetch user statistics:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};
