/**
 * Generic User Creation API Service
 *
 * This module provides a unified API service for creating users of any role.
 * It eliminates the need for separate API functions for each role and provides
 * a consistent interface for all user creation operations.
 */

import { apiRequest } from '../shared/apiClient';
import { RoleConfigUtils } from '@/config/roleConfig';
import type {
	RoleSpecificUserRole,
	RoleSpecificUserRequest,
	RoleSpecificUserResponse,
} from '@/types/roleSpecificUser.types';

/**
 * Generic user creation request interface
 */
export interface GenericUserCreationRequest {
	role: RoleSpecificUserRole;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	personalMail?: string;
	profileImage?: File;
	altText?: string;
	hospitalId?: number;
	departmentId: number;
	governorateIds?: number[];
	supportLevel?: string;
	supportSpecialization?: string;
	notes?: string;
}

/**
 * User creation result interface
 */
export interface UserCreationResult {
	success: boolean;
	data?: RoleSpecificUserResponse;
	error?: string;
	validationErrors?: Record<string, string[]>;
}

/**
 * Generic User Creation API Service Class
 *
 * This class provides methods for creating users of any role using a unified interface.
 * It handles form data preparation, API calls, and error handling consistently.
 */
export class GenericUserCreationApi {
	/**
	 * Create a user with the specified role
	 *
	 * @param role - The role of the user to create
	 * @param userData - The user data to send
	 * @param token - Authentication token
	 * @returns Promise<UserCreationResult>
	 */
	static async createUser(
		role: RoleSpecificUserRole,
		userData: RoleSpecificUserRequest,
		token: string
	): Promise<UserCreationResult> {
		try {
			// Removed verbose console logs for production

			// Get role configuration
			const roleConfig = RoleConfigUtils.getRoleConfig(role);

			// Prepare user data with role-specific requirements
			const preparedData = this.prepareUserData(
				role,
				userData,
				roleConfig
			);

			// Create FormData for multipart/form-data request
			const formData = this.createFormData(preparedData);

			// Get API endpoint for the role
			const endpoint = RoleConfigUtils.getApiEndpoint(role);

			// Avoid logging form data content in production

			// Make API request
			const response =
				await apiRequest<RoleSpecificUserResponse>(
					endpoint,
					{
						method: 'POST',
						body: formData,
					},
					token
				);

			return {
				success: true,
				data: response,
			};
		} catch (error: any) {
			// Keep error logging concise without exposing sensitive data
			console.error('Failed to create user');

			return this.handleApiError(error);
		}
	}

	/**
	 * Prepare user data based on role requirements
	 *
	 * @param role - The role of the user
	 * @param userData - Raw user data
	 * @param roleConfig - Role configuration
	 * @returns Prepared user data
	 */
	private static prepareUserData(
		role: RoleSpecificUserRole,
		userData: RoleSpecificUserRequest,
		roleConfig: any
	): GenericUserCreationRequest {
		const preparedData: GenericUserCreationRequest = {
			...userData,
			role,
			departmentId: roleConfig.requirements.autoDepartmentId,
			hospitalId: (userData as any).hospitalId
				? Number((userData as any).hospitalId)
				: undefined,
			governorateIds: (userData as any).governorateIds || [],
		};

		// Add role-specific fields based on configuration
		const roleSpecificFields = roleConfig.fields.filter(
			(field: any) => field.section === 'role-specific'
		);

		roleSpecificFields.forEach((field: any) => {
			const value =
				userData[
					field.key as keyof RoleSpecificUserRequest
				];
			if (value !== undefined && value !== null) {
				(preparedData as any)[field.key] = value;
			}
		});

		return preparedData;
	}

	/**
	 * Create FormData object for multipart/form-data request
	 *
	 * @param userData - Prepared user data
	 * @returns FormData object
	 */
	private static createFormData(
		userData: GenericUserCreationRequest
	): FormData {
		const formData = new FormData();

		// Add all user data fields to FormData with proper field mapping
		Object.entries(userData).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (
					key === 'profileImage' &&
					value instanceof File
				) {
					formData.append('ProfileImage', value);
				} else if (key === 'altText') {
					formData.append(
						'AltText',
						value as string
					);
				} else if (
					key === 'governorateIds' &&
					Array.isArray(value)
				) {
					// Handle governorate IDs array - send as individual numbers
					value.forEach((id, index) => {
						formData.append(
							`GovernorateIds[${index}]`,
							id.toString()
						);
					});
				} else if (key === 'departmentId') {
					formData.append(
						'DepartmentId',
						value.toString()
					);
				} else {
					// Convert camelCase to PascalCase for API
					const apiKey =
						key.charAt(0).toUpperCase() +
						key.slice(1);
					formData.append(
						apiKey,
						value as string
					);
				}
			}
		});

		return formData;
	}

	/**
	 * Handle API errors and extract meaningful error messages
	 *
	 * @param error - The error object from the API call
	 * @returns UserCreationResult with error information
	 */
	private static handleApiError(error: any): UserCreationResult {
		let errorMessage = 'An unexpected error occurred';
		let validationErrors: Record<string, string[]> = {};

		try {
			// Try to parse the error response
			const errorResponse = error.response || error;

			if (
				errorResponse &&
				typeof errorResponse === 'object'
			) {
				// Check if it's the API error format we expect
				if (
					errorResponse.message &&
					errorResponse.errors
				) {
					// Extract individual error messages from the errors object
					if (
						typeof errorResponse.errors ===
						'object'
					) {
						Object.entries(
							errorResponse.errors
						).forEach(
							([field, messages]) => {
								if (
									Array.isArray(
										messages
									)
								) {
									validationErrors[
										field
									] =
										messages as string[];
								} else if (
									typeof messages ===
									'string'
								) {
									validationErrors[
										field
									] = [
										messages,
									];
								}
							}
						);
					}
					errorMessage = errorResponse.message;
				} else if (errorResponse.message) {
					errorMessage = errorResponse.message;
				} else if (errorResponse.error) {
					errorMessage = errorResponse.error;
				}
			}
		} catch (parseError) {
			// If parsing fails, use the original error message
			errorMessage = error.message || 'Failed to create user';
		}

		return {
			success: false,
			error: errorMessage,
			validationErrors:
				Object.keys(validationErrors).length > 0
					? validationErrors
					: undefined,
		};
	}

	/**
	 * Validate user data before sending to API
	 *
	 * @param role - The role of the user
	 * @param userData - The user data to validate
	 * @returns Validation result
	 */
	static validateUserData(
		role: RoleSpecificUserRole,
		userData: RoleSpecificUserRequest
	): { isValid: boolean; errors: string[] } {
		const errors: string[] = [];
		const roleConfig = RoleConfigUtils.getRoleConfig(role);

		// Get required fields for the role
		const requiredFields = RoleConfigUtils.getRequiredFields(role);

		// Check required fields
		requiredFields.forEach((fieldKey) => {
			const value =
				userData[
					fieldKey as keyof RoleSpecificUserRequest
				];
			if (
				!value ||
				(typeof value === 'string' &&
					value.trim() === '')
			) {
				errors.push(`${fieldKey} is required`);
			}
		});

		// Role-specific validations
		if (
			roleConfig.requirements.requiresHospital &&
			!(userData as any).hospitalId
		) {
			errors.push('Hospital selection is required');
		}

		if (
			roleConfig.requirements.requiresGovernorates &&
			(!(userData as any).governorateIds ||
				(userData as any).governorateIds.length === 0)
		) {
			errors.push(
				'At least one governorate must be selected'
			);
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Get supported roles
	 *
	 * @returns Array of supported role keys
	 */
	static getSupportedRoles(): RoleSpecificUserRole[] {
		return RoleConfigUtils.getAllRoles();
	}

	/**
	 * Check if a role is supported
	 *
	 * @param role - The role to check
	 * @returns True if the role is supported
	 */
	static isRoleSupported(role: string): role is RoleSpecificUserRole {
		return RoleConfigUtils.getAllRoles().includes(
			role as RoleSpecificUserRole
		);
	}
}

/**
 * Convenience function for creating users
 *
 * @param role - The role of the user to create
 * @param userData - The user data to send
 * @param token - Authentication token
 * @returns Promise<UserCreationResult>
 */
export const createUser = (
	role: RoleSpecificUserRole,
	userData: RoleSpecificUserRequest,
	token: string
): Promise<UserCreationResult> => {
	return GenericUserCreationApi.createUser(role, userData, token);
};

/**
 * Convenience function for validating user data
 *
 * @param role - The role of the user
 * @param userData - The user data to validate
 * @returns Validation result
 */
export const validateUserData = (
	role: RoleSpecificUserRole,
	userData: RoleSpecificUserRequest
): { isValid: boolean; errors: string[] } => {
	return GenericUserCreationApi.validateUserData(role, userData);
};
