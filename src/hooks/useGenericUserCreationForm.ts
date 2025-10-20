/**
 * Generic User Creation Form Hook
 *
 * This hook provides a unified, type-safe interface for managing user creation forms
 * across all roles. It eliminates redundancy by centralizing form state management,
 * validation, and API interactions in a single, reusable hook.
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FormValidator } from '@/utils/formValidation';
import {
	createUser,
	validateUserData,
} from '@/services/roleSpecific/genericUserCreationApi';
import type {
	RoleSpecificUserRole,
	RoleSpecificUserRequest,
} from '@/types/roleSpecificUser.types';
import type { FieldConfig } from '@/config/roleConfig';

/**
 * Form state interface
 */
export interface FormState {
	formData: RoleSpecificUserRequest;
	isLoading: boolean;
	errors: string[];
	fieldErrors: Record<string, string[]>;
	passwordErrors: string[];
	showPassword: boolean;
	showConfirmPassword: boolean;
	showGovernorateDropdown: boolean;
	imagePreview: string | null;
	imageError: string;
}

/**
 * Form actions interface
 */
export interface FormActions {
	// Data manipulation
	setFormData: (data: RoleSpecificUserRequest) => void;
	updateField: (field: string, value: any) => void;
	resetForm: () => void;

	// UI state management
	setIsLoading: (loading: boolean) => void;
	setErrors: (errors: string[]) => void;
	clearErrors: () => void;
	setFieldError: (field: string, error: string) => void;
	clearFieldError: (field: string) => void;

	// Password visibility
	togglePasswordVisibility: () => void;
	toggleConfirmPasswordVisibility: () => void;

	// Image handling
	handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleRemoveImage: () => void;
	handleImageAltTextChange: (value: string) => void;

	// Governorate handling
	toggleGovernorateDropdown: () => void;
	handleGovernorateToggle: (governorateId: number) => void;
	removeGovernorate: (governorateId: number) => void;
	clearAllGovernorates: () => void;

	// Hospital handling
	handleHospitalSelect: (hospitalId: string) => void;

	// Department handling
	handleDepartmentChange: (department: string) => void;

	// Form submission
	submitForm: (
		role: RoleSpecificUserRole,
		token: string
	) => Promise<{ success: boolean; error?: string }>;

	// Validation
	validateField: (field: FieldConfig) => string[];
	validateForm: (role: RoleSpecificUserRole) => {
		isValid: boolean;
		errors: string[];
	};
}

/**
 * Hook return type
 */
export interface UseGenericUserCreationFormReturn
	extends FormState,
		FormActions {
	// Refs
	governorateDropdownRef: React.RefObject<HTMLDivElement>;
	fileInputRef: React.RefObject<HTMLInputElement>;

	// Utility functions
	hasFieldError: (field: string) => boolean;
	getFieldValue: (field: keyof RoleSpecificUserRequest) => any;
}

/**
 * Generic User Creation Form Hook
 *
 * Provides a unified interface for managing user creation forms across all roles.
 * Handles form state, validation, and API interactions consistently.
 */
export const useGenericUserCreationForm =
	(): UseGenericUserCreationFormReturn => {
		const { t } = useTranslation();

		// Form data state
		const [formData, setFormData] = useState<any>({
			email: '',
			password: '',
			confirmPassword: '',
			firstName: '',
			lastName: '',
			phoneNumber: '',
			specialty: '',
			hospitalId: '',
			departmentId: 0,
			department: '',
			governorateIds: [],
			salesTerritory: '',
			salesTeam: '',
			salesTarget: '',
			managerNotes: '',
			maintenanceSpecialty: '',
			certification: '',
			jobTitle: '',
			technicalSkills: '',
			personalMail: '',
			supportSpecialization: '',
			supportLevel: '',
			notes: '',
			profileImage: undefined,
			altText: '',
		});

		// UI state
		const [isLoading, setIsLoading] = useState(false);
		const [errors, setErrors] = useState<string[]>([]);
		const [fieldErrors, setFieldErrors] = useState<
			Record<string, string[]>
		>({});
		const [passwordErrors, setPasswordErrors] = useState<string[]>(
			[]
		);
		const [showPassword, setShowPassword] = useState(false);
		const [showConfirmPassword, setShowConfirmPassword] =
			useState(false);
		const [showGovernorateDropdown, setShowGovernorateDropdown] =
			useState(false);
		const [imagePreview, setImagePreview] = useState<string | null>(
			null
		);
		const [imageError, setImageError] = useState<string>('');

		// Refs
		const governorateDropdownRef = useRef<HTMLDivElement>(null);
		const fileInputRef = useRef<HTMLInputElement>(null);

		/**
		 * Update a specific field in the form data
		 */
		const updateField = useCallback(
			(field: string, value: any) => {
				setFormData((prev: any) => ({
					...prev,
					[field]: value,
				}));

				// Clear field errors when user starts typing
				if (fieldErrors[field]) {
					setFieldErrors((prev) => {
						const newErrors = { ...prev };
						delete newErrors[field];
						return newErrors;
					});
				}

				// Clear general errors when user starts typing
				if (errors.length > 0) {
					setErrors([]);
				}

				// Real-time password validation
				if (field === 'password') {
					const passwordValidation =
						FormValidator.validatePasswordStrength(
							value,
							t as (
								key: string
							) => string
						);
					setPasswordErrors(
						passwordValidation.errors
					);
				} else if (field === 'confirmPassword') {
					// Clear password errors when user starts typing confirm password
					if (passwordErrors.length > 0) {
						setPasswordErrors([]);
					}
				}
			},
			[fieldErrors, errors, passwordErrors, t]
		);

		/**
		 * Clear all errors
		 */
		const clearErrors = useCallback(() => {
			setErrors([]);
			setFieldErrors({});
			setPasswordErrors([]);
			setImageError('');
		}, []);

		/**
		 * Set field-specific error
		 */
		const setFieldError = useCallback(
			(field: string, error: string) => {
				setFieldErrors((prev) => ({
					...prev,
					[field]: [error],
				}));
			},
			[]
		);

		/**
		 * Clear field-specific error
		 */
		const clearFieldError = useCallback((field: string) => {
			setFieldErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}, []);

		/**
		 * Toggle password visibility
		 */
		const togglePasswordVisibility = useCallback(() => {
			setShowPassword((prev) => !prev);
		}, []);

		const toggleConfirmPasswordVisibility = useCallback(() => {
			setShowConfirmPassword((prev) => !prev);
		}, []);

		/**
		 * Handle image selection
		 */
		const handleImageSelect = useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				const file = event.target.files?.[0];
				if (!file) return;

				// Validate file
				const validation =
					FormValidator.validateFileUpload(
						file,
						5 * 1024 * 1024,
						[
							'image/jpeg',
							'image/jpg',
							'image/png',
							'image/gif',
						],
						t as (key: string) => string
					);

				if (validation) {
					setImageError(validation.message);
					return;
				}

				// Clear previous errors
				setImageError('');
				updateField('profileImage', file);

				// Create preview
				const reader = new FileReader();
				reader.onload = (e) => {
					setImagePreview(
						e.target?.result as string
					);
				};
				reader.readAsDataURL(file);
			},
			[updateField, t]
		);

		/**
		 * Handle image removal
		 */
		const handleRemoveImage = useCallback(() => {
			updateField('profileImage', undefined);
			updateField('altText', '');
			setImagePreview(null);
			setImageError('');
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}, [updateField]);

		/**
		 * Handle image alt text change
		 */
		const handleImageAltTextChange = useCallback(
			(value: string) => {
				updateField('altText', value);
			},
			[updateField]
		);

		/**
		 * Toggle governorate dropdown
		 */
		const toggleGovernorateDropdown = useCallback(() => {
			setShowGovernorateDropdown((prev) => !prev);
		}, []);

		/**
		 * Handle governorate toggle
		 */
		const handleGovernorateToggle = useCallback(
			(governorateId: number) => {
				if (!governorateId || isNaN(governorateId)) {
					console.error(
						'Invalid governorate ID:',
						governorateId
					);
					return;
				}

				setFormData((prev: any) => {
					const currentIds =
						(prev as any).governorateIds ||
						[];
					const isSelected =
						currentIds.includes(
							governorateId
						);
					const newIds = isSelected
						? currentIds.filter(
								(id: any) =>
									id !==
									governorateId
						  )
						: [
								...currentIds,
								governorateId,
						  ];

					return {
						...prev,
						governorateIds: newIds,
					};
				});

				// Clear errors when user makes selection
				if (errors.length > 0) {
					setErrors([]);
				}
			},
			[errors]
		);

		/**
		 * Remove specific governorate
		 */
		const removeGovernorate = useCallback(
			(governorateId: number) => {
				setFormData((prev: any) => ({
					...prev,
					governorateIds: (
						(prev as any).governorateIds ||
						[]
					).filter(
						(id: any) =>
							id !== governorateId
					),
				}));
			},
			[]
		);

		/**
		 * Clear all governorates
		 */
		const clearAllGovernorates = useCallback(() => {
			setFormData((prev: any) => ({
				...prev,
				governorateIds: [],
			}));
		}, []);

		/**
		 * Handle hospital selection
		 */
		const handleHospitalSelect = useCallback(
			(hospitalId: string) => {
				updateField('hospitalId', hospitalId);
			},
			[updateField]
		);

		/**
		 * Handle department change
		 */
		const handleDepartmentChange = useCallback(
			(department: string) => {
				updateField('department', department);
			},
			[updateField]
		);

		/**
		 * Validate a specific field
		 */
		const validateField = useCallback(
			(field: FieldConfig): string[] => {
				const value =
					formData[
						field.key as keyof RoleSpecificUserRequest
					];
				return FormValidator.getFieldErrors(
					field,
					value,
					t as (key: string) => string
				);
			},
			[formData, t]
		);

		/**
		 * Validate entire form
		 */
		const validateForm = useCallback(
			(
				role: RoleSpecificUserRole
			): { isValid: boolean; errors: string[] } => {
				// Validate using the generic API validation
				const validation = validateUserData(
					role,
					formData
				);

				// Additional password confirmation validation
				if (
					formData.password !==
					(formData as any).confirmPassword
				) {
					validation.errors.push(
						t('passwordsDoNotMatch')
					);
				}

				return validation;
			},
			[formData, t]
		);

		/**
		 * Submit form
		 */
		const submitForm = useCallback(
			async (
				role: RoleSpecificUserRole,
				token: string
			): Promise<{ success: boolean; error?: string }> => {
				setIsLoading(true);
				clearErrors();

				try {
					// Validate form before submission
					const validation = validateForm(role);
					if (!validation.isValid) {
						setErrors(validation.errors);
						return {
							success: false,
							error: validation.errors.join(
								', '
							),
						};
					}

					// Submit to API
					const result = await createUser(
						role,
						formData,
						token
					);

					if (result.success) {
						return { success: true };
					} else {
						setErrors([
							result.error ||
								'Failed to create user',
						]);
						return {
							success: false,
							error: result.error,
						};
					}
				} catch (error: any) {
					const errorMessage =
						error.message ||
						'An unexpected error occurred';
					setErrors([errorMessage]);
					return {
						success: false,
						error: errorMessage,
					};
				} finally {
					setIsLoading(false);
				}
			},
			[formData, validateForm, clearErrors]
		);

		/**
		 * Reset form to initial state
		 */
		const resetForm = useCallback(() => {
			setFormData({
				email: '',
				password: '',
				confirmPassword: '',
				firstName: '',
				lastName: '',
				phoneNumber: '',
				specialty: '',
				hospitalId: '',
				departmentId: 0,
				department: '',
				governorateIds: [],
				salesTerritory: '',
				salesTeam: '',
				salesTarget: '',
				managerNotes: '',
				maintenanceSpecialty: '',
				certification: '',
				jobTitle: '',
				technicalSkills: '',
				personalMail: '',
				supportSpecialization: '',
				supportLevel: '',
				notes: '',
				profileImage: undefined,
				altText: '',
			});
			clearErrors();
			setShowPassword(false);
			setShowConfirmPassword(false);
			setShowGovernorateDropdown(false);
			setImagePreview(null);
		}, [clearErrors]);

		/**
		 * Check if a field has an error
		 */
		const hasFieldError = useCallback(
			(field: string): boolean => {
				return (
					!!fieldErrors[field] ||
					errors.some((error) =>
						error
							.toLowerCase()
							.includes(
								field.toLowerCase()
							)
					)
				);
			},
			[fieldErrors, errors]
		);

		/**
		 * Get field value
		 */
		const getFieldValue = useCallback(
			(field: keyof RoleSpecificUserRequest): any => {
				return formData[field];
			},
			[formData]
		);

		// Memoized return object to prevent unnecessary re-renders
		return useMemo(
			() => ({
				// State
				formData,
				isLoading,
				errors,
				fieldErrors,
				passwordErrors,
				showPassword,
				showConfirmPassword,
				showGovernorateDropdown,
				imagePreview,
				imageError,

				// Refs
				governorateDropdownRef,
				fileInputRef,

				// Actions
				setFormData,
				updateField,
				resetForm,
				setIsLoading,
				setErrors,
				clearErrors,
				setFieldError,
				clearFieldError,
				togglePasswordVisibility,
				toggleConfirmPasswordVisibility,
				handleImageSelect,
				handleRemoveImage,
				handleImageAltTextChange,
				toggleGovernorateDropdown,
				handleGovernorateToggle,
				removeGovernorate,
				clearAllGovernorates,
				handleHospitalSelect,
				handleDepartmentChange,
				submitForm,
				validateField,
				validateForm,

				// Utilities
				hasFieldError,
				getFieldValue,
			}),
			[
				formData,
				isLoading,
				errors,
				fieldErrors,
				passwordErrors,
				showPassword,
				showConfirmPassword,
				showGovernorateDropdown,
				imagePreview,
				imageError,
				updateField,
				clearErrors,
				setFieldError,
				clearFieldError,
				togglePasswordVisibility,
				toggleConfirmPasswordVisibility,
				handleImageSelect,
				handleRemoveImage,
				handleImageAltTextChange,
				toggleGovernorateDropdown,
				handleGovernorateToggle,
				removeGovernorate,
				clearAllGovernorates,
				handleHospitalSelect,
				handleDepartmentChange,
				submitForm,
				validateField,
				validateForm,
				hasFieldError,
				getFieldValue,
			]
		);
	};
