import { apiClient } from './api';
import type {
	UserStatistics,
	UserCounts,
	ActivateDeactivateRequest,
	ActivateDeactivateResponse,
} from '@/types/api.types';

// Function to fetch user statistics with loading state
export const fetchUserStatistics = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserStatistics> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<UserStatistics>(
			'/User/statistics',
			token
		);
	} finally {
		setLoading?.(false);
	}
};

// Function to fetch user counts with loading state
export const fetchUserCounts = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserCounts> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<UserCounts>('/User/counts', token);
	} finally {
		setLoading?.(false);
	}
};

// Function to activate or deactivate a user
export const activateDeactivateUser = async (
	request: ActivateDeactivateRequest,
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<ActivateDeactivateResponse> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	if (!request.userId || !request.action || !request.reason) {
		throw new Error('userId, action, and reason are required');
	}

	try {
		setLoading?.(true);
		return await apiClient.put<ActivateDeactivateResponse>(
			'/User/activate-deactivate',
			request,
			token
		);
	} finally {
		setLoading?.(false);
	}
};
