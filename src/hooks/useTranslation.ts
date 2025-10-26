import { useThemeStore } from '@/stores/themeStore';
import { translations, type TranslationKey } from '@/lib/translations';

export const useTranslation = () => {
	const { language } = useThemeStore();

	const t = (key: string): string => {
		return (
			translations[language][key] ||
			translations.en[key] ||
			key
		);
	};

	return { t, language };
};
