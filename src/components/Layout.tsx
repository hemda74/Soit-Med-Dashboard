import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

export function Layout() {
    useNavigationLoading();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <div className={cn(
            "min-h-screen",
            isDark 
                ? "bg-gradient-to-br from-primary/10 via-background to-secondary/10" 
                : "bg-gradient-to-br from-primary/5 via-background to-secondary/5"
        )}>
            <Header />
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
