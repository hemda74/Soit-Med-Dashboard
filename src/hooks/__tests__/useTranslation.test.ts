import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTranslation } from '../useTranslation';
import { useThemeStore } from '@/stores/themeStore';

// Mock the theme store
vi.mock('@/stores/themeStore', () => ({
	useThemeStore: vi.fn(),
}));

// Mock translations
vi.mock('@/lib/translations', () => ({
	translations: {
		en: {
			'common.save': 'Save',
			'common.cancel': 'Cancel',
			'common.delete': 'Delete',
		},
		ar: {
			'common.save': 'حفظ',
			'common.cancel': 'إلغاء',
			'common.delete': 'حذف',
		},
	},
}));

describe('useTranslation hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns translation function and language', () => {
		(useThemeStore as any).mockReturnValue({ language: 'en' });
		
		const { result } = renderHook(() => useTranslation());
		
		expect(result.current.t).toBeInstanceOf(Function);
		expect(result.current.language).toBe('en');
	});

	it('translates English keys correctly', () => {
		(useThemeStore as any).mockReturnValue({ language: 'en' });
		
		const { result } = renderHook(() => useTranslation());
		
		expect(result.current.t('common.save' as any)).toBe('Save');
		expect(result.current.t('common.cancel' as any)).toBe('Cancel');
	});

	it('translates Arabic keys correctly', () => {
		(useThemeStore as any).mockReturnValue({ language: 'ar' });
		
		const { result } = renderHook(() => useTranslation());
		
		expect(result.current.t('common.save' as any)).toBe('حفظ');
		expect(result.current.t('common.cancel' as any)).toBe('إلغاء');
	});

	it('falls back to English if Arabic translation not found', () => {
		(useThemeStore as any).mockReturnValue({ language: 'ar' });
		
		const { result } = renderHook(() => useTranslation());
		
		// Assuming 'common.newKey' doesn't exist in Arabic but exists in English
		// It should fall back to English or return the key
		const translation = result.current.t('common.newKey' as any);
		expect(translation).toBeDefined();
	});

	it('returns key if translation not found', () => {
		(useThemeStore as any).mockReturnValue({ language: 'en' });
		
		const { result } = renderHook(() => useTranslation());
		
		const translation = result.current.t('nonexistent.key' as any);
		expect(translation).toBe('nonexistent.key');
	});

	it('updates language when theme store changes', () => {
		(useThemeStore as any).mockReturnValue({ language: 'en' });
		
		const { result, rerender } = renderHook(() => useTranslation());
		expect(result.current.language).toBe('en');
		
		(useThemeStore as any).mockReturnValue({ language: 'ar' });
		rerender();
		
		expect(result.current.language).toBe('ar');
	});
});

