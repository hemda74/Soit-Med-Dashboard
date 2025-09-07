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
	roles: string[];
}

export interface AuthContextType {
	token: string | null;
	user: AuthUser | null;
	login: (token: string) => void;
	logout: () => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
}
