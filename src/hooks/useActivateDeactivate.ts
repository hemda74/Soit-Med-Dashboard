import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { activateDeactivateUser } from '@/services';
import toast from 'react-hot-toast';

export function useActivateDeactivate() {
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);

	const handleActivateDeactivate = async (
		userId: string,
		_userName: string,
		_userEmail: string,
		isActive: boolean,
		reason: string
	) => {
		if (!user?.token) {
			toast.error('No authentication token available');
			return;
		}

		try {
			setIsLoading(true);

			const response = await activateDeactivateUser(
				userId,
				isActive,
				reason
			);

			// Show success message
			toast.success('User status updated successfully');

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
