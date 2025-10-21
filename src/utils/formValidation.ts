/**
 * Generic Form Validation Utilities
 * 
 * This module provides reusable validation functions that can be used across
 * different forms in the application. It centralizes validation logic and
 * provides consistent error handling.
 */

import type { FieldConfig, FieldValidation } from '@/config/roleConfig';
import type { FormData } from '@/hooks/useUserCreationForm';

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Password strength validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
}

/**
 * Generic form validation class
 */
export class FormValidator {
  /**
   * Validate a single field based on its configuration
   */
  static validateField(
    field: FieldConfig,
    value: any,
    t: (key: string) => string
  ): ValidationError | null {
    const validation = field.validation;
    if (!validation) return null;

    // Required field validation
    if (validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return {
        field: field.key,
        message: t('fieldRequired').replace('{field}', t(field.label))
      };
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return {
          field: field.key,
          message: t('fieldMinLength')
            .replace('{field}', t(field.label))
            .replace('{min}', validation.minLength.toString())
        };
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        return {
          field: field.key,
          message: t('fieldMaxLength')
            .replace('{field}', t(field.label))
            .replace('{max}', validation.maxLength.toString())
        };
      }

      // Pattern validation
      if (validation.pattern && !validation.pattern.test(value)) {
        return {
          field: field.key,
          message: t('fieldInvalidFormat').replace('{field}', t(field.label))
        };
      }
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        return {
          field: field.key,
          message: customError
        };
      }
    }

    return null;
  }

  /**
   * Validate entire form based on field configurations
   */
  static validateForm(
    formData: FormData,
    fields: FieldConfig[],
    t: (key: string) => string
  ): ValidationResult {
    const errors: ValidationError[] = [];

    fields.forEach(field => {
      const value = formData[field.key as keyof FormData];
      const error = this.validateField(field, value, t);
      if (error) {
        errors.push(error);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(
    password: string,
    t: (key: string) => string
  ): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Length check (20 points)
    if (password.length >= 8) {
      score += 20;
    } else {
      errors.push(t('passwordMustBeAtLeast8'));
    }

    // Uppercase check (20 points)
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      errors.push(t('passwordMustContainUppercase'));
    }

    // Lowercase check (20 points)
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      errors.push(t('passwordMustContainLowercase'));
    }

    // Number check (20 points)
    if (/\d/.test(password)) {
      score += 20;
    } else {
      errors.push(t('passwordMustContainNumber'));
    }

    // Special character check (20 points)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    } else {
      errors.push(t('passwordMustContainSpecial'));
    }

    return {
      isValid: errors.length === 0,
      errors,
      score
    };
  }

  /**
   * Validate password confirmation
   */
  static validatePasswordConfirmation(
    password: string,
    confirmPassword: string,
    t: (key: string) => string
  ): ValidationError | null {
    if (password !== confirmPassword) {
      return {
        field: 'confirmPassword',
        message: t('passwordsDoNotMatch')
      };
    }
    return null;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(
    file: File | undefined,
    maxSize: number = 5 * 1024 * 1024, // 5MB default
    allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    t: (key: string) => string
  ): ValidationError | null {
    if (!file) return null;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        field: 'profileImage',
        message: t('imageTypeError')
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        field: 'profileImage',
        message: t('imageSizeError')
      };
    }

    return null;
  }

  /**
   * Validate required fields for a specific role
   */
  static validateRequiredFields(
    formData: FormData,
    requiredFields: string[],
    t: (key: string) => string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    requiredFields.forEach(fieldKey => {
      const value = formData[fieldKey as keyof FormData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          field: fieldKey,
          message: t('fieldRequired').replace('{field}', t(fieldKey))
        });
      }
    });

    return errors;
  }

  /**
   * Get field validation rules for a specific field
   */
  static getFieldValidationRules(field: FieldConfig): FieldValidation {
    return field.validation || {};
  }

  /**
   * Check if a field is required
   */
  static isFieldRequired(field: FieldConfig): boolean {
    return field.validation?.required || false;
  }

  /**
   * Get all validation errors for a specific field
   */
  static getFieldErrors(
    field: FieldConfig,
    value: any,
    t: (key: string) => string
  ): string[] {
    const error = this.validateField(field, value, t);
    return error ? [error.message] : [];
  }
}

/**
 * Predefined validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  URL: /^https?:\/\/.+/,
} as const;

/**
 * Common validation error messages (can be overridden by translation function)
 */
export const DEFAULT_VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  MIN_LENGTH: 'Must be at least {min} characters',
  MAX_LENGTH: 'Must be no more than {max} characters',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_FORMAT: 'Invalid format',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  FILE_TOO_LARGE: 'File is too large',
  INVALID_FILE_TYPE: 'Invalid file type',
} as const;





