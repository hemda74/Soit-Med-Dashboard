// API service functions for user creation flow

import type {
	UserRole,
	RolesResponse,
	RoleObject,
	RoleFieldsResponse,
	Hospital,
	Governorate,
	Department,
	UserCreationData,
	UserCreationResponse,
	ApiError,
} from '../types/userCreation.types';
import { getApiUrl } from '../config/api';

// Enhanced API configuration for user creation endpoints
const USER_CREATION_ENDPOINTS = {
	AVAILABLE_ROLES: '/Role',
	ROLE_FIELDS: '/Role/fields',
	HOSPITALS: '/Hospital',
	GOVERNORATES: '/Governorate',
	DEPARTMENTS: '/Department',
	CREATE_USER_BASE: '/RoleSpecificUser',
} as const;

// Generic API request function with error handling
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
		console.log('Authorization header added');
	} else {
		console.log('No token provided for authorization');
	}

	console.log('Request headers:', defaultHeaders);
	console.log('Request options:', options);

	const response = await fetch(url, {
		...options,
		headers: {
			...defaultHeaders,
			...options.headers,
		},
	});

	console.log('🌐 Response status:', response.status);
	console.log('🌐 Response ok:', response.ok);
	console.log(
		'🌐 Response headers:',
		Object.fromEntries(response.headers.entries())
	);

	if (!response.ok) {
		const errorText = await response.text();
		let errorData: ApiError;

		try {
			errorData = JSON.parse(errorText);
		} catch {
			errorData = {
				message:
					errorText ||
					`HTTP ${response.status}: Request failed`,
				statusCode: response.status,
			};
		}

		throw errorData;
	}

	const responseText = await response.text();
	console.log('📄 Raw response text:', responseText);

	let jsonData;
	try {
		jsonData = JSON.parse(responseText);
		console.log('✅ Parsed JSON data:', jsonData);
	} catch (parseError) {
		console.error('❌ JSON parse error:', parseError);
		console.error('📄 Failed to parse text:', responseText);
		throw new Error('Failed to parse response as JSON');
	}

	return jsonData;
}

// Step 1: Get all available roles
export const getAvailableRoles = async (
	token: string
): Promise<RoleObject[]> => {
	console.log(
		'getAvailableRoles called with token:',
		token ? 'Token provided' : 'No token'
	);
	console.log('API endpoint:', USER_CREATION_ENDPOINTS.AVAILABLE_ROLES);

	const response = await apiRequest<RolesResponse>(
		USER_CREATION_ENDPOINTS.AVAILABLE_ROLES,
		{ method: 'GET' },
		token
	);

	console.log('🎯 Complete API response from /api/Role:', response);
	console.log('📊 Response type:', typeof response);
	console.log(
		'📏 Response length:',
		Array.isArray(response) ? response.length : 'Not an array'
	);
	console.log(
		'🔍 Response structure:',
		JSON.stringify(response, null, 2)
	);

	if (Array.isArray(response) && response.length > 0) {
		console.log(
			'📋 Role objects with names:',
			response.map((role) => ({
				id: role.id,
				name: role.name,
			}))
		);
		console.log('✅ First role example:', response[0]);
	} else {
		console.warn('⚠️ No roles found or response is not an array');
	}

	console.log('🚀 Returning response:', response);
	return response;
};

// Utility function to create slug from role name
export const createRoleSlug = (roleName: string): string => {
	return roleName
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
};

// Step 2: Get role-specific fields
export const getRoleFields = async (
	role: UserRole,
	token: string
): Promise<RoleFieldsResponse> => {
	return apiRequest<RoleFieldsResponse>(
		`${USER_CREATION_ENDPOINTS.ROLE_FIELDS}/${role}`,
		{ method: 'GET' },
		token
	);
};

// Step 3: Get reference data
export const getHospitals = async (token: string): Promise<Hospital[]> => {
	return apiRequest<Hospital[]>(
		USER_CREATION_ENDPOINTS.HOSPITALS,
		{ method: 'GET' },
		token
	);
};

export const getGovernorates = async (
	token: string
): Promise<Governorate[]> => {
	console.log('🏛️ Calling getGovernorates API');
	console.log(
		'📍 Governorate endpoint:',
		USER_CREATION_ENDPOINTS.GOVERNORATES
	);

	const response = await apiRequest<Governorate[]>(
		USER_CREATION_ENDPOINTS.GOVERNORATES,
		{ method: 'GET' },
		token
	);

	console.log('🎯 Governorates API response:', response);
	console.log('📊 Number of governorates:', response.length);
	console.log(
		'📝 Active governorates:',
		response.filter((g) => g.isActive).length
	);

	// Filter only active governorates
	const activeGovernorates = response.filter((gov) => gov.isActive);
	console.log('✅ Returning active governorates:', activeGovernorates);

	return activeGovernorates;
};

export const getDepartments = async (token: string): Promise<Department[]> => {
	return apiRequest<Department[]>(
		USER_CREATION_ENDPOINTS.DEPARTMENTS,
		{ method: 'GET' },
		token
	);
};

// Step 4: Create user with role-specific data
export const createUser = async (
	role: UserRole,
	userData: UserCreationData,
	token: string
): Promise<UserCreationResponse> => {
	const endpoint = `${
		USER_CREATION_ENDPOINTS.CREATE_USER_BASE
	}/${role.toLowerCase()}`;

	console.log('🚀 Creating user with role:', role);
	console.log('📝 User data:', userData);
	console.log('🔗 API endpoint:', endpoint);

	return apiRequest<UserCreationResponse>(
		endpoint,
		{
			method: 'POST',
			body: JSON.stringify(userData),
		},
		token
	);
};

// Specific function for creating Engineer users
export const createEngineerUser = async (
	userData: {
		userName: string;
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		specialty: string;
		governorateIds: number[];
	},
	token: string
): Promise<UserCreationResponse> => {
	const endpoint = `${USER_CREATION_ENDPOINTS.CREATE_USER_BASE}/engineer`;

	console.log('🔧 Creating Engineer user');
	console.log('📝 Engineer data:', userData);
	console.log('🔗 Engineer endpoint:', endpoint);
	console.log('🏛️ Governorate IDs being sent:', userData.governorateIds);

	return apiRequest<UserCreationResponse>(
		endpoint,
		{
			method: 'POST',
			body: JSON.stringify(userData),
		},
		token
	);
};

// Utility functions for form validation
export const validateField = (
	_fieldName: string,
	value: any,
	field: any
): string | null => {
	// Required field validation
	if (
		field.required &&
		(!value || (typeof value === 'string' && value.trim() === ''))
	) {
		return `${field.label} is required`;
	}

	// Type-specific validation
	switch (field.type) {
		case 'email':
			if (
				value &&
				!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
			) {
				return 'Please enter a valid email address';
			}
			break;

		case 'password':
			if (
				value &&
				field.validation?.minLength &&
				value.length < field.validation.minLength
			) {
				return `Password must be at least ${field.validation.minLength} characters long`;
			}
			if (value && field.validation?.pattern) {
				const regex = new RegExp(
					field.validation.pattern
				);
				if (!regex.test(value)) {
					return 'Password does not meet complexity requirements';
				}
			}
			break;

		case 'string':
			if (
				value &&
				field.validation?.minLength &&
				value.length < field.validation.minLength
			) {
				return `${field.label} must be at least ${field.validation.minLength} characters long`;
			}
			if (
				value &&
				field.validation?.maxLength &&
				value.length > field.validation.maxLength
			) {
				return `${field.label} must not exceed ${field.validation.maxLength} characters`;
			}
			break;

		case 'number':
			const numValue = Number(value);
			if (value && isNaN(numValue)) {
				return `${field.label} must be a valid number`;
			}
			if (
				field.validation?.min !== undefined &&
				numValue < field.validation.min
			) {
				return `${field.label} must be at least ${field.validation.min}`;
			}
			if (
				field.validation?.max !== undefined &&
				numValue > field.validation.max
			) {
				return `${field.label} must not exceed ${field.validation.max}`;
			}
			break;
	}

	return null;
};

// Validate entire form
export const validateForm = (
	formData: Record<string, any>,
	fields: any[]
): Array<{ field: string; message: string }> => {
	const errors: Array<{ field: string; message: string }> = [];

	fields.forEach((field) => {
		const error = validateField(
			field.name,
			formData[field.name],
			field
		);
		if (error) {
			errors.push({ field: field.name, message: error });
		}
	});

	return errors;
};

// Get all required reference data for a role
export const getReferenceDataForRole = async (
	roleFields: RoleFieldsResponse,
	token: string
): Promise<{
	hospitals: Hospital[];
	governorates: Governorate[];
	departments: Department[];
}> => {
	const referenceData = {
		hospitals: [] as Hospital[],
		governorates: [] as Governorate[],
		departments: [] as Department[],
	};

	// Fetch data based on requiredData endpoints
	const fetchPromises = roleFields.requiredData.map(async (dataReq) => {
		try {
			if (dataReq.endpoint.includes('Hospital')) {
				referenceData.hospitals = await getHospitals(
					token
				);
			} else if (dataReq.endpoint.includes('Governorate')) {
				referenceData.governorates =
					await getGovernorates(token);
			} else if (dataReq.endpoint.includes('Department')) {
				referenceData.departments =
					await getDepartments(token);
			}
		} catch (error) {
			console.warn(
				`Failed to fetch reference data from ${dataReq.endpoint}:`,
				error
			);
		}
	});

	// Always try to fetch departments as they're commonly needed
	try {
		referenceData.departments = await getDepartments(token);
	} catch (error) {
		console.warn('Failed to fetch departments:', error);
	}

	await Promise.allSettled(fetchPromises);
	return referenceData;
};

// Transform form data based on field types
export const transformFormData = (
	formData: Record<string, any>,
	fields: any[]
): UserCreationData => {
	const transformed: Record<string, any> = {};

	fields.forEach((field) => {
		const value = formData[field.name];

		if (value !== undefined && value !== null && value !== '') {
			switch (field.type) {
				case 'number':
					transformed[field.name] = Number(value);
					break;
				case 'multiselect':
					// Handle array values for multiselect
					transformed[field.name] = Array.isArray(
						value
					)
						? value
						: [value];
					break;
				case 'boolean':
					transformed[field.name] =
						Boolean(value);
					break;
				default:
					transformed[field.name] = value;
			}
		}
	});

	return transformed as UserCreationData;
};
