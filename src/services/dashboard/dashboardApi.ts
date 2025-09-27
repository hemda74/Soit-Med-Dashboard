// Dashboard API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { DashboardStats } from '@/types/dashboard.types';
import type { UserStatistics, UserCounts } from '@/types/api.types';

// Fetch comprehensive user statistics with role and department breakdown
// GET /api/User/statistics
export const fetchUserStatistics = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserStatistics> => {
	try {
		setLoading?.(true);
		console.log('Fetching user statistics...');

		const response = await apiRequest<UserStatistics>(
			API_ENDPOINTS.USER.STATISTICS,
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

// Fetch basic user counts (total, active, inactive)
// GET /api/User/counts
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

// Legacy function for backward compatibility - now uses user statistics
export const fetchDashboardStats = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<DashboardStats> => {
	try {
		setLoading?.(true);
		console.log('Fetching dashboard statistics...');

		// Use the new user statistics API
		const userStats = await fetchUserStatistics(token);

		// Transform to DashboardStats format
		const dashboardStats: DashboardStats = {
			totalUsers: userStats.totalUsers,
			activeUsers: userStats.activeUsers,
			inactiveUsers: userStats.inactiveUsers,
			totalReports: 0, // Not available in user statistics
			pendingReports: 0, // Not available in user statistics
			completedReports: 0, // Not available in user statistics
		};

		console.log(
			'Dashboard stats fetched successfully:',
			dashboardStats
		);
		return dashboardStats;
	} catch (error) {
		console.error('Failed to fetch dashboard stats:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};

// Alias for backward compatibility
export const fetchDetailedUserStatistics = fetchUserStatistics;
