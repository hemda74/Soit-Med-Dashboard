// Sales role-specific user creation API services (Salesman, Sales Manager)

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { RoleSpecificUserResponse } from '@/types/roleSpecificUser.types';

export const createSalesman = async (
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
	console.log('Creating salesman:', userData);
	console.log(
		'Using endpoint:',
		API_ENDPOINTS.ROLE_SPECIFIC_USER.SALESMAN
	);

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
		API_ENDPOINTS.ROLE_SPECIFIC_USER.SALESMAN,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

export const createSalesManager = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		departmentId?: number;
		salesTerritory?: string;
		salesTeam?: string;
		salesTarget?: number;
		managerNotes?: string;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating sales manager:', userData);
	console.log(
		'Using endpoint:',
		API_ENDPOINTS.ROLE_SPECIFIC_USER.SALES_MANAGER
	);

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
	if (userData.salesTerritory) {
		formData.append('SalesTerritory', userData.salesTerritory);
	}
	if (userData.salesTeam) {
		formData.append('SalesTeam', userData.salesTeam);
	}
	if (userData.salesTarget !== undefined) {
		formData.append('SalesTarget', userData.salesTarget.toString());
	}
	if (userData.managerNotes) {
		formData.append('ManagerNotes', userData.managerNotes);
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
		API_ENDPOINTS.ROLE_SPECIFIC_USER.SALES_MANAGER,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};
