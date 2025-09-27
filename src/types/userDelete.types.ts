// User Delete API Types

export interface DeleteUserRequest {
	userId: string;
}

export interface DeleteUserSuccessResponse {
	success: true;
	message: string;
	deletedUserId: string;
	deletedUserName: string;
	timestamp: string;
}

export interface DeleteUserErrorResponse {
	success: false;
	message: string;
	errors?: string[];
	timestamp: string;
}

export type DeleteUserResponse =
	| DeleteUserSuccessResponse
	| DeleteUserErrorResponse;

export interface DeleteUserParams {
	userId: string;
	token: string;
}

export interface UseDeleteUserReturn {
	deleteUser: (userId: string) => Promise<void>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}
