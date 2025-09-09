export interface Department {
	id: number;
	name: string;
	description: string;
	createdAt: string;
	userCount: number;
}

export interface DepartmentUser {
	id: string;
	userName: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	isActive: boolean;
	createdAt: string;
	lastLoginAt: string | null;
	roles: string[];
	departmentId: number;
	departmentName: string;
	departmentDescription: string;
}

export interface DepartmentUsersResponse {
	department: string;
	departmentId: number;
	userCount: number;
	users: DepartmentUser[];
}

export interface UserSearchResponse {
	id: string;
	userName: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	isActive: boolean;
	createdAt: string;
	lastLoginAt: string | null;
	roles: string[];
	departmentId: number;
	departmentName: string;
	departmentDescription: string;
}

export interface Role {
	id: string;
	name: string;
	normalizedName: string;
	concurrencyStamp: string | null;
}

export interface RoleUsersResponse {
	role: string;
	userCount: number;
	users: DepartmentUser[];
}
