import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { userUpdateApi } from '@/services/user/userUpdateApi';
import type { UpdateUserRequest } from '@/types/userUpdate.types';
import type { UserListResponse } from '@/types/user.types';

interface UserUpdateFormProps {
    user: UserListResponse;
    onUpdate: (userData: UpdateUserRequest) => Promise<void>;
    isLoading?: boolean;
}

export const UserUpdateForm: React.FC<UserUpdateFormProps> = ({
    user,
    onUpdate,
    isLoading = false,
}) => {
    const { isLoading: isUpdating } = useUpdateUser();
    const [formData, setFormData] = useState<UpdateUserRequest>({
        email: user.email,
        role: 'Admin', // Default role since UserListResponse doesn't include roles
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form data
        const validation = userUpdateApi.validateUserData(formData);
        if (!validation.isValid) {
            alert(validation.errors.join(', '));
            return;
        }

        try {
            await onUpdate(formData);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleInputChange = (field: keyof UpdateUserRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Update User Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                placeholder="Enter first name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                placeholder="Enter last name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => handleInputChange('role', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                                    <SelectItem value="Doctor">Doctor</SelectItem>
                                    <SelectItem value="Technician">Technician</SelectItem>
                                    <SelectItem value="Engineer">Engineer</SelectItem>
                                    <SelectItem value="SalesMan">SalesMan</SelectItem>
                                    <SelectItem value="SalesManager">SalesManager</SelectItem>
                                    <SelectItem value="FinanceManager">FinanceManager</SelectItem>
                                    <SelectItem value="FinanceEmployee">FinanceEmployee</SelectItem>
                                    <SelectItem value="LegalManager">LegalManager</SelectItem>
                                    <SelectItem value="LegalEmployee">LegalEmployee</SelectItem>
                                    <SelectItem value="MaintenanceManager">MaintenanceManager</SelectItem>
                                    <SelectItem value="MaintenanceSupport">MaintenanceSupport</SelectItem>
                                    <SelectItem value="SparePartsCoordinator">SparePartsCoordinator</SelectItem>
                                    <SelectItem value="InventoryManager">InventoryManager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="password">New Password (Optional)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="Enter new password (leave blank to keep current)"
                            />
                            <p className="text-sm text-gray-500">
                                Leave blank to keep the current password
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading || isUpdating}
                            className="flex items-center gap-2"
                        >
                            {(isLoading || isUpdating) ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Update User
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserUpdateForm;
