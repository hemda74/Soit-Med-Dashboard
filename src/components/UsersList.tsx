import React, { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import type { UserListResponse } from '@/types/user.types';
import type { Department, DepartmentUsersResponse, UserSearchResponse, Role, RoleUsersResponse } from '@/types/department.types';
import { fetchUsers, fetchUsersByDepartment, searchUserByUsername, fetchUsersByRole } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import DepartmentSelector from './DepartmentSelector';
import RoleSelector from './RoleSelector';
import UserSearchInput from './UserSearchInput';

type ViewMode = 'all' | 'department' | 'role' | 'search';

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<UserListResponse[]>([]);
    const [departmentUsers, setDepartmentUsers] = useState<DepartmentUsersResponse | null>(null);
    const [roleUsers, setRoleUsers] = useState<RoleUsersResponse | null>(null);
    const [searchResult, setSearchResult] = useState<UserSearchResponse | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { setLoading } = useAppStore();

    const loadAllUsers = async () => {
        if (!user?.token) {
            setError('No authentication token found');
            return;
        }

        try {
            setError(null);
            const usersData = await fetchUsers(user.token, setLoading);
            setUsers(usersData);
            setViewMode('all');
            setDepartmentUsers(null);
            setRoleUsers(null);
            setSearchResult(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        }
    };

    const loadDepartmentUsers = async (department: Department) => {
        if (!user?.token) {
            setError('No authentication token found');
            return;
        }

        try {
            setError(null);
            const departmentData = await fetchUsersByDepartment(department.id, user.token, setLoading);
            setDepartmentUsers(departmentData);
            setSelectedDepartment(department);
            setViewMode('department');
            setRoleUsers(null);
            setSearchResult(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load department users');
        }
    };

    const loadRoleUsers = async (role: Role) => {
        if (!user?.token) {
            setError('No authentication token found');
            return;
        }

        try {
            setError(null);
            const roleData = await fetchUsersByRole(role.name, user.token, setLoading);
            setRoleUsers(roleData);
            setSelectedRole(role);
            setViewMode('role');
            setDepartmentUsers(null);
            setSearchResult(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load role users');
        }
    };

    const searchUser = async (username: string) => {
        if (!user?.token) {
            setError('No authentication token found');
            return;
        }

        try {
            setError(null);
            const userData = await searchUserByUsername(username, user.token, setLoading);
            setSearchResult(userData);
            setViewMode('search');
            setDepartmentUsers(null);
            setRoleUsers(null);
            setSelectedDepartment(null);
            setSelectedRole(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search user');
        }
    };

    const clearSearch = () => {
        setSearchResult(null);
        setError(null);
        setViewMode('all');
    };

    const handleDepartmentSelect = (department: Department) => {
        loadDepartmentUsers(department);
    };

    const handleRoleSelect = (role: Role) => {
        loadRoleUsers(role);
    };

    // Load all users on component mount
    useEffect(() => {
        loadAllUsers();
    }, [user?.token]);

    // Map department IDs to department names
    const getDepartmentName = (departmentId: number): string => {
        const departmentMap: { [key: number]: string } = {
            1: 'Administration',
            2: 'IT',
            3: 'HR',
            4: 'Finance',
            5: 'Operations',
            6: 'Support'
        };
        return departmentMap[departmentId] || `Department ${departmentId}`;
    };

    // Get current users to display
    const currentUsers = viewMode === 'all'
        ? users
        : viewMode === 'department'
            ? departmentUsers?.users || []
            : viewMode === 'role'
                ? roleUsers?.users || []
                : searchResult
                    ? [searchResult]
                    : [];

    const currentDescription = viewMode === 'all'
        ? 'View all users across all departments'
        : viewMode === 'department'
            ? `View users in ${selectedDepartment?.name} department (${departmentUsers?.userCount || 0} users)`
            : viewMode === 'role'
                ? `View users with ${selectedRole?.name} role (${roleUsers?.userCount || 0} users)`
                : searchResult
                    ? `Found user: ${searchResult.fullName}`
                    : 'Search for a user by username';

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Users Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {currentDescription}
                </p>
            </div>

            {/* Search Section */}
            <div className="mb-6">
                <UserSearchInput
                    onSearch={searchUser}
                    onClear={clearSearch}
                    isSearching={false}
                    searchResult={searchResult}
                    error={error}
                />
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
                <Button
                    onClick={loadAllUsers}
                    variant={viewMode === 'all' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                >
                    <Users className="h-4 w-4" />
                    All Users
                </Button>

                <div className="flex-1 max-w-md">
                    <DepartmentSelector
                        onDepartmentSelect={handleDepartmentSelect}
                        selectedDepartment={selectedDepartment}
                    />
                </div>

                <div className="flex-1 max-w-md">
                    <RoleSelector
                        onRoleSelect={handleRoleSelect}
                        selectedRole={selectedRole}
                    />
                </div>

                <Button
                    onClick={() => {
                        if (viewMode === 'all') {
                            loadAllUsers();
                        } else if (viewMode === 'department' && selectedDepartment) {
                            loadDepartmentUsers(selectedDepartment);
                        } else if (viewMode === 'role' && selectedRole) {
                            loadRoleUsers(selectedRole);
                        } else if (viewMode === 'search' && searchResult) {
                            searchUser(searchResult.userName);
                        }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-start py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Name
                                </th>
                                <th className="text-start py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Department
                                </th>
                                <th className="text-start py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Email
                                </th>
                                <th className="text-start py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                                        {user.fullName}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                        {getDepartmentName(user.departmentId)}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {currentUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {viewMode === 'all'
                            ? 'No users found'
                            : viewMode === 'department'
                                ? 'No users found in this department'
                                : viewMode === 'role'
                                    ? 'No users found with this role'
                                    : 'No user found with this username'
                        }
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UsersList;
