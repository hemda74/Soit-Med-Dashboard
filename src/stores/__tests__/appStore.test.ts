import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../appStore';

describe('AppStore', () => {
	beforeEach(() => {
		// Reset store state before each test
		useAppStore.setState({
			sidebarOpen: false,
			loading: false,
			error: null,
			currentPage: 'dashboard',
			breadcrumbs: [{ label: 'Dashboard' }],
			modals: {
				userProfile: false,
				settings: false,
				confirmDialog: false,
			},
			searchQuery: '',
			searchResults: [],
			isSearching: false,
		});
	});

	it('initializes with default values', () => {
		const state = useAppStore.getState();
		expect(state.sidebarOpen).toBe(false);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
		expect(state.currentPage).toBe('dashboard');
		expect(state.searchQuery).toBe('');
	});

	it('toggles sidebar correctly', () => {
		const state = useAppStore.getState();
		expect(state.sidebarOpen).toBe(false);
		
		state.toggleSidebar();
		const updatedState = useAppStore.getState();
		expect(updatedState.sidebarOpen).toBe(true);
		
		updatedState.toggleSidebar();
		const finalState = useAppStore.getState();
		expect(finalState.sidebarOpen).toBe(false);
	});

	it('sets sidebar open state', () => {
		const state = useAppStore.getState();
		state.setSidebarOpen(true);
		const updatedState = useAppStore.getState();
		expect(updatedState.sidebarOpen).toBe(true);
		
		updatedState.setSidebarOpen(false);
		const finalState = useAppStore.getState();
		expect(finalState.sidebarOpen).toBe(false);
	});

	it('sets loading state', () => {
		const state = useAppStore.getState();
		state.setLoading(true);
		const updatedState = useAppStore.getState();
		expect(updatedState.loading).toBe(true);
		
		updatedState.setLoading(false);
		const finalState = useAppStore.getState();
		expect(finalState.loading).toBe(false);
	});

	it('sets and clears error', () => {
		const state = useAppStore.getState();
		state.setError('Test error');
		const updatedState = useAppStore.getState();
		expect(updatedState.error).toBe('Test error');
		
		updatedState.clearError();
		const finalState = useAppStore.getState();
		expect(finalState.error).toBeNull();
	});

	it('sets current page', () => {
		const state = useAppStore.getState();
		state.setCurrentPage('users');
		const updatedState = useAppStore.getState();
		expect(updatedState.currentPage).toBe('users');
	});

	it('sets breadcrumbs', () => {
		const state = useAppStore.getState();
		const breadcrumbs = [
			{ label: 'Home', href: '/' },
			{ label: 'Users' },
		];
		state.setBreadcrumbs(breadcrumbs);
		const updatedState = useAppStore.getState();
		expect(updatedState.breadcrumbs).toEqual(breadcrumbs);
	});

	it('opens and closes modals', () => {
		const state = useAppStore.getState();
		
		state.openModal('userProfile');
		const updatedState = useAppStore.getState();
		expect(updatedState.modals.userProfile).toBe(true);
		expect(updatedState.modals.settings).toBe(false);
		
		updatedState.closeModal('userProfile');
		const finalState = useAppStore.getState();
		expect(finalState.modals.userProfile).toBe(false);
	});

	it('closes all modals', () => {
		const state = useAppStore.getState();
		state.openModal('userProfile');
		state.openModal('settings');
		state.openModal('confirmDialog');
		
		state.closeAllModals();
		expect(state.modals.userProfile).toBe(false);
		expect(state.modals.settings).toBe(false);
		expect(state.modals.confirmDialog).toBe(false);
	});

	it('sets search query', () => {
		const state = useAppStore.getState();
		state.setSearchQuery('test query');
		const updatedState = useAppStore.getState();
		expect(updatedState.searchQuery).toBe('test query');
	});

	it('sets search results', () => {
		const state = useAppStore.getState();
		const results = [{ id: 1, name: 'Test' }];
		state.setSearchResults(results);
		const updatedState = useAppStore.getState();
		expect(updatedState.searchResults).toEqual(results);
	});

	it('sets is searching state', () => {
		const state = useAppStore.getState();
		state.setIsSearching(true);
		const updatedState = useAppStore.getState();
		expect(updatedState.isSearching).toBe(true);
		
		updatedState.setIsSearching(false);
		const finalState = useAppStore.getState();
		expect(finalState.isSearching).toBe(false);
	});

	it('clears search', () => {
		const state = useAppStore.getState();
		state.setSearchQuery('test');
		state.setSearchResults([{ id: 1 }]);
		state.setIsSearching(true);
		
		state.clearSearch();
		const updatedState = useAppStore.getState();
		expect(updatedState.searchQuery).toBe('');
		expect(updatedState.searchResults).toEqual([]);
		expect(updatedState.isSearching).toBe(false);
	});
});

