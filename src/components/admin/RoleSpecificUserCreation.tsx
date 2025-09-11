import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, UserPlus, Eye, EyeOff, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Governorate interface
interface GovernorateInfo {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

// Role configuration
const ROLE_CONFIG = {
    doctor: {
        name: 'Doctor',
        description: 'Medical staff including doctors and technicians',
        fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty', 'hospitalId'],
        requiresHospital: true,
        requiresDepartment: false,
        autoDepartmentId: 2,
    },
    engineer: {
        name: 'Engineer',
        description: 'Technical and engineering staff',
        fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'specialty', 'governorateIds'],
        requiresHospital: false,
        requiresDepartment: false,
        requiresGovernorates: true,
        autoDepartmentId: 4,
    },
    technician: {
        name: 'Technician',
        description: 'Medical technicians',
        fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'hospitalId'],
        requiresHospital: true,
        requiresDepartment: false,
        autoDepartmentId: 2,
    },
    admin: {
        name: 'Admin',
        description: 'Administrative and management roles',
        fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
        requiresHospital: false,
        requiresDepartment: false,
        autoDepartmentId: 1,
    },
    'finance-manager': {
        name: 'Finance Manager',
        description: 'Financial management and accounting',
        fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
        requiresHospital: false,
        requiresDepartment: false,
        autoDepartmentId: 5,
    },
    'legal-manager': {
        name: 'Legal Manager',
        description: 'Legal affairs and compliance',
        fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
        requiresHospital: false,
        requiresDepartment: false,
        autoDepartmentId: 6,
    },
    salesman: {
        name: 'Salesman',
        description: 'Sales team and customer relations',
        fields: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
        requiresHospital: false,
        requiresDepartment: false,
        autoDepartmentId: 3,
    },
};

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    specialty?: string;
    hospitalId?: string;
    departmentId?: string;
    governorateIds?: number[];
}

const RoleSpecificUserCreation: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { success, error: showError } = useNotificationStore();
    const { setLoading } = useAppStore();

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
    const governorateDropdownRef = useRef<HTMLDivElement>(null);

    // Check permissions
    const { hasRole } = useAuthStore();
    const canCreateUsers = hasRole('SuperAdmin') || hasRole('Admin');

    // Custom password validation function
    const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
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

    // Handle click outside to close governorate dropdown
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
            governorateIds: [],
        });
        setErrors([]);
        setPasswordErrors([]);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setCreatedUser(null);
        setShowGovernorateDropdown(false);

        console.log('Selected role:', role);
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        console.log(`Form field updated - ${field}:`, value);

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

            console.log('Governorate selection updated:', {
                governorateId,
                isSelected,
                previousIds: currentIds,
                newIds
            });

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

            console.log('Removing governorate:', {
                governorateId,
                previousIds: currentIds,
                newIds
            });

            return { ...prev, governorateIds: newIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole || !user?.token) return;

        const config = ROLE_CONFIG[selectedRole];
        const requiredFields = config.fields;

        console.log('=== FORM SUBMISSION ===');
        console.log('Selected Role:', selectedRole);
        console.log('Form Data Before Validation:', formData);

        // Validate form
        const validationErrors = validateForm(formData, requiredFields);
        if (validationErrors.length > 0) {
            console.log('Validation Errors:', validationErrors);
            setErrors(validationErrors);
            return;
        }

        // Custom password strength validation
        const passwordValidation = validatePasswordStrength(formData.password);
        if (!passwordValidation.isValid) {
            console.log('Password Validation Errors:', passwordValidation.errors);
            setErrors(passwordValidation.errors);
            return;
        }

        // Additional password confirmation validation
        if (formData.password !== formData.confirmPassword) {
            console.log('Password confirmation failed');
            setErrors(['Passwords do not match']);
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
                ...(config.requiresHospital && formData.hospitalId && { hospitalId: formData.hospitalId }),
                ...(config.requiresDepartment && formData.departmentId && { departmentId: formData.departmentId }),
                ...(selectedRole === 'doctor' && formData.specialty && { specialty: formData.specialty }),
                ...(selectedRole === 'engineer' && formData.specialty && { specialty: formData.specialty }),
                // Auto-assign department ID for all roles
                ...(selectedRole && { departmentId: getDepartmentIdForRole(selectedRole) }),
                ...(selectedRole === 'engineer' && formData.governorateIds && formData.governorateIds.length > 0 && { governorateIds: formData.governorateIds }),
            };

            console.log('=== API CALL DATA ===');
            console.log('User Data to be sent:', userData);
            console.log('API Token:', user.token ? 'Present' : 'Missing');

            let response: RoleSpecificUserResponse;

            switch (selectedRole) {
                case 'doctor':
                    console.log('Calling createDoctor API...');
                    response = await createDoctor(userData as any, user.token);
                    break;
                case 'engineer':
                    console.log('Calling createEngineer API...');
                    response = await createEngineer(userData as any, user.token);
                    break;
                case 'technician':
                    console.log('Calling createTechnician API...');
                    response = await createTechnician(userData as any, user.token);
                    break;
                case 'admin':
                    console.log('Calling createAdmin API...');
                    response = await createAdmin(userData as any, user.token);
                    break;
                case 'finance-manager':
                    console.log('Calling createFinanceManager API...');
                    response = await createFinanceManager(userData as any, user.token);
                    break;
                case 'legal-manager':
                    console.log('Calling createLegalManager API...');
                    response = await createLegalManager(userData as any, user.token);
                    break;
                case 'salesman':
                    console.log('Calling createSalesman API...');
                    response = await createSalesman(userData as any, user.token);
                    break;
                default:
                    throw new Error('Invalid role selected');
            }

            console.log('=== API RESPONSE ===');
            console.log('API Response:', response);

            setCreatedUser(response);
            success('User Created Successfully', response.message);
        } catch (err: any) {
            console.error('=== API ERROR ===');
            console.error('Error creating user:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });

            const errorMessage = err.message || 'Failed to create user';
            setErrors([errorMessage]);
            showError('Error', errorMessage);
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

    const handleStartOver = () => {
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
    };

    if (!canCreateUsers) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Admin access required</p>
                        <Button onClick={() => navigate('/')} className="w-full mt-4">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    };

    if (createdUser) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">User Created Successfully</h1>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                User Created Successfully
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p><strong>User ID:</strong> {createdUser.data.userId}</p>
                                <p><strong>Name:</strong> {createdUser.data.firstName} {createdUser.data.lastName}</p>
                                <p><strong>Email:</strong> {createdUser.data.email}</p>
                                <p><strong>Role:</strong> {createdUser.data.role}</p>
                                {'specialty' in createdUser.data && (
                                    <p><strong>Specialty:</strong> {createdUser.data.specialty}</p>
                                )}
                                {'hospitalId' in createdUser.data && (
                                    <p><strong>Hospital ID:</strong> {createdUser.data.hospitalId}</p>
                                )}
                                {'departmentId' in createdUser.data && (
                                    <p><strong>Department ID:</strong> {createdUser.data.departmentId}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleStartOver} variant="outline" className="flex-1">
                                    Create Another User
                                </Button>
                                <Button onClick={() => navigate('/admin/users')} className="flex-1">
                                    View All Users
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Create New User</h1>
                        <p className="text-muted-foreground">
                            {selectedRole ? `Create a new ${ROLE_CONFIG[selectedRole].name}` : 'Select a role to create a new user'}
                        </p>
                    </div>
                </div>

                {!selectedRole ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => (
                            <Card
                                key={roleKey}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleRoleSelect(roleKey as RoleSpecificUserRole)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        {config.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm">{config.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Create {ROLE_CONFIG[selectedRole].name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {errors.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <div className="flex">
                                            <AlertCircle className="h-5 w-5 text-red-400" />
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
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
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder="Enter password"
                                                required
                                                className={`pr-10 ${passwordErrors.length > 0 ? 'border-red-500' : ''}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                                            Must be at least 8 characters with uppercase, lowercase, number, and special character
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
                                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                placeholder="Confirm password"
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
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                                            <p className="text-xs text-red-600">Passwords do not match</p>
                                        )}
                                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                            <p className="text-xs text-green-600">Passwords match</p>
                                        )}
                                    </div>

                                    {(selectedRole === 'doctor' || selectedRole === 'engineer') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="specialty">Specialty *</Label>
                                            <Input
                                                id="specialty"
                                                value={formData.specialty}
                                                onChange={(e) => handleInputChange('specialty', e.target.value)}
                                                placeholder={selectedRole === 'doctor' ? "Enter medical specialty" : "Enter engineering specialty"}
                                                required
                                            />
                                        </div>
                                    )}

                                    {ROLE_CONFIG[selectedRole].requiresHospital && (
                                        <div className="space-y-2">
                                            <Label htmlFor="hospitalId">Hospital *</Label>
                                            <Select
                                                value={formData.hospitalId}
                                                onValueChange={(value) => handleInputChange('hospitalId', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a hospital" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {hospitals.map((hospital) => (
                                                        <SelectItem key={hospital.id} value={hospital.id}>
                                                            {hospital.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Department is auto-assigned for all roles */}
                                    <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <Label className="text-sm font-medium text-blue-800">Department Assignment</Label>
                                        <p className="text-xs text-blue-600">
                                            Department will be automatically assigned based on role:
                                            <span className="font-medium ml-1">
                                                {ROLE_CONFIG[selectedRole]?.autoDepartmentId === 1 && 'Admin (ID: 1)'}
                                                {ROLE_CONFIG[selectedRole]?.autoDepartmentId === 2 && 'Medical (ID: 2)'}
                                                {ROLE_CONFIG[selectedRole]?.autoDepartmentId === 3 && 'Sales (ID: 3)'}
                                                {ROLE_CONFIG[selectedRole]?.autoDepartmentId === 4 && 'Engineering (ID: 4)'}
                                                {ROLE_CONFIG[selectedRole]?.autoDepartmentId === 5 && 'Finance (ID: 5)'}
                                                {ROLE_CONFIG[selectedRole]?.autoDepartmentId === 6 && 'Legal (ID: 6)'}
                                            </span>
                                        </p>
                                    </div>

                                    {selectedRole === 'engineer' && (
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Governorates * (Select multiple)</Label>

                                            {/* Multi-select dropdown with better visual feedback */}
                                            <div className="relative" ref={governorateDropdownRef}>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowGovernorateDropdown(!showGovernorateDropdown)}
                                                    className="w-full justify-between text-left"
                                                >
                                                    <span className={formData.governorateIds?.length === 0 ? "text-muted-foreground" : ""}>
                                                        {formData.governorateIds?.length === 0
                                                            ? "Select governorates"
                                                            : `${formData.governorateIds?.length} governorate(s) selected`
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
                                                            Selected Governorates ({formData.governorateIds.length})
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setFormData(prev => ({ ...prev, governorateIds: [] }))}
                                                            className="text-blue-600 hover:text-blue-800 text-xs"
                                                        >
                                                            Clear All
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

                                            {/* Debug info */}
                                            <div className="p-2 bg-gray-100 rounded text-xs">
                                                <p>Debug: Selected IDs: {JSON.stringify(formData.governorateIds || [])}</p>
                                                <p>Total governorates: {governorates.length}</p>
                                            </div>

                                            {/* Show requirement message if no governorates selected */}
                                            {(!formData.governorateIds || formData.governorateIds.length === 0) && (
                                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-sm text-amber-700 flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Please select at least one governorate for the engineer.
                                                    </p>
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
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        {isLoading ? 'Creating User...' : `Create ${ROLE_CONFIG[selectedRole].name}`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default RoleSpecificUserCreation;