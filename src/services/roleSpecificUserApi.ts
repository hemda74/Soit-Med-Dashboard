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
	CHANGE_PASSWORD: '/Account/change-password',
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

	const defaultHeaders: HeadersInit = {
		'Content-Type': 'application/json',
	};

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

	return apiRequest<RoleSpecificUserResponse>(
		endpoint,
		{
			method: 'POST',
			body: JSON.stringify(userData),
		},
		token
	);
};

// Specific functions for each role
export const createDoctor = async (
	userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		departmentId: number;
		specialty: string;
		hospitalId: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	return createRoleSpecificUser('doctor', userData, token);
};

export const createEngineer = async (
	userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		departmentId: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	return createRoleSpecificUser('engineer', userData, token);
};

export const createTechnician = async (
	userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		hospitalId: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	return createRoleSpecificUser('technician', userData, token);
};

export const createAdmin = async (
	userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		departmentId: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	return createRoleSpecificUser('admin', userData, token);
};

export const createFinanceManager = async (
	userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		departmentId: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	return createRoleSpecificUser('finance-manager', userData, token);
};

export const createLegalManager = async (
	userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		departmentId: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	return createRoleSpecificUser('legal-manager', userData, token);
};

export const createSalesman = async (
	userData: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		departmentId: string;
	},
	token: string
): Promise<RoleSpecificUserResponse> => {
	return createRoleSpecificUser('salesman', userData, token);
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

// Password validation
export const validatePassword = (
	password: string
): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push(
			'Password must contain at least one uppercase letter'
		);
	}

	if (!/[a-z]/.test(password)) {
		errors.push(
			'Password must contain at least one lowercase letter'
		);
	}

	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		errors.push(
			'Password must contain at least one special character'
		);
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
			errors.push(`${field} is required`);
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
