import { Moon, Sun, Languages, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
    const { theme, language, toggleTheme, toggleLanguage, setTheme } = useThemeStore();
    const { t } = useTranslation();

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        console.log('Theme changed to:', newTheme);
    };

    return (
        <header className="fixed top-0 right-0 z-50 p-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 bg-background border-border hover:bg-accent"
                >
                    <Languages className="h-4 w-4" />
                    <span className="text-xs">
                        {language === 'en' ? 'العربية' : 'English'}
                    </span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 bg-background border-border hover:bg-accent"
                        >
                            {theme === 'dark' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                            <span className="text-xs">
                                {theme === 'dark' ? t('darkMode') : t('lightMode')}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border-border">
                        <DropdownMenuItem
                            onClick={() => handleThemeChange('light')}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Sun className="h-4 w-4" />
                            {t('lightMode')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleThemeChange('dark')}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Moon className="h-4 w-4" />
                            {t('darkMode')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
