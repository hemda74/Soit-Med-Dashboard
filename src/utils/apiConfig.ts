/**
 * Centralized API configuration utility
 * Reads from environment variables with sensible defaults
 */

/**
 * Get the base API URL from environment variables
 * Reads from VITE_API_BASE_URL environment variable
 * Falls back to development default if not set
 *
 * @returns The base API URL string
 * @throws {Error} If the URL format is invalid
 */
export function getApiBaseUrl(): string {
	// Use environment variable if set, otherwise use development IP
	// This matches the mobile apps configuration
	const url = import.meta.env.VITE_API_BASE_URL || 'http://10.10.9.108:5117';

	try {
		new URL(url);
		return url;
	} catch (error) {
		console.error('Invalid API base URL format:', url);
		// Return default if validation fails
		return 'http://10.10.9.108:5117';
	}
}

/**
 * Get the base server URL (without /api) for static files
 * Static files are served from wwwroot at the root, not under /api
 * In development, use relative URLs to leverage Vite proxy and avoid CORS
 *
 * @returns The base server URL without /api suffix, or empty string for relative URLs
 */
export function getStaticFileBaseUrl(): string {
	try {
		let baseUrl = getApiBaseUrl();

		// Remove /api suffix if present since static files are served from root
		baseUrl = baseUrl.replace(/\/api\/?$/, '');

		// Remove trailing slash
		baseUrl = baseUrl.replace(/\/$/, '');

		// Validate the result
		if (!baseUrl || baseUrl.trim() === '') {
			console.warn(
				'Empty base URL after processing, using default'
			);
			return 'http://localhost:5117';
		}

		return baseUrl;
	} catch (error) {
		console.error('Error processing static file base URL:', error);
		return 'http://localhost:5117';
	}
}

/**
 * Get the full API URL for an endpoint
 *
 * @param endpoint - The API endpoint path (e.g., '/api/users' or 'users')
 * @returns The full API URL
 * @throws {Error} If endpoint is invalid
 */
export function getApiUrl(endpoint: string): string {
	if (!endpoint || typeof endpoint !== 'string') {
		throw new Error('Endpoint must be a non-empty string');
	}

	try {
		const baseUrl = getApiBaseUrl();

		// Ensure endpoint starts with /
		const normalizedEndpoint = endpoint.startsWith('/')
			? endpoint
			: `/${endpoint}`;

		// Remove any double slashes (except after protocol)
		const cleanEndpoint = normalizedEndpoint.replace(
			/([^:]\/)\/+/g,
			'$1'
		);

		const fullUrl = `${baseUrl}${cleanEndpoint}`;

		// Validate the constructed URL
		new URL(fullUrl);

		return fullUrl;
	} catch (error) {
		console.error('Error constructing API URL:', error);
		throw new Error(`Invalid API endpoint: ${endpoint}`);
	}
}

/**
 * Get the full URL for a static file
 *
 * @param filePath - The file path (can be null, undefined, relative, absolute, or full URL)
 * @returns The full URL for the static file or a placeholder image data URI
 */
export function getStaticFileUrl(filePath: string | null | undefined): string {
	// Handle null/undefined/empty string
	if (
		!filePath ||
		(typeof filePath === 'string' && filePath.trim() === '')
	) {
		// Return placeholder SVG data URI
		return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
	}

	// Ensure filePath is a string
	if (typeof filePath !== 'string') {
		console.warn('Invalid filePath type, returning placeholder');
		return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
	}

	try {
		// If already a full URL, validate and return as-is
		if (
			filePath.startsWith('http://') ||
			filePath.startsWith('https://')
		) {
			// Validate URL format
			new URL(filePath);
			return filePath;
		}

		const baseUrl = getStaticFileBaseUrl();

		// Handle paths that start with / (absolute path)
		if (filePath.startsWith('/')) {
			// If baseUrl is empty (development with proxy), return relative URL
			if (!baseUrl) {
				return filePath;
			}
			const fullUrl = `${baseUrl}${filePath}`;
			// Validate the constructed URL only if it's absolute
			try {
				new URL(fullUrl);
			} catch {
				// If validation fails, return as-is (might be relative)
				return fullUrl;
			}
			return fullUrl;
		}

		// Handle relative paths (e.g., "products/product-1.jpg" or "images/Picture1.jpg")
		// Remove any leading slashes from relative path
		const cleanPath = filePath.replace(/^\/+/, '');
		
		// If baseUrl is empty (development with proxy), return relative URL
		if (!baseUrl) {
			return `/${cleanPath}`;
		}
		
		const finalUrl = `${baseUrl}/${cleanPath}`;

		// Validate the constructed URL only if it's absolute
		try {
			new URL(finalUrl);
		} catch {
			// If validation fails, return as-is (might be relative)
			return finalUrl;
		}

		return finalUrl;
	} catch (error) {
		console.error(
			'Error constructing static file URL:',
			error,
			'filePath:',
			filePath
		);
		// Return placeholder on error
		return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
	}
}
