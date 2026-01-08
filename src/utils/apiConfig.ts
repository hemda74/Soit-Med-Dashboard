/**
 * Centralized API configuration utility
 * Reads from environment variables with sensible defaults
 *
 * ⚠️ IMPORTANT: This file is auto-synced from shared-config.ts
 * To update the IP address, edit shared-config.ts and run: node sync-config.js
 * Or manually update: shared-config.ts (root directory)
 */

import { getAuthToken } from './authUtils';

// Import from shared config (relative path from Web/src/utils to root)
// Fallback values are synced from shared-config.ts
const DEV_API_URL = 'http://10.10.9.100:5117'; // Auto-synced from shared-config.ts

/**
 * Get the base API URL from environment variables
 * Reads from VITE_API_BASE_URL environment variable
 * Falls back to development default if not set
 *
 * Supports both localhost (same device) and network IP (other devices)
 *
 * @returns The base API URL string
 * @throws {Error} If the URL format is invalid
 */
export function getApiBaseUrl(): string {
	// Use environment variable if set, otherwise use development IP from shared config
	const url = import.meta.env.VITE_API_BASE_URL || DEV_API_URL;

	try {
		new URL(url);
		return url;
	} catch (error) {
		console.error('Invalid API base URL format:', url);
		// Return default if validation fails (from shared config)
		return DEV_API_URL;
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
			// Fallback to shared config default
			return DEV_API_URL;
		}

		return baseUrl;
	} catch (error) {
		console.error('Error processing static file base URL:', error);
		// ⚠️ Keep in sync with API_CONFIG.md - unified API configuration
		return 'http://10.10.9.100:5117';
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

/**
 * Get authenticated file URL as blob URL
 * This function fetches the file with authentication token and returns a blob URL
 * Use this for images and files that require authentication
 *
 * @param filePath - The file path from the API
 * @returns Promise that resolves to a blob URL string
 */
export async function getAuthenticatedFileUrl(
	filePath: string | null | undefined
): Promise<string> {
	// Handle null/undefined/empty string
	if (
		!filePath ||
		(typeof filePath === 'string' && filePath.trim() === '')
	) {
		return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
	}

	try {
		const token = getAuthToken();
		if (!token) {
			console.warn(
				'No authentication token available for file request'
			);
			// For API endpoints, use getApiUrl; for static files, use getStaticFileUrl
			if (filePath.startsWith('/api/')) {
				return getApiUrl(filePath);
			}
			return getStaticFileUrl(filePath);
		}

		// Determine if this is an API endpoint or static file
		let fullUrl: string;
		if (
			filePath.startsWith('/api/') ||
			filePath.startsWith('http://') ||
			filePath.startsWith('https://')
		) {
			// API endpoint - use getApiUrl
			if (
				filePath.startsWith('http://') ||
				filePath.startsWith('https://')
			) {
				fullUrl = filePath; // Already a full URL
			} else {
				fullUrl = getApiUrl(filePath);
			}
		} else {
			// Static file - use getStaticFileUrl
			fullUrl = getStaticFileUrl(filePath);
		}

		// Fetch the file with authentication
		const response = await fetch(fullUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			console.error(
				'Failed to fetch authenticated file:',
				response.status,
				response.statusText,
				'URL:',
				fullUrl
			);
			// Fallback based on file path type
			if (filePath.startsWith('/api/')) {
				return getApiUrl(filePath);
			}
			return getStaticFileUrl(filePath);
		}

		// Convert response to blob
		const blob = await response.blob();

		// Create object URL from blob
		const blobUrl = URL.createObjectURL(blob);

		return blobUrl;
	} catch (error) {
		console.error(
			'Error fetching authenticated file:',
			error,
			'filePath:',
			filePath
		);
		// Fallback based on file path type
		if (filePath.startsWith('/api/')) {
			return getApiUrl(filePath);
		}
		return getStaticFileUrl(filePath);
	}
}

/**
 * Revoke a blob URL to free memory
 * Call this when you're done using the blob URL (e.g., in cleanup)
 *
 * @param blobUrl - The blob URL to revoke
 */
export function revokeBlobUrl(blobUrl: string): void {
	if (blobUrl && blobUrl.startsWith('blob:')) {
		URL.revokeObjectURL(blobUrl);
	}
}
