import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isExpanded: boolean;
    isHovered: boolean;
    isMobileOpen: boolean;
    setIsExpanded: (expanded: boolean) => void;
    setIsHovered: (hovered: boolean) => void;
    setIsMobileOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    toggleMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const value: SidebarContextType = {
        isExpanded,
        isHovered,
        isMobileOpen,
        setIsExpanded,
        setIsHovered,
        setIsMobileOpen,
        toggleSidebar,
        toggleMobileSidebar,
    };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = (): SidebarContextType => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
