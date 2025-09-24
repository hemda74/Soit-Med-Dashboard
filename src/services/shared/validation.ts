// Shared validation utilities

// Password validation - updated to match backend requirements (min 6 chars, max 100 chars)
export const validatePassword = (
	password: string
): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (password.length < 6) {
		errors.push('Password must be at least 6 characters long');
	}

	if (password.length > 100) {
		errors.push('Password must be at most 100 characters long');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

// Email validation
export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Form validation helper
export const validateForm = (
	formData: Record<string, any>,
	requiredFields: string[]
): string[] => {
	const errors: string[] = [];

	requiredFields.forEach((field) => {
		if (
			!formData[field] ||
			(typeof formData[field] === 'string' &&
				formData[field].trim() === '')
		) {
			// Special handling for hospitalId to provide better error message
			if (field === 'hospitalId') {
				errors.push('Please select a hospital');
			} else {
				errors.push(`${field} is required`);
			}
		}
	});

	if (formData.email && !validateEmail(formData.email)) {
		errors.push('Please enter a valid email address');
	}

	if (formData.password) {
		const passwordValidation = validatePassword(formData.password);
		if (!passwordValidation.isValid) {
			errors.push(...passwordValidation.errors);
		}
	}

	if (
		formData.confirmPassword &&
		formData.password !== formData.confirmPassword
	) {
		errors.push('Passwords do not match');
	}

	return errors;
};
