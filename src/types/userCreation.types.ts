// Types for the admin user creation flow

export type UserRole =
	| 'SuperAdmin'
	| 'Admin'
	| 'Doctor'
	| 'Technician'
	| 'Salesman'
	| 'Engineer'
	| 'FinanceManager'
	| 'FinanceEmployee'
	| 'LegalManager'
	| 'LegalEmployee'
	| 'Hello'
	| 'admin'
	| 'user';

// Role object from API
export interface RoleObject {
	id: string;
	name: string;
	normalizedName: string;
	concurrencyStamp: string | null;
}

export type FieldType =
	| 'string'
	| 'email'
	| 'password'
	| 'number'
	| 'select'
	| 'multiselect'
	| 'boolean';

export interface FormField {
	name: string;
	type: FieldType;
	required: boolean;
	label: string;
	placeholder?: string;
	options?: Array<{ value: string | number; label: string }>;
	validation?: {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
		min?: number;
		max?: number;
	};
}

export interface RoleFieldsResponse {
	role: UserRole;
	department: string;
	baseFields: FormField[];
	roleSpecificFields: FormField[];
	requiredData: Array<{
		endpoint: string;
		description: string;
	}>;
	createEndpoint: string;
	message: string;
}

// Updated response type for new API endpoint
export type RolesResponse = RoleObject[];

// Reference data types
export interface Hospital {
	id: string;
	name: string;
	location?: string;
	type?: string;
}

export interface Governorate {
	governorateId: number;
	name: string;
	createdAt: string;
	isActive: boolean;
	engineerCount: number;
}

export interface Department {
	id: number;
	name: string;
	description?: string;
}

// User creation form data
export interface BaseUserData {
	userName: string;
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	departmentId?: number;
}

// Role-specific user data interfaces
export interface DoctorUserData extends BaseUserData {
	specialty: string;
	hospitalId: string;
}

export interface TechnicianUserData extends BaseUserData {
	department: string;
	hospitalId: string;
}

export interface EngineerUserData extends BaseUserData {
	specialty: string;
	governorateIds: number[];
}

export interface AdminUserData extends BaseUserData {
	accessLevel?: string;
}

export interface FinanceManagerUserData extends BaseUserData {
	budgetAuthority?: string;
}

export interface LegalManagerUserData extends BaseUserData {
	legalSpecialty?: string;
}

export interface SalesmanUserData extends BaseUserData {
	territory?: string;
	salesTarget?: number;
}

// Union type for all user creation data
export type UserCreationData =
	| BaseUserData
	| DoctorUserData
	| TechnicianUserData
	| EngineerUserData
	| AdminUserData
	| FinanceManagerUserData
	| LegalManagerUserData
	| SalesmanUserData;

// User creation response
export interface UserCreationResponse {
	userId: string;
	userName: string;
	email: string;
	role: UserRole;
	departmentName?: string;
	createdAt: string;
	message: string;
	// Role-specific response fields
	doctorId?: number;
	technicianId?: number;
	engineerId?: number;
	salesmanId?: number;
	specialty?: string;
	hospitalName?: string;
	governorateNames?: string[];
	assignedGovernorates?: string[];
	territory?: string;
}

// Form validation errors
export interface ValidationError {
	field: string;
	message: string;
}

// Form state for user creation
export interface UserCreationFormState {
	selectedRole: UserRole | null;
	formData: Record<string, any>;
	errors: ValidationError[];
	isLoading: boolean;
	step:
		| 'role-selection'
		| 'form-filling'
		| 'submitting'
		| 'success'
		| 'error';
	roleFields: RoleFieldsResponse | null;
	referenceData: {
		hospitals: Hospital[];
		governorates: Governorate[];
		departments: Department[];
	};
}

// API error response
export interface ApiError {
	message: string;
	errors?: Record<string, string[]>;
	statusCode: number;
}
