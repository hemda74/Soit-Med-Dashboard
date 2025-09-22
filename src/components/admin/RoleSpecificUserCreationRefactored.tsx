import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    createDoctor,
    createEngineer,
    createTechnician,
    createAdmin,
    createFinanceManager,
    createFinanceEmployee,
    createLegalManager,
    createLegalEmployee,
    createSalesman,
    createSalesManager,
    getHospitals,
    getGovernorates,
    validateForm,
} from '@/services/roleSpecificUserApi';
import type {
    RoleSpecificUserRole,
    HospitalInfo,
    RoleSpecificUserResponse,
} from '@/types/roleSpecificUser.types';
import UserCreationSuccessModal from '../ui/user-creation-success-modal';
import RoleSelectionCard from './RoleSelectionCard';
import UserCreationForm from './UserCreationForm';
import { useUserCreationForm, type FormData } from '@/hooks/useUserCreationForm';

// Governorate interface
interface GovernorateInfo {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

const RoleSpecificUserCreation: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { error: showError } = useNotificationStore();
    const { setLoading } = useAppStore();
    const { t, language } = useTranslation();

    // Role configuration with translations
    const ROLE_CONFIG = {
        doctor: {
            name: t('doctor'),
            description: t('doctorDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty', 'hospitalId'],
            requiresHospital: true,
            requiresDepartment: false,
            autoDepartmentId: 2,
        },
        engineer: {
            name: t('engineer'),
            description: t('engineerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty', 'governorateIds'],
            requiresHospital: false,
            requiresDepartment: false,
            requiresGovernorates: true,
            autoDepartmentId: 4,
        },
        technician: {
            name: t('technician'),
            description: t('technicianDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'hospitalId', 'department'],
            requiresHospital: true,
            requiresDepartment: false,
            requiresMedicalDepartment: true,
            autoDepartmentId: 2,
        },
        admin: {
            name: t('admin'),
            description: t('adminDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 1,
        },
        'finance-manager': {
            name: t('financeManager'),
            description: t('financeManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 5,
        },
        'finance-employee': {
            name: t('financeEmployee'),
            description: t('financeEmployeeDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 5,
        },
        'legal-manager': {
            name: t('legalManager'),
            description: t('legalManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 6,
        },
        'legal-employee': {
            name: t('legalEmployee'),
            description: t('legalEmployeeDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 6,
        },
        salesman: {
            name: t('salesman'),
            description: t('salesmanDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 3,
            role: 'Salesman'
        },
        'sales-manager': {
            name: t('salesManager'),
            description: t('salesManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'salesTerritory', 'salesTeam', 'salesTarget', 'managerNotes'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 3,
            role: 'SalesManager'
        },
    };

    const [selectedRole, setSelectedRole] = useState<RoleSpecificUserRole | null>(null);
    const [hospitals, setHospitals] = useState<HospitalInfo[]>([]);
    const [governorates, setGovernorates] = useState<GovernorateInfo[]>([]);
    const [createdUser, setCreatedUser] = useState<RoleSpecificUserResponse | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdPassword, setCreatedPassword] = useState('');

    // Use the custom hook for form management
    const {
        formData,
        setFormData,
        isLoading,
        setIsLoading,
        errors,
        setErrors,
        passwordErrors,
        showPassword,
        showConfirmPassword,
        showGovernorateDropdown,
        setShowGovernorateDropdown,
        imagePreview,
        imageError,
        governorateDropdownRef,
        validatePasswordStrength,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
        handleImageSelect,
        handleRemoveImage,
        handleImageAltTextChange,
        handleInputChange,
        handleGovernorateToggle,
        removeGovernorate,
        handleHospitalSelect,
        resetForm,
    } = useUserCreationForm();

    // Check permissions
    const { hasRole } = useAuthStore();
    const canCreateUsers = hasRole('SuperAdmin') || hasRole('Admin');

    useEffect(() => {
        if (!canCreateUsers) {
            showError('Access Denied', 'Admin access required');
            navigate('/');
            return;
        }

        loadReferenceData();
    }, [canCreateUsers, user?.token]);

    const loadReferenceData = async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const [hospitalsData, governoratesData] = await Promise.all([
                getHospitals(user.token),
                getGovernorates(user.token),
            ]);

            setHospitals(hospitalsData);
            setGovernorates(governoratesData);
        } catch (err) {
            console.error('Error loading reference data:', err);
            showError('Error', 'Failed to load reference data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role: RoleSpecificUserRole) => {
        setSelectedRole(role);
        resetForm();
        setCreatedUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole || !user?.token) return;

        const config = ROLE_CONFIG[selectedRole];
        const requiredFields = config.fields;

        // Validate form
        const validationErrors = validateForm(formData, requiredFields);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Custom password strength validation
        const passwordValidation = validatePasswordStrength(formData.password);
        if (!passwordValidation.isValid) {
            setErrors(passwordValidation.errors);
            return;
        }

        // Additional password confirmation validation
        if (formData.password !== formData.confirmPassword) {
            setErrors([t('passwordsDoNotMatchError')]);
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            // Auto-assign department IDs based on role
            const getDepartmentIdForRole = (role: RoleSpecificUserRole): number => {
                return ROLE_CONFIG[role]?.autoDepartmentId || 0;
            };

            const userData = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                // Auto-assign department ID for all roles (as number)
                departmentId: getDepartmentIdForRole(selectedRole),
                ...(config.requiresHospital && formData.hospitalId && { hospitalId: formData.hospitalId }),
                ...(selectedRole === 'doctor' && formData.specialty && { specialty: formData.specialty }),
                ...(selectedRole === 'engineer' && formData.specialty && { specialty: formData.specialty }),
                ...(selectedRole === 'engineer' && formData.governorateIds && formData.governorateIds.length > 0 && { governorateIds: formData.governorateIds }),
                ...(selectedRole === 'technician' && formData.department && { department: formData.department }),
                ...(selectedRole === 'sales-manager' && formData.salesTerritory && { salesTerritory: formData.salesTerritory }),
                ...(selectedRole === 'sales-manager' && formData.salesTeam && { salesTeam: formData.salesTeam }),
                ...(selectedRole === 'sales-manager' && formData.salesTarget && { salesTarget: parseFloat(formData.salesTarget) }),
                ...(selectedRole === 'sales-manager' && formData.managerNotes && { managerNotes: formData.managerNotes }),
                ...(formData.profileImage && { profileImage: formData.profileImage }),
                ...(formData.imageAltText && { imageAltText: formData.imageAltText }),
            };

            let response: RoleSpecificUserResponse;

            switch (selectedRole) {
                case 'doctor':
                    response = await createDoctor(userData as any, user.token);
                    break;
                case 'engineer':
                    response = await createEngineer(userData as any, user.token);
                    break;
                case 'technician':
                    response = await createTechnician(userData as any, user.token);
                    break;
                case 'admin':
                    response = await createAdmin(userData as any, user.token);
                    break;
                case 'finance-manager':
                    response = await createFinanceManager(userData as any, user.token);
                    break;
                case 'finance-employee':
                    response = await createFinanceEmployee(userData as any, user.token);
                    break;
                case 'legal-manager':
                    response = await createLegalManager(userData as any, user.token);
                    break;
                case 'legal-employee':
                    response = await createLegalEmployee(userData as any, user.token);
                    break;
                case 'salesman':
                    response = await createSalesman(userData as any, user.token);
                    break;
                case 'sales-manager':
                    response = await createSalesManager(userData as any, user.token);
                    break;
                default:
                    throw new Error('Invalid role selected');
            }

            // Transform the response to match expected structure
            const transformedResponse = {
                success: true,
                message: 'User created successfully',
                data: {
                    userId: (response as any).userId,
                    email: (response as any).email,
                    firstName: (response as any).firstName,
                    lastName: (response as any).lastName,
                    role: (response as any).role || selectedRole,
                    departmentId: (response as any).departmentId || getDepartmentIdForRole(selectedRole).toString(),
                }
            } as RoleSpecificUserResponse;

            setCreatedUser(transformedResponse);
            setCreatedPassword(formData.password);
            setShowSuccessModal(true);

        } catch (err: any) {
            console.error('=== API ERROR ===');
            console.error('Error creating user:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });

            // Parse API error response to extract specific error messages
            let errorMessages: string[] = [];

            try {
                // Try to parse the error response
                const errorResponse = err.response || err;

                if (errorResponse && typeof errorResponse === 'object') {
                    // Check if it's the API error format we expect
                    if (errorResponse.message && errorResponse.errors) {
                        // Extract individual error messages from the errors object
                        if (typeof errorResponse.errors === 'object') {
                            Object.entries(errorResponse.errors).forEach(([field, message]) => {
                                if (typeof message === 'string') {
                                    errorMessages.push(`${field}: ${message}`);
                                } else if (Array.isArray(message)) {
                                    message.forEach(msg => {
                                        if (typeof msg === 'string') {
                                            errorMessages.push(`${field}: ${msg}`);
                                        }
                                    });
                                }
                            });
                        }
                    } else if (errorResponse.message) {
                        errorMessages.push(errorResponse.message);
                    } else if (errorResponse.error) {
                        errorMessages.push(errorResponse.error);
                    }
                }
            } catch (parseError) {
                // Ignore parse errors
            }
            if (errorMessages.length === 0) {
                errorMessages.push(err.message || 'Failed to create user');
            }

            setErrors(errorMessages);

        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (selectedRole) {
            setSelectedRole(null);
            resetForm();
            setCreatedUser(null);
        } else {
            navigate('/admin/users');
        }
    };

    const handleDepartmentChange = (department: string) => {
        setFormData(prev => ({ ...prev, department }));
    };

    const handleClearAllGovernorates = () => {
        setFormData(prev => ({ ...prev, governorateIds: [] }));
    };

    const handleToggleGovernorateDropdown = () => {
        setShowGovernorateDropdown(!showGovernorateDropdown);
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        setCreatedUser(null);
        setCreatedPassword('');
        // Reset form and go back to role selection
        setSelectedRole(null);
        resetForm();
    };

    if (!canCreateUsers) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            {t('accessDeniedTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('adminAccessRequiredMessage')}</p>
                        <Button onClick={() => navigate('/')} className="w-full mt-4 hover:bg-blue-800 hover:text-white transition-colors duration-200">
                            {t('goBack')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                {/* Colorful Header */}
                <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-8 shadow-lg">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="text-white hover:bg-blue-800 hover:text-white transition-colors duration-200"
                        >
                            <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {t('back')}
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">{t('createNewUserTitle')}</h1>
                            <p className="text-primary-foreground/80 text-lg">
                                {selectedRole ? t('createRoleUser').replace('{role}', ROLE_CONFIG[selectedRole].name) : t('selectRoleToCreateUser')}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {!selectedRole ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(ROLE_CONFIG).map(([roleKey, config], index) => (
                            <RoleSelectionCard
                                key={roleKey}
                                roleKey={roleKey}
                                config={config}
                                index={index}
                                onSelect={handleRoleSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <UserCreationForm
                        selectedRole={selectedRole}
                        roleConfig={ROLE_CONFIG[selectedRole]}
                        formData={formData}
                        hospitals={hospitals}
                        governorates={governorates}
                        errors={errors}
                        passwordErrors={passwordErrors}
                        showPassword={showPassword}
                        showConfirmPassword={showConfirmPassword}
                        showGovernorateDropdown={showGovernorateDropdown}
                        imagePreview={imagePreview}
                        imageError={imageError}
                        isLoading={isLoading}
                        governorateDropdownRef={governorateDropdownRef}
                        onInputChange={handleInputChange}
                        onPasswordToggle={togglePasswordVisibility}
                        onConfirmPasswordToggle={toggleConfirmPasswordVisibility}
                        onImageSelect={handleImageSelect}
                        onRemoveImage={handleRemoveImage}
                        onImageAltTextChange={handleImageAltTextChange}
                        onHospitalSelect={handleHospitalSelect}
                        onGovernorateToggle={handleGovernorateToggle}
                        onRemoveGovernorate={removeGovernorate}
                        onClearAllGovernorates={handleClearAllGovernorates}
                        onToggleGovernorateDropdown={handleToggleGovernorateDropdown}
                        onDepartmentChange={handleDepartmentChange}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                    />
                )}
            </div>

            {/* Success Modal */}
            {createdUser && createdUser.data && showSuccessModal && (
                <UserCreationSuccessModal
                    isOpen={showSuccessModal}
                    onClose={handleSuccessModalClose}
                    userData={{
                        email: createdUser.data.email,
                        firstName: createdUser.data.firstName,
                        lastName: createdUser.data.lastName,
                        role: createdUser.data.role,
                        userId: createdUser.data.userId,
                    }}
                    password={createdPassword}
                />
            )}
        </div>
    );
};

export default RoleSpecificUserCreation;

