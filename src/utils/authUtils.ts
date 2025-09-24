// Utility functions for authentication

/**
 * Gets the authentication token from the auth store
 * @returns The JWT token or null if not found
 */
export const getAuthToken = (): string | null => {
	try {
		const authState = JSON.parse(
			localStorage.getItem('auth-storage') || '{}'
		);
		return authState?.state?.user?.token || null;
	} catch (error) {
		console.error('Error getting auth token:', error);
		return null;
	}
};

/**
 * Checks if the user is authenticated by verifying token existence
 * @returns True if user has a valid token
 */
export const isAuthenticated = (): boolean => {
	return getAuthToken() !== null;
};

/**
 * Gets the current user from the auth store
 * @returns The current user object or null if not found
 */
export const getCurrentUser = (): any | null => {
	try {
		const authState = JSON.parse(
			localStorage.getItem('auth-storage') || '{}'
		);
		return authState?.state?.user || null;
	} catch (error) {
		console.error('Error getting current user:', error);
		return null;
	}
};
