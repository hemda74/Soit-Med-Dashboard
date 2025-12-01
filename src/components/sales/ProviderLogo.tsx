import React, { useState } from 'react';
import { productApi } from '@/services/sales/productApi';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ProviderLogoProps {
	providerName?: string | null;
	logoPath?: string | null;
	productId?: number | null; // Optional product ID for API fallback
	size?: 'sm' | 'md' | 'lg';
	showName?: boolean;
	className?: string;
}

const ProviderLogo: React.FC<ProviderLogoProps> = ({
	providerName,
	logoPath,
	productId = null,
	size = 'md',
	showName = false,
	className = '',
}) => {
	const [imageError, setImageError] = useState(false);
	const [retryCount, setRetryCount] = useState(0);

	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-12 h-12',
		lg: 'w-16 h-16',
	};

	const textSizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base',
	};

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const target = e.target as HTMLImageElement;

		// If we haven't exhausted retries and have a logoPath, try alternative URL formats
		if (retryCount < 2 && logoPath) {
			if (retryCount === 0) {
				// First retry: Try with leading slash if it doesn't have one
				setRetryCount(1);
				if (!logoPath.startsWith('/') && !logoPath.startsWith('http')) {
					const alternativeUrl = productApi.getProviderImageUrl(`/${logoPath}`);
					target.src = alternativeUrl;
					return;
				}

				// Or try direct static file URL (remove /api if present)
				if (logoPath && !logoPath.startsWith('http')) {
					const baseUrl = getApiBaseUrl();
					const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
					// Remove /api suffix if present to access static files
					const staticBaseUrl = baseUrl.replace(/\/api\/?$/, '');
					const apiUrl = `${staticBaseUrl}${cleanPath}`;
					target.src = apiUrl;
					return;
				}
			} else if (retryCount === 1 && productId) {
				// Second retry: Use API endpoint if we have productId
				setRetryCount(2);
				const baseUrl = getApiBaseUrl();
				const apiUrl = `${baseUrl}/api/Product/${productId}/provider-image-file`;
				target.src = apiUrl;
				return;
			}
		}

		// If all retries failed or no logoPath, show placeholder
		setImageError(true);
		target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect fill="%23e5e7eb" width="48" height="48"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="10" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Logo%3C/text%3E%3C/svg%3E';
		target.onerror = null; // Prevent infinite loop
	};

	// If we have a logoPath, try to display it
	if (logoPath) {
		const imageUrl = productApi.getProviderImageUrl(logoPath);
		const placeholderUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect fill="%23e5e7eb" width="48" height="48"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="10" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Logo%3C/text%3E%3C/svg%3E';

		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<img
					src={imageError ? placeholderUrl : imageUrl}
					alt={providerName || 'Provider logo'}
					className={`${sizeClasses[size]} object-contain rounded`}
					onError={handleImageError}
					loading="lazy"
				/>
				{showName && providerName && (
					<span className={`font-medium text-gray-900 dark:text-gray-100 ${textSizeClasses[size]}`}>
						{providerName}
					</span>
				)}
			</div>
		);
	}

	// Fallback: show name as text if no logo
	if (providerName) {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<div className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center`}>
					<PhotoIcon className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'} text-gray-400`} />
				</div>
				{showName && (
					<span className={`font-medium text-gray-900 dark:text-gray-100 ${textSizeClasses[size]}`}>
						{providerName}
					</span>
				)}
			</div>
		);
	}

	// No provider info
	return (
		<div className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center ${className}`}>
			<span className={`text-gray-400 ${textSizeClasses[size]}`}>N/A</span>
		</div>
	);
};

export default ProviderLogo;


