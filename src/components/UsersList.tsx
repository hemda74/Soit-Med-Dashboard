import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Edit, Save, X, Key } from 'lucide-react';
import type { UserListResponse } from '@/types/user.types';
import type { Department, DepartmentUsersResponse, UserSearchResponse, Role, RoleUsersResponse, DepartmentUser } from '@/types/department.types';
import { fetchUsers, fetchUsersByDepartment, searchUserByUsername, fetchUsersByRole } from '@/services/api';
import { updateUser } from '@/services/roleSpecificUserApi';
import { useNotificationStore } from '@/stores/notificationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import DepartmentSelector from './DepartmentSelector';
import RoleSelector from './RoleSelector';
import UserSearchInput from './UserSearchInput';
import { PasswordUpdateModal } from './admin/PasswordUpdateModal';
import { UserStatusToggle } from './UserStatusToggle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type ViewMode = 'all' | 'department' | 'role' | 'search';

// Department mapping
const DEPARTMENT_MAP: Record<number, string> = {
    1: 'Administration',
    2: 'Medical',
    3: 'Sales',
    4: 'Engineering',
    5: 'Finance',
    6: 'Legal',
    7: 'NewOne'
};

// Union type for all possible user types
type UserData = UserListResponse | DepartmentUser | UserSearchResponse;

// Helper function to get department name by ID
const getDepartmentName = (departmentId: number): string => {
    return DEPARTMENT_MAP[departmentId] || `Department ${departmentId}`;
};

// Helper function to extract username from email (remove @soitmed.com)
const extractUsername = (email: string): string => {
    if (email.includes('@soitmed.com')) {
        return email.split('@soitmed.com')[0];
    }
    return email;
};

// User edit form validation schema
const userEditSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    userName: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().optional(),
    isActive: z.boolean(),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<UserListResponse[]>([]);
    const [departmentUsers, setDepartmentUsers] = useState<DepartmentUsersResponse | null>(null);
    const [roleUsers, setRoleUsers] = useState<RoleUsersResponse | null>(null);
    const [searchResult, setSearchResult] = useState<UserSearchResponse | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const { user } = useAuthStore();
    const { setLoading } = useAppStore();
    const { success, error: showError } = useNotificationStore();

    // Check if current user is super admin
    const isSuperAdmin = user?.roles.includes('SuperAdmin') || false;

    // Form for editing user
    const editForm = useForm<UserEditFormData>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            userName: '',
            email: '',
            phoneNumber: '',
            isActive: true,
        }
    });

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

    // Handle opening edit modal
    const handleEditUser = (userToEdit: UserData) => {
        setSelectedUser(userToEdit);
        editForm.reset({
            firstName: userToEdit.firstName,
            lastName: userToEdit.lastName,
            userName: extractUsername(userToEdit.email),
            email: userToEdit.email,
            phoneNumber: 'phoneNumber' in userToEdit ? (userToEdit.phoneNumber || '') : '',

        });
        setIsEditModalOpen(true);
    };

    // Handle closing edit modal
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        editForm.reset();
    };

    // Handle opening password update modal
    const handleUpdatePassword = (userToUpdate: UserData) => {
        setSelectedUser(userToUpdate);
        setIsPasswordModalOpen(true);
    };

    // Handle closing password update modal
    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setSelectedUser(null);
    };

    // Handle user status change
    const handleUserStatusChange = (userId: string, newStatus: boolean) => {
        // Update the user status in the current view
        if (viewMode === 'all') {
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, isActive: newStatus } : user
                )
            );
        } else if (viewMode === 'department' && departmentUsers) {
            setDepartmentUsers(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    users: prev.users.map(user =>
                        user.id === userId ? { ...user, isActive: newStatus } : user
                    )
                };
            });
        } else if (viewMode === 'role' && roleUsers) {
            setRoleUsers(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    users: prev.users.map(user =>
                        user.id === userId ? { ...user, isActive: newStatus } : user
                    )
                };
            });
        } else if (viewMode === 'search' && searchResult) {
            setSearchResult(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isActive: newStatus
                };
            });
        }

        // Update the selectedUser if it's the same user being edited
        if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(prev => prev ? { ...prev, isActive: newStatus } : null);
        }
    };

    // Handle form submission
    const onSubmitEdit = async (data: UserEditFormData) => {
        if (!user?.token || !selectedUser) {
            showError('No authentication token or selected user found');
            return;
        }

        try {
            const response = await updateUser(
                selectedUser.id,
                {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    userName: data.userName,
                    email: data.email,
                    phoneNumber: data.phoneNumber || '',
                    isActive: data.isActive,
                },
                user.token
            );

            if (response.success) {
                success('User Updated Successfully', response.message);
                handleCloseEditModal();
                // Refresh the current view
                if (viewMode === 'all') {
                    loadAllUsers();
                } else if (viewMode === 'department' && selectedDepartment) {
                    loadDepartmentUsers(selectedDepartment);
                } else if (viewMode === 'role' && selectedRole) {
                    loadRoleUsers(selectedRole);
                } else if (viewMode === 'search' && searchResult) {
                    searchUser(searchResult.userName);
                }
            } else {
                showError('User Update Failed', response.message);
            }
        } catch (error: any) {
            console.error('Error updating user:', error);
            const errorMessage = error.message || 'Failed to update user';
            showError('User Update Failed', errorMessage);
        }
    };

    // Load all users on component mount
    useEffect(() => {
        loadAllUsers();
    }, [user?.token]);



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
                    onStatusChange={(newStatus) => {
                        if (searchResult) {
                            setSearchResult(prev => prev ? { ...prev, isActive: newStatus } : null);
                        }
                    }}
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
                                <th className="text-start py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                    Actions
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
                                        {'departmentName' in user
                                            ? user.departmentName
                                            : getDepartmentName(user.departmentId)
                                        }
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
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditUser(user)}
                                                className="flex items-center gap-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Button>
                                            {isSuperAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdatePassword(user)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Key className="h-4 w-4" />
                                                    Password
                                                </Button>
                                            )}
                                        </div>
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

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Edit className="h-5 w-5" />
                                        Edit User
                                    </CardTitle>
                                    <CardDescription>
                                        Update user information for {selectedUser.fullName}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCloseEditModal}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            {...editForm.register("firstName")}
                                            placeholder="Enter first name"
                                        />
                                        {editForm.formState.errors.firstName && (
                                            <p className="text-sm text-red-600">
                                                {editForm.formState.errors.firstName.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            {...editForm.register("lastName")}
                                            placeholder="Enter last name"
                                        />
                                        {editForm.formState.errors.lastName && (
                                            <p className="text-sm text-red-600">
                                                {editForm.formState.errors.lastName.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="userName">Username</Label>
                                        <Input
                                            id="userName"
                                            {...editForm.register("userName")}
                                            placeholder="Enter username"
                                        />
                                        {editForm.formState.errors.userName && (
                                            <p className="text-sm text-red-600">
                                                {editForm.formState.errors.userName.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...editForm.register("email")}
                                            placeholder="Enter email address"
                                        />
                                        {editForm.formState.errors.email && (
                                            <p className="text-sm text-red-600">
                                                {editForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input
                                            id="phoneNumber"
                                            {...editForm.register("phoneNumber")}
                                            placeholder="Enter phone number"
                                        />
                                        {editForm.formState.errors.phoneNumber && (
                                            <p className="text-sm text-red-600">
                                                {editForm.formState.errors.phoneNumber.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Department (Read-only) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            value={
                                                'departmentName' in selectedUser
                                                    ? selectedUser.departmentName
                                                    : getDepartmentName(selectedUser.departmentId)
                                            }
                                            disabled
                                            className="bg-gray-50 dark:bg-gray-800"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Department cannot be changed here
                                        </p>
                                    </div>
                                </div>
                                {/* User Status Actions - Only for SuperAdmin */}
                                {isSuperAdmin && (
                                    <div className="border-t pt-4 mt-4">
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                    User Status Management
                                                </h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                                    Change the user's active status. This will affect their ability to access the system.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">Current Status:</span>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedUser.isActive
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <UserStatusToggle
                                                    userId={selectedUser.id}
                                                    userName={selectedUser.fullName}
                                                    email={selectedUser.email}
                                                    isActive={selectedUser.isActive}
                                                    onStatusChange={(newStatus) => {
                                                        handleUserStatusChange(selectedUser.id, newStatus);
                                                        // Update the form's isActive field to reflect the change
                                                        editForm.setValue('isActive', newStatus);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={editForm.formState.isSubmitting}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseEditModal}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Password Update Modal */}
            <PasswordUpdateModal
                isOpen={isPasswordModalOpen}
                onClose={handleClosePasswordModal}
                user={selectedUser as UserListResponse | null}
            />
        </div>
    );
};

export default UsersList;
