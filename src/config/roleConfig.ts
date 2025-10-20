/**
 * Generic Role Configuration System
 *
 * This module provides a centralized, type-safe configuration system for all user roles.
 * It eliminates redundancy by defining role properties, field requirements, and validation rules
 * in a single, maintainable location.
 */

import {
	Stethoscope,
	Wrench,
	Settings,
	Shield,
	DollarSign,
	Scale,
	ShoppingCart,
	UserCheck,
	Cog,
	HardHat,
	HeadphonesIcon,
} from 'lucide-react';
import type { RoleSpecificUserRole } from '@/types/roleSpecificUser.types';

/**
 * Field types that can be used in role configurations
 */
export type FieldType =
	| 'text'
	| 'email'
	| 'password'
	| 'tel'
	| 'textarea'
	| 'select'
	| 'file'
	| 'number'
	| 'multiselect';

/**
 * Field validation rules
 */
export interface FieldValidation {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	custom?: (value: any) => string | null; // Returns error message or null
}

/**
 * Field configuration for role-specific forms
 */
export interface FieldConfig {
	key: string;
	label: string;
	placeholder: string;
	type: FieldType;
	validation?: FieldValidation;
	options?: Array<{ value: string; label: string }>; // For select fields
	section: 'personal' | 'credentials' | 'profile' | 'role-specific';
	order: number;
	gridSpan?: 1 | 2; // How many grid columns this field should span
}

/**
 * Role-specific requirements and configurations
 */
export interface RoleRequirements {
	requiresHospital: boolean;
	requiresDepartment: boolean;
	requiresGovernorates: boolean;
	requiresMedicalDepartment: boolean;
	autoDepartmentId: number;
	role?: string; // API role name if different from key
}

/**
 * Complete role configuration
 */
export interface RoleConfig {
	name: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	requirements: RoleRequirements;
	fields: FieldConfig[];
	apiEndpoint: string;
}

/**
 * Centralized role configuration registry
 *
 * This object contains all role configurations in a structured, maintainable format.
 * Adding new roles or modifying existing ones only requires updating this configuration.
 */
export const ROLE_CONFIGURATIONS: Record<RoleSpecificUserRole, RoleConfig> = {
	doctor: {
		name: 'doctor',
		description: 'doctorDescription',
		icon: Stethoscope,
		requirements: {
			requiresHospital: true,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 2,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
			{
				key: 'specialty',
				label: 'specialty',
				placeholder: 'enterMedicalSpecialty',
				type: 'text',
				validation: { required: true },
				section: 'profile',
				order: 3,
			},

			// Role-Specific Information
			{
				key: 'hospitalId',
				label: 'hospital',
				placeholder: 'selectHospital',
				type: 'select',
				validation: { required: true },
				section: 'role-specific',
				order: 1,
			},
		],
		apiEndpoint: '/RoleSpecificUser/doctor',
	},

	engineer: {
		name: 'engineer',
		description: 'engineerDescription',
		icon: Wrench,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: true,
			requiresMedicalDepartment: false,
			autoDepartmentId: 4,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
			{
				key: 'specialty',
				label: 'specialty',
				placeholder: 'enterEngineeringSpecialty',
				type: 'text',
				validation: { required: true },
				section: 'profile',
				order: 3,
			},

			// Role-Specific Information
			{
				key: 'governorateIds',
				label: 'governorates',
				placeholder: 'selectGovernorates',
				type: 'multiselect',
				validation: { required: true },
				section: 'role-specific',
				order: 1,
			},
		],
		apiEndpoint: '/RoleSpecificUser/engineer',
	},

	technician: {
		name: 'technician',
		description: 'technicianDescription',
		icon: Settings,
		requirements: {
			requiresHospital: true,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: true,
			autoDepartmentId: 2,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},

			// Role-Specific Information
			{
				key: 'hospitalId',
				label: 'hospital',
				placeholder: 'selectHospital',
				type: 'select',
				validation: { required: true },
				section: 'role-specific',
				order: 1,
			},
			{
				key: 'department',
				label: 'department',
				placeholder: 'selectMedicalDepartment',
				type: 'select',
				validation: { required: true },
				section: 'role-specific',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/technician',
	},

	admin: {
		name: 'admin',
		description: 'adminDescription',
		icon: Shield,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 1,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/admin',
	},

	'finance-manager': {
		name: 'financeManager',
		description: 'financeManagerDescription',
		icon: DollarSign,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 5,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/finance-manager',
	},

	'finance-employee': {
		name: 'financeEmployee',
		description: 'financeEmployeeDescription',
		icon: DollarSign,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 5,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/finance-employee',
	},

	'legal-manager': {
		name: 'legalManager',
		description: 'legalManagerDescription',
		icon: Scale,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 6,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/legal-manager',
	},

	'legal-employee': {
		name: 'legalEmployee',
		description: 'legalEmployeeDescription',
		icon: Scale,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 6,
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/legal-employee',
	},

	salesman: {
		name: 'salesman',
		description: 'salesmanDescription',
		icon: ShoppingCart,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 3,
			role: 'Salesman',
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/salesman',
	},

	'sales-manager': {
		name: 'salesManager',
		description: 'salesManagerDescription',
		icon: UserCheck,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 3,
			role: 'SalesManager',
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},

			// Role-Specific Information
			{
				key: 'salesTerritory',
				label: 'salesTerritory',
				placeholder: 'enterSalesTerritory',
				type: 'text',
				section: 'role-specific',
				order: 1,
			},
			{
				key: 'salesTeam',
				label: 'salesTeam',
				placeholder: 'enterSalesTeam',
				type: 'text',
				section: 'role-specific',
				order: 2,
			},
			{
				key: 'salesTarget',
				label: 'salesTarget',
				placeholder: 'enterSalesTarget',
				type: 'number',
				section: 'role-specific',
				order: 3,
			},
			{
				key: 'managerNotes',
				label: 'managerNotes',
				placeholder: 'enterManagerNotes',
				type: 'textarea',
				section: 'role-specific',
				order: 4,
			},
		],
		apiEndpoint: '/RoleSpecificUser/sales-manager',
	},

	'maintenance-manager': {
		name: 'maintenanceManager',
		description: 'maintenanceManagerDescription',
		icon: HardHat,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 4,
			role: 'MaintenanceManager',
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},

			// Role-Specific Information
			{
				key: 'maintenanceSpecialty',
				label: 'maintenanceSpecialty',
				placeholder: 'enterMaintenanceSpecialty',
				type: 'text',
				validation: { required: true },
				section: 'role-specific',
				order: 1,
			},
			{
				key: 'certification',
				label: 'certification',
				placeholder: 'enterCertification',
				type: 'text',
				validation: { required: true },
				section: 'role-specific',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/maintenance-manager',
	},

	'maintenance-support': {
		name: 'maintenanceSupport',
		description: 'maintenanceSupportDescription',
		icon: Cog,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 4,
			role: 'MaintenanceSupport',
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},

			// Role-Specific Information
			{
				key: 'jobTitle',
				label: 'jobTitle',
				placeholder: 'enterJobTitle',
				type: 'text',
				validation: { required: true },
				section: 'role-specific',
				order: 1,
			},
			{
				key: 'technicalSkills',
				label: 'technicalSkills',
				placeholder: 'enterTechnicalSkills',
				type: 'textarea',
				validation: { required: true },
				section: 'role-specific',
				order: 2,
			},
		],
		apiEndpoint: '/RoleSpecificUser/maintenance-support',
	},

	'sales-support': {
		name: 'salesSupport',
		description: 'salesSupportDescription',
		icon: HeadphonesIcon,
		requirements: {
			requiresHospital: false,
			requiresDepartment: false,
			requiresGovernorates: false,
			requiresMedicalDepartment: false,
			autoDepartmentId: 4,
			role: 'SalesSupport',
		},
		fields: [
			// Personal Information
			{
				key: 'firstName',
				label: 'firstName',
				placeholder: 'enterFirstName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 1,
			},
			{
				key: 'lastName',
				label: 'lastName',
				placeholder: 'enterLastName',
				type: 'text',
				validation: { required: true, minLength: 2 },
				section: 'personal',
				order: 2,
			},
			{
				key: 'phoneNumber',
				label: 'phoneNumber',
				placeholder: 'enterPhoneNumber',
				type: 'tel',
				section: 'personal',
				order: 3,
			},

			// Account Credentials
			{
				key: 'email',
				label: 'email',
				placeholder: 'enterEmailAddress',
				type: 'email',
				validation: { required: true },
				section: 'credentials',
				order: 1,
			},
			{
				key: 'password',
				label: 'password',
				placeholder: 'enterPasswordField',
				type: 'password',
				validation: { required: true, minLength: 8 },
				section: 'credentials',
				order: 2,
			},
			{
				key: 'confirmPassword',
				label: 'confirmPassword',
				placeholder: 'confirmPasswordPlaceholder',
				type: 'password',
				validation: { required: true },
				section: 'credentials',
				order: 3,
			},

			// Profile Information
			{
				key: 'profileImage',
				label: 'profileImage',
				placeholder: 'selectProfileImage',
				type: 'file',
				section: 'profile',
				order: 1,
			},
			{
				key: 'imageAltText',
				label: 'imageAltText',
				placeholder: 'enterImageAltText',
				type: 'text',
				section: 'profile',
				order: 2,
			},

			// Role-Specific Information
			{
				key: 'personalMail',
				label: 'salesSupportFields.personalMail',
				placeholder:
					'salesSupportFields.personalMailPlaceholder',
				type: 'email',
				section: 'role-specific',
				order: 1,
			},
			{
				key: 'supportSpecialization',
				label: 'salesSupportFields.supportSpecialization',
				placeholder:
					'salesSupportFields.supportSpecializationPlaceholder',
				type: 'select',
				section: 'role-specific',
				order: 2,
				options: [
					{
						value: 'Customer Support',
						label: 'salesSupportSpecializations.customerSupport',
					},
					{
						value: 'Technical Support',
						label: 'salesSupportSpecializations.technicalSupport',
					},
					{
						value: 'Sales Support',
						label: 'salesSupportSpecializations.salesSupport',
					},
					{
						value: 'Product Support',
						label: 'salesSupportSpecializations.productSupport',
					},
					{
						value: 'Billing Support',
						label: 'salesSupportSpecializations.billingSupport',
					},
					{
						value: 'Account Management',
						label: 'salesSupportSpecializations.accountManagement',
					},
				],
			},
			{
				key: 'supportLevel',
				label: 'salesSupportFields.supportLevel',
				placeholder:
					'salesSupportFields.supportLevelPlaceholder',
				type: 'select',
				section: 'role-specific',
				order: 3,
				options: [
					{
						value: 'Junior',
						label: 'salesSupportLevels.junior',
					},
					{
						value: 'Senior',
						label: 'salesSupportLevels.senior',
					},
					{
						value: 'Lead',
						label: 'salesSupportLevels.lead',
					},
					{
						value: 'Specialist',
						label: 'salesSupportLevels.specialist',
					},
				],
			},
			{
				key: 'notes',
				label: 'salesSupportFields.notes',
				placeholder:
					'salesSupportFields.notesPlaceholder',
				type: 'textarea',
				section: 'role-specific',
				order: 4,
			},
		],
		apiEndpoint: '/RoleSpecificUser/sales-support',
	},
};

/**
 * Utility functions for working with role configurations
 */
export class RoleConfigUtils {
	/**
	 * Get role configuration by role key
	 */
	static getRoleConfig(role: RoleSpecificUserRole): RoleConfig {
		return ROLE_CONFIGURATIONS[role];
	}

	/**
	 * Get all available roles
	 */
	static getAllRoles(): RoleSpecificUserRole[] {
		return Object.keys(
			ROLE_CONFIGURATIONS
		) as RoleSpecificUserRole[];
	}

	/**
	 * Get fields for a specific role and section
	 */
	static getFieldsBySection(
		role: RoleSpecificUserRole,
		section: FieldConfig['section']
	): FieldConfig[] {
		const config = this.getRoleConfig(role);
		return config.fields
			.filter((field) => field.section === section)
			.sort((a, b) => a.order - b.order);
	}

	/**
	 * Get required fields for a role
	 */
	static getRequiredFields(role: RoleSpecificUserRole): string[] {
		const config = this.getRoleConfig(role);
		return config.fields
			.filter((field) => field.validation?.required)
			.map((field) => field.key);
	}

	/**
	 * Check if a role requires specific resources
	 */
	static requiresResource(
		role: RoleSpecificUserRole,
		resource: keyof RoleRequirements
	): boolean {
		const config = this.getRoleConfig(role);
		return Boolean(config.requirements[resource]) || false;
	}

	/**
	 * Get the API endpoint for a role
	 */
	static getApiEndpoint(role: RoleSpecificUserRole): string {
		const config = this.getRoleConfig(role);
		return config.apiEndpoint;
	}
}
