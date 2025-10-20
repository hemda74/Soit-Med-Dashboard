import React from 'react';
import { CheckCircle, Copy, X, User, Key, Mail, UserCheck } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useNotificationStore } from '../../stores/notificationStore';

interface UserCreationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        userId: string;
    };
    password: string;
}

const UserCreationSuccessModal: React.FC<UserCreationSuccessModalProps> = ({
    isOpen,
    onClose,
    userData,
    password,
}) => {
    const { success, errorNotification } = useNotificationStore();

    console.log('=== MODAL RENDER ===');
    console.log('isOpen:', isOpen);
    console.log('userData:', userData);
    console.log('password:', password);

    // Safety check for userData
    if (!userData || !userData.email) {
        console.error('Invalid userData provided to modal:', userData);
        return null;
    }

    const handleCopy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            success('Copied!', `${label} copied to clipboard`);
        } catch {
            errorNotification('Copy Failed', 'Failed to copy to clipboard');
        }
    };

    const handleCopyCredentials = async () => {
        const credentials = `Username: ${userData.email}\nPassword: ${password}`;
        try {
            await navigator.clipboard.writeText(credentials);
            success('Copied!', 'Username and password copied to clipboard');
        } catch {
            errorNotification('Copy Failed', 'Failed to copy credentials to clipboard');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <Card className="w-full max-w-md mx-auto bg-white shadow-xl">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">
                        User Created Successfully!
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                        The user has been created and is ready to use the system.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* User Information */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <User className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Email/Username</p>
                                <p className="font-medium font-mono text-sm">{userData.email}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(userData.email, 'Email')}
                                className="ml-2"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Key className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Password</p>
                                <p className="font-medium font-mono text-sm">{password}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(password, 'Password')}
                                className="ml-2"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <UserCheck className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="font-medium">{userData.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleCopyCredentials}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All Credentials
                        </Button>

                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="w-full"
                        >
                            Close
                        </Button>
                    </div>

                    {/* Important Note */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Important:</strong> Please save these credentials securely.
                            The password will not be shown again.
                        </p>
                    </div>
                </CardContent>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </Card>
        </div>
    );
};

export default UserCreationSuccessModal;
