import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { theme, language, setTheme, setLanguage } = useThemeStore();

    useEffect(() => {
        // Initialize theme on first load
        const savedTheme = localStorage.getItem('theme-storage');
        if (savedTheme) {
            try {
                const parsed = JSON.parse(savedTheme);
                if (parsed.state?.theme) {
                    setTheme(parsed.state.theme);
                }
                if (parsed.state?.language) {
                    setLanguage(parsed.state.language);
                }
            } catch {
                // Fallback to system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(prefersDark ? 'dark' : 'light');
            }
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, [setTheme, setLanguage]);

    useEffect(() => {
        // Apply theme classes
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Apply language and direction
        root.dir = language === 'ar' ? 'rtl' : 'ltr';
        root.lang = language;

        console.log('Theme applied:', theme, 'Language:', language);
    }, [theme, language]);

    return <>{children}</>;
}
