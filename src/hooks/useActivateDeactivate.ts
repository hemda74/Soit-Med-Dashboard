import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { activateDeactivateUser } from '@/services/dashboardApi';
import type { ActivateDeactivateRequest } from '@/types/api.types';
import toast from 'react-hot-toast';

export function useActivateDeactivate() {
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);

	const handleActivateDeactivate = async (
		userId: string,
		userName: string,
		userEmail: string,
		isActive: boolean,
		reason: string
	) => {
		if (!user?.token) {
			toast.error('No authentication token available');
			return;
		}

		try {
			setIsLoading(true);

			const request: ActivateDeactivateRequest = {
				userId,
				action: isActive ? 'deactivate' : 'activate',
				reason,
			};

			const response = await activateDeactivateUser(
				request,
				user.token,
				setIsLoading
			);

			// Show success message
			toast.success(response.message);

			// Return the response for any additional handling
			return response;
		} catch (error) {
			console.error(
				'Failed to activate/deactivate user:',
				error
			);
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to update user status'
			);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		handleActivateDeactivate,
		isLoading,
	};
}


