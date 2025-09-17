import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
	onPageChange: (page: number) => void;
	totalCount: number;
	pageSize: number;
	isLoading?: boolean;
}

export default function Pagination({
	currentPage,
	totalPages,
	hasPreviousPage,
	hasNextPage,
	onPageChange,
	totalCount,
	pageSize,
	isLoading = false,
}: PaginationProps) {
	const { t } = useTranslation();

	const startItem = (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalCount);

	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	if (totalPages <= 1) {
		return (
			<div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
				<span>
					{t('showing')} {totalCount} {t('results')}
				</span>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-between px-4 py-3">
			<div className="flex items-center text-sm text-muted-foreground">
				<span>
					{t('showing')} {startItem} {t('to')} {endItem} {t('of')} {totalCount} {t('results')}
				</span>
			</div>

			<div className="flex items-center space-x-2">
				{/* First Page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={!hasPreviousPage || isLoading}
					className="h-8 w-8 p-0"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>

				{/* Previous Page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={!hasPreviousPage || isLoading}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Page Numbers */}
				<div className="flex items-center space-x-1">
					{getVisiblePages().map((page, index) => (
						<React.Fragment key={index}>
							{page === '...' ? (
								<span className="px-2 py-1 text-sm text-muted-foreground">...</span>
							) : (
								<Button
									variant={currentPage === page ? "default" : "outline"}
									size="sm"
									onClick={() => onPageChange(page as number)}
									disabled={isLoading}
									className="h-8 w-8 p-0"
								>
									{page}
								</Button>
							)}
						</React.Fragment>
					))}
				</div>

				{/* Next Page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={!hasNextPage || isLoading}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>

				{/* Last Page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={!hasNextPage || isLoading}
					className="h-8 w-8 p-0"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
