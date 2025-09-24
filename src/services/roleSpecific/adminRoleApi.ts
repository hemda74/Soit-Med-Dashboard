// Admin role-specific user creation API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { RoleSpecificUserResponse } from '@/types/roleSpecificUser.types';

export const createAdmin = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		departmentId?: number;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating admin:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.ROLE_SPECIFIC_USER.ADMIN);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with PascalCase field names
	formData.append('Email', userData.email);
	formData.append('Password', userData.password);

	// Add optional fields
	if (userData.firstName) {
		formData.append('FirstName', userData.firstName);
	}
	if (userData.lastName) {
		formData.append('LastName', userData.lastName);
	}
	if (userData.departmentId) {
		formData.append(
			'DepartmentId',
			userData.departmentId.toString()
		);
	}
	if (userData.profileImage) {
		formData.append('profileImage', userData.profileImage);
	}
	if (userData.altText) {
		formData.append('AltText', userData.altText);
	}

	console.log('FormData contents:');
	for (const [key, value] of formData.entries()) {
		console.log(`${key}:`, value);
	}

	return apiRequest<RoleSpecificUserResponse>(
		API_ENDPOINTS.ROLE_SPECIFIC_USER.ADMIN,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};
