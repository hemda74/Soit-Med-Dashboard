// Medical role-specific user creation API services (Doctor, Technician)

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';
import type { RoleSpecificUserResponse } from '@/types/roleSpecificUser.types';

export const createDoctor = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
		departmentId?: number;
		specialty: string;
		hospitalId: string;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating doctor:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.ROLE_SPECIFIC_USER.DOCTOR);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with PascalCase field names
	formData.append('Email', userData.email);
	formData.append('Password', userData.password);
	formData.append('Specialty', userData.specialty);
	formData.append('HospitalId', userData.hospitalId);

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
		API_ENDPOINTS.ROLE_SPECIFIC_USER.DOCTOR,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

export const createTechnician = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
		departmentId?: number;
		hospitalId: string;
		department: string;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating technician:', userData);
	console.log(
		'Using endpoint:',
		API_ENDPOINTS.ROLE_SPECIFIC_USER.TECHNICIAN
	);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with PascalCase field names
	formData.append('Email', userData.email);
	formData.append('Password', userData.password);
	formData.append('Department', userData.department);
	formData.append('HospitalId', userData.hospitalId);

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
		API_ENDPOINTS.ROLE_SPECIFIC_USER.TECHNICIAN,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};
