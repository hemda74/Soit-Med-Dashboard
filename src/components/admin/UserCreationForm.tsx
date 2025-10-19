import React from 'react';
import { AlertCircle, UserPlus, CheckCircle, ArrowLeft, Loader2, Shield, Camera, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
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
    onImageAltTextChange,
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
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-background via-background to-muted/10 overflow-hidden">
                <CardHeader className="pb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                                <UserPlus className="h-7 w-7" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                                    {t('createRoleUser').replace('{role}', roleConfig.name)}
                                </CardTitle>
                                <p className="text-muted-foreground text-base mt-2 font-medium">
                                    Complete the form below to create a new {roleConfig.name.toLowerCase()} account
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Required fields marked with *</span>
                        </div>
                    </div>

                    {/* Form Progress Indicator */}
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Form Progress</span>
                            <span className="font-semibold">
                                {(() => {
                                    const totalFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
                                    const completedFields = totalFields.filter(field => {
                                        const value = formData[field as keyof FormData];
                                        return typeof value === 'string' && value.trim();
                                    });
                                    return `${completedFields.length}/${totalFields.length}`;
                                })()} Complete
                            </span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-out"
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
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={onSubmit} className="space-y-8">
                        {errors.length > 0 && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 animate-in slide-in-from-top-2 duration-300 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-destructive/20">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-destructive">{t('pleaseFixFollowingErrors')}</h3>
                                        <ul className="text-sm text-destructive/90 space-y-2">
                                            {errors.map((error, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></span>
                                                    <span className="font-medium">{error}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Personal Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="firstName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('firstName')} <span className="text-destructive text-lg">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => onInputChange('firstName', e.target.value)}
                                        placeholder={t('enterFirstName')}
                                        className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                        error={hasFieldError('firstName')}
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
                                        className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                        error={hasFieldError('lastName')}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number Field */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('phoneNumber')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={(e) => onInputChange('phoneNumber', e.target.value)}
                                        placeholder={t('enterPhoneNumber')}
                                        className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                        error={hasFieldError('phoneNumber')}
                                        type="tel"
                                    />
                                </div>
                                <div></div> {/* Empty div to maintain grid structure */}
                            </div>
                        </div>

                        {/* Sales Support Specific Fields */}
                        {selectedRole === 'sales-support' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground">Sales Support Information</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Personal Email */}
                                    <div className="space-y-3">
                                        <Label htmlFor="personalMail" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            {t('salesSupportFields.personalMail')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                        </Label>
                                        <Input
                                            id="personalMail"
                                            type="email"
                                            value={formData.personalMail || ''}
                                            onChange={(e) => onInputChange('personalMail', e.target.value)}
                                            placeholder={t('salesSupportFields.personalMailPlaceholder')}
                                            className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                            error={hasFieldError('personalMail')}
                                        />
                                    </div>

                                    {/* Support Specialization */}
                                    <div className="space-y-3">
                                        <Label htmlFor="supportSpecialization" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            {t('salesSupportFields.supportSpecialization')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                        </Label>
                                        <select
                                            id="supportSpecialization"
                                            value={formData.supportSpecialization || ''}
                                            onChange={(e) => onInputChange('supportSpecialization', e.target.value)}
                                            className="h-12 w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground transition-all duration-300 focus:border-primary hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">{t('salesSupportFields.supportSpecializationPlaceholder')}</option>
                                            <option value="Customer Support">{t('salesSupportSpecializations.customerSupport')}</option>
                                            <option value="Technical Support">{t('salesSupportSpecializations.technicalSupport')}</option>
                                            <option value="Sales Support">{t('salesSupportSpecializations.salesSupport')}</option>
                                            <option value="Product Support">{t('salesSupportSpecializations.productSupport')}</option>
                                            <option value="Billing Support">{t('salesSupportSpecializations.billingSupport')}</option>
                                            <option value="Account Management">{t('salesSupportSpecializations.accountManagement')}</option>
                                        </select>
                                    </div>

                                    {/* Support Level */}
                                    <div className="space-y-3">
                                        <Label htmlFor="supportLevel" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            {t('salesSupportFields.supportLevel')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                        </Label>
                                        <select
                                            id="supportLevel"
                                            value={formData.supportLevel || ''}
                                            onChange={(e) => onInputChange('supportLevel', e.target.value)}
                                            className="h-12 w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground transition-all duration-300 focus:border-primary hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">{t('salesSupportFields.supportLevelPlaceholder')}</option>
                                            <option value="Junior">{t('salesSupportLevels.junior')}</option>
                                            <option value="Senior">{t('salesSupportLevels.senior')}</option>
                                            <option value="Lead">{t('salesSupportLevels.lead')}</option>
                                            <option value="Specialist">{t('salesSupportLevels.specialist')}</option>
                                        </select>
                                    </div>
                                    <div></div> {/* Empty div to maintain grid structure */}
                                </div>

                                {/* Notes */}
                                <div className="space-y-3">
                                    <Label htmlFor="notes" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {t('salesSupportFields.notes')} <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">Optional</span>
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes || ''}
                                        onChange={(e) => onInputChange('notes', e.target.value)}
                                        placeholder={t('salesSupportFields.notesPlaceholder')}
                                        className="min-h-[100px] transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                        error={hasFieldError('notes')}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Account Credentials Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">Account Credentials</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
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
                                        className="h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl"
                                        error={hasFieldError('email')}
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
                                        error={formData.confirmPassword && formData.password !== formData.confirmPassword}
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
                            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                    <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                            </div>

                            <ImageUploadField
                                imagePreview={imagePreview}
                                imageError={imageError}
                                imageAltText={formData.imageAltText || ''}
                                onImageSelect={onImageSelect}
                                onRemoveImage={onRemoveImage}
                                onAltTextChange={onImageAltTextChange}
                            />

                            {(selectedRole === 'doctor' || selectedRole === 'engineer') && (
                                <div className="grid grid-cols-2 gap-6">
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
                                            error={hasFieldError('specialty')}
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
                                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                        <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground">Role-Specific Information</h2>
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
                                        <div className="grid grid-cols-2 gap-6">
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
                                                    error={hasFieldError('salesTerritory')}
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
                                                    error={hasFieldError('salesTeam')}
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
                                                    error={hasFieldError('salesTarget')}
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
                                        <div className="grid grid-cols-2 gap-6">
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
                                                    error={hasFieldError('maintenanceSpecialty')}
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
                                                    error={hasFieldError('certification')}
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
                                        <div className="grid grid-cols-2 gap-6">
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
                                                    error={hasFieldError('jobTitle')}
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

                        <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10 -mx-6 px-6 py-6 rounded-b-2xl">
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
                                        {t('creatingUserLoading')}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5 mr-2" />
                                        {t('createRoleUser').replace('{role}', roleConfig.name)}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={onCloseSuccessModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader className="text-center pb-6">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 shadow-lg">
                            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <DialogTitle className="text-3xl font-bold text-foreground mb-2">
                            {t('userCreatedSuccessfully')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-lg">
                            The {roleConfig.name.toLowerCase()} has been successfully created and added to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800/30">
                                <UserPlus className="h-5 w-5 text-green-700 dark:text-green-300" />
                            </div>
                            <div>
                                <p className="font-semibold text-green-800 dark:text-green-200">Account Ready</p>
                                <p className="text-sm text-green-700 dark:text-green-300">The user can now log in with their credentials</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={onCloseSuccessModal}
                            className="flex-1 h-12 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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

