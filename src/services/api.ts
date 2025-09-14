import { API_BASE_URL } from '@/utils/constants';
import type {
	UserListResponse,
	UserStatusRequest,
	UserStatusResponse,
} from '@/types/user.types';
import type {
	Department,
	DepartmentUsersResponse,
	UserSearchResponse,
	Role,
	RoleUsersResponse,
} from '@/types/department.types';

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const config: RequestInit = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
			...options,
		};

		const response = await fetch(url, config);

		if (!response.ok) {
			throw new Error(
				`HTTP error! status: ${response.status}`
			);
		}

		return response.json();
	}

	async get<T>(endpoint: string, token?: string): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'GET',
			headers: token
				? { Authorization: `Bearer ${token}` }
				: {},
		});
	}

	async post<T>(
		endpoint: string,
		data?: any,
		token?: string
	): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
			headers: token
				? { Authorization: `Bearer ${token}` }
				: {},
		});
	}

	async delete<T>(endpoint: string, token?: string): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'DELETE',
			headers: token
				? { Authorization: `Bearer ${token}` }
				: {},
		});
	}

	async put<T>(endpoint: string, data?: any, token?: string): Promise<T> {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
			headers,
		});
	}
}

export const apiClient = new ApiClient(API_BASE_URL);

// Function to fetch all users with loading state
export const fetchUsers = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserListResponse[]> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<UserListResponse[]>('/User', token);
	} finally {
		setLoading?.(false);
	}
};

// Function to fetch all departments with loading state
export const fetchDepartments = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<Department[]> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<Department[]>('/Department', token);
	} finally {
		setLoading?.(false);
	}
};

// Function to fetch users by department with loading state
export const fetchUsersByDepartment = async (
	departmentId: number,
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<DepartmentUsersResponse> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<DepartmentUsersResponse>(
			`/User/department/${departmentId}`,
			token
		);
	} finally {
		setLoading?.(false);
	}
};

// Function to search user by username with loading state
export const searchUserByUsername = async (
	username: string,
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserSearchResponse> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	if (!username.trim()) {
		throw new Error('Username is required');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<UserSearchResponse>(
			`/User/username/${encodeURIComponent(username.trim())}`,
			token
		);
	} finally {
		setLoading?.(false);
	}
};

// Function to fetch all roles with loading state
export const fetchRoles = async (
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<Role[]> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<Role[]>('/Role', token);
	} finally {
		setLoading?.(false);
	}
};

// Function to fetch users by role with loading state
export const fetchUsersByRole = async (
	role: string,
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<RoleUsersResponse> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	if (!role.trim()) {
		throw new Error('Role is required');
	}

	try {
		setLoading?.(true);
		return await apiClient.get<RoleUsersResponse>(
			`/User/role/${encodeURIComponent(role.trim())}`,
			token
		);
	} finally {
		setLoading?.(false);
	}
};

// Function to activate/deactivate user with loading state
export const updateUserStatus = async (
	request: UserStatusRequest,
	token: string,
	setLoading?: (loading: boolean) => void
): Promise<UserStatusResponse> => {
	if (!token) {
		throw new Error('No authentication token provided');
	}

	if (!request.userId.trim()) {
		throw new Error('User ID is required');
	}

	if (
		!request.action ||
		!['activate', 'deactivate'].includes(request.action)
	) {
		throw new Error(
			'Valid action (activate/deactivate) is required'
		);
	}

	if (!request.reason.trim()) {
		throw new Error('Reason is required');
	}

	try {
		setLoading?.(true);

		// Debug logging
		console.log('🔄 Making user status update request:', {
			endpoint: '/User/activate-deactivate',
			method: 'PUT',
			request,
			token: token
				? `${token.substring(0, 20)}...`
				: 'No token',
		});

		const response = await apiClient.put<UserStatusResponse>(
			'/User/activate-deactivate',
			request,
			token
		);

		console.log('✅ User status update successful:', response);
		return response;
	} catch (error) {
		console.error('❌ User status update failed:', error);
		throw error;
	} finally {
		setLoading?.(false);
	}
};
