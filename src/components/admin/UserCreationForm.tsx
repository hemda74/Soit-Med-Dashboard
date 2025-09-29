import React from 'react';
import { AlertCircle, UserPlus, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
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

    return (
        <>
            <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        {t('createRoleUser').replace('{role}', roleConfig.name)}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-2">
                        Please fill out the form below to create a new {roleConfig.name.toLowerCase()}
                    </p>
                </CardHeader>
                <CardContent className="pt-0">
                    <form onSubmit={onSubmit} className="space-y-6">
                        {errors.length > 0 && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-destructive">{t('pleaseFixFollowingErrors')}</h3>
                                        <ul className="text-sm text-destructive/80 space-y-1">
                                            {errors.map((error, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0"></span>
                                                    <span>{error}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                                    {t('firstName')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => onInputChange('firstName', e.target.value)}
                                    placeholder={t('enterFirstName')}
                                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                                    {t('lastName')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => onInputChange('lastName', e.target.value)}
                                    placeholder={t('enterLastName')}
                                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                                    {t('email')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => onInputChange('email', e.target.value)}
                                    placeholder={t('enterEmailAddress')}
                                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                                    className={`transition-all duration-200 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? 'border-destructive focus:ring-destructive/20'
                                        : formData.confirmPassword && formData.password === formData.confirmPassword
                                            ? 'border-green-500 focus:ring-green-500/20'
                                            : 'focus:ring-primary/20'
                                        }`}
                                />

                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{t('passwordsDoNotMatch')}</span>
                                    </div>
                                )}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 animate-in slide-in-from-top-1 duration-200">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>{t('passwordsMatch')}</span>
                                    </div>
                                )}
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
                                <div className="space-y-3">
                                    <Label htmlFor="specialty" className="text-sm font-semibold text-foreground">
                                        {t('specialty')} <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="specialty"
                                        value={formData.specialty}
                                        onChange={(e) => onInputChange('specialty', e.target.value)}
                                        placeholder={selectedRole === 'doctor' ? t('enterMedicalSpecialty') : t('enterEngineeringSpecialty')}
                                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                            )}

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
                                <div className="col-span-full space-y-6 p-6 bg-muted/30 rounded-lg border border-muted">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        Sales Manager Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="salesTerritory" className="text-sm font-semibold text-foreground">
                                                {t('salesTerritory')}
                                            </Label>
                                            <Input
                                                id="salesTerritory"
                                                value={formData.salesTerritory || ''}
                                                onChange={(e) => onInputChange('salesTerritory', e.target.value)}
                                                placeholder={t('enterSalesTerritory')}
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="salesTeam" className="text-sm font-semibold text-foreground">
                                                {t('salesTeam')}
                                            </Label>
                                            <Input
                                                id="salesTeam"
                                                value={formData.salesTeam || ''}
                                                onChange={(e) => onInputChange('salesTeam', e.target.value)}
                                                placeholder={t('enterSalesTeam')}
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="salesTarget" className="text-sm font-semibold text-foreground">
                                                {t('salesTarget')}
                                            </Label>
                                            <Input
                                                id="salesTarget"
                                                type="number"
                                                step="0.01"
                                                value={formData.salesTarget || ''}
                                                onChange={(e) => onInputChange('salesTarget', e.target.value)}
                                                placeholder={t('enterSalesTarget')}
                                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="managerNotes" className="text-sm font-semibold text-foreground">
                                                {t('managerNotes')}
                                            </Label>
                                            <Textarea
                                                id="managerNotes"
                                                value={formData.managerNotes || ''}
                                                onChange={(e) => onInputChange('managerNotes', e.target.value)}
                                                placeholder={t('enterManagerNotes')}
                                                rows={3}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBack}
                                disabled={isLoading}
                                className="h-12 px-8 font-semibold transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg disabled:opacity-50"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('back')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-12 px-8 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t('creatingUserLoading')}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-foreground">
                            {t('userCreatedSuccessfully')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2">
                            The {roleConfig.name.toLowerCase()} has been successfully created and added to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            onClick={onCloseSuccessModal}
                            className="flex-1 h-11 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
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

