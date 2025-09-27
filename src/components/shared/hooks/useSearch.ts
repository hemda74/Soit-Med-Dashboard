import { useState, useMemo, useCallback } from 'react';

interface UseSearchOptions<T> {
	data: T[];
	searchFields: (keyof T)[];
	initialSearchTerm?: string;
}

export const useSearch = <T>({
	data,
	searchFields,
	initialSearchTerm = '',
}: UseSearchOptions<T>) => {
	const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

	const filteredData = useMemo(() => {
		if (!searchTerm) return data;

		return data.filter((item) =>
			searchFields.some((field) => {
				const value = item[field];
				if (typeof value === 'string') {
					return value
						.toLowerCase()
						.includes(
							searchTerm.toLowerCase()
						);
				}
				if (typeof value === 'number') {
					return value
						.toString()
						.includes(searchTerm);
				}
				return false;
			})
		);
	}, [data, searchTerm, searchFields]);

	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term);
	}, []);

	const clearSearch = useCallback(() => {
		setSearchTerm('');
	}, []);

	return {
		searchTerm,
		filteredData,
		handleSearch,
		clearSearch,
	};
};
