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
		case 'Doctor': {
			const { createDoctor } = await import(
				'./medicalRoleApi'
			);
			return createDoctor(
				userData as DoctorUserRequest,
				token
			);
		}
		case 'Engineer': {
			const { createEngineer } = await import(
				'./technicalRoleApi'
			);
			return createEngineer(
				userData as EngineerUserRequest,
				token
			);
		}
		case 'Technician': {
			const { createTechnician } = await import(
				'./medicalRoleApi'
			);
			return createTechnician(
				userData as TechnicianUserRequest,
				token
			);
		}
		case 'Admin': {
			const { createAdmin } = await import('./AdminRoleApi');
			return createAdmin(userData, token);
		}
		case 'FinanceManager': {
			const { createFinanceManager } = await import(
				'./financeRoleApi'
			);
			return createFinanceManager(userData, token);
		}
		case 'FinanceEmployee': {
			const { createFinanceEmployee } = await import(
				'./financeRoleApi'
			);
			return createFinanceEmployee(userData, token);
		}
		case 'LegalManager': {
			const { createLegalManager } = await import(
				'./legalRoleApi'
			);
			return createLegalManager(userData, token);
		}
		case 'LegalEmployee': {
			const { createLegalEmployee } = await import(
				'./legalRoleApi'
			);
			return createLegalEmployee(userData, token);
		}
		case 'SalesMan': {
			const { createSalesMan } = await import(
				'./salesRoleApi'
			);
			return createSalesMan(userData, token);
		}
		case 'SalesManager': {
			const { createSalesManager } = await import(
				'./salesRoleApi'
			);
			return createSalesManager(userData, token);
		}
		case 'MaintenanceManager': {
			const { createMaintenanceManager } = await import(
				'./maintenanceRoleApi'
			);
			return createMaintenanceManager(userData, token);
		}
		case 'MaintenanceSupport': {
			const { createMaintenanceSupport } = await import(
				'./maintenanceRoleApi'
			);
			return createMaintenanceSupport(userData, token);
		}
		case 'SalesSupport': {
			const { createSalesSupport } = await import(
				'./salesSupportRoleApi'
			);
			return createSalesSupport(userData, token);
		}
		case 'SparePartsCoordinator': {
			const { createSparePartsCoordinator } = await import(
				'./maintenanceRoleApi'
			);
			return createSparePartsCoordinator(userData, token);
		}
		case 'InventoryManager': {
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

// Super Admin password update API function
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
		EngineerCount: number;
	}[]
> => {
	return apiRequest<
		{
			governorateId: number;
			name: string;
			createdAt: string;
			isActive: boolean;
			EngineerCount: number;
		}[]
	>(API_ENDPOINTS.GOVERNORATE.ALL, { method: 'GET' }, token);
};
