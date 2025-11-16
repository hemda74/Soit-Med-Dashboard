import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';

describe('useSearch hook', () => {
	const mockData = [
		{ id: 1, name: 'John Doe', email: 'john@example.com' },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com' },
		{ id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
	];

	it('initializes with empty search term', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['name'],
			})
		);

		expect(result.current.searchTerm).toBe('');
		expect(result.current.filteredData).toEqual(mockData);
	});

	it('initializes with provided search term', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['name'],
				initialSearchTerm: 'Jane',
			})
		);

		expect(result.current.searchTerm).toBe('Jane');
		expect(result.current.filteredData).toHaveLength(1);
		expect(result.current.filteredData[0].name).toBe('Jane Smith');
	});

	it('filters data by string field', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['name'],
			})
		);

		act(() => {
			result.current.handleSearch('Jane');
		});

		expect(result.current.filteredData).toHaveLength(1);
		expect(result.current.filteredData[0].name).toBe('Jane Smith');
	});

	it('filters data by multiple fields', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['name', 'email'],
			})
		);

		act(() => {
			result.current.handleSearch('example.com');
		});

		expect(result.current.filteredData.length).toBeGreaterThan(0);
	});

	it('filters data by number field', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['id'],
			})
		);

		act(() => {
			result.current.handleSearch('1');
		});

		expect(result.current.filteredData).toHaveLength(1);
		expect(result.current.filteredData[0].id).toBe(1);
	});

	it('performs case-insensitive search', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['name'],
			})
		);

		act(() => {
			result.current.handleSearch('JANE');
		});

		expect(result.current.filteredData).toHaveLength(1);
		expect(result.current.filteredData[0].name).toBe('Jane Smith');
	});

	it('returns all data when search term is empty', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['name'],
			})
		);

		act(() => {
			result.current.handleSearch('Jane');
		});

		expect(result.current.filteredData).toHaveLength(1);

		act(() => {
			result.current.clearSearch();
		});

		expect(result.current.searchTerm).toBe('');
		expect(result.current.filteredData).toEqual(mockData);
	});

	it('returns empty array when no matches found', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: mockData,
				searchFields: ['name'],
			})
		);

		act(() => {
			result.current.handleSearch('NonExistent');
		});

		expect(result.current.filteredData).toHaveLength(0);
	});

	it('handles empty data array', () => {
		const { result } = renderHook(() =>
			useSearch({
				data: [],
				searchFields: ['name'],
			})
		);

		act(() => {
			result.current.handleSearch('test');
		});

		expect(result.current.filteredData).toEqual([]);
	});
});

