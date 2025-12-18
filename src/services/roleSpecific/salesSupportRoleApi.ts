// Sales Support Role API Service

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type {
	SalesSupportUserRequest,
	SalesSupportUserResponse,
} from '@/types/roleSpecificUser.types';

/**
 * Create a new Sales Support user
 * @param userData - Sales Support user data
 * @param token - Authentication token
 * @returns Promise<SalesSupportUserResponse>
 */
export const createSalesSupport = async (
	userData: SalesSupportUserRequest,
	token: string
): Promise<SalesSupportUserResponse> => {
	console.log('Creating Sales Support user:', userData);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with exact API field names
	if (userData.email) formData.append('Email', userData.email);
	if (userData.password) formData.append('Password', userData.password);
	if (userData.firstName)
		formData.append('FirstName', userData.firstName);
	if (userData.lastName) formData.append('LastName', userData.lastName);
	if (userData.phoneNumber)
		formData.append('PhoneNumber', userData.phoneNumber);
	if (userData.personalMail)
		formData.append('PersonalMail', userData.personalMail);
	if (userData.departmentId)
		formData.append(
			'DepartmentId',
			userData.departmentId.toString()
		);
	if (userData.altText) formData.append('AltText', userData.altText);
	if (userData.supportSpecialization)
		formData.append(
			'SupportSpecialization',
			userData.supportSpecialization
		);
	if (userData.supportLevel)
		formData.append('SupportLevel', userData.supportLevel);
	if (userData.notes) formData.append('Notes', userData.notes);

	// Handle profile image upload - the API expects it as a file field
	if (userData.profileImage && userData.profileImage instanceof File) {
		formData.append('ProfileImage', userData.profileImage);
	}

	console.log('FormData contents for Sales Support:');
	for (const [key, value] of formData.entries()) {
		console.log(`${key}:`, value);
	}

	const endpoint = `${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport`;

	return apiRequest<SalesSupportUserResponse>(
		endpoint,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

/**
 * Get Sales Support user by ID
 * @param userId - User ID
 * @param token - Authentication token
 * @returns Promise<SalesSupportUserResponse>
 */
export const getSalesSupport = async (
	userId: string,
	token: string
): Promise<SalesSupportUserResponse> => {
	return apiRequest<SalesSupportUserResponse>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport/${userId}`,
		{
			method: 'GET',
		},
		token
	);
};

/**
 * Update Sales Support user
 * @param userId - User ID
 * @param userData - Updated user data
 * @param token - Authentication token
 * @returns Promise<SalesSupportUserResponse>
 */
export const updateSalesSupport = async (
	userId: string,
	userData: Partial<SalesSupportUserRequest>,
	token: string
): Promise<SalesSupportUserResponse> => {
	console.log('Updating Sales Support user:', userId, userData);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with proper field mapping
	Object.entries(userData).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			if (key === 'profileImage' && value instanceof File) {
				formData.append('profileImage', value);
			} else if (key === 'altText') {
				formData.append('AltText', value as string);
			} else {
				// Convert camelCase to PascalCase for API
				const apiKey =
					key.charAt(0).toUpperCase() +
					key.slice(1);
				formData.append(apiKey, value as string);
			}
		}
	});

	return apiRequest<SalesSupportUserResponse>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport/${userId}`,
		{
			method: 'PUT',
			body: formData,
		},
		token
	);
};

/**
 * Delete Sales Support user
 * @param userId - User ID
 * @param token - Authentication token
 * @returns Promise<{ success: boolean; message: string }>
 */
export const deleteSalesSupport = async (
	userId: string,
	token: string
): Promise<{ success: boolean; message: string }> => {
	return apiRequest<{ success: boolean; message: string }>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport/${userId}`,
		{
			method: 'DELETE',
		},
		token
	);
};

/**
 * Get all Sales Support users
 * @param token - Authentication token
 * @returns Promise<SalesSupportUserResponse[]>
 */
export const getAllSalesSupport = async (
	token: string
): Promise<SalesSupportUserResponse[]> => {
	return apiRequest<SalesSupportUserResponse[]>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport`,
		{
			method: 'GET',
		},
		token
	);
};

/**
 * Get Sales Support users by department
 * @param departmentId - Department ID
 * @param token - Authentication token
 * @returns Promise<SalesSupportUserResponse[]>
 */
export const getSalesSupportByDepartment = async (
	departmentId: number,
	token: string
): Promise<SalesSupportUserResponse[]> => {
	return apiRequest<SalesSupportUserResponse[]>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport/department/${departmentId}`,
		{
			method: 'GET',
		},
		token
	);
};

/**
 * Get Sales Support users by support level
 * @param supportLevel - Support level (Junior, Senior, Lead, Specialist)
 * @param token - Authentication token
 * @returns Promise<SalesSupportUserResponse[]>
 */
export const getSalesSupportByLevel = async (
	supportLevel: string,
	token: string
): Promise<SalesSupportUserResponse[]> => {
	return apiRequest<SalesSupportUserResponse[]>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport/level/${supportLevel}`,
		{
			method: 'GET',
		},
		token
	);
};

/**
 * Get Sales Support users by specialization
 * @param specialization - Support specialization
 * @param token - Authentication token
 * @returns Promise<SalesSupportUserResponse[]>
 */
export const getSalesSupportBySpecialization = async (
	specialization: string,
	token: string
): Promise<SalesSupportUserResponse[]> => {
	return apiRequest<SalesSupportUserResponse[]>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport/specialization/${specialization}`,
		{
			method: 'GET',
		},
		token
	);
};

/**
 * Get Sales Support statistics
 * @param token - Authentication token
 * @returns Promise<{
 *   totalCount: number;
 *   byLevel: Record<string, number>;
 *   bySpecialization: Record<string, number>;
 *   byDepartment: Record<string, number>;
 * }>
 */
export const getSalesSupportStatistics = async (
	token: string
): Promise<{
	totalCount: number;
	byLevel: Record<string, number>;
	bySpecialization: Record<string, number>;
	byDepartment: Record<string, number>;
}> => {
	return apiRequest<{
		totalCount: number;
		byLevel: Record<string, number>;
		bySpecialization: Record<string, number>;
		byDepartment: Record<string, number>;
	}>(
		`${API_ENDPOINTS.ROLE_SPECIFIC_USER.BASE}/SalesSupport/statistics`,
		{
			method: 'GET',
		},
		token
	);
};
