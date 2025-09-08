import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type {
    UserRole,
    RoleObject,
    UserCreationFormState,
    UserCreationResponse,
    ValidationError,
    ApiError
} from '@/types/userCreation.types';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useApiStore } from '@/stores/apiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { RoleSelector } from './RoleSelector';
import { DynamicForm } from './DynamicForm';
import { EngineerForm } from './EngineerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    getAvailableRoles,
    getRoleFields,
    getReferenceDataForRole,
    createUser,
    validateForm,
    transformFormData,
    createRoleSlug,
} from '@/services/userCreationApi';

const INITIAL_STATE: UserCreationFormState = {
    selectedRole: null,
    formData: {},
    errors: [],
    isLoading: false,
    step: 'role-selection',
    roleFields: null,
    referenceData: {
        hospitals: [],
        governorates: [],
        departments: [],
    },
};

export default function CreateUser() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { success, error: showError } = useNotificationStore();
    const { setLoading, setError, clearError } = useApiStore();
    const { t } = useTranslation();

    const [state, setState] = useState<UserCreationFormState>(INITIAL_STATE);
    const [availableRoles, setAvailableRoles] = useState<RoleObject[]>([]);
    const [createdUser, setCreatedUser] = useState<UserCreationResponse | null>(null);

    // Check if user has permission to create users
    const { hasRole } = useAuthStore();
    const canCreateUsers = hasRole('SuperAdmin') || hasRole('Admin');

    const loadAvailableRoles = useCallback(async () => {
        console.log('loadAvailableRoles called');
        console.log('User token:', user?.token ? 'Token exists' : 'No token');

        if (!user?.token) {
            console.log('No user token available');
            return;
        }

        setState(prev => ({ ...prev, isLoading: true }));
        setLoading('loadRoles', true);
        clearError('loadRoles');

        try {
            console.log('🚀 Calling getAvailableRoles with token');
            const roleObjects = await getAvailableRoles(user.token);

            console.log('📦 API Response - Available Role Objects:', roleObjects);
            console.log('📊 Response type in component:', typeof roleObjects);
            console.log('📏 Number of roles received:', Array.isArray(roleObjects) ? roleObjects.length : 'Not an array');

            if (Array.isArray(roleObjects)) {
                console.log('📝 Role names only:', roleObjects.map(role => role.name));
                console.log('🎯 Setting availableRoles state with:', roleObjects);
                setAvailableRoles(roleObjects);
                console.log('✅ State updated successfully');
            } else {
                console.error('❌ roleObjects is not an array:', roleObjects);
                setAvailableRoles([]);
            }
        } catch (err) {
            console.error('Error loading roles:', err);
            const apiError = err as ApiError;
            setError('loadRoles', apiError.message);
            showError(t('failedToLoadRoles'), apiError.message);
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
            setLoading('loadRoles', false);
        }
    }, [user?.token, setLoading, clearError, setError]);

    useEffect(() => {
        if (!canCreateUsers) {
            showError(t('accessDenied'), t('adminAccessRequired'));
            navigate('/');
            return;
        }

        loadAvailableRoles();
        // Only run once when component mounts and when canCreateUsers changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canCreateUsers]);

    const handleRoleSelect = async (roleObject: RoleObject) => {
        if (!user?.token) return;

        const roleSlug = createRoleSlug(roleObject.name);
        console.log('🎯 Role selected:', roleObject.name);
        console.log('🔗 Generated slug:', roleSlug);
        console.log('📝 Full role object:', roleObject);

        setState(prev => ({
            ...prev,
            selectedRole: roleObject.name as UserRole,
            isLoading: true,
            step: 'form-filling',
            errors: []
        }));

        // For Engineer role, use custom form - no need to load role fields
        if (roleObject.name === 'Engineer') {
            console.log('🔧 Using custom Engineer form');
            setState(prev => ({
                ...prev,
                isLoading: false,
            }));
            return;
        }

        setLoading('loadRoleFields', true);
        clearError('loadRoleFields');

        try {
            // Get role-specific fields for other roles
            const roleFields = await getRoleFields(roleObject.name as UserRole, user.token);

            // Get reference data
            const referenceData = await getReferenceDataForRole(roleFields, user.token);

            setState(prev => ({
                ...prev,
                roleFields,
                referenceData,
                isLoading: false,
            }));

        } catch (err) {
            const apiError = err as ApiError;
            setError('loadRoleFields', apiError.message);
            showError(t('failedToLoadRoleFields'), apiError.message);
            setState(prev => ({
                ...prev,
                isLoading: false,
                step: 'role-selection',
                selectedRole: null,
            }));
        } finally {
            setLoading('loadRoleFields', false);
        }
    };

    const handleFormSubmit = async (formData: Record<string, any>) => {
        if (!user?.token || !state.roleFields || !state.selectedRole) return;

        setState(prev => ({ ...prev, isLoading: true, step: 'submitting', errors: [] }));
        setLoading('createUser', true);
        clearError('createUser');

        try {
            // Validate form data
            const allFields = [...state.roleFields.baseFields, ...state.roleFields.roleSpecificFields];
            const validationErrors = validateForm(formData, allFields);

            if (validationErrors.length > 0) {
                setState(prev => ({
                    ...prev,
                    errors: validationErrors,
                    isLoading: false,
                    step: 'form-filling',
                }));
                return;
            }

            // Transform form data
            const userData = transformFormData(formData, allFields);

            // Create user
            const response = await createUser(state.selectedRole, userData, user.token);

            // Success
            setCreatedUser(response);
            setState(prev => ({ ...prev, step: 'success', isLoading: false }));
            success(t('userCreatedSuccessfully'), response.message);

        } catch (err) {
            const apiError = err as ApiError;

            // Handle validation errors from API
            if (apiError.errors) {
                const validationErrors: ValidationError[] = Object.entries(apiError.errors).flatMap(
                    ([field, messages]) => messages.map(message => ({ field, message }))
                );
                setState(prev => ({
                    ...prev,
                    errors: validationErrors,
                    step: 'form-filling',
                    isLoading: false,
                }));
            } else {
                setState(prev => ({ ...prev, step: 'error', isLoading: false }));
                setError('createUser', apiError.message);
                showError(t('failedToCreateUser'), apiError.message);
            }
        } finally {
            setLoading('createUser', false);
        }
    };

    const handleBack = () => {
        if (state.step === 'form-filling') {
            setState(prev => ({
                ...prev,
                step: 'role-selection',
                selectedRole: null,
                roleFields: null,
                formData: {},
                errors: [],
            }));
        } else {
            navigate('/admin/users'); // Navigate back to user management
        }
    };

    const handleStartOver = () => {
        setState(INITIAL_STATE);
        setCreatedUser(null);
        loadAvailableRoles();
    };

    if (!canCreateUsers) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            {t('accessDenied')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('adminAccessRequired')}</p>
                        <Button onClick={() => navigate('/')} className="w-full mt-4">
                            {t('goBack')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with navigation */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('back')}
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('createNewUser')}</h1>
                    <p className="text-muted-foreground">{t('createNewUserDescription')}</p>
                </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${state.step === 'role-selection' ? 'text-primary' :
                        ['form-filling', 'submitting', 'success'].includes(state.step) ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${state.step === 'role-selection' ? 'border-primary bg-primary text-primary-foreground' :
                            ['form-filling', 'submitting', 'success'].includes(state.step) ? 'border-green-600 bg-green-600 text-white' :
                                'border-muted-foreground'
                            }`}>
                            1
                        </div>
                        <span className="ml-2 text-sm font-medium">{t('selectRole')}</span>
                    </div>

                    <div className={`h-px w-12 ${['form-filling', 'submitting', 'success'].includes(state.step) ? 'bg-green-600' : 'bg-muted-foreground'
                        }`} />

                    <div className={`flex items-center ${state.step === 'form-filling' ? 'text-primary' :
                        ['submitting', 'success'].includes(state.step) ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${state.step === 'form-filling' ? 'border-primary bg-primary text-primary-foreground' :
                            ['submitting', 'success'].includes(state.step) ? 'border-green-600 bg-green-600 text-white' :
                                'border-muted-foreground'
                            }`}>
                            2
                        </div>
                        <span className="ml-2 text-sm font-medium">{t('fillDetails')}</span>
                    </div>

                    <div className={`h-px w-12 ${state.step === 'success' ? 'bg-green-600' : 'bg-muted-foreground'
                        }`} />

                    <div className={`flex items-center ${state.step === 'success' ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${state.step === 'success' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'
                            }`}>
                            3
                        </div>
                        <span className="ml-2 text-sm font-medium">{t('complete')}</span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto">
                {state.step === 'role-selection' && (
                    <RoleSelector
                        availableRoles={availableRoles}
                        onRoleSelect={handleRoleSelect}
                        isLoading={state.isLoading}
                    />
                )}

                {state.step === 'form-filling' && state.selectedRole === 'Engineer' && (
                    <EngineerForm
                        onBack={handleBack}
                        onSuccess={(response) => {
                            setCreatedUser(response);
                            setState(prev => ({ ...prev, step: 'success', isLoading: false }));
                        }}
                    />
                )}

                {state.step === 'form-filling' && state.roleFields && state.selectedRole && state.selectedRole !== 'Engineer' && (
                    <DynamicForm
                        role={state.selectedRole}
                        baseFields={state.roleFields.baseFields}
                        roleSpecificFields={state.roleFields.roleSpecificFields}
                        referenceData={state.referenceData}
                        onSubmit={handleFormSubmit}
                        onBack={handleBack}
                        isLoading={state.isLoading}
                        errors={state.errors}
                    />
                )}

                {state.step === 'submitting' && (
                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle className="text-center">{t('creatingUser')}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">{t('pleaseWait')}</p>
                        </CardContent>
                    </Card>
                )}

                {state.step === 'success' && createdUser && (
                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                {t('userCreatedSuccessfully')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p><strong>{t('username')}:</strong> {createdUser.userName}</p>
                                <p><strong>{t('email')}:</strong> {createdUser.email}</p>
                                <p><strong>{t('role')}:</strong> {createdUser.role}</p>
                                {createdUser.departmentName && (
                                    <p><strong>{t('department')}:</strong> {createdUser.departmentName}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleStartOver} variant="outline" className="flex-1">
                                    {t('createAnother')}
                                </Button>
                                <Button onClick={() => navigate('/admin/users')} className="flex-1">
                                    {t('viewUsers')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {state.step === 'error' && (
                    <Card className="max-w-md mx-auto border-destructive">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="h-5 w-5" />
                                {t('creationFailed')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">{t('userCreationError')}</p>
                            <div className="flex gap-2">
                                <Button onClick={handleBack} variant="outline" className="flex-1">
                                    {t('tryAgain')}
                                </Button>
                                <Button onClick={() => navigate('/admin/users')} className="flex-1">
                                    {t('goBack')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
