import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, UserPlus, Eye, EyeOff, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    createDoctor,
    createEngineer,
    createTechnician,
    createAdmin,
    createFinanceManager,
    createLegalManager,
    createSalesman,
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

// Governorate interface
interface GovernorateInfo {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

// Medical department options for technicians
const MEDICAL_DEPARTMENTS = [
    'Radiology',
    'Laboratory',
    'Biomedical Engineering',
    'Cardiology',
    'Respiratory Therapy',
    'Emergency Department',
    'Operating Room',
    'ICU/Critical Care',
    'Blood Bank',
    'Equipment Maintenance'
];

// Role configuration - will be created inside component to use translations

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    specialty?: string;
    hospitalId?: string;
    departmentId?: string;
    department?: string;
    governorateIds?: number[];
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
        'legal-manager': {
            name: t('legalManager'),
            description: t('legalManagerDescription'),
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
    };

    const [selectedRole, setSelectedRole] = useState<RoleSpecificUserRole | null>(null);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        specialty: '',
        hospitalId: '',
        departmentId: '',
        department: '',
        governorateIds: [],
    });
    const [hospitals, setHospitals] = useState<HospitalInfo[]>([]);
    const [governorates, setGovernorates] = useState<GovernorateInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [createdUser, setCreatedUser] = useState<RoleSpecificUserResponse | null>(null);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showGovernorateDropdown, setShowGovernorateDropdown] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdPassword, setCreatedPassword] = useState('');
    const governorateDropdownRef = useRef<HTMLDivElement>(null);

    // Check permissions
    const { hasRole } = useAuthStore();
    const canCreateUsers = hasRole('SuperAdmin') || hasRole('Admin');

    // Custom password validation function
    const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push(t('passwordMustBeAtLeast8'));
        }

        if (!/[A-Z]/.test(password)) {
            errors.push(t('passwordMustContainUppercase'));
        }

        if (!/[a-z]/.test(password)) {
            errors.push(t('passwordMustContainLowercase'));
        }

        if (!/\d/.test(password)) {
            errors.push(t('passwordMustContainNumber'));
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push(t('passwordMustContainSpecial'));
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    useEffect(() => {
        if (!canCreateUsers) {
            showError('Access Denied', 'Admin access required');
            navigate('/');
            return;
        }

        loadReferenceData();
    }, [canCreateUsers, user?.token]);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (governorateDropdownRef.current && !governorateDropdownRef.current.contains(event.target as Node)) {
                setShowGovernorateDropdown(false);
            }
        };

        if (showGovernorateDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showGovernorateDropdown]);

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
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            specialty: '',
            hospitalId: '',
            departmentId: '',
            department: '',
            governorateIds: [],
        });
        setErrors([]);
        setPasswordErrors([]);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setCreatedUser(null);
        setShowGovernorateDropdown(false);


    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }

        // Real-time password validation
        if (field === 'password') {
            const passwordValidation = validatePasswordStrength(value);
            setPasswordErrors(passwordValidation.errors);
        } else if (field === 'confirmPassword') {
            // Clear password errors when user starts typing confirm password
            if (passwordErrors.length > 0) {
                setPasswordErrors([]);
            }
        }
    };

    const handleGovernorateToggle = (governorateId: number) => {
        if (!governorateId || isNaN(governorateId)) {
            console.error('Invalid governorate ID:', governorateId);
            return;
        }

        setFormData(prev => {
            const currentIds = prev.governorateIds || [];
            const isSelected = currentIds.includes(governorateId);
            let newIds;

            if (isSelected) {
                // Remove if already selected
                newIds = currentIds.filter(id => id !== governorateId);
            } else {
                // Add if not selected
                newIds = [...currentIds, governorateId];
            }


            return { ...prev, governorateIds: newIds };
        });

        // Clear errors when user makes selection
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const removeGovernorate = (governorateId: number) => {
        setFormData(prev => {
            const currentIds = prev.governorateIds || [];
            const newIds = currentIds.filter(id => id !== governorateId);

            return { ...prev, governorateIds: newIds };
        });
    };

    const handleHospitalSelect = (hospitalId: string) => {
        setFormData(prev => {
            const updated = { ...prev, hospitalId };
            return updated;
        });

        // Clear errors when user makes selection
        if (errors.length > 0) {
            setErrors([]);
        }
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
                case 'legal-manager':
                    response = await createLegalManager(userData as any, user.token);
                    break;
                case 'salesman':
                    response = await createSalesman(userData as any, user.token);
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

            // success('User Created Successfully', response.message);
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
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                specialty: '',
                hospitalId: '',
                departmentId: '',
                governorateIds: [],
            });
            setErrors([]);
            setPasswordErrors([]);
            setShowPassword(false);
            setShowConfirmPassword(false);
            setCreatedUser(null);
            setShowGovernorateDropdown(false);
        } else {
            navigate('/admin/users');
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        setCreatedUser(null);
        setCreatedPassword('');
        // Reset form and go back to role selection
        setSelectedRole(null);
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            specialty: '',
            hospitalId: '',
            departmentId: '',
            department: '',
            governorateIds: [],
        });
        setErrors([]);
        setPasswordErrors([]);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowGovernorateDropdown(false);
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
    };

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
                        {Object.entries(ROLE_CONFIG).map(([roleKey, config], index) => {
                            const colors = [
                                { bg: 'bg-white', border: 'border-2 border-border', icon: 'bg-gradient-to-br from-primary to-primary/80' },
                                { bg: 'bg-white', border: 'border-2 border-border', icon: 'bg-gradient-to-br from-primary to-primary/80' },
                                { bg: 'bg-white', border: 'border-2 border-border', icon: 'bg-gradient-to-br from-primary to-primary/80' },
                                { bg: 'bg-white', border: 'border-2 border-border', icon: 'bg-gradient-to-br from-primary to-primary/80' },
                                { bg: 'bg-white', border: 'border-2 border-border', icon: 'bg-gradient-to-br from-primary to-primary/80' },
                                { bg: 'bg-white', border: 'border-2 border-border', icon: 'bg-gradient-to-br from-primary to-primary/80' },
                                { bg: 'bg-white', border: 'border-2 border-border', icon: 'bg-gradient-to-br from-primary to-primary/80' },
                            ];
                            const colorScheme = colors[index % colors.length];

                            return (
                                <Card
                                    key={roleKey}
                                    className={`cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-110 ${colorScheme.bg} ${colorScheme.border} group shadow-lg`}
                                    onClick={() => handleRoleSelect(roleKey as RoleSpecificUserRole)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-4 text-foreground group-hover:scale-105 transition-transform font-bold text-lg">
                                            <div className={`w-12 h-12 ${colorScheme.icon} rounded-xl flex items-center justify-center shadow-lg`}>
                                                <UserPlus className="h-6 w-6 text-white" />
                                            </div>
                                            {config.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground font-medium opacity-90">{config.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                {t('createRoleUser').replace('{role}', ROLE_CONFIG[selectedRole].name)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder={t('enterFirstName')}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{t('lastName')} *</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder={t('enterEmailAddress')}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">{t('password')} *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder={t('enterPasswordField')}
                                                required
                                                className={`pr-10 ${passwordErrors.length > 0 ? 'border-red-500' : ''}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-blue-800 hover:text-white transition-colors duration-200"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('passwordRequirements')}
                                        </p>
                                        {passwordErrors.length > 0 && (
                                            <div className="text-xs text-red-600">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {passwordErrors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">{t('confirmPassword')} *</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                placeholder={t('confirmPasswordPlaceholder')}
                                                required
                                                className={`pr-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                                    ? 'border-red-500'
                                                    : formData.confirmPassword && formData.password === formData.confirmPassword
                                                        ? 'border-green-500'
                                                        : ''
                                                    }`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-blue-800 hover:text-white transition-colors duration-200"
                                                onClick={toggleConfirmPasswordVisibility}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <p className="text-xs text-red-600">{t('passwordsDoNotMatch')}</p>
                                        )}
                                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                            <p className="text-xs text-green-600">{t('passwordsMatch')}</p>
                                        )}
                                    </div>

                                    {(selectedRole === 'doctor' || selectedRole === 'engineer') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="specialty">{t('specialty')} *</Label>
                                            <Input
                                                id="specialty"
                                                value={formData.specialty}
                                                onChange={(e) => handleInputChange('specialty', e.target.value)}
                                                placeholder={selectedRole === 'doctor' ? t('enterMedicalSpecialty') : t('enterEngineeringSpecialty')}
                                                required
                                            />
                                        </div>
                                    )}

                                    {ROLE_CONFIG[selectedRole].requiresHospital && (
                                        <div className="space-y-2">
                                            <Label>{t('hospital')} *</Label>

                                            {/* Simple select dropdown */}
                                            <select
                                                value={formData.hospitalId || ""}
                                                onChange={(e) => {
                                                    console.log('Select onChange called with:', e.target.value);
                                                    console.log('Selected hospital:', hospitals.find(h => h.id === e.target.value));
                                                    handleHospitalSelect(e.target.value);
                                                }}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            >
                                                <option value="">{t('selectHospital')}</option>
                                                {hospitals && hospitals.length > 0 ? (
                                                    hospitals.map((hospital) => {
                                                        // Handle different possible field names
                                                        const hospitalId = hospital.id || hospital.hospitalId || hospital.HospitalId;
                                                        const hospitalName = hospital.name || hospital.hospitalName || hospital.HospitalName;
                                                        return (
                                                            <option key={hospitalId} value={hospitalId}>
                                                                {hospitalName} (ID: {hospitalId})
                                                            </option>
                                                        );
                                                    })
                                                ) : (
                                                    <option value="" disabled>
                                                        {hospitals ? 'No hospitals available' : 'Loading hospitals...'}
                                                    </option>
                                                )}
                                            </select>

                                            {/* Debug display */}
                                            <div className="text-sm text-gray-600 mt-1">
                                                Current hospitalId: {formData.hospitalId || 'None'}
                                            </div>
                                            {formData.hospitalId && (
                                                <div className="text-sm text-green-600 mt-1">
                                                    Selected: {hospitals.find(h => (h.id || h.hospitalId || h.HospitalId) === formData.hospitalId)?.name || formData.hospitalId}
                                                </div>
                                            )}


                                        </div>
                                    )}

                                    {selectedRole === 'technician' && ROLE_CONFIG[selectedRole].requiresMedicalDepartment && (
                                        <div className="space-y-2">
                                            <Label>{t('medicalDepartment')} *</Label>
                                            <select
                                                value={formData.department || ""}
                                                onChange={(e) => {
                                                    console.log('Medical department selected:', e.target.value);
                                                    setFormData(prev => ({ ...prev, department: e.target.value }));
                                                }}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-blue-800 hover:text-white transition-colors duration-200"
                                            >
                                                <option value="">{t('selectMedicalDepartment')}</option>
                                                {MEDICAL_DEPARTMENTS.map((dept) => (
                                                    <option key={dept} value={dept}>
                                                        {dept}
                                                    </option>
                                                ))}
                                            </select>
                                            
                                            {/* Debug display */}
                                            <div className="text-sm text-gray-600 mt-1">
                                                Current department: {formData.department || 'None'}
                                            </div>
                                            {formData.department && (
                                                <div className="text-sm text-green-600 mt-1">
                                                    Selected: {formData.department}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedRole === 'engineer' && (
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>{t('governorates')} * (Select multiple)</Label>

                                            {/* Multi-select dropdown with better visual feedback */}
                                            <div className="relative" ref={governorateDropdownRef}>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowGovernorateDropdown(!showGovernorateDropdown)}
                                                    className="w-full justify-between text-left hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-colors duration-200"
                                                >
                                                    <span className={formData.governorateIds?.length === 0 ? "text-muted-foreground" : ""}>
                                                        {formData.governorateIds?.length === 0
                                                            ? t('selectGovernorates')
                                                            : t('governoratesSelected').replace('{count}', formData.governorateIds?.length.toString() || '0')
                                                        }
                                                    </span>
                                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showGovernorateDropdown ? 'rotate-180' : ''}`} />
                                                </Button>

                                                {showGovernorateDropdown && (
                                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                                        {governorates && governorates.length > 0 ? (
                                                            governorates.map((governorate) => {
                                                                const isSelected = formData.governorateIds?.includes(governorate.governorateId) || false;
                                                                return (
                                                                    <div
                                                                        key={governorate.governorateId}
                                                                        className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                                                        onClick={() => handleGovernorateToggle(governorate.governorateId)}
                                                                    >
                                                                        {/* Custom checkbox with better visual feedback */}
                                                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${isSelected
                                                                            ? 'bg-blue-500 border-blue-500 text-white'
                                                                            : 'border-gray-300 hover:border-blue-400'
                                                                            }`}>
                                                                            {isSelected && (
                                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <label
                                                                            className={`text-sm font-medium cursor-pointer flex-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'
                                                                                }`}
                                                                        >
                                                                            {governorate.name}
                                                                        </label>
                                                                        {isSelected && (
                                                                            <span className="text-xs text-blue-600 font-medium">✓ Selected</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="p-3 text-sm text-gray-500 text-center">
                                                                {governorates ? 'No governorates available' : 'Loading governorates...'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selected Governorates Display */}
                                            {formData.governorateIds && formData.governorateIds.length > 0 && (
                                                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-blue-800">
                                                            {t('selectedGovernorates').replace('{count}', formData.governorateIds.length.toString())}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setFormData(prev => ({ ...prev, governorateIds: [] }))}
                                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-800 hover:text-white text-xs transition-colors duration-200"
                                                        >
                                                            {t('clearAll')}
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.governorateIds.map((id) => {
                                                            const governorate = governorates.find(g => g.governorateId === id);
                                                            return governorate ? (
                                                                <div
                                                                    key={id}
                                                                    className="flex items-center gap-2 bg-white border border-blue-300 text-blue-800 px-3 py-2 rounded-lg text-sm shadow-sm"
                                                                >
                                                                    <CheckCircle className="h-3 w-3 text-blue-600" />
                                                                    <span className="font-medium">{governorate.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeGovernorate(id)}
                                                                        className="ml-1 hover:bg-red-100 rounded-full p-1 transition-colors"
                                                                        aria-label={`Remove ${governorate.name}`}
                                                                    >
                                                                        <X className="h-3 w-3 text-red-600 hover:text-red-800" />
                                                                    </button>
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
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
                                        {isLoading ? t('creatingUserLoading') : t('createRoleUser').replace('{role}', ROLE_CONFIG[selectedRole].name)}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
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
