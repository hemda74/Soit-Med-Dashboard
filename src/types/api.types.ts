export interface ApiResponse<T = any> {
	data: T;
	success: boolean;
	message?: string;
}

export interface ApiError {
	message: string;
	status: number;
	errors?: string[];
}

export interface Role {
	id: string;
	name: string;
}
