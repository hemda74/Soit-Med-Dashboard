import React from 'react';
import { getStaticFileUrl } from '@/utils/apiConfig';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ProviderLogoProps {
	providerName?: string | null;
	logoPath?: string | null;
	size?: 'sm' | 'md' | 'lg';
	showName?: boolean;
	className?: string;
}

const ProviderLogo: React.FC<ProviderLogoProps> = ({
	providerName,
	logoPath,
	size = 'md',
	showName = false,
	className = '',
}) => {
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

	if (logoPath) {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<img
					src={getStaticFileUrl(logoPath)}
					alt={providerName || 'Provider logo'}
					className={`${sizeClasses[size]} object-contain rounded`}
					onError={(e) => {
						(e.target as HTMLImageElement).src =
							'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect fill="%23e5e7eb" width="48" height="48"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="10" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Logo%3C/text%3E%3C/svg%3E';
					}}
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


