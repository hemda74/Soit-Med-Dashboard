export interface User {
	id: string;
	userName: string;
	email: string;
	passwordHash?: string;
}

export interface CreateUserRequest {
	UserName: string;
	Email: string;
	Password: string;
}
