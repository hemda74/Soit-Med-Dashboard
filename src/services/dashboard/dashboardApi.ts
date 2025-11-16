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

		// API returns PascalCase, so we use 'any' to normalize it
		const response = await apiRequest<any>(
			API_ENDPOINTS.USER.STATISTICS,
			{
				method: 'GET',
			},
			token
		);

		// Normalize the response to match UserStatistics interface
		// Handle both PascalCase (from API) and camelCase formats
		const normalizedResponse: UserStatistics = {
			totalUsers:
				response.totalUsers ?? response.TotalUsers ?? 0,
			activeUsers:
				response.activeUsers ??
				response.ActiveUsers ??
				0,
			inactiveUsers:
				response.inactiveUsers ??
				response.InactiveUsers ??
				0,
			usersByRole:
				response.usersByRole ??
				response.UsersByRole ??
				0,
			generatedAt:
				response.generatedAt ??
				response.GeneratedAt ??
				new Date().toISOString(),
			usersByRoleBreakdown:
				response.usersByRoleBreakdown ??
				response.UsersByRoleBreakdown ??
				{},
			usersByDepartment:
				response.usersByDepartment ??
				response.UsersByDepartment ??
				{},
		};

		return normalizedResponse;
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

		const response = await apiRequest<UserCounts>(
			API_ENDPOINTS.USER.COUNTS,
			{
				method: 'GET',
			},
			token
		);

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
