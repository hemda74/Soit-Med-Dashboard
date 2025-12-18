import React, { useState } from 'react';
import { Search, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { UserStatusToggle } from './UserStatusToggle';
import { useAuthStore } from '@/stores/authStore';

interface UserSearchInputProps {
    onSearch: (username: string) => void;
    onClear: () => void;
    isSearching: boolean;
    searchResult: {
        id: string;
        fullName: string;
        userName: string;
        email: string;
        departmentName: string;
        roles: string[];
        isActive: boolean;
    } | null;
    error: string | null;
    onStatusChange?: (newStatus: boolean) => void;
}

export function UserSearchInput({
    onSearch,
    onClear,
    isSearching,
    searchResult,
    error,
    onStatusChange,
}: UserSearchInputProps) {
    const [searchValue, setSearchValue] = useState('');
    const { user } = useAuthStore();

    // Check if current user is super Admin
    const isSuperAdmin = user?.roles.includes('SuperAdmin') || false;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            onSearch(searchValue.trim());
        }
    };

    const handleClear = () => {
        setSearchValue('');
        onClear();
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by username (e.g., Ahmed_Hemdan)"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-10"
                        disabled={isSearching}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={!searchValue.trim() || isSearching}
                    className="flex items-center gap-2"
                >
                    <Search className="h-4 w-4" />
                    Search
                </Button>
                {(searchResult || error) && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                )}
            </form>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="p-4">
                        <p className="text-destructive text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            {searchResult && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-800 dark:text-green-200">
                                    User Found
                                </h3>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p>
                                        <span className="font-medium">Name:</span>{' '}
                                        {searchResult.fullName}
                                    </p>
                                    <p>
                                        <span className="font-medium">Username:</span>{' '}
                                        {searchResult.userName}
                                    </p>
                                    <p>
                                        <span className="font-medium">Email:</span>{' '}
                                        {searchResult.email}
                                    </p>
                                    <p>
                                        <span className="font-medium">Department:</span>{' '}
                                        {searchResult.departmentName}
                                    </p>
                                    <p>
                                        <span className="font-medium">Role:</span>{' '}
                                        {searchResult.roles.join(', ')}
                                    </p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${searchResult.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}
                                        >
                                            {searchResult.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                </div>
                                {isSuperAdmin && onStatusChange && (
                                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                                        <UserStatusToggle
                                            userId={searchResult.id}
                                            userName={searchResult.fullName}
                                            email={searchResult.email}
                                            isActive={searchResult.isActive}
                                            onStatusChange={onStatusChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default UserSearchInput;
