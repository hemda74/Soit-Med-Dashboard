// Base role-specific user creation API services

import type {
	RoleSpecificUserRequest,
	RoleSpecificUserResponse,
	RoleSpecificUserRole,
	ChangePasswordRequest,
	ChangePasswordResponse,
	DepartmentInfo,
	HospitalInfo,
	DoctorUserRequest,
	EngineerUserRequest,
	TechnicianUserRequest,
} from '@/types/roleSpecificUser.types';
import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';

// Create role-specific user
export const createRoleSpecificUser = async <T extends RoleSpecificUserRequest>(
	role: RoleSpecificUserRole,
	userData: T,
	token: string
): Promise<RoleSpecificUserResponse> => {
	const endpoint = `${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/${role}`;

	// Removed verbose console logs for production

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with proper field mapping
	Object.entries(userData).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			if (key === 'profileImage' && value instanceof File) {
				formData.append('ProfileImage', value);
			} else if (key === 'altText') {
				formData.append('AltText', value as string);
			} else if (
				key === 'governorateIds' &&
				Array.isArray(value)
			) {
				// Handle governorate IDs array - send as individual numbers
				value.forEach((id, index) => {
					formData.append(
						`GovernorateIds[${index}]`,
						id.toString()
					);
				});
			} else {
				// Convert camelCase to PascalCase for API
				const apiKey =
					key.charAt(0).toUpperCase() +
					key.slice(1);
				formData.append(apiKey, value as string);
			}
		}
	});

	// Avoid logging form data content in production

	return apiRequest<RoleSpecificUserResponse>(
		endpoint,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

// Helper function to create users with proper role mapping
export const createUserByRole = async (
	role: RoleSpecificUserRole,
	userData: RoleSpecificUserRequest,
	token: string
): Promise<RoleSpecificUserResponse> => {
	switch (role) {
		case 'doctor': {
			const { createDoctor } = await import(
				'./medicalRoleApi'
			);
			return createDoctor(
				userData as DoctorUserRequest,
				token
			);
		}
		case 'engineer': {
			const { createEngineer } = await import(
				'./technicalRoleApi'
			);
			return createEngineer(
				userData as EngineerUserRequest,
				token
			);
		}
		case 'technician': {
			const { createTechnician } = await import(
				'./medicalRoleApi'
			);
			return createTechnician(
				userData as TechnicianUserRequest,
				token
			);
		}
		case 'admin': {
			const { createAdmin } = await import('./adminRoleApi');
			return createAdmin(userData, token);
		}
		case 'finance-manager': {
			const { createFinanceManager } = await import(
				'./financeRoleApi'
			);
			return createFinanceManager(userData, token);
		}
		case 'finance-employee': {
			const { createFinanceEmployee } = await import(
				'./financeRoleApi'
			);
			return createFinanceEmployee(userData, token);
		}
		case 'legal-manager': {
			const { createLegalManager } = await import(
				'./legalRoleApi'
			);
			return createLegalManager(userData, token);
		}
		case 'legal-employee': {
			const { createLegalEmployee } = await import(
				'./legalRoleApi'
			);
			return createLegalEmployee(userData, token);
		}
		case 'salesman': {
			const { createSalesman } = await import(
				'./salesRoleApi'
			);
			return createSalesman(userData, token);
		}
		case 'sales-manager': {
			const { createSalesManager } = await import(
				'./salesRoleApi'
			);
			return createSalesManager(userData, token);
		}
		case 'maintenance-manager': {
			const { createMaintenanceManager } = await import(
				'./maintenanceRoleApi'
			);
			return createMaintenanceManager(userData, token);
		}
		case 'maintenance-support': {
			const { createMaintenanceSupport } = await import(
				'./maintenanceRoleApi'
			);
			return createMaintenanceSupport(userData, token);
		}
		case 'sales-support': {
			const { createSalesSupport } = await import(
				'./salesSupportRoleApi'
			);
			return createSalesSupport(userData, token);
		}
		case 'spare-parts-coordinator': {
			const { createSparePartsCoordinator } = await import(
				'./maintenanceRoleApi'
			);
			return createSparePartsCoordinator(userData, token);
		}
		case 'inventory-manager': {
			const { createInventoryManager } = await import(
				'./maintenanceRoleApi'
			);
			return createInventoryManager(userData, token);
		}
		default:
			throw new Error(`Unsupported role: ${role}`);
	}
};

// Change password for role-specific users
export const changeRoleSpecificPassword = async (
	passwordData: ChangePasswordRequest,
	token: string
): Promise<ChangePasswordResponse> => {
	return apiRequest<ChangePasswordResponse>(
		API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
		{
			method: 'POST',
			body: JSON.stringify(passwordData),
		},
		token
	);
};

// Super admin password update API function
export const updateUserPasswordBySuperAdmin = async (
	userId: string,
	newPassword: string,
	confirmPassword: string,
	token: string
): Promise<{
	success: boolean;
	message: string;
	userId: string;
	userName: string;
}> => {
	// Removed verbose console logs for production

	const response = await apiRequest<{
		success: boolean;
		message: string;
		userId: string;
		userName: string;
	}>(
		API_ENDPOINTS.AUTH.SUPERADMIN_UPDATE_PASSWORD,
		{
			method: 'POST',
			body: JSON.stringify({
				userId,
				newPassword,
				confirmPassword,
			}),
		},
		token
	);

	// Avoid logging API response in production
	return response;
};

// Get departments
export const getDepartments = async (
	token: string
): Promise<DepartmentInfo[]> => {
	return apiRequest<DepartmentInfo[]>(
		API_ENDPOINTS.DEPARTMENT.ALL,
		{ method: 'GET' },
		token
	);
};

// Get hospitals
export const getHospitals = async (token: string): Promise<HospitalInfo[]> => {
	return apiRequest<HospitalInfo[]>(
		API_ENDPOINTS.HOSPITAL.ALL,
		{ method: 'GET' },
		token
	);
};

// Get governorates
export const getGovernorates = async (
	token: string
): Promise<
	{
		governorateId: number;
		name: string;
		createdAt: string;
		isActive: boolean;
		engineerCount: number;
	}[]
> => {
	return apiRequest<
		{
			governorateId: number;
			name: string;
			createdAt: string;
			isActive: boolean;
			engineerCount: number;
		}[]
	>(API_ENDPOINTS.GOVERNORATE.ALL, { method: 'GET' }, token);
};
