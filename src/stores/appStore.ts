import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface AppState {
	// UI State
	sidebarOpen: boolean;
	loading: boolean;
	error: string | null;

	// Navigation state
	currentPage: string;
	breadcrumbs: Array<{ label: string; href?: string }>;

	// Modal/Dialog state
	modals: {
		userProfile: boolean;
		settings: boolean;
		confirmDialog: boolean;
	};

	// Search state
	searchQuery: string;
	searchResults: any[];
	isSearching: boolean;

	// Actions
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;

	// Navigation actions
	setCurrentPage: (page: string) => void;
	setBreadcrumbs: (
		breadcrumbs: Array<{ label: string; href?: string }>
	) => void;

	// Modal actions
	openModal: (modal: keyof AppState['modals']) => void;
	closeModal: (modal: keyof AppState['modals']) => void;
	closeAllModals: () => void;

	// Search actions
	setSearchQuery: (query: string) => void;
	setSearchResults: (results: any[]) => void;
	setIsSearching: (searching: boolean) => void;
	clearSearch: () => void;
}

export const useAppStore = create<AppState>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				// Initial state
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

				// UI Actions
				setSidebarOpen: (open: boolean) =>
					set({ sidebarOpen: open }),

				toggleSidebar: () =>
					set((state) => ({
						sidebarOpen: !state.sidebarOpen,
					})),

				setLoading: (loading: boolean) =>
					set({ loading }),

				setError: (error: string | null) =>
					set({ error }),

				clearError: () => set({ error: null }),

				// Navigation Actions
				setCurrentPage: (page: string) =>
					set({ currentPage: page }),

				setBreadcrumbs: (
					breadcrumbs: Array<{
						label: string;
						href?: string;
					}>
				) => set({ breadcrumbs }),

				// Modal Actions
				openModal: (modal: keyof AppState['modals']) =>
					set((state) => ({
						modals: {
							...state.modals,
							[modal]: true,
						},
					})),

				closeModal: (modal: keyof AppState['modals']) =>
					set((state) => ({
						modals: {
							...state.modals,
							[modal]: false,
						},
					})),

				closeAllModals: () =>
					set({
						modals: {
							userProfile: false,
							settings: false,
							confirmDialog: false,
						},
					}),

				// Search Actions
				setSearchQuery: (query: string) =>
					set({ searchQuery: query }),

				setSearchResults: (results: any[]) =>
					set({ searchResults: results }),

				setIsSearching: (searching: boolean) =>
					set({ isSearching: searching }),

				clearSearch: () =>
					set({
						searchQuery: '',
						searchResults: [],
						isSearching: false,
					}),
			}),
			{
				name: 'app-storage',
				partialize: (state) => ({
					sidebarOpen: state.sidebarOpen,
					currentPage: state.currentPage,
				}),
			}
		)
	)
);
