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
	token: string;
	expired: string;
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
}

export interface AuthContextType {
	token: string | null;
	user: AuthUser | null;
	login: (token: string) => void;
	logout: () => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
}
