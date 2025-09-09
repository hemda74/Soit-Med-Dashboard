import React, { useState, useEffect } from 'react';
import type { UserListResponse } from '@/types/user.types';
import { fetchUsers } from '@/services/api';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<UserListResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { setLoading } = useAppStore();

    useEffect(() => {
        const loadUsers = async () => {
            if (!user?.token) {
                setError('No authentication token found');
                return;
            }

            try {
                const usersData = await fetchUsers(user.token, setLoading);
                setUsers(usersData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load users');
            }
        };

        loadUsers();
    }, [user?.token, setLoading]);

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

    // Loading state is now handled by the global LoadingScreen component

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
                    Users List
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    View all users and their departments
                </p>
            </div>

            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Name
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Department
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Email
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
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

                {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No users found
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UsersList;
