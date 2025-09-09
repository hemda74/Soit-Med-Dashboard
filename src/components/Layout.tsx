import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

export function Layout() {
    useNavigationLoading();

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-16">
                <Outlet />
            </main>
        </div>
    );
}
