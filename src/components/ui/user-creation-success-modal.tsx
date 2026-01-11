import React, { useState, useCallback } from 'react';
import { CheckCircle, Copy, X, User, Key, Mail, UserCheck, MessageSquare, Send, ExternalLink, Check } from 'lucide-react';
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

    // Safety check for userData
    if (!userData || !userData.email) {
        console.error('Invalid userData provided to modal:', userData);
        return null;
    }

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

    const generateFormalCredentials = () => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return `Dear ${userData.firstName} ${userData.lastName},

Welcome to Soit-Med! Your account has been successfully created.

═══════════════════════════════════════
ACCOUNT CREDENTIALS
═══════════════════════════════════════

Full Name: ${userData.firstName} ${userData.lastName}
Role: ${userData.role}
Email Address: ${userData.email}
Temporary Password: ${password}

═══════════════════════════════════════
LOGIN INSTRUCTIONS
═══════════════════════════════════════

1. Visit the Soit-Med application login page
2. Enter your email address: ${userData.email}
3. Enter your temporary password: ${password}
4. Click "Sign In" to access your account

═══════════════════════════════════════
IMPORTANT SECURITY NOTICE
═══════════════════════════════════════

For your account security, please change your password immediately after your first login. 

If you have any questions or need assistance, please contact your system Administrator.

Best regards,
Soit-Med Admin Team

---
Account Created: ${currentDate}
This is an automated message from Soit-Med Admin Panel`;
    };

    const handleCopyCredentials = useCallback(async () => {
        const credentials = generateFormalCredentials();
        await handleCopy(credentials, 'all');
    }, [generateFormalCredentials, handleCopy]);

    const sendViaWhatsApp = () => {
        const message = generateFormalCredentials();
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        success('Opening WhatsApp', 'WhatsApp opened with credentials ready to send');
    };

    const sendViaEmail = () => {
        const message = generateFormalCredentials();
        const subject = `Soit-Med Account Credentials - ${userData.firstName} ${userData.lastName}`;
        const mailtoLink = `mailto:${userData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
        success('Opening Email', 'Email client opened with credentials ready to send');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 left-[16rem] bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
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
                    {/* Credentials Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Key className="h-5 w-5 text-blue-600" />
                            Login Credentials
                        </h3>
                        <Button
                            onClick={handleCopyCredentials}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            {copiedField === 'all' ? (
                                <>
                                    <Check className="h-4 w-4 text-green-600" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy All
                                </>
                            )}
                        </Button>
                    </div>

                    {/* User Information */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <User className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Email/Username</p>
                                <p className="font-medium font-mono text-sm text-blue-900 dark:text-blue-100">{userData.email}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(userData.email, 'email')}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            >
                                {copiedField === 'email' ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Password</p>
                                <p className="font-medium font-mono text-sm text-orange-900 dark:text-orange-100">{password}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(password, 'password')}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                            >
                                {copiedField === 'password' ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
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

                    {/* Delivery Options */}
                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                                Share Credentials
                            </h4>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                            Send the account credentials to the user via email or WhatsApp. Click the button below to open your preferred delivery method with the credentials pre-filled.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                onClick={sendViaEmail}
                                variant="outline"
                                className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Send via Email
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                            <Button
                                onClick={sendViaWhatsApp}
                                variant="outline"
                                className="w-full border-2 border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 dark:text-green-300 dark:border-green-600"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Send via WhatsApp
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleCopyCredentials}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {copiedField === 'all' ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Credentials Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy All Credentials
                                </>
                            )}
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
                            <strong>Important:</strong> Please save these credentials securely and deliver them to the user via a secure channel.
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
