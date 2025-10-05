import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { fetchUsers } from '@/services/user/userApi';
import type { UserOption } from '@/types/salesReport.types';

export interface UseUsersForFilterReturn {
	users: UserOption[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export function useUsersForFilter(): UseUsersForFilterReturn {
	const { user } = useAuthStore();
	const [users, setUsers] = useState<UserOption[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUsersList = useCallback(async () => {
		if (!user?.token) {
			setError('No authentication token found');
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const response = await fetchUsers(
				user.token,
				setLoading
			);

			// Extract users array from response
			const usersArray = Array.isArray(response)
				? response
				: response.users || [];

			// Transform the user data to UserOption format
			const transformedUsers: UserOption[] = usersArray.map(
				(user) => ({
					id: user.id,
					name: `${user.firstName} ${user.lastName}`.trim(),
					email: user.email,
				})
			);

			setUsers(transformedUsers);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Failed to fetch users';
			setError(errorMessage);
			console.error('Error fetching users for filter:', err);
		} finally {
			setLoading(false);
		}
	}, [user?.token]);

	const refetch = useCallback(async () => {
		await fetchUsersList();
	}, [fetchUsersList]);

	// Fetch users on mount
	useEffect(() => {
		if (user?.token) {
			fetchUsersList();
		}
	}, [user?.token, fetchUsersList]);

	return {
		users,
		loading,
		error,
		refetch,
	};
}
