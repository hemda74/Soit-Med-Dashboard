import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, UserPlus, Shield, Users, Stethoscope, Wrench, Settings, DollarSign, Scale, ShoppingCart, UserCheck } from 'lucide-react';
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
} from '@/services';
import type {
    RoleSpecificUserRole,
    HospitalInfo,
} from '@/types/roleSpecificUser.types';
import UserCreationForm from './UserCreationForm';
import { useUserCreationForm } from '@/hooks/useUserCreationForm';

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

    // Role icons mapping
    const ROLE_ICONS = {
        doctor: Stethoscope,
        engineer: Wrench,
        technician: Settings,
        admin: Shield,
        'finance-manager': DollarSign,
        'finance-employee': DollarSign,
        'legal-manager': Scale,
        'legal-employee': Scale,
        salesman: ShoppingCart,
        'sales-manager': UserCheck,
    };

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
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

            switch (selectedRole) {
                case 'doctor':
                    await createDoctor(userData as any, user.token);
                    break;
                case 'engineer':
                    await createEngineer(userData as any, user.token);
                    break;
                case 'technician':
                    await createTechnician(userData as any, user.token);
                    break;
                case 'admin':
                    await createAdmin(userData as any, user.token);
                    break;
                case 'finance-manager':
                    await createFinanceManager(userData as any, user.token);
                    break;
                case 'finance-employee':
                    await createFinanceEmployee(userData as any, user.token);
                    break;
                case 'legal-manager':
                    await createLegalManager(userData as any, user.token);
                    break;
                case 'legal-employee':
                    await createLegalEmployee(userData as any, user.token);
                    break;
                case 'salesman':
                    await createSalesman(userData as any, user.token);
                    break;
                case 'sales-manager':
                    await createSalesManager(userData as any, user.token);
                    break;
                default:
                    throw new Error('Invalid role selected');
            }

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
                        <Button onClick={() => navigate('/')} className="w-full mt-4 hover:bg-primary hover:text-white transition-colors duration-200">
                            {t('goBack')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-3xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        <div className="relative p-8 md:p-12 text-white">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={handleBack}
                                    className="text-white hover:bg-white/20 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/20"
                                >
                                    <ArrowLeft className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                    {t('back')}
                                </Button>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                            <UserPlus className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                                                {t('createNewUserTitle')}
                                            </h1>
                                            <p className="text-white/80 text-lg md:text-xl mt-2">
                                                {selectedRole ? t('createRoleUser').replace('{role}', ROLE_CONFIG[selectedRole].name) : t('selectRoleToCreateUser')}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedRole && (
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                                {React.createElement(ROLE_ICONS[selectedRole], { className: "w-6 h-6 text-white" })}
                                            </div>
                                            <span className="text-white/90 font-medium">
                                                {ROLE_CONFIG[selectedRole].description}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="hidden lg:block">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                        <Users className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!selectedRole ? (
                        <div className="space-y-8">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-bold text-foreground">
                                    Choose User Role
                                </h2>
                                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                    Select the appropriate role for the new user. Each role has specific permissions and requirements.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                                    const IconComponent = ROLE_ICONS[roleKey as keyof typeof ROLE_ICONS];
                                    return (
                                        <Card
                                            key={roleKey}
                                            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-gradient-to-br from-card to-muted/20 hover:from-primary/5 hover:to-primary/10"
                                            onClick={() => handleRoleSelect(roleKey as RoleSpecificUserRole)}
                                        >
                                            <CardContent className="p-6 text-center space-y-4">
                                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                                                    <IconComponent className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                                        {config.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                                        {config.description}
                                                    </p>
                                                </div>
                                                <div className="pt-2">
                                                    <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                                                        <span>Create User</span>
                                                        <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
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
                            showSuccessModal={showSuccessModal}
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
                            onCloseSuccessModal={handleSuccessModalClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleSpecificUserCreation;
