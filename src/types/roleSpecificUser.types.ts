// Types for role-specific user creation based on the new API specification

// Base user data that all roles share
export interface BaseUserRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

// Role-specific request types
export interface DoctorUserRequest extends BaseUserRequest {
	departmentId: number;
	specialty: string;
	hospitalId: string;
}

export interface EngineerUserRequest extends BaseUserRequest {
	departmentId: string;
}

export interface TechnicianUserRequest extends BaseUserRequest {
	hospitalId: string;
}

export interface AdminUserRequest extends BaseUserRequest {
	departmentId: string;
}

export interface FinanceManagerUserRequest extends BaseUserRequest {
	departmentId: string;
}

export interface LegalManagerUserRequest extends BaseUserRequest {
	departmentId: string;
}

export interface SalesmanUserRequest extends BaseUserRequest {
	departmentId: string;
}

// Union type for all role-specific requests
export type RoleSpecificUserRequest =
	| DoctorUserRequest
	| EngineerUserRequest
	| TechnicianUserRequest
	| AdminUserRequest
	| FinanceManagerUserRequest
	| LegalManagerUserRequest
	| SalesmanUserRequest;

// Base response data
export interface BaseUserResponse {
	success: boolean;
	message: string;
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
	};
}

// Role-specific response data
export interface DoctorUserResponse extends BaseUserResponse {
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'Doctor';
		specialty: string;
		hospitalId: string;
	};
}

export interface EngineerUserResponse extends BaseUserResponse {
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'Engineer';
		departmentId: string;
	};
}

export interface TechnicianUserResponse extends BaseUserResponse {
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'Technician';
		hospitalId: string;
	};
}

export interface AdminUserResponse extends BaseUserResponse {
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'Admin';
		departmentId: string;
	};
}

export interface FinanceManagerUserResponse extends BaseUserResponse {
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'FinanceManager';
		departmentId: string;
	};
}

export interface LegalManagerUserResponse extends BaseUserResponse {
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'LegalManager';
		departmentId: string;
	};
}

export interface SalesmanUserResponse extends BaseUserResponse {
	data: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'Salesman';
		departmentId: string;
	};
}

// Union type for all role-specific responses
export type RoleSpecificUserResponse =
	| DoctorUserResponse
	| EngineerUserResponse
	| TechnicianUserResponse
	| AdminUserResponse
	| FinanceManagerUserResponse
	| LegalManagerUserResponse
	| SalesmanUserResponse;

// Available roles for user creation
export type RoleSpecificUserRole =
	| 'doctor'
	| 'engineer'
	| 'technician'
	| 'admin'
	| 'finance-manager'
	| 'legal-manager'
	| 'salesman';

// Password change request
export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

// Password change response
export interface ChangePasswordResponse {
	success: boolean;
	message: string;
}

// API error response
export interface RoleSpecificApiError {
	type?: string;
	title?: string;
	status: number;
	errors?: Record<string, string[]>;
	message?: string;
}

// Form validation error
export interface FormValidationError {
	field: string;
	message: string;
}

// Department mapping for display
export interface DepartmentInfo {
	id: number;
	name: string;
	description: string;
}

// Hospital mapping for display
export interface HospitalInfo {
	id: string;
	name: string;
	location?: string;
	type?: string;
}
