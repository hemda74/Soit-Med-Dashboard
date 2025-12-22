// Types for role-specific user creation based on the new API specification

// Base user data that all roles share
export interface BaseUserRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
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

export interface SalesManUserRequest extends BaseUserRequest {
	departmentId?: number;
}

export interface SalesManagerUserRequest extends BaseUserRequest {
	departmentId?: number;
	salesTerritory?: string;
	salesTeam?: string;
	salesTarget?: number;
	managerNotes?: string;
}

export interface MaintenanceManagerUserRequest extends BaseUserRequest {
	departmentId?: number;
	maintenanceSpecialty: string;
	certification: string;
}

export interface MaintenanceSupportUserRequest extends BaseUserRequest {
	departmentId?: number;
	jobTitle: string;
	technicalSkills: string;
}

export interface SalesSupportUserRequest extends BaseUserRequest {
	departmentId?: number;
	supportSpecialization?: string;
	supportLevel?: string;
	notes?: string;
	personalMail?: string;
}

export interface SparePartsCoordinatorUserRequest extends BaseUserRequest {
	departmentId?: number;
	specialty: string;
}

export interface InventoryManagerUserRequest extends BaseUserRequest {
	departmentId?: number;
	specialty: string;
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
	| SalesManUserRequest
	| SalesManagerUserRequest
	| MaintenanceManagerUserRequest
	| MaintenanceSupportUserRequest
	| SalesSupportUserRequest
	| SparePartsCoordinatorUserRequest
	| InventoryManagerUserRequest;

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
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	role: string;
	departmentName: string;
	createdAt: string;
	profileImage?: ProfileImageResponse;
	message: string;
}

// Role-specific response data
export interface DoctorUserResponse extends BaseUserResponse {
	role: 'Doctor';
	DoctorId: number;
	specialty: string;
	hospitalName: string;
}

export interface EngineerUserResponse extends BaseUserResponse {
	role: 'Engineer';
	EngineerId: number;
	specialty: string;
	governorateNames: string[];
}

export interface TechnicianUserResponse extends BaseUserResponse {
	role: 'Technician';
	TechnicianId: number;
	hospitalName: string;
}

export interface AdminUserResponse extends BaseUserResponse {
	role: 'Admin';
	AdminId: number;
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

export interface SalesManUserResponse extends BaseUserResponse {
	role: 'SalesMan';
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

export interface MaintenanceManagerUserResponse extends BaseUserResponse {
	role: 'MaintenanceManager';
	maintenanceManagerId: number;
	maintenanceSpecialty: string;
	certification: string;
}

export interface MaintenanceSupportUserResponse extends BaseUserResponse {
	role: 'MaintenanceSupport';
	maintenanceSupportId: number;
	jobTitle: string;
	technicalSkills: string;
}

export interface SalesSupportUserResponse {
	userId: string;
	email: string;
	role: string;
	departmentName: string;
	createdAt: string;
	profileImage?: {
		id: number;
		fileName: string;
		filePath: string;
		contentType: string;
		fileSize: number;
		altText: string;
		isProfileImage: boolean;
		uploadedAt: string;
	};
	message: string;
	supportSpecialization?: string;
	supportLevel?: string;
	notes?: string;
}

export interface SparePartsCoordinatorUserResponse extends BaseUserResponse {
	role: 'SparePartsCoordinator';
	sparePartsCoordinatorId: number;
	specialty: string;
}

export interface InventoryManagerUserResponse extends BaseUserResponse {
	role: 'InventoryManager';
	inventoryManagerId: number;
	specialty: string;
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
	| SalesManUserResponse
	| SalesManagerUserResponse
	| MaintenanceManagerUserResponse
	| MaintenanceSupportUserResponse
	| SalesSupportUserResponse
	| SparePartsCoordinatorUserResponse
	| InventoryManagerUserResponse;

// Available roles for user creation
export type RoleSpecificUserRole =
	| 'Doctor'
	| 'Engineer'
	| 'Technician'
	| 'Admin'
	| 'FinanceManager'
	| 'FinanceEmployee'
	| 'LegalManager'
	| 'LegalEmployee'
	| 'SalesMan'
	| 'SalesManager'
	| 'MaintenanceManager'
	| 'MaintenanceSupport'
	| 'SalesSupport'
	| 'SparePartsCoordinator'
	| 'InventoryManager';

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
