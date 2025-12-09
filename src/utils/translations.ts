/**
 * Translation utility for use outside React components (hooks, services, etc.)
 * This allows accessing translations without React hooks
 */

import { translations } from '@/lib/translations';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Get translation for a key (can be used outside React components)
 * @param key - Translation key
 * @returns Translated string
 */
export const getTranslation = (key: string): string => {
	try {
		const { language } = useThemeStore.getState();
		const translation = (translations[language] as any)?.[key] || 
		                   (translations.en as any)?.[key] || 
		                   key;
		return translation;
	} catch (error) {
		console.warn(`Translation key "${key}" not found`);
		return key;
	}
};

/**
 * Alias for shorter usage
 */
export const t = getTranslation;

