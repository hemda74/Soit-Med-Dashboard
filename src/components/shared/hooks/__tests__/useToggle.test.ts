import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../useToggle';

describe('useToggle hook', () => {
	it('initializes with false when no default value provided', () => {
		const { result } = renderHook(() => useToggle());
		expect(result.current.isOpen).toBe(false);
	});

	it('initializes with provided default value', () => {
		const { result } = renderHook(() => useToggle(true));
		expect(result.current.isOpen).toBe(true);
	});

	it('toggles value when toggle is called', () => {
		const { result } = renderHook(() => useToggle());
		expect(result.current.isOpen).toBe(false);

		act(() => {
			result.current.toggle();
		});

		expect(result.current.isOpen).toBe(true);

		act(() => {
			result.current.toggle();
		});

		expect(result.current.isOpen).toBe(false);
	});

	it('sets value to true when open is called', () => {
		const { result } = renderHook(() => useToggle(false));
		expect(result.current.isOpen).toBe(false);

		act(() => {
			result.current.open();
		});

		expect(result.current.isOpen).toBe(true);
	});

	it('sets value to false when close is called', () => {
		const { result } = renderHook(() => useToggle(true));
		expect(result.current.isOpen).toBe(true);

		act(() => {
			result.current.close();
		});

		expect(result.current.isOpen).toBe(false);
	});
});

