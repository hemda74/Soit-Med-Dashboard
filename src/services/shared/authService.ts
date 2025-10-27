// Authentication service utilities

export function getAuthToken(): string | null {
	// Try to get token from localStorage
	if (typeof window !== 'undefined') {
		return localStorage.getItem('authToken');
	}
	return null;
}

export function setAuthToken(token: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem('authToken', token);
	}
}

export function removeAuthToken(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('authToken');
	}
}

export function isAuthenticated(): boolean {
	return getAuthToken() !== null;
}



