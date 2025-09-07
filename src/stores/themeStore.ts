import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';

interface ThemeState {
	theme: Theme;
	language: Language;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
	toggleLanguage: () => void;
	setLanguage: (language: Language) => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			theme: 'light',
			language: 'en',

			toggleTheme: () => {
				const newTheme =
					get().theme === 'light'
						? 'dark'
						: 'light';
				set({ theme: newTheme });

				// Apply theme class immediately
				const root = document.documentElement;
				root.classList.remove('light', 'dark');
				root.classList.add(newTheme);
			},

			setTheme: (theme: Theme) => {
				set({ theme });

				// Apply theme class immediately
				const root = document.documentElement;
				root.classList.remove('light', 'dark');
				root.classList.add(theme);
			},

			toggleLanguage: () => {
				const newLanguage =
					get().language === 'en' ? 'ar' : 'en';
				set({ language: newLanguage });
				document.documentElement.dir =
					newLanguage === 'ar' ? 'rtl' : 'ltr';
				document.documentElement.lang = newLanguage;
			},

			setLanguage: (language: Language) => {
				set({ language });
				document.documentElement.dir =
					language === 'ar' ? 'rtl' : 'ltr';
				document.documentElement.lang = language;
			},
		}),
		{
			name: 'theme-storage',
		}
	)
);
