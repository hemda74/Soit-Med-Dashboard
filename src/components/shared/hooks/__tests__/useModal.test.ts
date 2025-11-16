import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from '../useModal';

describe('useModal hook', () => {
	it('initializes with closed state', () => {
		const { result } = renderHook(() => useModal());
		expect(result.current.isOpen).toBe(false);
	});

	it('initializes with open state when initialState is true', () => {
		const { result } = renderHook(() => useModal(true));
		expect(result.current.isOpen).toBe(true);
	});

	it('opens modal when open is called', () => {
		const { result } = renderHook(() => useModal());
		expect(result.current.isOpen).toBe(false);

		act(() => {
			result.current.open();
		});

		expect(result.current.isOpen).toBe(true);
	});

	it('closes modal when close is called', () => {
		const { result } = renderHook(() => useModal(true));
		expect(result.current.isOpen).toBe(true);

		act(() => {
			result.current.close();
		});

		expect(result.current.isOpen).toBe(false);
	});

	it('toggles modal state when toggle is called', () => {
		const { result } = renderHook(() => useModal());
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

	it('returns correct API structure', () => {
		const { result } = renderHook(() => useModal());
		expect(result.current).toHaveProperty('isOpen');
		expect(result.current).toHaveProperty('open');
		expect(result.current).toHaveProperty('close');
		expect(result.current).toHaveProperty('toggle');
		expect(typeof result.current.open).toBe('function');
		expect(typeof result.current.close).toBe('function');
		expect(typeof result.current.toggle).toBe('function');
	});
});
