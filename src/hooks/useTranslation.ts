import { useThemeStore } from '@/stores/themeStore';
import { translations, type TranslationKey } from '@/lib/translations';

export const useTranslation = () => {
	const { language } = useThemeStore();

	const t = (key: TranslationKey | string): string => {
		// Handle nested keys with dot notation
		if (typeof key === 'string' && key.includes('.')) {
			const keys = key.split('.');
			let value: any = translations[language] as any;
			let fallback: any = translations.en as any;
			
			for (const k of keys) {
				value = value?.[k];
				fallback = fallback?.[k];
			}
			
			return value || fallback || key;
		}
		
		// Handle flat keys
		return (
			(translations[language] as any)[key] ||
			(translations.en as any)[key] ||
			key
		);
	};

	return { t, language };
};
