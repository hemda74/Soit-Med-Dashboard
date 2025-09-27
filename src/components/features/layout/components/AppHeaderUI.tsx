import React from 'react';
import { Menu, X, MoreHorizontal } from 'lucide-react';
import UserDropdown from "@/components/header/UserDropdown";
import Logo from "@/components/Logo";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { LanguageSelector } from "@/components/header/LanguageSelector";
import { SearchBar } from "@/components/header/SearchBar";
import NotificationDropdown from "@/components/header/NotificationDropdown";

interface AppHeaderUIProps {
    toggleSidebar: () => void;
    toggleAppMenu: () => void;
    isAppMenuOpen: boolean;
    isExpanded: boolean;
}

export const AppHeaderUI: React.FC<AppHeaderUIProps> = ({
    toggleSidebar,
    toggleAppMenu,
    isAppMenuOpen,
    isExpanded,
}) => {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Left side - Sidebar toggle button and logo */}
                <div className="flex items-center gap-4">
                    {/* Sidebar toggle button - visible on all screen sizes */}
                    <button
                        onClick={toggleSidebar}
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        aria-label="Toggle sidebar"
                    >
                        {isExpanded ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>

                    <Logo asLink={true} className="lg:hidden" />
                </div>

                {/* Center - Search bar (hidden on mobile) */}
                <div className="hidden lg:block flex-1 max-w-md mx-4">
                    <SearchBar />
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
