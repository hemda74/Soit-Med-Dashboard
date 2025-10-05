// Maintenance role-specific user creation API services (Maintenance Manager, Maintenance Support)

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { RoleSpecificUserResponse } from '@/types/roleSpecificUser.types';

export const createMaintenanceManager = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
		departmentId?: number;
		maintenanceSpecialty?: string;
		certification?: string;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating maintenance manager:', userData);
	console.log(
		'Using endpoint:',
		API_ENDPOINTS.ROLE_SPECIFIC_USER.MAINTENANCE_MANAGER
	);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with PascalCase field names
	formData.append('Email', userData.email);
	formData.append('Password', userData.password);
	if (userData.maintenanceSpecialty) {
		formData.append(
			'MaintenanceSpecialty',
			userData.maintenanceSpecialty
		);
	}
	if (userData.certification) {
		formData.append('Certification', userData.certification);
	}

	// Add optional fields
	if (userData.firstName) {
		formData.append('FirstName', userData.firstName);
	}
	if (userData.lastName) {
		formData.append('LastName', userData.lastName);
	}
	if (userData.phoneNumber) {
		formData.append('PhoneNumber', userData.phoneNumber);
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
		API_ENDPOINTS.ROLE_SPECIFIC_USER.MAINTENANCE_MANAGER,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

export const createMaintenanceSupport = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
		departmentId?: number;
		jobTitle?: string;
		technicalSkills?: string;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating maintenance support:', userData);
	console.log(
		'Using endpoint:',
		API_ENDPOINTS.ROLE_SPECIFIC_USER.MAINTENANCE_SUPPORT
	);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with PascalCase field names
	formData.append('Email', userData.email);
	formData.append('Password', userData.password);
	if (userData.jobTitle) {
		formData.append('JobTitle', userData.jobTitle);
	}
	if (userData.technicalSkills) {
		formData.append('TechnicalSkills', userData.technicalSkills);
	}

	// Add optional fields
	if (userData.firstName) {
		formData.append('FirstName', userData.firstName);
	}
	if (userData.lastName) {
		formData.append('LastName', userData.lastName);
	}
	if (userData.phoneNumber) {
		formData.append('PhoneNumber', userData.phoneNumber);
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
		API_ENDPOINTS.ROLE_SPECIFIC_USER.MAINTENANCE_SUPPORT,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};
