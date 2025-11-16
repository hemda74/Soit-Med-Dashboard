import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage hook', () => {
	const key = 'test-key';

	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('initializes with initial value when localStorage is empty', () => {
		const { result } = renderHook(() =>
			useLocalStorage(key, 'initial')
		);

		expect(result.current[0]).toBe('initial');
	});

	it('initializes with value from localStorage', () => {
		localStorage.setItem(key, JSON.stringify('stored-value'));

		const { result } = renderHook(() =>
			useLocalStorage(key, 'initial')
		);

		expect(result.current[0]).toBe('stored-value');
	});

	it('stores value in localStorage when setValue is called', () => {
		const { result } = renderHook(() =>
			useLocalStorage(key, 'initial')
		);

		act(() => {
			result.current[1]('new-value');
		});

		expect(result.current[0]).toBe('new-value');
		expect(localStorage.getItem(key)).toBe(JSON.stringify('new-value'));
	});

	it('handles function updater in setValue', () => {
		const { result } = renderHook(() =>
			useLocalStorage(key, 0)
		);

		act(() => {
			result.current[1]((prev) => prev + 1);
		});

		expect(result.current[0]).toBe(1);
	});

	it('stores complex objects in localStorage', () => {
		const complexObject = { name: 'Test', id: 1, nested: { value: 'test' } };

		const { result } = renderHook(() =>
			useLocalStorage(key, null)
		);

		act(() => {
			result.current[1](complexObject);
		});

		expect(result.current[0]).toEqual(complexObject);
		expect(localStorage.getItem(key)).toBe(JSON.stringify(complexObject));
	});

	it('removes value from localStorage when removeValue is called', () => {
		const { result } = renderHook(() =>
			useLocalStorage(key, 'initial')
		);

		act(() => {
			result.current[1]('test-value');
		});

		expect(localStorage.getItem(key)).toBe(JSON.stringify('test-value'));

		act(() => {
			result.current[2]();
		});

		expect(result.current[0]).toBe('initial');
		expect(localStorage.getItem(key)).toBeNull();
	});

	it('handles localStorage errors gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		
		// Mock localStorage.setItem to throw error
		const originalSetItem = Storage.prototype.setItem;
		Storage.prototype.setItem = vi.fn(() => {
			throw new Error('Storage quota exceeded');
		});

		const { result } = renderHook(() =>
			useLocalStorage(key, 'initial')
		);

		act(() => {
			result.current[1]('new-value');
		});

		// Should not crash, value should still be updated in state
		expect(result.current[0]).toBe('new-value');
		expect(consoleSpy).toHaveBeenCalled();

		// Restore
		Storage.prototype.setItem = originalSetItem;
		consoleSpy.mockRestore();
	});

	it('handles invalid JSON in localStorage', () => {
		localStorage.setItem(key, 'invalid-json');

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const { result } = renderHook(() =>
			useLocalStorage(key, 'initial')
		);

		// Should fall back to initial value
		expect(result.current[0]).toBe('initial');
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});
});




