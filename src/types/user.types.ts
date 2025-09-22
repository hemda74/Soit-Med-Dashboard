export interface User {
	id: string;
	userName: string;
	email: string;
	passwordHash?: string;
	profileImage?: {
		id: number;
		userId: string;
		fileName: string;
		filePath: string;
		contentType: string;
		fileSize: number;
		altText: string;
		uploadedAt: string;
		isActive: boolean;
		isProfileImage: boolean;
	} | null;
	userImages?: any[];
}

export interface CreateUserRequest {
	UserName: string;
	Email: string;
	Password: string;
}

// New types for user list API
export interface UserListResponse {
	departmentId: number;
	department: string | null;
	firstName: string;
	lastName: string;
	createdAt: string;
	lastLoginAt: string | null;
	isActive: boolean;
	fullName: string;
	id: string;
	userName: string;
	normalizedUserName: string;
	email: string;
	normalizedEmail: string;
	emailConfirmed: boolean;
	passwordHash: string;
	securityStamp: string;
	concurrencyStamp: string;
	phoneNumber: string | null;
	phoneNumberConfirmed: boolean;
	twoFactorEnabled: boolean;
	lockoutEnd: string | null;
	lockoutEnabled: boolean;
	accessFailedCount: number;
	profileImage: {
		id: number;
		userId: string;
		fileName: string;
		filePath: string;
		contentType: string;
		fileSize: number;
		altText: string;
		uploadedAt: string;
		isActive: boolean;
		isProfileImage: boolean;
	} | null;
	userImages: any[];
}

// User activation/deactivation types
export interface UserStatusRequest {
	userId: string;
	action: 'activate' | 'deactivate';
	reason: string;
}

export interface UserStatusResponse {
	userId: string;
	userName: string;
	email: string;
	isActive: boolean;
	action: 'activate' | 'deactivate';
	reason: string;
	actionDate: string;
	message: string;
}
