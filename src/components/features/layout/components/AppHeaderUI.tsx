import React from 'react';
import { Menu, X } from 'lucide-react';
import UserDropdown from "@/components/header/UserDropdown";
import Logo from "@/components/Logo";

interface AppHeaderUIProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    toggleAppMenu: () => void;
}

export const AppHeaderUI: React.FC<AppHeaderUIProps> = ({
    isSidebarOpen,
    toggleSidebar,
    toggleAppMenu,
}) => {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Left side - Mobile menu button and logo */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
                        aria-label="Toggle sidebar"
                    >
                        {isSidebarOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>

                    <Logo asLink={true} className="lg:hidden" />
                </div>

                {/* Right side - App menu and user dropdown */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleAppMenu}
                        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        aria-label="Toggle app menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <UserDropdown />
                </div>
            </div>
        </header>
    );
};
