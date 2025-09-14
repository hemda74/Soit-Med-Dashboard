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

export interface UserStatistics {
	totalUsers: number;
	activeUsers: number;
	inactiveUsers: number;
	usersByRole: number;
	generatedAt: string;
	usersByRoleBreakdown: {
		SuperAdmin: number;
		Admin: number;
		Doctor: number;
		Technician: number;
		Salesman: number;
		Engineer: number;
		FinanceManager: number;
		FinanceEmployee: number;
		LegalManager: number;
		LegalEmployee: number;
	};
	usersByDepartment: {
		Administration: number;
		Medical: number;
		Sales: number;
		Engineering: number;
		Finance: number;
		Legal: number;
	};
}

export interface UserCounts {
	totalUsers: number;
	activeUsers: number;
	inactiveUsers: number;
	generatedAt: string;
}

export interface ActivateDeactivateRequest {
	userId: string;
	action: 'activate' | 'deactivate';
	reason: string;
}

export interface ActivateDeactivateResponse {
	userId: string;
	userName: string;
	email: string;
	isActive: boolean;
	action: 'activate' | 'deactivate';
	reason: string;
	actionDate: string;
	message: string;
}
