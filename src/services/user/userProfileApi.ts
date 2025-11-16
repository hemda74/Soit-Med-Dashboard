// User profile management API services

import { apiRequest } from '../shared/apiClient';
import { API_ENDPOINTS } from '../shared/endpoints';

// Profile image upload response interface
export interface ProfileImageUploadResponse {
	userId: string;
	message: string;
	profileImage: {
		id: number;
		fileName: string;
		filePath: string;
		contentType: string;
		fileSize: number;
		altText: string;
		isProfileImage: boolean;
		uploadedAt: string;
		isActive: boolean;
	};
	updatedAt: string;
}

// Profile image response interface for GET
export interface ProfileImageGetResponse {
	id: number;
	fileName: string;
	filePath: string;
	contentType: string;
	fileSize: number;
	altText: string;
	isProfileImage: boolean;
	uploadedAt: string;
	isActive: boolean;
}

// Profile image delete response interface
export interface ProfileImageDeleteResponse {
	userId: string;
	message: string;
	deletedAt: string;
}

// Upload profile image (POST - for new image)
export async function uploadProfileImage(
	file: File,
	altText: string = '',
	token: string
): Promise<ProfileImageUploadResponse> {
	const formData = new FormData();
	formData.append('profileImage', file);
	formData.append('AltText', altText);

	return apiRequest<ProfileImageUploadResponse>(
		API_ENDPOINTS.USER.IMAGE,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
}

// Update profile image (PUT - for existing image)
export async function updateProfileImage(
	file: File,
	altText: string = '',
	token: string
): Promise<ProfileImageUploadResponse> {
	const formData = new FormData();
	formData.append('profileImage', file);
	formData.append('AltText', altText);

	return apiRequest<ProfileImageUploadResponse>(
		API_ENDPOINTS.USER.IMAGE,
		{
			method: 'PUT',
			body: formData,
		},
		token
	);
}

// Get profile image
export async function getProfileImage(
	token: string
): Promise<ProfileImageGetResponse> {
	return apiRequest<ProfileImageGetResponse>(
		API_ENDPOINTS.USER.IMAGE,
		{
			method: 'GET',
		},
		token
	);
}

// Delete profile image
export async function deleteProfileImage(
	token: string
): Promise<ProfileImageDeleteResponse> {
	return apiRequest<ProfileImageDeleteResponse>(
		API_ENDPOINTS.USER.IMAGE,
		{
			method: 'DELETE',
		},
		token
	);
}

// Update user information
export const updateUser = async (
	userId: string,
	userData: {
		email: string;
		role: string;
		firstName: string;
		lastName: string;
		password?: string;
	},
	token: string
): Promise<{ success: boolean; message: string }> => {
	// Only send the fields that the API expects
	const apiData = {
		email: userData.email,
		role: userData.role,
		firstName: userData.firstName,
		lastName: userData.lastName,
		...(userData.password && { password: userData.password }),
	};

	return apiRequest<{ success: boolean; message: string }>(
		API_ENDPOINTS.USER.BY_ID(userId),
		{
			method: 'PATCH',
			body: JSON.stringify(apiData),
		},
		token
	);
};

// Update current user profile (PATCH /api/User/me)
export interface UpdateProfileRequest {
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	personalMail?: string;
	dateOfBirth?: string; // ISO 8601 date string
}

export interface UpdateProfileResponse {
	success: boolean;
	message: string;
	data?: any;
}

export const updateCurrentUserProfile = async (
	profileData: UpdateProfileRequest,
	token: string
): Promise<UpdateProfileResponse> => {
	// Only send fields that are provided
	const apiData: UpdateProfileRequest = {};
	
	if (profileData.firstName !== undefined) {
		apiData.firstName = profileData.firstName;
	}
	if (profileData.lastName !== undefined) {
		apiData.lastName = profileData.lastName;
	}
	if (profileData.phoneNumber !== undefined) {
		apiData.phoneNumber = profileData.phoneNumber;
	}
	if (profileData.personalMail !== undefined) {
		apiData.personalMail = profileData.personalMail;
	}
	if (profileData.dateOfBirth !== undefined) {
		apiData.dateOfBirth = profileData.dateOfBirth;
	}

	return apiRequest<UpdateProfileResponse>(
		API_ENDPOINTS.AUTH.CURRENT_USER,
		{
			method: 'PATCH',
			body: JSON.stringify(apiData),
		},
		token
	);
};
