import React, { useState, useCallback } from 'react';
import { AlertCircle, UserPlus, CheckCircle, ArrowLeft, Loader2, Shield, Camera, Briefcase, Copy, Check, Mail, Lock, Send, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotificationStore } from '@/stores/notificationStore';
import PasswordField from './PasswordField';
import ImageUploadField from './ImageUploadField';
import HospitalSelector from './HospitalSelector';
import GovernorateSelector from './GovernorateSelector';
import MedicalDepartmentSelector from './MedicalDepartmentSelector';
import type { RoleSpecificUserRole, HospitalInfo } from '@/types/roleSpecificUser.types';
import type { FormData } from '@/hooks/useUserCreationForm';

interface GovernorateInfo {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

interface RoleConfig {
    name: string;
    description: string;
    fields: string[];
    requiresHospital: boolean;
    requiresDepartment: boolean;
    requiresGovernorates?: boolean;
    requiresMedicalDepartment?: boolean;
    autoDepartmentId: number;
    role?: string;
}

interface UserCreationFormProps {
    selectedRole: RoleSpecificUserRole;
    roleConfig: RoleConfig;
    formData: FormData;
    hospitals: HospitalInfo[];
    governorates: GovernorateInfo[];
    errors: string[];
    passwordErrors: string[];
    showPassword: boolean;
    showConfirmPassword: boolean;
    showGovernorateDropdown: boolean;
    imagePreview: string | null;
    imageError: string;
    isLoading: boolean;
    showSuccessModal: boolean;
    governorateDropdownRef: React.RefObject<HTMLDivElement>;
    onInputChange: (field: keyof FormData, value: string) => void;
    onPasswordToggle: () => void;
    onConfirmPasswordToggle: () => void;
    onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    onImageAltTextChange: (value: string) => void;
    onHospitalSelect: (hospitalId: string) => void;
    onGovernorateToggle: (governorateId: number) => void;
    onRemoveGovernorate: (governorateId: number) => void;
    onClearAllGovernorates: () => void;
    onToggleGovernorateDropdown: () => void;
    onDepartmentChange: (department: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    onCloseSuccessModal: () => void;
}

const UserCreationForm: React.FC<UserCreationFormProps> = ({
    selectedRole,
    roleConfig,
    formData,
    hospitals,
    governorates,
    errors,
    passwordErrors,
    showPassword,
    showConfirmPassword,
    showGovernorateDropdown,
    imagePreview,
    imageError,
    isLoading,
    showSuccessModal,
    governorateDropdownRef,
    onInputChange,
    onPasswordToggle,
    onConfirmPasswordToggle,
    onImageSelect,
    onRemoveImage,
    onHospitalSelect,
    onGovernorateToggle,
    onRemoveGovernorate,
    onClearAllGovernorates,
    onToggleGovernorateDropdown,
    onDepartmentChange,
    onSubmit,
    onBack,
    onCloseSuccessModal
}) => {
    const { t } = useTranslation();
    const { success, errorNotification } = useNotificationStore();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Copy functionality
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

    // Generate formal credentials text
    const generateFormalCredentials = useCallback(() => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return `Dear ${formData.firstName} ${formData.lastName},

Welcome to Soit-Med! Your account has been successfully created.

═══════════════════════════════════════
ACCOUNT CREDENTIALS
═══════════════════════════════════════

Full Name: ${formData.firstName} ${formData.lastName}
Role: ${roleConfig.name}
Email Address: ${formData.email}
Temporary Password: ${formData.password}

═══════════════════════════════════════
LOGIN INSTRUCTIONS
═══════════════════════════════════════

1. Visit the Soit-Med application login page
2. Enter your email address: ${formData.email}
3. Enter your temporary password: ${formData.password}
4. Click "Sign In" to access your account

═══════════════════════════════════════
IMPORTANT SECURITY NOTICE
═══════════════════════════════════════

For your account security, please change your password immediately after your first login. 

If you have any questions or need assistance, please contact your system administrator.

Best regards,
Soit-Med Admin Team

---
Account Created: ${currentDate}
This is an automated message from Soit-Med Admin Panel`;
    }, [formData, roleConfig]);

    // Copy all credentials
    const handleCopyCredentials = useCallback(async () => {
        const credentials = generateFormalCredentials();
        await handleCopy(credentials, 'all');
    }, [generateFormalCredentials, handleCopy]);

    // Send via WhatsApp
    const sendViaWhatsApp = useCallback(() => {
        const message = generateFormalCredentials();
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        success('Opening WhatsApp', 'WhatsApp opened with credentials ready to send');
    }, [generateFormalCredentials, success]);

    // Send via Email
    const sendViaEmail = useCallback(() => {
        const message = generateFormalCredentials();
        const subject = `Soit-Med Account Credentials - ${formData.firstName} ${formData.lastName}`;
        const mailtoLink = `mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
        success('Opening Email', 'Email client opened with credentials ready to send');
    }, [generateFormalCredentials, formData, success]);

    // Helper function to check if a specific field has an error
    const hasFieldError = (fieldName: string): boolean => {
        return errors.some(error =>
            error.toLowerCase().includes(fieldName.toLowerCase()) ||
            error.toLowerCase().includes('required') ||
            error.toLowerCase().includes('valid')
        );
    };

    return (
        <>
            <Card className="shadow-2xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/10 overflow-hidden">
                <CardHeader className="pb-8 pt-8 bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 border-b-2 border-primary/10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                                <UserPlus className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                                    {t('createRoleUser').replace('{role}', roleConfig.name)}
                                </CardTitle>
                                <p className="text-muted-foreground text-base mt-2 font-medium">
                                    Complete the form below to create a new {roleConfig.name.toLowerCase()} account
                                </p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-muted-foreground">Required fields marked with *</span>
                        </div>
                    </div>

                    {/* Enhanced Form Progress Indicator */}
                    <div className="mt-8 space-y-4 bg-muted/30 rounded-xl p-5 border border-border/50">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">Form Progress</span>
                            <span className="text-sm font-bold text-primary">
                                {(() => {
                                    const totalFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
                                    const completedFields = totalFields.filter(field => {
                                        const value = formData[field as keyof FormData];
                                        return typeof value === 'string' && value.trim();
                                    });
                                    const percentage = Math.round((completedFields.length / totalFields.length) * 100);
                                    return `${percentage}%`;
                                })()}
                            </span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                                className="bg-gradient-to-r from-primary via-primary/90 to-primary h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                                style={{
                                    width: `${(() => {
                                        const totalFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
                                        const completedFields = totalFields.filter(field => {
                                            const value = formData[field as keyof FormData];
                                            return typeof value === 'string' && value.trim();
                                        });
                                        return (completedFields.length / totalFields.length) * 100;
                                    })()}%`
                                }}
                            ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {(() => {
                                const totalFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
                                const completedFields = totalFields.filter(field => {
                                    const value = formData[field as keyof FormData];
                                    return typeof value === 'string' && value.trim();
                                });
                                return `${completedFields.length} of ${totalFields.length} required fields completed`;
                            })()}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 px-6 lg:px-8">
                    <form onSubmit={onSubmit} className="space-y-10">
                        {errors.length > 0 && (
                            <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 lg:p-8 animate-in slide-in-from-top-2 duration-300 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-destructive/20 shadow-sm flex-shrink-0">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <h3 className="text-lg font-bold text-destructive">{t('pleaseFixFollowingErrors')}</h3>
                                        <ul className="text-sm text-destructive/90 space-y-2.5">
                                            {errors.map((error, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-destructive mt-2.5 flex-shrink-0"></span>
                                                    <span className="font-medium leading-relaxed">{error}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Personal Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-5 border-b-2 border-border/50 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 p-4 rounded-xl -mx-4 px-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                                    <UserPlus className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl lg:text-2xl font-bold text-foreground">Personal Information</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Basic personal details for the user account</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="firstName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('firstName')} <span className="text-destructive text-lg">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => onInputChange('firstName', e.target.value)}
                                        placeholder={t('enterFirstName')}
                                        className="h-12 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 rounded-xl shadow-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="lastName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('lastName')} <span className="text-destructive text-lg">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => onInputChange('lastName', e.target.value)}
                                        placeholder={t('enterLastName')}
                                        className="h-12 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 rounded-xl shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number Field */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('phoneNumber')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={(e) => onInputChange('phoneNumber', e.target.value)}
                                        placeholder={t('enterPhoneNumber')}
                                        className="h-12 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 rounded-xl shadow-sm"
                                        type="tel"
                                    />
                                </div>
                                <div></div> {/* Empty div to maintain grid structure */}
                            </div>
                        </div>

                        {/* Sales Support Specific Fields */}
                        {selectedRole === 'sales-support' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 pb-5 border-b-2 border-border/50 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20 p-4 rounded-xl -mx-4 px-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                                        <Briefcase className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Sales Support Information</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Additional details for sales support staff</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Personal Email */}
                                    <div className="space-y-3">
                                        <Label htmlFor="personalMail" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            Personal Email <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                        </Label>
                                        <Input
                                            id="personalMail"
                                            type="email"
                                            value={formData.personalMail || ''}
                                            onChange={(e) => onInputChange('personalMail', e.target.value)}
                                            placeholder="Enter personal email"
                                            className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                        />
                                    </div>

                                    {/* Support Specialization */}
                                    <div className="space-y-3">
                                        <Label htmlFor="supportSpecialization" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            Support Specialization <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                        </Label>
                                        <select
                                            id="supportSpecialization"
                                            value={formData.supportSpecialization || ''}
                                            onChange={(e) => onInputChange('supportSpecialization', e.target.value)}
                                            className="h-12 w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground transition-all duration-300 focus:border-primary hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select specialization</option>
                                            <option value="Customer Support">Customer Support</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Sales Support">Sales Support</option>
                                            <option value="Product Support">Product Support</option>
                                            <option value="Billing Support">Billing Support</option>
                                            <option value="Account Management">Account Management</option>
                                        </select>
                                    </div>

                                    {/* Support Level */}
                                    <div className="space-y-3">
                                        <Label htmlFor="supportLevel" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            Support Level <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                        </Label>
                                        <select
                                            id="supportLevel"
                                            value={formData.supportLevel || ''}
                                            onChange={(e) => onInputChange('supportLevel', e.target.value)}
                                            className="h-12 w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground transition-all duration-300 focus:border-primary hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select support level</option>
                                            <option value="Junior">Junior</option>
                                            <option value="Senior">Senior</option>
                                            <option value="Lead">Lead</option>
                                            <option value="Specialist">Specialist</option>
                                        </select>
                                    </div>
                                    <div></div> {/* Empty div to maintain grid structure */}
                                </div>

                                {/* Notes */}
                                <div className="space-y-3">
                                    <Label htmlFor="notes" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        Notes <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes || ''}
                                        onChange={(e) => onInputChange('notes', e.target.value)}
                                        placeholder="Enter additional notes..."
                                        className="min-h-[100px] transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Account Credentials Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-5 border-b-2 border-border/50 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20 p-4 rounded-xl -mx-4 px-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl lg:text-2xl font-bold text-foreground">Account Credentials</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Login credentials and security settings</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('email')} <span className="text-destructive text-lg">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => onInputChange('email', e.target.value)}
                                        placeholder={t('enterEmailAddress')}
                                        className="h-12 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 rounded-xl shadow-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <PasswordField
                                        id="password"
                                        value={formData.password}
                                        onChange={(value) => onInputChange('password', value)}
                                        placeholder={t('enterPasswordField')}
                                        showPassword={showPassword}
                                        onToggleVisibility={onPasswordToggle}
                                        errors={passwordErrors}
                                        label={t('password')}
                                        required
                                        className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <PasswordField
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={(value) => onInputChange('confirmPassword', value)}
                                        placeholder={t('confirmPasswordPlaceholder')}
                                        showPassword={showConfirmPassword}
                                        onToggleVisibility={onConfirmPasswordToggle}
                                        errors={[]}
                                        label={t('confirmPassword')}
                                        required
                                        className={`h-12 transition-all duration-300 hover:border-primary/50 rounded-xl ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-destructive focus:border-destructive'
                                            : formData.confirmPassword && formData.password === formData.confirmPassword
                                                ? 'border-green-500 focus:border-green-500'
                                                : 'focus:border-primary'
                                            }`}
                                    />

                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200 bg-destructive/5 p-2 rounded-lg">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="font-medium">{t('passwordsDoNotMatch')}</span>
                                        </div>
                                    )}
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <div className="flex items-center gap-2 text-sm text-green-600 animate-in slide-in-from-top-1 duration-200 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">{t('passwordsMatch')}</span>
                                        </div>
                                    )}
                                </div>
                                <div></div> {/* Empty div to maintain grid structure */}
                            </div>
                        </div>

                        {/* Profile Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-5 border-b-2 border-border/50 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20 p-4 rounded-xl -mx-4 px-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                                    <Camera className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl lg:text-2xl font-bold text-foreground">Profile Information</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Profile image and additional user details</p>
                                </div>
                            </div>

                            <ImageUploadField
                                imagePreview={imagePreview}
                                imageError={imageError}
                                onImageSelect={onImageSelect}
                                onRemoveImage={onRemoveImage}
                            />

                            {(selectedRole === 'doctor' || selectedRole === 'engineer') && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="specialty" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            {t('specialty')} <span className="text-destructive text-lg">*</span>
                                        </Label>
                                        <Input
                                            id="specialty"
                                            value={formData.specialty}
                                            onChange={(e) => onInputChange('specialty', e.target.value)}
                                            placeholder={selectedRole === 'doctor' ? t('enterMedicalSpecialty') : t('enterEngineeringSpecialty')}
                                            className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div></div> {/* Empty div to maintain grid structure */}
                                </div>
                            )}
                        </div>

                        {/* Role-Specific Information Section */}
                        {(roleConfig.requiresHospital || selectedRole === 'engineer' || selectedRole === 'technician' || selectedRole === 'sales-manager' || selectedRole === 'maintenance-manager' || selectedRole === 'maintenance-support') && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 pb-5 border-b-2 border-border/50 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20 p-4 rounded-xl -mx-4 px-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                                        <Briefcase className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Role-Specific Information</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Additional information specific to the selected role</p>
                                    </div>
                                </div>

                                {roleConfig.requiresHospital && (
                                    <HospitalSelector
                                        hospitals={hospitals}
                                        selectedHospitalId={formData.hospitalId || ''}
                                        onHospitalSelect={onHospitalSelect}
                                    />
                                )}

                                {selectedRole === 'technician' && roleConfig.requiresMedicalDepartment && (
                                    <MedicalDepartmentSelector
                                        selectedDepartment={formData.department || ''}
                                        onDepartmentChange={onDepartmentChange}
                                    />
                                )}

                                {selectedRole === 'engineer' && (
                                    <GovernorateSelector
                                        governorates={governorates}
                                        selectedGovernorateIds={formData.governorateIds || []}
                                        showDropdown={showGovernorateDropdown}
                                        onToggleDropdown={onToggleGovernorateDropdown}
                                        onGovernorateToggle={onGovernorateToggle}
                                        onRemoveGovernorate={onRemoveGovernorate}
                                        onClearAll={onClearAllGovernorates}
                                        dropdownRef={governorateDropdownRef}
                                    />
                                )}

                                {selectedRole === 'sales-manager' && (
                                    <div className="col-span-full space-y-6 p-8 bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl border border-muted/50 shadow-lg">
                                        <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                            </div>
                                            Sales Manager Details
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="salesTerritory" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('salesTerritory')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                                </Label>
                                                <Input
                                                    id="salesTerritory"
                                                    value={formData.salesTerritory || ''}
                                                    onChange={(e) => onInputChange('salesTerritory', e.target.value)}
                                                    placeholder={t('enterSalesTerritory')}
                                                    className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="salesTeam" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('salesTeam')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                                </Label>
                                                <Input
                                                    id="salesTeam"
                                                    value={formData.salesTeam || ''}
                                                    onChange={(e) => onInputChange('salesTeam', e.target.value)}
                                                    placeholder={t('enterSalesTeam')}
                                                    className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="salesTarget" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('salesTarget')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                                </Label>
                                                <Input
                                                    id="salesTarget"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.salesTarget || ''}
                                                    onChange={(e) => onInputChange('salesTarget', e.target.value)}
                                                    placeholder={t('enterSalesTarget')}
                                                    className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="managerNotes" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('managerNotes')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                                </Label>
                                                <Textarea
                                                    id="managerNotes"
                                                    value={formData.managerNotes || ''}
                                                    onChange={(e) => onInputChange('managerNotes', e.target.value)}
                                                    placeholder={t('enterManagerNotes')}
                                                    rows={3}
                                                    className={`transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl resize-none ${hasFieldError('managerNotes') ? 'border-destructive focus:border-destructive' : 'border-input'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedRole === 'maintenance-manager' && (
                                    <div className="col-span-full space-y-6 p-8 bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl border border-muted/50 shadow-lg">
                                        <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                            </div>
                                            Maintenance Manager Details
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="maintenanceSpecialty" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('maintenanceSpecialty')} <span className="text-destructive text-lg">*</span>
                                                </Label>
                                                <Input
                                                    id="maintenanceSpecialty"
                                                    value={formData.maintenanceSpecialty || ''}
                                                    onChange={(e) => onInputChange('maintenanceSpecialty', e.target.value)}
                                                    placeholder={t('enterMaintenanceSpecialty')}
                                                    className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="certification" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('certification')} <span className="text-destructive text-lg">*</span>
                                                </Label>
                                                <Input
                                                    id="certification"
                                                    value={formData.certification || ''}
                                                    onChange={(e) => onInputChange('certification', e.target.value)}
                                                    placeholder={t('enterCertification')}
                                                    className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedRole === 'maintenance-support' && (
                                    <div className="col-span-full space-y-6 p-8 bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl border border-muted/50 shadow-lg">
                                        <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                            </div>
                                            Maintenance Support Details
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="jobTitle" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('jobTitle')} <span className="text-destructive text-lg">*</span>
                                                </Label>
                                                <Input
                                                    id="jobTitle"
                                                    value={formData.jobTitle || ''}
                                                    onChange={(e) => onInputChange('jobTitle', e.target.value)}
                                                    placeholder={t('enterJobTitle')}
                                                    className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="technicalSkills" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {t('technicalSkills')} <span className="text-destructive text-lg">*</span>
                                                </Label>
                                                <Textarea
                                                    id="technicalSkills"
                                                    value={formData.technicalSkills || ''}
                                                    onChange={(e) => onInputChange('technicalSkills', e.target.value)}
                                                    placeholder={t('enterTechnicalSkills')}
                                                    rows={3}
                                                    className={`transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl resize-none ${hasFieldError('technicalSkills') ? 'border-destructive focus:border-destructive' : 'border-input'}`}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t-2 border-border/50 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 -mx-6 px-6 py-8 rounded-b-2xl">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBack}
                                disabled={isLoading}
                                className="h-14 px-8 font-semibold transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-xl disabled:opacity-50 border-2 rounded-xl"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                {t('back')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-14 px-8 font-semibold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 flex-1 rounded-xl"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        <span>{t('creatingUserLoading')}</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5 mr-2" />
                                        <span>{t('createRoleUser').replace('{role}', roleConfig.name)}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Enhanced Success Modal with Copy Functionality */}
            <Dialog open={showSuccessModal} onOpenChange={onCloseSuccessModal}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center pb-6">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 shadow-lg">
                            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <DialogTitle className="text-3xl font-bold text-foreground mb-2">
                            {t('userCreatedSuccessfully')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-lg">
                            The {roleConfig.name.toLowerCase()} has been successfully created. Please provide the following credentials to the user.
                        </DialogDescription>
                    </DialogHeader>

                    {/* User Information Card */}
                    <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800/30">
                                    <UserPlus className="h-5 w-5 text-green-700 dark:text-green-300" />
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
                                        {formData.firstName} {formData.lastName}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {roleConfig.name}
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

                        {/* Email Credential */}
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Email Address</p>
                                            <p className="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100">
                                                {formData.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleCopy(formData.email, 'email')}
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
                                                {formData.password}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleCopy(formData.password, 'password')}
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
                            onClick={handleCopyCredentials}
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
                            onClick={onCloseSuccessModal}
                            variant="outline"
                            className="flex-1 h-12 font-semibold border-2 rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                        >
                            Continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserCreationForm;

