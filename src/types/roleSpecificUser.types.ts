// Types for role-specific user creation based on the new API specification

// Base user data that all roles share
export interface BaseUserRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	profileImage?: File;
	altText?: string;
}

// Role-specific request types
export interface DoctorUserRequest extends BaseUserRequest {
	departmentId?: number;
	specialty: string;
	hospitalId: string;
}

export interface EngineerUserRequest extends BaseUserRequest {
	departmentId?: number;
	specialty: string;
	governorateIds: number[];
}

export interface TechnicianUserRequest extends BaseUserRequest {
	departmentId?: number;
	hospitalId: string;
	department: string;
}

export interface AdminUserRequest extends BaseUserRequest {
	departmentId?: number;
}

export interface FinanceManagerUserRequest extends BaseUserRequest {
	departmentId?: number;
}

export interface FinanceEmployeeUserRequest extends BaseUserRequest {
	departmentId?: number;
}

export interface LegalManagerUserRequest extends BaseUserRequest {
	departmentId?: number;
}

export interface LegalEmployeeUserRequest extends BaseUserRequest {
	departmentId?: number;
}

export interface SalesmanUserRequest extends BaseUserRequest {
	departmentId?: number;
}

export interface SalesManagerUserRequest extends BaseUserRequest {
	departmentId?: number;
	salesTerritory?: string;
	salesTeam?: string;
	salesTarget?: number;
	managerNotes?: string;
}

// Union type for all role-specific requests
export type RoleSpecificUserRequest =
	| DoctorUserRequest
	| EngineerUserRequest
	| TechnicianUserRequest
	| AdminUserRequest
	| FinanceManagerUserRequest
	| FinanceEmployeeUserRequest
	| LegalManagerUserRequest
	| LegalEmployeeUserRequest
	| SalesmanUserRequest
	| SalesManagerUserRequest;

// Profile image response data
export interface ProfileImageResponse {
	id: number;
	userId: string;
	fileName: string;
	filePath: string;
	contentType: string;
	fileSize: number;
	altText: string;
	uploadedAt: string;
	isActive: boolean;
	isProfileImage: boolean;
}

// Base response data - matches new API response structure
export interface BaseUserResponse {
	userId: string;
	email: string;
	role: string;
	departmentName: string;
	createdAt: string;
	profileImage?: ProfileImageResponse;
	message: string;
}

// Role-specific response data
export interface DoctorUserResponse extends BaseUserResponse {
	role: 'Doctor';
	doctorId: number;
	specialty: string;
	hospitalName: string;
}

export interface EngineerUserResponse extends BaseUserResponse {
	role: 'Engineer';
	engineerId: number;
	specialty: string;
	governorateNames: string[];
}

export interface TechnicianUserResponse extends BaseUserResponse {
	role: 'Technician';
	technicianId: number;
	hospitalName: string;
}

export interface AdminUserResponse extends BaseUserResponse {
	role: 'Admin';
	adminId: number;
}

export interface FinanceManagerUserResponse extends BaseUserResponse {
	role: 'FinanceManager';
	financeManagerId: number;
}

export interface FinanceEmployeeUserResponse extends BaseUserResponse {
	role: 'FinanceEmployee';
	financeEmployeeId: number;
}

export interface LegalManagerUserResponse extends BaseUserResponse {
	role: 'LegalManager';
	legalManagerId: number;
}

export interface LegalEmployeeUserResponse extends BaseUserResponse {
	role: 'LegalEmployee';
	legalEmployeeId: number;
}

export interface SalesmanUserResponse extends BaseUserResponse {
	role: 'Salesman';
	salesmanId: number;
}

export interface SalesManagerUserResponse extends BaseUserResponse {
	role: 'SalesManager';
	salesManagerId: number;
	salesTerritory?: string;
	salesTeam?: string;
	salesTarget?: number;
	managerNotes?: string;
}

// Union type for all role-specific responses
export type RoleSpecificUserResponse =
	| DoctorUserResponse
	| EngineerUserResponse
	| TechnicianUserResponse
	| AdminUserResponse
	| FinanceManagerUserResponse
	| FinanceEmployeeUserResponse
	| LegalManagerUserResponse
	| LegalEmployeeUserResponse
	| SalesmanUserResponse
	| SalesManagerUserResponse;

// Available roles for user creation
export type RoleSpecificUserRole =
	| 'doctor'
	| 'engineer'
	| 'technician'
	| 'admin'
	| 'finance-manager'
	| 'finance-employee'
	| 'legal-manager'
	| 'legal-employee'
	| 'salesman'
	| 'sales-manager';

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
	hospitalId?: string;
	hospitalName?: string;
	HospitalId?: string;
	HospitalName?: string;
}
