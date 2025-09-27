import { useState, useCallback } from 'react';
import { userUpdateApi } from '@/services/user/userUpdateApi';
import { useAuthStore } from '@/stores/authStore';
import { useLoading } from '@/utils/loadingUtils';
import type {
	UseUpdateUserReturn,
	UpdateUserRequest,
} from '@/types/userUpdate.types';
import toast from 'react-hot-toast';

/**
 * Custom hook for user update functionality
 * Provides loading state, error handling, and success feedback
 */
export const useUpdateUser = (): UseUpdateUserReturn => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const { user } = useAuthStore();
	const { withLoading } = useLoading();

	/**
	 * Update a user by their ID
	 * @param userId - ID of the user to update
	 * @param userData - User data to update
	 */
	const updateUser = useCallback(
		async (
			userId: string,
			userData: UpdateUserRequest
		): Promise<void> => {
			if (!user?.token) {
				setError('Authentication token not found');
				return;
			}

			// Validate user data before making API call
			const validation =
				userUpdateApi.validateUserData(userData);
			if (!validation.isValid) {
				const errorMessage =
					validation.errors.join(', ');
				setError(errorMessage);
				toast.error(errorMessage);
				return;
			}

			// Validate permissions before making API call
			const permissionValidation =
				userUpdateApi.validateUpdatePermission(
					user.roles?.[0] || '',
					userData
				);

			if (!permissionValidation.canUpdate) {
				setError(
					permissionValidation.errorMessage ||
						'Permission denied'
				);
				toast.error(
					permissionValidation.errorMessage ||
						'Permission denied'
				);
				return;
			}

			setIsLoading(true);
			setError(null);
			setSuccess(false);

			try {
				await withLoading(async () => {
					const response =
						await userUpdateApi.updateUser({
							userId,
							userData,
							token: user.token!,
						});

					if (response.success) {
						setSuccess(true);
						toast.success(response.message);
					} else {
						const errorMessage =
							userUpdateApi.getErrorMessage(
								response
							);
						setError(errorMessage);
						toast.error(errorMessage);
					}
				});
			} catch (err: any) {
				const errorMessage =
					err.message ||
					'An unexpected error occurred';
				setError(errorMessage);
				toast.error(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[user, withLoading]
	);

	return {
		updateUser,
		isLoading,
		error,
		success,
	};
};

export default useUpdateUser;
