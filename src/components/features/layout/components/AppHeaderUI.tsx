import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import UserDropdown from "@/components/header/UserDropdown";
import Logo from "@/components/Logo";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { LanguageSelector } from "@/components/header/LanguageSelector";
import NotificationDropdown from "@/components/header/NotificationDropdown";

interface AppHeaderUIProps {
    toggleAppMenu: () => void;
    isAppMenuOpen: boolean;
}

export const AppHeaderUI: React.FC<AppHeaderUIProps> = ({
    toggleAppMenu,
    isAppMenuOpen,
}) => {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Left side - Logo */}
                <div className="flex items-center gap-4">
                    <Logo asLink={true} className="lg:hidden" />
                </div>



                {/* Right side - Controls and user dropdown */}
                <div className="flex items-center gap-2">
                    {/* Mobile app menu button */}
                    <button
                        onClick={toggleAppMenu}
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
                        aria-label="Toggle app menu"
                    >
                        <MoreHorizontal className="h-6 w-6" />
                    </button>

                    {/* Desktop controls */}
                    <div className="hidden lg:flex items-center gap-2">
                        <ThemeToggleButton />
                        <LanguageSelector />
                        <NotificationDropdown />
                    </div>

                    <UserDropdown />
                </div>
            </div>

            {/* Mobile menu overlay */}
            {isAppMenuOpen && (
                <div className="lg:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex items-center justify-between px-4 py-4 gap-4">
                        <div className="flex items-center gap-2">
                            <ThemeToggleButton />
                            <LanguageSelector />
                            <NotificationDropdown />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
