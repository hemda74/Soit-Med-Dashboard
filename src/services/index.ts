// Main services index - exports all services

// Shared utilities
export * from './shared/apiClient';
export * from './shared/validation';
export * from './shared/endpoints';

// User management
export * from './user/userApi';
export * from './user/userProfileApi';
export * from './user/userDeletionApi';
export * from './user/userDeleteApi';
export * from './user/userUpdateApi';

// Authentication
export * from './auth/authApi';

// Role-specific user creation
export * from './roleSpecific/baseRoleSpecificApi';
export * from './roleSpecific/medicalRoleApi';
export * from './roleSpecific/technicalRoleApi';
export * from './roleSpecific/adminRoleApi';
export * from './roleSpecific/financeRoleApi';
export * from './roleSpecific/legalRoleApi';
export * from './roleSpecific/salesRoleApi';

// Sales reports
export * from './sales/salesReportApi';

// Dashboard
export * from './dashboard/dashboardApi';

// Legacy exports for backward compatibility
export { userApiClient } from './user/userApi';
export { salesReportApi } from './sales/salesReportApi';

// User activation/deactivation
export const activateDeactivateUser = async (
	userId: string,
	isActive: boolean,
	reason: string
) => {
	// This is a placeholder implementation
	// You should implement the actual API call here
	console.log('Activate/Deactivate user:', { userId, isActive, reason });
	return Promise.resolve(true);
};
