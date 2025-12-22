import { useThemeStore } from '@/stores/themeStore';
import { translations, type TranslationKey } from '@/lib/translations';

export const useTranslation = () => {
	const { language } = useThemeStore();

	const t = (key: TranslationKey | string): string => {
		try {
			// Handle nested keys with dot notation
			if (typeof key === 'string' && key.includes('.')) {
				const keys = key.split('.');
				let value: any = translations[language] as any;
				let fallback: any = translations.en as any;

				// Safely navigate nested properties
				for (const k of keys) {
					if (
						value &&
						typeof value === 'object'
					) {
						value = value[k];
					} else {
						value = undefined;
					}
					if (
						fallback &&
						typeof fallback === 'object'
					) {
						fallback = fallback[k];
					} else {
						fallback = undefined;
					}
				}

				return (
					(typeof value === 'string'
						? value
						: undefined) ||
					(typeof fallback === 'string'
						? fallback
						: undefined) ||
					key
				);
			}

			// Handle flat keys
			const langTranslations = translations[language] as any;
			const enTranslations = translations.en as any;

			return (
				(langTranslations && langTranslations[key]) ||
				(enTranslations && enTranslations[key]) ||
				key
			);
		} catch (error) {
			console.warn('Translation error for key:', key, error);
			return key;
		}
	};

	return { t, language };
};
