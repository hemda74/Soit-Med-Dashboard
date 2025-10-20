import { useThemeStore } from '@/stores/themeStore';
import { translations, type TranslationKey } from '@/lib/translations';

export const useTranslation = () => {
	const { language } = useThemeStore();

	const t = (key: TranslationKey): string => {
		return (
			(translations[language] as any)[key] ||
			(translations.en as any)[key] ||
			key
		);
	};

	return { t, language };
};
