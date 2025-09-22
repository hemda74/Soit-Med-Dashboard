import React from 'react';
import { AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    onBack
}) => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    {t('createRoleUser').replace('{role}', roleConfig.name)}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{t('pleaseFixFollowingErrors')}</h3>
                                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">{t('firstName')} *</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => onInputChange('firstName', e.target.value)}
                                placeholder={t('enterFirstName')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">{t('lastName')} *</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => onInputChange('lastName', e.target.value)}
                                placeholder={t('enterLastName')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email')} *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => onInputChange('email', e.target.value)}
                                placeholder={t('enterEmailAddress')}
                                required
                            />
                        </div>

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
                            className={`${formData.confirmPassword && formData.password !== formData.confirmPassword
                                ? 'border-red-500'
                                : formData.confirmPassword && formData.password === formData.confirmPassword
                                    ? 'border-green-500'
                                    : ''
                                }`}
                        />

                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-xs text-red-600">{t('passwordsDoNotMatch')}</p>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <p className="text-xs text-green-600">{t('passwordsMatch')}</p>
                        )}

                        <ImageUploadField
                            imagePreview={imagePreview}
                            imageError={imageError}
                            imageAltText={formData.imageAltText || ''}
                            onImageSelect={onImageSelect}
                            onRemoveImage={onRemoveImage}
                            onAltTextChange={onImageAltTextChange}
                        />

                        {(selectedRole === 'doctor' || selectedRole === 'engineer') && (
                            <div className="space-y-2">
                                <Label htmlFor="specialty">{t('specialty')} *</Label>
                                <Input
                                    id="specialty"
                                    value={formData.specialty}
                                    onChange={(e) => onInputChange('specialty', e.target.value)}
                                    placeholder={selectedRole === 'doctor' ? t('enterMedicalSpecialty') : t('enterEngineeringSpecialty')}
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
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salesTerritory">{t('salesTerritory')}</Label>
                                    <Input
                                        id="salesTerritory"
                                        value={formData.salesTerritory || ''}
                                        onChange={(e) => onInputChange('salesTerritory', e.target.value)}
                                        placeholder={t('enterSalesTerritory')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salesTeam">{t('salesTeam')}</Label>
                                    <Input
                                        id="salesTeam"
                                        value={formData.salesTeam || ''}
                                        onChange={(e) => onInputChange('salesTeam', e.target.value)}
                                        placeholder={t('enterSalesTeam')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salesTarget">{t('salesTarget')}</Label>
                                    <Input
                                        id="salesTarget"
                                        type="number"
                                        step="0.01"
                                        value={formData.salesTarget || ''}
                                        onChange={(e) => onInputChange('salesTarget', e.target.value)}
                                        placeholder={t('enterSalesTarget')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="managerNotes">{t('managerNotes')}</Label>
                                    <Textarea
                                        id="managerNotes"
                                        value={formData.managerNotes || ''}
                                        onChange={(e) => onInputChange('managerNotes', e.target.value)}
                                        placeholder={t('enterManagerNotes')}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={isLoading}
                            className="hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-colors duration-200"
                        >
                            {t('back')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 hover:bg-blue-800 hover:text-white transition-colors duration-200"
                        >
                            {isLoading ? t('creatingUserLoading') : t('createRoleUser').replace('{role}', roleConfig.name)}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserCreationForm;

