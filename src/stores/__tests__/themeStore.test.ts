import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '../themeStore';

describe('ThemeStore', () => {
	beforeEach(() => {
		// Reset store state before each test
		useThemeStore.setState({
			theme: 'light',
			language: 'en',
		});
		
		// Reset DOM
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.dir = 'ltr';
		document.documentElement.lang = 'en';
	});

	it('initializes with default theme and language', () => {
		const state = useThemeStore.getState();
		expect(state.theme).toBe('light');
		expect(state.language).toBe('en');
	});

	it('toggles theme correctly', () => {
		const state = useThemeStore.getState();
		expect(state.theme).toBe('light');
		
		state.toggleTheme();
		const updatedState = useThemeStore.getState();
		expect(updatedState.theme).toBe('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		
		updatedState.toggleTheme();
		const finalState = useThemeStore.getState();
		expect(finalState.theme).toBe('light');
		expect(document.documentElement.classList.contains('light')).toBe(true);
	});

	it('sets theme directly', () => {
		const state = useThemeStore.getState();
		state.setTheme('dark');
		const updatedState = useThemeStore.getState();
		expect(updatedState.theme).toBe('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		
		updatedState.setTheme('light');
		const finalState = useThemeStore.getState();
		expect(finalState.theme).toBe('light');
		expect(document.documentElement.classList.contains('light')).toBe(true);
	});

	it('toggles language correctly', () => {
		const state = useThemeStore.getState();
		expect(state.language).toBe('en');
		
		state.toggleLanguage();
		const updatedState = useThemeStore.getState();
		expect(updatedState.language).toBe('ar');
		expect(document.documentElement.dir).toBe('rtl');
		expect(document.documentElement.lang).toBe('ar');
		
		updatedState.toggleLanguage();
		const finalState = useThemeStore.getState();
		expect(finalState.language).toBe('en');
		expect(document.documentElement.dir).toBe('ltr');
		expect(document.documentElement.lang).toBe('en');
	});

	it('sets language directly', () => {
		const state = useThemeStore.getState();
		state.setLanguage('ar');
		const updatedState = useThemeStore.getState();
		expect(updatedState.language).toBe('ar');
		expect(document.documentElement.dir).toBe('rtl');
		expect(document.documentElement.lang).toBe('ar');
		
		updatedState.setLanguage('en');
		const finalState = useThemeStore.getState();
		expect(finalState.language).toBe('en');
		expect(document.documentElement.dir).toBe('ltr');
		expect(document.documentElement.lang).toBe('en');
	});
});

