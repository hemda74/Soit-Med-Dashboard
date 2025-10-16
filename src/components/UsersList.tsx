import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Key } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import type { UserListResponse } from '@/types/user.types';
import type { DepartmentUser } from '@/types/department.types';
import type { UserFilters as UserFiltersType, PaginatedUserResponse, User } from '@/types/api.types';
import { fetchUsers, fetchUsersWithFilters, updateUser, uploadProfileImage, updateProfileImage, deleteProfileImage } from '@/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import UserFiltersComponent from './filters/UserFilters';
import Pagination from './Pagination';
import { PasswordUpdateModal } from './admin/PasswordUpdateModal';
import ProfileImage from './ProfileImage';
import EditUserModal from './admin/EditUserModal';
import Logo from './Logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserStatusToggle } from './UserStatusToggle';

type ViewMode = 'all' | 'filtered';

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
type UserData = User | UserListResponse | DepartmentUser;

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
    const { user, hasAnyRole } = useAuthStore();
    const { setLoading } = useAppStore();
    const { success, error: showError } = useNotificationStore();

    // All state hooks must be called at the top level
    const [allUsers, setAllUsers] = useState<PaginatedUserResponse | null>(null);
    const [filteredUsers, setFilteredUsers] = useState<PaginatedUserResponse | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserListResponse | null>(null);
    const [filters, setFilters] = useState<UserFiltersType>({});
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

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

    // Check if user has access to users page (Admin or Super Admin only)
    const hasAccess = hasAnyRole(['Admin', 'SuperAdmin']);

    // Check if current user is super admin
    const isSuperAdmin = user?.roles.includes('SuperAdmin') || false;

    const loadAllUsers = useCallback(async (page: number = 1) => {
        if (!user?.token) {
            setError('No authentication token found');
            return;
        }

        try {
            setError(null);
            const usersData = await fetchUsers(user.token, setLoading, page, pageSize);
            setAllUsers(usersData);
            setCurrentPage(page);
            setViewMode('all');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        }
    }, [user?.token, setLoading, pageSize]);

    // Load all users on component mount
    useEffect(() => {
        if (hasAccess) {
            loadAllUsers();
        }
    }, [user?.token, hasAccess, loadAllUsers]);

    // Redirect to dashboard if user doesn't have access
    if (!hasAccess) {
        return <Navigate to="/dashboard" replace />;
    }




    const loadFilteredUsers = async (filters: UserFiltersType) => {
        if (!user?.token) {
            setError('No authentication token found');
            return;
        }

        try {
            setError(null);
            const filteredData = await fetchUsersWithFilters(filters, user.token, setLoading);
            setFilteredUsers(filteredData);
            setCurrentPage(filters.pageNumber || 1);
            setViewMode('filtered');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load filtered users');
        }
    };

    const handleFiltersChange = (newFilters: UserFiltersType) => {
        setFilters(newFilters);
    };

    const handleApplyFilters = () => {
        loadFilteredUsers(filters);
    };

    const handleClearFilters = () => {
        setFilters({});
        setFilteredUsers(null);
        setCurrentPage(1);
        setViewMode('all');
        loadAllUsers(1);
    };

    const handlePageChange = (page: number) => {
        if (viewMode === 'filtered' && filteredUsers) {
            const newFilters = { ...filters, pageNumber: page };
            setFilters(newFilters);
            loadFilteredUsers(newFilters);
        } else if (viewMode === 'all') {
            loadAllUsers(page);
        }
    };


    // Handle opening edit modal
    const handleEditUser = (userToEdit: UserData) => {
        setSelectedUser(userToEdit as UserListResponse);
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

    // Handle user status change
    const handleUserStatusChange = (userId: string, newStatus: boolean) => {
        // Update the user status in the current view
        const updateUserInList = (users: PaginatedUserResponse | null) => {
            if (!users) return users;

            return {
                ...users,
                users: users.users.map(user =>
                    user.id === userId
                        ? { ...user, isActive: newStatus }
                        : user
                )
            };
        };

        if (viewMode === 'all' && allUsers) {
            setAllUsers(updateUserInList(allUsers));
        } else if (viewMode === 'filtered' && filteredUsers) {
            setFilteredUsers(updateUserInList(filteredUsers));
        }
    };

    // Handle opening password update modal
    const handleUpdatePassword = (userToUpdate: UserData) => {
        setSelectedUser(userToUpdate as UserListResponse);
        setIsPasswordModalOpen(true);
    };

    // Handle closing password update modal
    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setSelectedUser(null);
    };

    // Image upload handler for edit modal
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.token || !selectedUser) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Invalid file type', 'Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('File too large', 'Please select an image smaller than 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            // Use POST if no existing image, PUT if image exists
            const hasExistingImage = selectedUser.profileImage && selectedUser.profileImage.filePath;
            console.log('Selected user profile image state:', selectedUser.profileImage);
            console.log('Has existing image:', hasExistingImage);
            console.log('Using method:', hasExistingImage ? 'PUT' : 'POST');

            const response = hasExistingImage
                ? await updateProfileImage(file, selectedUser.fullName, user.token)
                : await uploadProfileImage(file, selectedUser.fullName, user.token);

            if (response.profileImage) {
                // Update the selected user's profile image
                setSelectedUser(prev => prev ? {
                    ...prev,
                    profileImage: response.profileImage ? {
                        ...response.profileImage,
                        userId: prev.id
                    } : null
                } : null);
                success('Profile Image Updated', response.message);
            } else {
                showError('Upload Failed', 'Failed to update profile image');
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            const errorMessage = error.message || 'Failed to upload image';
            showError('Upload Failed', errorMessage);
        } finally {
            setIsUploadingImage(false);
            // Reset file input
            event.target.value = '';
        }
    };

    // Image delete handler for edit modal
    const handleImageDelete = async () => {
        if (!user?.token || !selectedUser) return;

        console.log('Deleting profile image for user:', selectedUser.id);
        setIsDeletingImage(true);
        try {
            const response = await deleteProfileImage(user.token);

            if (response.message) {
                // Update the selected user's profile image to null
                setSelectedUser(prev => prev ? {
                    ...prev,
                    profileImage: null
                } : null);
                success('Profile Image Deleted', response.message);
                setShowDeleteImageModal(false);
            } else {
                showError('Delete Failed', 'Failed to delete profile image');
            }
        } catch (error: any) {
            console.error('Error deleting image:', error);
            const errorMessage = error.message || 'Failed to delete image';
            showError('Delete Failed', errorMessage);
        } finally {
            setIsDeletingImage(false);
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
                    email: data.email,
                    role: 'Admin', // Default role since UserListResponse doesn't include roles
                    firstName: data.firstName,
                    lastName: data.lastName,
                },
                user.token
            );

            if (response.success) {
                success('User Updated Successfully', response.message);
                handleCloseEditModal();
                // Refresh the current view
                if (viewMode === 'all') {
                    loadAllUsers(currentPage);
                } else if (viewMode === 'filtered') {
                    loadFilteredUsers(filters);
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

    // Get current users to display
    const currentUsers = viewMode === 'all'
        ? allUsers?.users || []
        : viewMode === 'filtered'
            ? filteredUsers?.users || []
            : [];

    const currentDescription = viewMode === 'all'
        ? `View all users across all departments (${allUsers?.totalCount || 0} users)`
        : viewMode === 'filtered'
            ? `Filtered results (${filteredUsers?.totalCount || 0} users)`
            : 'No users to display';

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
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">
                        Users Management
                    </h1>
                    <Logo />
                </div>
                <p className="text-muted-foreground mt-2">
                    {currentDescription}
                </p>
            </div>


            {/* Advanced Filters */}
            <UserFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isLoading={false}
            />

            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-start py-3 px-4 font-semibold text-foreground">
                                    User
                                </th>
                                <th className="text-start py-3 px-4 font-semibold text-foreground">
                                    Role & Department
                                </th>
                                <th className="text-start py-3 px-4 font-semibold text-foreground">
                                    Status
                                </th>
                                <th className="text-start py-3 px-4 font-semibold text-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-border menu-dropdown-item-inactive"
                                >
                                    {/* User Column - Image + Name + Email */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <ProfileImage
                                                src={'profileImage' in user ? user.profileImage : undefined}
                                                alt={`${user.fullName} profile picture`}
                                                size="sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role & Department Column */}
                                    <td className="py-3 px-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                    {'roles' in user ? (user.roles?.[0] || 'No Role') : 'No Role'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {'departmentName' in user
                                                    ? user.departmentName
                                                    : (user as any).departmentId
                                                        ? getDepartmentName((user as any).departmentId)
                                                        : 'No Department'
                                                }
                                            </p>
                                        </div>
                                    </td>

                                    {/* Status Column */}
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

                                    {/* Actions Column */}
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
                                            {isSuperAdmin && (
                                                <UserStatusToggle
                                                    userId={user.id}
                                                    userName={user.fullName}
                                                    email={user.email}
                                                    isActive={user.isActive}
                                                    onStatusChange={(newStatus) => handleUserStatusChange(user.id, newStatus)}
                                                />
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
                            : viewMode === 'filtered'
                                ? 'No users found matching the filters'
                                : 'No users to display'
                        }
                    </div>
                )}
            </Card>

            {/* Pagination for all users */}
            {viewMode === 'all' && allUsers && allUsers.totalPages > 1 && (
                <Pagination
                    currentPage={allUsers.pageNumber}
                    totalPages={allUsers.totalPages}
                    hasPreviousPage={allUsers.hasPreviousPage}
                    hasNextPage={allUsers.hasNextPage}
                    onPageChange={handlePageChange}
                    totalCount={allUsers.totalCount}
                    pageSize={allUsers.pageSize}
                    isLoading={false}
                />
            )}

            {/* Pagination for filtered results */}
            {viewMode === 'filtered' && filteredUsers && filteredUsers.totalPages > 1 && (
                <Pagination
                    currentPage={filteredUsers.pageNumber}
                    totalPages={filteredUsers.totalPages}
                    hasPreviousPage={filteredUsers.hasPreviousPage}
                    hasNextPage={filteredUsers.hasNextPage}
                    onPageChange={handlePageChange}
                    totalCount={filteredUsers.totalCount}
                    pageSize={filteredUsers.pageSize}
                    isLoading={false}
                />
            )}

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                user={selectedUser}
                onSubmit={onSubmitEdit}
                onImageUpload={handleImageUpload}
                onImageDelete={handleImageDelete}
                isUploadingImage={isUploadingImage}
                isDeletingImage={isDeletingImage}
                showDeleteImageModal={showDeleteImageModal}
                setShowDeleteImageModal={setShowDeleteImageModal}
                onStatusChange={handleUserStatusChange}
                isSuperAdmin={isSuperAdmin}
            />


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
