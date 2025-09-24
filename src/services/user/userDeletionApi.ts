// User deletion API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';

// Delete User API Types
export interface DeleteUserResponse {
	message: string;
	userId: string;
	userName: string;
	email: string;
	deletedAt: string;
	code: string;
}

export interface DeleteUserError {
	error: string;
	code: string;
	timestamp: string;
	details?: Array<{
		code: string;
		description: string;
	}>;
}

// Delete User API Function
export const deleteUser = async (
	userId: string,
	token: string
): Promise<DeleteUserResponse> => {
	return apiRequest<DeleteUserResponse>(
		API_ENDPOINTS.USER.DELETE(userId),
		{
			method: 'DELETE',
		},
		token
	);
};
