// Optimized Image Gallery Component with Lazy Loading

import React, { useState, useCallback, useMemo } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
	images: Array<{
		id: number;
		filePath: string;
		fileName: string;
		description?: string;
	}>;
	maxThumbnails?: number;
	thumbnailSize?: 'sm' | 'md' | 'lg';
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
	images,
	maxThumbnails = 4,
	thumbnailSize = 'md',
}) => {
	const [selectedImage, setSelectedImage] = useState<number | null>(null);
	const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
	const [errorImages, setErrorImages] = useState<Set<number>>(new Set());

	const visibleImages = useMemo(
		() => images.slice(0, maxThumbnails),
		[images, maxThumbnails]
	);
	const remainingCount = images.length - maxThumbnails;

	const thumbnailClasses = {
		sm: 'w-16 h-16',
		md: 'w-24 h-24',
		lg: 'w-32 h-32',
	};

	const getImageUrl = useCallback((filePath: string) => {
		// If it's already a full URL, return as is
		if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
			return filePath;
		}
		// Otherwise, construct the API URL
		const API_BASE_URL =
			import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117';
		return `${API_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
	}, []);

	const handleImageLoad = useCallback((id: number) => {
		setLoadedImages((prev) => new Set(prev).add(id));
	}, []);

	const handleImageError = useCallback((id: number) => {
		setErrorImages((prev) => new Set(prev).add(id));
	}, []);

	if (images.length === 0) {
		return null;
	}

	return (
		<>
			<div className="flex flex-wrap gap-2">
				{visibleImages.map((image, index) => {
					const imageUrl = getImageUrl(image.filePath);
					const isLoaded = loadedImages.has(image.id);
					const hasError = errorImages.has(image.id);

					return (
						<div
							key={image.id}
							className={`relative ${thumbnailClasses[thumbnailSize]} group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all`}
							onClick={() => setSelectedImage(index)}
						>
							{!hasError ? (
								<>
									{!isLoaded && (
										<div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
											<PhotoIcon className="w-6 h-6 text-gray-400" />
										</div>
									)}
									<img
										src={imageUrl}
										alt={image.description || image.fileName}
										className={`w-full h-full object-cover transition-opacity duration-300 ${
											isLoaded ? 'opacity-100' : 'opacity-0'
										}`}
										loading="lazy"
										decoding="async"
										onLoad={() => handleImageLoad(image.id)}
										onError={() => handleImageError(image.id)}
									/>
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
										<span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
											View
										</span>
									</div>
								</>
							) : (
								<div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
									<PhotoIcon className="w-6 h-6 text-gray-400" />
								</div>
							)}
						</div>
					);
				})}
				{remainingCount > 0 && (
					<button
						onClick={() => setSelectedImage(0)}
						className={`${thumbnailClasses[thumbnailSize]} rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-medium text-sm`}
					>
						+{remainingCount}
					</button>
				)}
			</div>

			{/* Lightbox Modal */}
			<Dialog
				open={selectedImage !== null}
				onOpenChange={(open) => !open && setSelectedImage(null)}
			>
				<DialogContent className="max-w-4xl max-h-[90vh] p-0">
					{selectedImage !== null && (
						<div className="relative">
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
								onClick={() => setSelectedImage(null)}
							>
								<XMarkIcon className="h-5 w-5" />
							</Button>

							<div className="relative w-full h-[70vh] bg-black flex items-center justify-center">
								<img
									src={getImageUrl(images[selectedImage].filePath)}
									alt={
										images[selectedImage].description ||
										images[selectedImage].fileName
									}
									className="max-w-full max-h-full object-contain"
									loading="eager"
								/>
							</div>

							<div className="p-4 bg-white dark:bg-gray-900 border-t">
								<p className="font-medium text-sm text-gray-900 dark:text-white">
									{images[selectedImage].fileName}
								</p>
								{images[selectedImage].description && (
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
										{images[selectedImage].description}
									</p>
								)}
							</div>

							{/* Navigation */}
							{images.length > 1 && (
								<div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
									<Button
										variant="ghost"
										size="icon"
										className="bg-black/50 hover:bg-black/70 text-white pointer-events-auto"
										onClick={(e) => {
											e.stopPropagation();
											setSelectedImage(
												selectedImage > 0
													? selectedImage - 1
													: images.length - 1
											);
										}}
									>
										<svg
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="bg-black/50 hover:bg-black/70 text-white pointer-events-auto"
										onClick={(e) => {
											e.stopPropagation();
											setSelectedImage(
												selectedImage < images.length - 1
													? selectedImage + 1
													: 0
											);
										}}
									>
										<svg
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</Button>
								</div>
							)}

							{/* Image Counter */}
							{images.length > 1 && (
								<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
									{selectedImage + 1} / {images.length}
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ImageGallery;

