import React from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '@/components/ProfileImage';

const UserDropdown: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleSettings = () => {
        navigate('/settings');
    };

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-10 px-3">
                    <ProfileImage
                        src={user.profileImage}
                        alt={user.fullName || user.email}
                        size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.fullName || user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 z-[10000]">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.fullName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile} className="cursor-pointer btn-hover-primary">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings} className="cursor-pointer btn-hover-primary">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;
