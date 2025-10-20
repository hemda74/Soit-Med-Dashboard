/**
 * Generic User Creation Form Component
 * 
 * This component provides a unified, role-agnostic form for creating users of any role.
 * It eliminates redundancy by using the generic form field component and role configuration
 * system to dynamically render appropriate fields based on the selected role.
 */

import React, { memo, useMemo } from 'react';
import { AlertCircle, UserPlus, ArrowLeft, Loader2, Shield, Camera, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { RoleConfigUtils } from '@/config/roleConfig';
import GenericFormField from './GenericFormField';
import UserCreationSuccessModal from './UserCreationSuccessModal';
import { useGenericUserCreationForm } from '@/hooks/useGenericUserCreationForm';
import type { RoleSpecificUserRole, HospitalInfo } from '@/types/roleSpecificUser.types';
import type { FieldConfig } from '@/config/roleConfig';

interface GovernorateInfo {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

interface GenericUserCreationFormProps {
    selectedRole: RoleSpecificUserRole;
    hospitals: HospitalInfo[];
    governorates: GovernorateInfo[];
    isLoading: boolean;
    showSuccessModal: boolean;
    createdUserCredentials?: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: RoleSpecificUserRole;
        createdAt: string;
    };
    onBack: () => void;
    onCloseSuccessModal: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * Section configuration for form organization
 */
interface FormSection {
    key: 'personal' | 'credentials' | 'profile' | 'role-specific';
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}

/**
 * Generic User Creation Form Component
 * 
 * Renders a dynamic form based on the selected role configuration.
 * Uses the generic form field component to maintain consistency and reduce redundancy.
 */
const GenericUserCreationForm: React.FC<GenericUserCreationFormProps> = memo(({
    selectedRole,
    hospitals,
    governorates,
    isLoading,
    showSuccessModal,
    createdUserCredentials,
    onBack,
    onCloseSuccessModal,
    onSubmit,
}) => {
    const { t } = useTranslation();

    // Get form state and actions from the generic hook
    const {
        formData,
        errors,
        fieldErrors,
        passwordErrors,
        showPassword,
        showGovernorateDropdown,
        imagePreview,
        imageError,
        governorateDropdownRef,
        updateField,
        togglePasswordVisibility,
        handleImageSelect,
        handleRemoveImage,
        handleImageAltTextChange,
        toggleGovernorateDropdown,
        handleGovernorateToggle,
        removeGovernorate,
        clearAllGovernorates,
        hasFieldError,
    } = useGenericUserCreationForm();

    // Get role configuration
    const roleConfig = useMemo(() => RoleConfigUtils.getRoleConfig(selectedRole), [selectedRole]);

    // Form sections configuration
    const formSections: FormSection[] = useMemo(() => [
        {
            key: 'personal',
            title: 'Personal Information',
            icon: UserPlus,
            description: 'Basic personal details for the user account',
        },
        {
            key: 'credentials',
            title: 'Account Credentials',
            icon: Shield,
            description: 'Login credentials and security settings',
        },
        {
            key: 'profile',
            title: 'Profile Information',
            icon: Camera,
            description: 'Profile image and additional user details',
        },
        {
            key: 'role-specific',
            title: 'Role-Specific Information',
            icon: Briefcase,
            description: 'Additional information specific to the selected role',
        },
    ], []);

    /**
     * Get fields for a specific section
     */
    const getFieldsForSection = (sectionKey: FormSection['key']): FieldConfig[] => {
        return RoleConfigUtils.getFieldsBySection(selectedRole, sectionKey);
    };

    /**
     * Render form section
     */
    const renderFormSection = (section: FormSection) => {
        const fields = getFieldsForSection(section.key);

        // Skip section if no fields
        if (fields.length === 0) return null;

        const IconComponent = section.icon;

        return (
            <div key={section.key} className="space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                        {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                        )}
                    </div>
                </div>

                {/* Section Fields */}
                <div className="grid grid-cols-2 gap-6">
                    {fields.map((field) => (
                        <GenericFormField
                            key={field.key}
                            field={field}
                            value={formData[field.key as keyof typeof formData]}
                            onChange={updateField}
                            error={hasFieldError(field.key)}
                            errorMessage={fieldErrors[field.key]?.[0]}
                            t={t as (key: string) => string}
                            // Pass additional props for specific field types
                            hospitals={hospitals}
                            governorates={governorates}
                            selectedGovernorateIds={(formData as any).governorateIds}
                            showGovernorateDropdown={showGovernorateDropdown}
                            onToggleGovernorateDropdown={toggleGovernorateDropdown}
                            onGovernorateToggle={handleGovernorateToggle}
                            onRemoveGovernorate={removeGovernorate}
                            onClearAllGovernorates={clearAllGovernorates}
                            governorateDropdownRef={governorateDropdownRef}
                            imagePreview={imagePreview}
                            imageError={imageError}
                            onImageSelect={handleImageSelect}
                            onRemoveImage={handleRemoveImage}
                            onImageAltTextChange={handleImageAltTextChange}
                            showPassword={showPassword}
                            onPasswordToggle={togglePasswordVisibility}
                            passwordErrors={passwordErrors}
                        />
                    ))}
                    {/* Add empty div if odd number of fields to maintain grid structure */}
                    {fields.length % 2 === 1 && <div></div>}
                </div>
            </div>
        );
    };

    /**
     * Calculate form completion percentage
     */
    const formCompletionPercentage = useMemo(() => {
        const requiredFields = RoleConfigUtils.getRequiredFields(selectedRole);
        const completedFields = requiredFields.filter(field => {
            const value = formData[field as keyof typeof formData];
            return value && (typeof value !== 'string' || value.trim() !== '');
        });
        return Math.round((completedFields.length / requiredFields.length) * 100);
    }, [selectedRole, formData]);

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
                                    Create {roleConfig.name} User
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
                                {formCompletionPercentage}% Complete
                            </span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${formCompletionPercentage}%` }}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-8">
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Error Display */}
                        {errors.length > 0 && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 animate-in slide-in-from-top-2 duration-300 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-destructive/20">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-destructive">
                                            {t('pleaseFixFollowingErrors')}
                                        </h3>
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

                        {/* Form Sections */}
                        {formSections.map(renderFormSection)}

                        {/* Form Actions */}
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
                                        Create {roleConfig.name} User
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Enhanced Success Modal with Credentials */}
            {createdUserCredentials && (
                <UserCreationSuccessModal
                    isOpen={showSuccessModal}
                    onClose={onCloseSuccessModal}
                    credentials={createdUserCredentials}
                    roleName={roleConfig.name}
                />
            )}
        </>
    );
});

GenericUserCreationForm.displayName = 'GenericUserCreationForm';

export default GenericUserCreationForm;
