import React, { useState, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Copy, Check, Mail, User, Key } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';

interface UserData {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userId: string;
}

interface UserCreationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: UserData;
    password: string;
}

const UserCreationSuccessModal: React.FC<UserCreationSuccessModalProps> = ({
    isOpen,
    onClose,
    userData,
    password,
}) => {
    const { success, errorNotification } = useNotificationStore();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = useCallback(async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            success('Copied!', `${field === 'all' ? 'All credentials' : field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard`);
            setTimeout(() => setCopiedField(null), 3000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            errorNotification('Copy Failed', 'Failed to copy to clipboard. Please try again.');
        }
    }, [success, errorNotification]);

    const generateFormalCredentials = useCallback(() => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return `Dear ${userData.firstName} ${userData.lastName},

Your account has been successfully created in the Soit-Med Admin Panel.

Account Details:
- Email: ${userData.email}
- Password: ${password}
- Role: ${userData.role}
- User ID: ${userData.userId}

Account Created: ${currentDate}
This is an automated message from Soit-Med Admin Panel`;
    }, [userData.firstName, userData.lastName, userData.role, userData.email, userData.userId, password]);

    const handleCopyCredentials = useCallback(async () => {
        const credentials = generateFormalCredentials();
        await handleCopy(credentials, 'all');
    }, [generateFormalCredentials, handleCopy]);

    // Safety check for userData
    if (!userData || !userData.email) {
        console.error('Invalid userData provided to modal:', userData);
        return null;
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">
                        User Created Successfully!
                    </CardTitle>
                    <CardDescription>
                        The user account has been created and is ready to use.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* User Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Name:</span>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm">{userData.firstName} {userData.lastName}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(`${userData.firstName} ${userData.lastName}`, 'name')}
                                    >
                                        {copiedField === 'name' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Email:</span>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm">{userData.email}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(userData.email, 'email')}
                                    >
                                        {copiedField === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Key className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">Password:</span>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm font-mono">{password}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(password, 'password')}
                                    >
                                        {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{userData.role}</Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                    User ID: {userData.userId}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleCopyCredentials}
                            className="flex-1"
                            variant="outline"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All Credentials
                        </Button>
                        <Button
                            onClick={() => window.open(`mailto:${userData.email}?subject=Your Account Credentials&body=${encodeURIComponent(generateFormalCredentials())}`)}
                            className="flex-1"
                            variant="outline"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                        </Button>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end">
                        <Button onClick={onClose} className="w-full sm:w-auto">
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserCreationSuccessModal;
