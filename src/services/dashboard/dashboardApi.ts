// Dashboard API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { DashboardStats } from '@/types/dashboard.types';
import type { UserStatistics, UserCounts } from '@/types/api.types';

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

// Fetch detailed user statistics with role and department breakdown
export const fetchDetailedUserStatistics = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserStatistics> => {
	try {
		setLoading?.(true);
		console.log('Fetching detailed user statistics...');

		const response = await apiRequest<UserStatistics>(
			API_ENDPOINTS.USER.STATISTICS,
			{
				method: 'GET',
			},
			token
		);

		console.log('Detailed user statistics fetched successfully:', response);
		return response;
	} catch (error) {
		console.error('Failed to fetch detailed user statistics:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Fetch basic user counts (total, active, inactive)
export const fetchUserCounts = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserCounts> => {
	try {
		setLoading?.(true);
		console.log('Fetching user counts...');

		const response = await apiRequest<UserCounts>(
			API_ENDPOINTS.USER.COUNTS,
			{
				method: 'GET',
			},
			token
		);

		console.log('User counts fetched successfully:', response);
		return response;
	} catch (error) {
		console.error('Failed to fetch user counts:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};
