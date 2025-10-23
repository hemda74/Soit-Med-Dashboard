// Admin feature models
export type RoleSpecificUserRole = 
	| 'medical'
	| 'technical'
	| 'sales'
	| 'admin'
	| 'finance'
	| 'legal'
	| 'sales_support'
	| 'maintenance';

export interface RoleSpecificUser {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	role: RoleSpecificUserRole;
	departmentId?: number;
	hospitalId?: number;
	governorateId?: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UserCreationForm {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone?: string;
	role: RoleSpecificUserRole;
	departmentId?: number;
	hospitalId?: number;
	governorateId?: number;
	profileImage?: File;
}

export interface RoleConfig {
	key: string;
	label: string;
	description: string;
	icon: string;
	fields: FieldConfig[];
	permissions: string[];
}

export interface FieldConfig {
	key: string;
	label: string;
	type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'file';
	required: boolean;
	placeholder?: string;
	options?: { value: string; label: string }[];
	validation?: {
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
		custom?: (value: unknown) => string | null;
	};
}