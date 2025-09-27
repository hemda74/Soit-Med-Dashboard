import { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export interface FormData {
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
	salesTerritory?: string;
	salesTeam?: string;
	salesTarget?: string;
	managerNotes?: string;
	profileImage?: File;
	imageAltText?: string;
}

export const useUserCreationForm = () => {
	const { t } = useTranslation();

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
		salesTerritory: '',
		salesTeam: '',
		salesTarget: '',
		managerNotes: '',
	});

	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showGovernorateDropdown, setShowGovernorateDropdown] =
		useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageError, setImageError] = useState<string>('');

	const governorateDropdownRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Custom password validation function
	const validatePasswordStrength = (
		password: string
	): { isValid: boolean; errors: string[] } => {
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

	// Image handling functions
	const handleImageSelect = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const validTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
		];
		if (!validTypes.includes(file.type)) {
			setImageError(t('imageTypeError'));
			return;
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024; // 5MB in bytes
		if (file.size > maxSize) {
			setImageError(t('imageSizeError'));
			return;
		}

		// Clear previous errors
		setImageError('');

		// Update form data
		setFormData((prev) => ({ ...prev, profileImage: file }));

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setImagePreview(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveImage = () => {
		setFormData((prev) => ({
			...prev,
			profileImage: undefined,
			imageAltText: '',
		}));
		setImagePreview(null);
		setImageError('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleImageAltTextChange = (value: string) => {
		setFormData((prev) => ({ ...prev, imageAltText: value }));
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear errors when user starts typing
		if (errors.length > 0) {
			setErrors([]);
		}

		// Real-time password validation
		if (field === 'password') {
			const passwordValidation =
				validatePasswordStrength(value);
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

		setFormData((prev) => {
			const currentIds = prev.governorateIds || [];
			const isSelected = currentIds.includes(governorateId);
			let newIds;

			if (isSelected) {
				// Remove if already selected
				newIds = currentIds.filter(
					(id) => id !== governorateId
				);
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
		setFormData((prev) => {
			const currentIds = prev.governorateIds || [];
			const newIds = currentIds.filter(
				(id) => id !== governorateId
			);

			return { ...prev, governorateIds: newIds };
		});
	};

	const handleHospitalSelect = (hospitalId: string) => {
		setFormData((prev) => {
			const updated = { ...prev, hospitalId };
			return updated;
		});

		// Clear errors when user makes selection
		if (errors.length > 0) {
			setErrors([]);
		}
	};

	const resetForm = () => {
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
			profileImage: undefined,
			imageAltText: '',
		});
		setErrors([]);
		setPasswordErrors([]);
		setShowPassword(false);
		setShowConfirmPassword(false);
		setShowGovernorateDropdown(false);
		setImagePreview(null);
		setImageError('');
	};

	return {
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
		fileInputRef,
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
	};
};
