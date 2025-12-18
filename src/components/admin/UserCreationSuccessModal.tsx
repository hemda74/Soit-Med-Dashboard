/**
 * User Creation Success Modal Component
 * 
 * This component displays a professional success modal after user creation,
 * including the user's credentials in a formal, copyable format for easy delivery.
 */

import React, { useState, useCallback } from 'react';
import { CheckCircle, Copy, Mail, Lock, User, Check, AlertCircle, MessageSquare, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotificationStore } from '@/stores/notificationStore';
import type { RoleSpecificUserRole } from '@/types/roleSpecificUser.types';

interface UserCredentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: RoleSpecificUserRole;
    createdAt: string;
}

interface UserCreationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    credentials: UserCredentials;
    roleName: string;
}

/**
 * User Creation Success Modal Component
 * 
 * Displays user credentials in a professional format with copy functionality
 */
const UserCreationSuccessModal: React.FC<UserCreationSuccessModalProps> = ({
    isOpen,
    onClose,
    credentials,
    roleName,
}) => {
    const { t } = useTranslation();
    const { success, errorNotification } = useNotificationStore();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    /**
     * Copy text to clipboard
     */
    const copyToClipboard = useCallback(async (text: string, field: string) => {
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

    /**
     * Generate formal credentials text
     */
    const generateFormalCredentials = useCallback(() => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return `Dear ${credentials.firstName} ${credentials.lastName},

Welcome to Soit-Med! Your account has been successfully created.

═══════════════════════════════════════
ACCOUNT CREDENTIALS
═══════════════════════════════════════

Full Name: ${credentials.firstName} ${credentials.lastName}
Role: ${roleName}
Email Address: ${credentials.email}
Temporary Password: ${credentials.password}

═══════════════════════════════════════
LOGIN INSTRUCTIONS
═══════════════════════════════════════

1. Visit the Soit-Med application login page
2. Enter your email address: ${credentials.email}
3. Enter your temporary password: ${credentials.password}
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
    }, [credentials, roleName]);

    /**
     * Copy all credentials as formal text
     */
    const copyAllCredentials = useCallback(async () => {
        const formalText = generateFormalCredentials();
        await copyToClipboard(formalText, 'all');
    }, [generateFormalCredentials, copyToClipboard]);

    /**
     * Open WhatsApp with credentials pre-filled
     */
    const sendViaWhatsApp = useCallback(() => {
        const message = generateFormalCredentials();
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        success('Opening WhatsApp', 'WhatsApp opened with credentials ready to send');
    }, [generateFormalCredentials, success]);

    /**
     * Open email client with credentials pre-filled
     */
    const sendViaEmail = useCallback(() => {
        const message = generateFormalCredentials();
        const subject = `Soit-Med Account Credentials - ${credentials.firstName} ${credentials.lastName}`;
        const mailtoLink = `mailto:${credentials.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
        success('Opening Email', 'Email client opened with credentials ready to send');
    }, [generateFormalCredentials, credentials, success]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center pb-6">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 shadow-lg">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <DialogTitle className="text-3xl font-bold text-foreground mb-2">
                        {t('userCreatedSuccessfully')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-lg">
                        The {roleName.toLowerCase()} account has been successfully created. Please provide the following credentials to the user.
                    </DialogDescription>
                </DialogHeader>

                {/* User Information Card */}
                <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800/30">
                                <User className="h-5 w-5 text-green-700 dark:text-green-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                    Account Information
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    User account details and access credentials
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {credentials.firstName} {credentials.lastName}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {roleName}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Credentials Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Login Credentials
                        </h3>
                        <Button
                            onClick={copyAllCredentials}
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

                    {/* Email Credential */}
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Email Address</p>
                                        <p className="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100">
                                            {credentials.email}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => copyToClipboard(credentials.email, 'email')}
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                    {copiedField === 'email' ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Credential */}
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    <div>
                                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Password</p>
                                        <p className="text-lg font-mono font-semibold text-orange-900 dark:text-orange-100">
                                            {credentials.password}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => copyToClipboard(credentials.password, 'password')}
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                                >
                                    {copiedField === 'password' ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Notice */}
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                    Security Notice
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Please inform the user to change their password immediately after first login for security purposes.
                                    These credentials should be delivered securely and not shared via unsecured channels.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Options */}
                <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <Send className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                                    className="h-11 border-2 border-blue-500 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600 font-medium"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send via Email
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                </Button>
                                <Button
                                    onClick={sendViaWhatsApp}
                                    variant="outline"
                                    className="h-11 border-2 border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 dark:text-green-300 dark:border-green-600 font-medium"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Send via WhatsApp
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                        onClick={copyAllCredentials}
                        className="flex-1 h-12 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {copiedField === 'all' ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Credentials Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-5 w-5 mr-2" />
                                Copy All Credentials
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-12 font-semibold border-2 rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                    >
                        Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserCreationSuccessModal;

