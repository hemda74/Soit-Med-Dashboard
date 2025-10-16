export interface LoginDTO {
	UserName: string;
	Password: string;
}

export interface RegisterDTO {
	UserName: string;
	Email: string;
	Password: string;
}

export interface AuthResponse {
	success: boolean;
	token: string;
	expired: string;
	message?: string;
}

export interface AuthUser {
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
	emailConfirmed: boolean;
	phoneNumberConfirmed: boolean;
	phoneNumber: string | null;
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

export interface AuthContextType {
	token: string | null;
	user: AuthUser | null;
	login: (token: string) => void;
	logout: () => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
}

// Additional auth-related types
export interface LoginRequest {
	UserName: string;
	Password: string;
}

export interface LoginResponse {
	success: boolean;
	token: string;
	expired: string;
	message?: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export interface ChangePasswordResponse {
	success: boolean;
	message: string;
}

export interface RefreshTokenRequest {
	token: string;
}

export interface RefreshTokenResponse {
	success: boolean;
	token: string;
	expired: string;
	message?: string;
}

// Password Reset Types
export interface ForgotPasswordRequest {
	email: string;
}

export interface ForgotPasswordResponse {
	success: boolean;
	message: string;
	email?: string;
}

export interface VerifyCodeRequest {
	email: string;
	code: string;
}

export interface VerifyCodeResponse {
	success: boolean;
	message: string;
	resetToken?: string;
	email?: string;
}

export interface ResetPasswordRequest {
	email: string;
	resetToken: string;
	newPassword: string;
	confirmPassword: string;
}

export interface ResetPasswordResponse {
	success: boolean;
	message: string;
}
