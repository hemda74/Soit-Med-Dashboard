/**
 * Rate limiting handler
 * Helper functions to handle API rate limiting gracefully
 */

import toast from 'react-hot-toast';

export interface RateLimitInfo {
	retryAfter: number;
	limit: number;
	remaining: number;
	resetAt: number;
}

/**
 * Check if error is a rate limit error
 */
export const isRateLimitError = (error: any): boolean => {
	return error?.response?.status === 429 || error?.status === 429;
};

/**
 * Extract rate limit information from error response
 */
export const extractRateLimitInfo = (error: any): RateLimitInfo => {
	const headers = error?.response?.headers || {};
	const retryAfter = parseInt(
		headers['retry-after'] || headers['Retry-After'] || '60',
		10
	);

	return {
		retryAfter,
		limit: parseInt(headers['x-ratelimit-limit'] || '100', 10),
		remaining: parseInt(
			headers['x-ratelimit-remaining'] || '0',
			10
		),
		resetAt: Date.now() + retryAfter * 1000,
	};
};

/**
 * Show user-friendly rate limit error message
 */
export const showRateLimitError = (error: any): void => {
	const info = extractRateLimitInfo(error);
	const minutes = Math.ceil(info.retryAfter / 60);

	toast.error(
		`Too many requests. Please wait ${minutes} minute${
			minutes > 1 ? 's' : ''
		} before trying again.`,
		{
			duration: 8000,
			icon: '⏱️',
		}
	);
};

/**
 * Handle rate limit error with retry
 */
export const handleRateLimitWithRetry = async <T>(
	apiCall: () => Promise<T>,
	maxRetries: number = 3,
	retryDelay: number = 1000
): Promise<T> => {
	let lastError: any;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await apiCall();
		} catch (error: any) {
			lastError = error;

			if (isRateLimitError(error) && attempt < maxRetries) {
				const info = extractRateLimitInfo(error);
				showRateLimitError(error);

				// Wait before retrying
				await new Promise((resolve) =>
					setTimeout(
						resolve,
						info.retryAfter * 1000
					)
				);

				continue;
			}

			// If it's a rate limit error on last attempt, show error
			if (isRateLimitError(error)) {
				showRateLimitError(error);
			}

			throw error;
		}
	}

	throw lastError;
};

/**
 * Create rate limit interceptor for axios
 */
export const createRateLimitInterceptor = () => {
	return (error: any) => {
		if (isRateLimitError(error)) {
			showRateLimitError(error);
		}
		return Promise.reject(error);
	};
};
