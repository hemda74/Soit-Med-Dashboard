import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, UserPlus, Shield, Stethoscope, Wrench, Settings, DollarSign, Scale, ShoppingCart, UserCheck, Cog, HardHat, HeadphonesIcon, Package, Warehouse } from 'lucide-react';
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
    createSalesMan,
    createSalesManager,
    createMaintenanceManager,
    createMaintenanceSupport,
    createSalesSupport,
    createSparePartsCoordinator,
    createInventoryManager,
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
    EngineerCount: number;
}

const RoleSpecificUserCreation: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { errorNotification } = useNotificationStore();
    const { setLoading } = useAppStore();
    const { t, language } = useTranslation();

    // Role icons mapping
    const ROLE_ICONS = {
        Doctor: Stethoscope,
        Engineer: Wrench,
        Technician: Settings,
        Admin: Shield,
        'FinanceManager': DollarSign,
        'FinanceEmployee': DollarSign,
        'LegalManager': Scale,
        'LegalEmployee': Scale,
        SalesMan: ShoppingCart,
        'SalesManager': UserCheck,
        'MaintenanceManager': HardHat,
        'MaintenanceSupport': Cog,
        'SalesSupport': HeadphonesIcon,
        'SparePartsCoordinator': Package,
        'InventoryManager': Warehouse,
    };

    // Role configuration with translations
    const ROLE_CONFIG = {
        Doctor: {
            name: t('Doctor'),
            description: t('DoctorDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty', 'hospitalId'],
            requiresHospital: true,
            requiresDepartment: false,
            autoDepartmentId: 2,
        },
        Engineer: {
            name: t('Engineer'),
            description: t('EngineerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty', 'governorateIds'],
            requiresHospital: false,
            requiresDepartment: false,
            requiresGovernorates: true,
            autoDepartmentId: 4,
        },
        Technician: {
            name: t('Technician'),
            description: t('TechnicianDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'hospitalId', 'department'],
            requiresHospital: true,
            requiresDepartment: false,
            requiresMedicalDepartment: true,
            autoDepartmentId: 2,
        },
        Admin: {
            name: t('Admin'),
            description: t('AdminDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 1,
        },
        'FinanceManager': {
            name: t('financeManager'),
            description: t('financeManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 5,
        },
        'FinanceEmployee': {
            name: t('financeEmployee'),
            description: t('financeEmployeeDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 5,
        },
        'LegalManager': {
            name: t('legalManager'),
            description: t('legalManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 6,
        },
        'LegalEmployee': {
            name: t('legalEmployee'),
            description: t('legalEmployeeDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 6,
        },
        SalesMan: {
            name: t('salesman'),
            description: t('salesmanDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 3,
            role: 'SalesMan'
        },
        'SalesManager': {
            name: t('salesManager'),
            description: t('salesManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'salesTerritory', 'salesTeam', 'salesTarget', 'managerNotes'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 3,
            role: 'SalesManager'
        },
        'MaintenanceManager': {
            name: t('maintenanceManager'),
            description: t('maintenanceManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'maintenanceSpecialty', 'certification'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 4,
            role: 'MaintenanceManager'
        },
        'MaintenanceSupport': {
            name: t('maintenanceSupport'),
            description: t('maintenanceSupportDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'jobTitle', 'technicalSkills'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 4,
            role: 'MaintenanceSupport'
        },
        'SalesSupport': {
            name: t('salesSupport'),
            description: t('salesSupportDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'phoneNumber', 'personalMail', 'supportSpecialization', 'supportLevel', 'notes'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 4,
            role: 'SalesSupport'
        },
        'SparePartsCoordinator': {
            name: t('sparePartsCoordinator'),
            description: t('sparePartsCoordinatorDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 4,
            role: 'SparePartsCoordinator'
        },
        'InventoryManager': {
            name: t('inventoryManager'),
            description: t('inventoryManagerDescription'),
            fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty'],
            requiresHospital: false,
            requiresDepartment: false,
            autoDepartmentId: 4,
            role: 'InventoryManager'
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

    // Check permissions (case-insensitive - hasRole is now case-insensitive)
    const { hasRole } = useAuthStore();
    const canCreateUsers = hasRole('SuperAdmin') || hasRole('Admin');

    useEffect(() => {
        if (!canCreateUsers) {
            errorNotification('Access Denied', 'Admin access required');
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
        } catch (err: any) {
            console.error('Error loading reference data:', err);
            
            // Handle 403 Forbidden errors specifically
            if (err?.status === 403 || err?.message?.includes('403') || err?.message?.includes('Forbidden')) {
                errorNotification(
                    'Access Denied',
                    'You do not have permission to access hospitals and governorates. Please contact your Administrator if you need this access.'
                );
                // Set empty arrays so the form can still be used (just without reference data)
                setHospitals([]);
                setGovernorates([]);
            } else {
                errorNotification('Error', 'Failed to load reference data. Please try again later.');
            }
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

            // Automatically set image alt text to firstName + lastName if image is uploaded
            const autoImageAltText = formData.profileImage && formData.firstName && formData.lastName
                ? `${formData.firstName} ${formData.lastName}`
                : undefined;

            const userData = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
                // Auto-assign department ID for all roles (as number)
                departmentId: getDepartmentIdForRole(selectedRole),
                ...(config.requiresHospital && formData.hospitalId && { hospitalId: formData.hospitalId }),
                ...(selectedRole === 'Doctor' && formData.specialty && { specialty: formData.specialty }),
                ...(selectedRole === 'Engineer' && formData.specialty && { specialty: formData.specialty }),
                ...(selectedRole === 'Engineer' && formData.governorateIds && formData.governorateIds.length > 0 && { governorateIds: formData.governorateIds }),
                ...(selectedRole === 'Technician' && formData.department && { department: formData.department }),
                ...(selectedRole === 'SalesManager' && formData.salesTerritory && { salesTerritory: formData.salesTerritory }),
                ...(selectedRole === 'SalesManager' && formData.salesTeam && { salesTeam: formData.salesTeam }),
                ...(selectedRole === 'SalesManager' && formData.salesTarget && { salesTarget: parseFloat(formData.salesTarget) }),
                ...(selectedRole === 'SalesManager' && formData.managerNotes && { managerNotes: formData.managerNotes }),
                ...(selectedRole === 'SalesSupport' && formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
                ...(selectedRole === 'SalesSupport' && formData.personalMail && { personalMail: formData.personalMail }),
                ...(selectedRole === 'SalesSupport' && formData.supportSpecialization && { supportSpecialization: formData.supportSpecialization }),
                ...(selectedRole === 'SalesSupport' && formData.supportLevel && { supportLevel: formData.supportLevel }),
                ...(selectedRole === 'SalesSupport' && formData.notes && { notes: formData.notes }),
                ...(selectedRole === 'SparePartsCoordinator' && formData.specialty && { specialty: formData.specialty }),
                ...(selectedRole === 'InventoryManager' && formData.specialty && { specialty: formData.specialty }),
                ...(formData.profileImage && { profileImage: formData.profileImage }),
                ...(autoImageAltText && { imageAltText: autoImageAltText }),
            };

            switch (selectedRole) {
                case 'Doctor':
                    await createDoctor(userData as any, user.token);
                    break;
                case 'Engineer':
                    await createEngineer(userData as any, user.token);
                    break;
                case 'Technician':
                    await createTechnician(userData as any, user.token);
                    break;
                case 'Admin':
                    await createAdmin(userData as any, user.token);
                    break;
                case 'FinanceManager':
                    await createFinanceManager(userData as any, user.token);
                    break;
                case 'FinanceEmployee':
                    await createFinanceEmployee(userData as any, user.token);
                    break;
                case 'LegalManager':
                    await createLegalManager(userData as any, user.token);
                    break;
                case 'LegalEmployee':
                    await createLegalEmployee(userData as any, user.token);
                    break;
                case 'SalesMan':
                    await createSalesMan(userData as any, user.token);
                    break;
                case 'SalesManager':
                    await createSalesManager(userData as any, user.token);
                    break;
                case 'MaintenanceManager':
                    await createMaintenanceManager(userData as any, user.token);
                    break;
                case 'MaintenanceSupport':
                    await createMaintenanceSupport(userData as any, user.token);
                    break;
                case 'SalesSupport':
                    await createSalesSupport(userData as any, user.token);
                    break;
                case 'SparePartsCoordinator':
                    await createSparePartsCoordinator(userData as any, user.token);
                    break;
                case 'InventoryManager':
                    await createInventoryManager(userData as any, user.token);
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
            navigate('/Admin/users');
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
                        <p className="text-muted-foreground">{t('AdminAccessRequiredMessage')}</p>
                        <Button onClick={() => navigate('/')} className="w-full mt-4 hover:bg-primary hover:text-white transition-colors duration-200">
                            {t('goBack')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 py-6 lg:py-10">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Enhanced Professional Header */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/20 overflow-hidden">
                        <CardContent className="p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                {/* Left Section - Back Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBack}
                                    className="h-11 px-4 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl"
                                >
                                    <span className="font-medium">{t('back')}</span>
                                </Button>

                                {/* Center Section - Title */}
                                <div className="flex-1 flex items-center gap-4 justify-center lg:justify-start">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
                                        <UserPlus className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                                            {t('createNewUserTitle')}
                                        </h1>
                                        <p className="text-muted-foreground text-sm lg:text-base">
                                            {selectedRole
                                                ? t('createRoleUser').replace('{role}', ROLE_CONFIG[selectedRole].name)
                                                : t('selectRoleToCreateUser')
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Right Section - Selected Role Badge */}
                                {selectedRole && (
                                    <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm">
                                        <div className="p-2 bg-background rounded-lg shadow-sm">
                                            {React.createElement(ROLE_ICONS[selectedRole], { className: "w-5 h-5 text-primary" })}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {ROLE_CONFIG[selectedRole].name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {ROLE_CONFIG[selectedRole].description}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {!selectedRole ? (
                        <div className="space-y-12">
                            {/* Enhanced Header Section */}
                            <div className="text-center space-y-6">

                                <div className="space-y-4">
                                    <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        Choose User Role
                                    </h2>
                                    <p className="text-muted-foreground text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                                        Select the appropriate role for the new user. Each role has specific permissions, requirements, and access levels.
                                    </p>
                                </div>
                            </div>

                            {/* Enhanced Role Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                                    const IconComponent = ROLE_ICONS[roleKey as keyof typeof ROLE_ICONS];
                                    return (
                                        <Card
                                            key={roleKey}
                                            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-border/50 bg-gradient-to-br from-card to-muted/5 hover:from-primary/5 hover:to-primary/10 hover:border-primary/30 overflow-hidden relative"
                                            onClick={() => handleRoleSelect(roleKey as RoleSpecificUserRole)}
                                        >
                                            {/* Animated background overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-300"></div>

                                            <CardContent className="p-6 lg:p-8 text-center space-y-5 relative z-10">
                                                {/* Icon Container */}
                                                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/15 via-primary/20 to-primary/25 rounded-2xl flex items-center justify-center group-hover:from-primary/25 group-hover:via-primary/30 group-hover:to-primary/35 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                                                    <IconComponent className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                                                </div>

                                                {/* Content */}
                                                <div className="space-y-3 mt-4">
                                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                                        {config.name}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                                                        {config.description}
                                                    </p>
                                                </div>

                                                {/* Action Badge */}
                                                <div className="pt-3">
                                                    <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-300 bg-primary/10 group-hover:bg-primary/20 px-5 py-2.5 rounded-full border border-primary/20 group-hover:border-primary/40">
                                                        <span>Create User</span>
                                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
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
