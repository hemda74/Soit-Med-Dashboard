import { Moon, Sun, Languages, User, LogOut, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoImage from '@/assets/Logo.png';

export function Header() {
    const { theme, language, toggleLanguage, setTheme } = useThemeStore();
    const { user, isAuthenticated, logout, hasRole } = useAuthStore();
    const { t } = useTranslation();

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        console.log('Theme changed to:', newTheme);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between w-full">
                    {/* Logo/Brand and Welcome message */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <img
                                src={logoImage}
                                alt="Soit Medical"
                                className=""
                                width={200}
                                height={150}
                                onError={(e) => {
                                    // Fallback to text if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                }}
                            />

                        </Link>
                        {isAuthenticated && user && (
                            <div className="text-sm text-muted-foreground">
                                {t('Hello')}, <span className="font-medium text-foreground">{user.firstName}</span>!
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Language Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleLanguage}
                            className="flex items-center gap-2"
                        >
                            <Languages className="h-4 w-4" />
                            <span className="text-xs">
                                {language === 'en' ? 'العربية' : 'English'}
                            </span>
                        </Button>

                        {/* Theme Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
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
                            <DropdownMenuContent align="end">
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

                        {/* User Menu - only show when authenticated */}
                        {isAuthenticated && user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="text-xs">{user.fullName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 cursor-pointer w-full"
                                        >
                                            <User className="h-4 w-4" />
                                            {t('profile')}
                                        </Link>
                                    </DropdownMenuItem>

                                    {/* Admin-only menu items */}
                                    {(hasRole('SuperAdmin') || hasRole('Admin')) && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/users"
                                                    className="flex items-center gap-2 cursor-pointer w-full"
                                                >
                                                    <Users className="h-4 w-4" />
                                                    {t('usersList')}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/admin/create-user"
                                                    className="flex items-center gap-2 cursor-pointer w-full"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                    {t('createNewUser')}
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="flex items-center gap-2 cursor-pointer text-destructive"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {t('signOut')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
