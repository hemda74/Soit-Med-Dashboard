import { useState, useCallback } from 'react';
import { userDeleteApi } from '@/services/user/userDeleteApi';
import { useAuthStore } from '@/stores/authStore';
import { useLoading } from '@/utils/loadingUtils';
import type { UseDeleteUserReturn } from '@/types/userDelete.types';
import toast from 'react-hot-toast';

/**
 * Custom hook for user deletion functionality
 * Provides loading state, error handling, and success feedback
 */
export const useDeleteUser = (): UseDeleteUserReturn => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const { user } = useAuthStore();
	const { withLoading } = useLoading();

	/**
	 * Delete a user by their ID
	 * @param userId - ID of the user to delete
	 */
	const deleteUser = useCallback(
		async (userId: string): Promise<void> => {
			if (!user?.token) {
				setError('Authentication token not found');
				return;
			}

			// Validate permissions before making API call
			const validation =
				userDeleteApi.validateDeletePermission(
					userId,
					user.id || '',
					user.roles?.[0] || ''
				);

			if (!validation.canDelete) {
				setError(
					validation.errorMessage ||
						'Permission denied'
				);
				toast.error(
					validation.errorMessage ||
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
						await userDeleteApi.deleteUser({
							userId,
							token: user.token!,
						});

					if (response.success) {
						setSuccess(true);
						toast.success(response.message);
					} else {
						const errorMessage =
							userDeleteApi.getErrorMessage(
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
		deleteUser,
		isLoading,
		error,
		success,
	};
};

export default useDeleteUser;
