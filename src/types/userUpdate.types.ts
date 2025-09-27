// User Update API Types

export interface UpdateUserRequest {
	email: string;
	role: string;
	firstName: string;
	lastName: string;
	password?: string;
}

export interface UpdateUserSuccessResponse {
	success: true;
	message: string;
	updatedUserId: string;
	updatedUserName: string;
	newRole: string;
	timestamp: string;
}

export interface UpdateUserErrorResponse {
	success: false;
	message: string;
	errors?: string[];
	timestamp: string;
}

export type UpdateUserResponse =
	| UpdateUserSuccessResponse
	| UpdateUserErrorResponse;

export interface UpdateUserParams {
	userId: string;
	userData: UpdateUserRequest;
	token: string;
}

export interface UseUpdateUserReturn {
	updateUser: (
		userId: string,
		userData: UpdateUserRequest
	) => Promise<void>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}

// Valid roles enum
export const VALID_ROLES = [
	'SuperAdmin',
	'Admin',
	'Doctor',
	'Technician',
	'Engineer',
	'FinanceManager',
	'FinanceEmployee',
	'LegalManager',
	'LegalEmployee',
	'SalesManager',
	'Salesman',
] as const;

export type ValidRole = (typeof VALID_ROLES)[number];
