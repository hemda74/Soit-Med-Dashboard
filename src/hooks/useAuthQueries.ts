import { useQuery } from '@tanstack/react-query';
import { getProfileCompletion } from '@/services/auth/authApi';
import type { ProfileCompletionDTO } from '@/types/auth.types';
import { useAuthStore } from '@/stores/authStore';

// Query keys
export const queryKeys = {
	profileCompletion: ['profileCompletion'] as const,
};

// Profile completion query
export const useProfileCompletionQuery = () => {
	const { user } = useAuthStore();

	return useQuery<ProfileCompletionDTO>({
		queryKey: queryKeys.profileCompletion,
		queryFn: async () => {
			if (!user?.token) {
				throw new Error(
					'No authentication token available'
				);
			}
			return await getProfileCompletion(user.token);
		},
		enabled: !!user?.token,
		staleTime: 2 * 60 * 1000, // 2 minutes
		retry: (failureCount, error) => {
			// Don't retry if it's an auth error
			if (
				error instanceof Error &&
				error.message.includes('401')
			) {
				return false;
			}
			return failureCount < 3;
		},
	});
};
