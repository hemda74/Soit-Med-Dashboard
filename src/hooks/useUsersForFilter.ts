import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { fetchUsers } from '@/services/user/userApi';

export interface UserOption {
	id: string;
	name: string;
	email: string;
}

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
			// If 403 Forbidden, the user doesn't have permission to access this endpoint
			// This is expected for non-admin users - just log it and continue
			if (errorMessage.includes('403')) {
				console.warn(
					'SalesManager does not have permission to access /api/User/all. This is expected behavior.'
				);
				setUsers([]); // Set empty array instead of showing error
				setError(null); // Don't show error to user
			} else {
				setError(errorMessage);
				console.error(
					'Error fetching users for filter:',
					err
				);
			}
		} finally {
			setLoading(false);
		}
	}, [user?.token]);

	const refetch = useCallback(async () => {
		await fetchUsersList();
	}, [fetchUsersList]);

	// Don't fetch users automatically on mount
	// Components should call refetch() manually if they need the data
	// useEffect(() => {
	// 	if (user?.token) {
	// 		fetchUsersList();
	// 	}
	// }, [user?.token]);

	return {
		users,
		loading,
		error,
		refetch,
	};
}
