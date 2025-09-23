// API service for role-specific user creation

import type {
	RoleSpecificUserRequest,
	RoleSpecificUserResponse,
	RoleSpecificUserRole,
	ChangePasswordRequest,
	ChangePasswordResponse,
	RoleSpecificApiError,
	DepartmentInfo,
	HospitalInfo,
} from '@/types/roleSpecificUser.types';
import { getApiUrl } from '@/config/api';

// API endpoints
const API_ENDPOINTS = {
	ROLE_SPECIFIC_USER: '/RoleSpecificUser',
	DOCTOR: '/RoleSpecificUser/doctor',
	ENGINEER: '/RoleSpecificUser/engineer',
	TECHNICIAN: '/RoleSpecificUser/technician',
	DELETE_USER: '/User',
	ADMIN: '/RoleSpecificUser/admin',
	FINANCE_MANAGER: '/RoleSpecificUser/finance-manager',
	FINANCE_EMPLOYEE: '/RoleSpecificUser/finance-employee',
	LEGAL_MANAGER: '/RoleSpecificUser/legal-manager',
	LEGAL_EMPLOYEE: '/RoleSpecificUser/legal-employee',
	SALESMAN: '/RoleSpecificUser/salesman',
	SALES_MANAGER: '/RoleSpecificUser/sales-manager',
	CHANGE_PASSWORD: '/Account/change-password',
	USER_IMAGE: '/User/image',
	USER_IMAGE_GET: '/User/image',
	USER_IMAGE_POST: '/User/image',
	USER_IMAGE_PUT: '/User/image',
	USER_IMAGE_DELETE: '/User/image',
	DEPARTMENTS: '/Department',
	HOSPITALS: '/Hospital',
} as const;

// Generic API request function
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	token?: string
): Promise<T> {
	const url = getApiUrl(endpoint);
	console.log('Making API request to:', url);

	const defaultHeaders: HeadersInit = {};

	// Only set Content-Type for JSON requests, not for FormData
	if (!(options.body instanceof FormData)) {
		defaultHeaders['Content-Type'] = 'application/json';
	}

	if (token) {
		defaultHeaders.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(url, {
		...options,
		headers: {
			...defaultHeaders,
			...options.headers,
		},
	});

	console.log('Response status:', response.status);
	console.log('Response ok:', response.ok);

	if (!response.ok) {
		const errorText = await response.text();
		let errorData: RoleSpecificApiError;

		try {
			errorData = JSON.parse(errorText);
		} catch {
			errorData = {
				message:
					errorText ||
					`HTTP ${response.status}: Request failed`,
				status: response.status,
			};
		}

		throw errorData;
	}

	const responseText = await response.text();
	let jsonData: T;

	try {
		jsonData = JSON.parse(responseText);
	} catch (parseError) {
		console.error('JSON parse error:', parseError);
		throw new Error('Failed to parse response as JSON');
	}

	return jsonData;
}

// Create role-specific user
export const createRoleSpecificUser = async <T extends RoleSpecificUserRequest>(
	role: RoleSpecificUserRole,
	userData: T,
	token: string
): Promise<RoleSpecificUserResponse> => {
	const endpoint = `${API_ENDPOINTS.ROLE_SPECIFIC_USER}/${role}`;

	console.log('Creating role-specific user:', role);
	console.log('User data:', userData);
	console.log('Endpoint:', endpoint);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with proper field mapping
	Object.entries(userData).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			if (key === 'profileImage' && value instanceof File) {
				formData.append('profileImage', value);
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

	console.log('FormData contents:');
	for (const [key, value] of formData.entries()) {
		console.log(`${key}:`, value);
	}

	return apiRequest<RoleSpecificUserResponse>(
		endpoint,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

// Specific functions for each role
export const createDoctor = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		departmentId?: number;
		specialty: string;
		hospitalId: string;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating doctor:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.DOCTOR);

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
		API_ENDPOINTS.DOCTOR,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

export const createEngineer = async (
	userData: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
		departmentId?: number;
		specialty: string;
		governorateIds: number[];
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating engineer:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.ENGINEER);

	// Create FormData for multipart/form-data request
	const formData = new FormData();

	// Add all user data fields to FormData with PascalCase field names
	formData.append('Email', userData.email);
	formData.append('Password', userData.password);
	formData.append('Specialty', userData.specialty);

	// Add governorate IDs as individual numbers
	userData.governorateIds.forEach((id, index) => {
		formData.append(`GovernorateIds[${index}]`, id.toString());
	});

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
		API_ENDPOINTS.ENGINEER,
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
		departmentId?: number;
		hospitalId: string;
		department: string;
		profileImage?: File;
		altText?: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	console.log('Creating technician:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.TECHNICIAN);

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
		API_ENDPOINTS.TECHNICIAN,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

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
	console.log('Using endpoint:', API_ENDPOINTS.ADMIN);

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
		API_ENDPOINTS.ADMIN,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

export const createFinanceManager = async (
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
	console.log('Creating finance manager:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.FINANCE_MANAGER);

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
		API_ENDPOINTS.FINANCE_MANAGER,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

// NEW: Finance Employee creation
export const createFinanceEmployee = async (
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
	console.log('Creating finance employee:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.FINANCE_EMPLOYEE);

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
		API_ENDPOINTS.FINANCE_EMPLOYEE,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

export const createLegalManager = async (
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
	console.log('Creating legal manager:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.LEGAL_MANAGER);

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
		API_ENDPOINTS.LEGAL_MANAGER,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

// NEW: Legal Employee creation
export const createLegalEmployee = async (
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
	console.log('Creating legal employee:', userData);
	console.log('Using endpoint:', API_ENDPOINTS.LEGAL_EMPLOYEE);

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
		API_ENDPOINTS.LEGAL_EMPLOYEE,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

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
	console.log('Using endpoint:', API_ENDPOINTS.SALESMAN);

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
		API_ENDPOINTS.SALESMAN,
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
	console.log('Using endpoint:', API_ENDPOINTS.SALES_MANAGER);

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
		API_ENDPOINTS.SALES_MANAGER,
		{
			method: 'POST',
			body: formData,
		},
		token
	);
};

// Change password
export const changePassword = async (
	passwordData: ChangePasswordRequest,
	token: string
): Promise<ChangePasswordResponse> => {
	return apiRequest<ChangePasswordResponse>(
		API_ENDPOINTS.CHANGE_PASSWORD,
		{
			method: 'POST',
			body: JSON.stringify(passwordData),
		},
		token
	);
};

// Update user information
export const updateUser = async (
	userId: string,
	userData: {
		firstName: string;
		lastName: string;
		userName: string;
		email: string;
		phoneNumber?: string;
		isActive: boolean;
	},
	token: string
): Promise<{ success: boolean; message: string }> => {
	return apiRequest<{ success: boolean; message: string }>(
		`/api/User/${userId}`,
		{
			method: 'PUT',
			body: JSON.stringify(userData),
		},
		token
	);
};

// Get departments
export const getDepartments = async (
	token: string
): Promise<DepartmentInfo[]> => {
	return apiRequest<DepartmentInfo[]>(
		API_ENDPOINTS.DEPARTMENTS,
		{ method: 'GET' },
		token
	);
};

// Get hospitals
export const getHospitals = async (token: string): Promise<HospitalInfo[]> => {
	return apiRequest<HospitalInfo[]>(
		API_ENDPOINTS.HOSPITALS,
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
	>('/Governorate', { method: 'GET' }, token);
};

// Password validation - updated to match backend requirements (min 6 chars, max 100 chars)
export const validatePassword = (
	password: string
): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (password.length < 6) {
		errors.push('Password must be at least 6 characters long');
	}

	if (password.length > 100) {
		errors.push('Password must be at most 100 characters long');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

// Email validation
export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Form validation helper
export const validateForm = (
	formData: Record<string, any>,
	requiredFields: string[]
): string[] => {
	const errors: string[] = [];

	requiredFields.forEach((field) => {
		if (
			!formData[field] ||
			(typeof formData[field] === 'string' &&
				formData[field].trim() === '')
		) {
			// Special handling for hospitalId to provide better error message
			if (field === 'hospitalId') {
				errors.push('Please select a hospital');
			} else {
				errors.push(`${field} is required`);
			}
		}
	});

	if (formData.email && !validateEmail(formData.email)) {
		errors.push('Please enter a valid email address');
	}

	if (formData.password) {
		const passwordValidation = validatePassword(formData.password);
		if (!passwordValidation.isValid) {
			errors.push(...passwordValidation.errors);
		}
	}

	if (
		formData.confirmPassword &&
		formData.password !== formData.confirmPassword
	) {
		errors.push('Passwords do not match');
	}

	return errors;
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
	console.log('Calling superadmin password update API with:', {
		userId,
		newPassword: '***',
		confirmPassword: '***',
		token: token ? 'present' : 'missing',
	});

	const response = await apiRequest<{
		success: boolean;
		message: string;
		userId: string;
		userName: string;
	}>(
		`/Account/superadmin-update-password`,
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

	console.log('API response:', response);
	return response;
};

// Helper function to create users with proper role mapping
export const createUserByRole = async (
	role: RoleSpecificUserRole,
	userData: any,
	token: string
): Promise<RoleSpecificUserResponse> => {
	switch (role) {
		case 'doctor':
			return createDoctor(userData, token);
		case 'engineer':
			return createEngineer(userData, token);
		case 'technician':
			return createTechnician(userData, token);
		case 'admin':
			return createAdmin(userData, token);
		case 'finance-manager':
			return createFinanceManager(userData, token);
		case 'finance-employee':
			return createFinanceEmployee(userData, token);
		case 'legal-manager':
			return createLegalManager(userData, token);
		case 'legal-employee':
			return createLegalEmployee(userData, token);
		case 'salesman':
			return createSalesman(userData, token);
		case 'sales-manager':
			return createSalesManager(userData, token);
		default:
			throw new Error(`Unsupported role: ${role}`);
	}
};

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
		API_ENDPOINTS.USER_IMAGE_POST,
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
		API_ENDPOINTS.USER_IMAGE_PUT,
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
		API_ENDPOINTS.USER_IMAGE_GET,
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
		API_ENDPOINTS.USER_IMAGE_DELETE,
		{
			method: 'DELETE',
		},
		token
	);
}

// Delete User API Types
export interface DeleteUserResponse {
	message: string;
	userId: string;
	userName: string;
	email: string;
	deletedAt: string;
	code: string;
}

export interface DeleteUserError {
	error: string;
	code: string;
	timestamp: string;
	details?: Array<{
		code: string;
		description: string;
	}>;
}

// Delete User API Function
export const deleteUser = async (
	userId: string,
	token: string
): Promise<DeleteUserResponse> => {
	return apiRequest<DeleteUserResponse>(
		`${API_ENDPOINTS.DELETE_USER}?userId=${userId}`,
		{
			method: 'DELETE',
		},
		token
	);
};
