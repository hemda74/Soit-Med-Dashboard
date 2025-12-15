/**
 * Generic Form Field Component
 * 
 * This component provides a reusable, type-safe form field that can handle
 * different input types, validation, and styling consistently across the application.
 * It eliminates code duplication and provides a unified interface for all form fields.
 */

import React, { memo, useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PasswordField from './PasswordField';
import ImageUploadField from './ImageUploadField';
import HospitalSelector from './HospitalSelector';
import GovernorateSelector from './GovernorateSelector';
import type { FieldConfig } from '@/config/roleConfig';
import type { FormData } from '@/hooks/useUserCreationForm';
import type { HospitalInfo } from '@/types/roleSpecificUser.types';

interface GovernorateInfo {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

interface GenericFormFieldProps {
    field: FieldConfig;
    value: any;
    onChange: (field: keyof FormData, value: any) => void;
    error?: boolean;
    errorMessage?: string;
    successMessage?: string;
    disabled?: boolean;
    className?: string;
    // Additional props for specific field types
    hospitals?: HospitalInfo[];
    governorates?: GovernorateInfo[];
    selectedGovernorateIds?: number[];
    showGovernorateDropdown?: boolean;
    onToggleGovernorateDropdown?: () => void;
    onGovernorateToggle?: (governorateId: number) => void;
    onRemoveGovernorate?: (governorateId: number) => void;
    onClearAllGovernorates?: () => void;
    governorateDropdownRef?: React.RefObject<HTMLDivElement>;
    imagePreview?: string | null;
    imageError?: string;
    onImageSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage?: () => void;
    showPassword?: boolean;
    onPasswordToggle?: () => void;
    passwordErrors?: string[];
    // Translation function
    t: (key: string) => string;
}

/**
 * Generic Form Field Component
 * 
 * Renders appropriate input component based on field configuration
 * Handles validation, error states, and success states consistently
 */
const GenericFormField: React.FC<GenericFormFieldProps> = memo(({
    field,
    value,
    onChange,
    error = false,
    errorMessage,
    successMessage,
    disabled = false,
    className = '',
    hospitals = [],
    governorates = [],
    selectedGovernorateIds = [],
    showGovernorateDropdown = false,
    onToggleGovernorateDropdown,
    onGovernorateToggle,
    onRemoveGovernorate,
    onClearAllGovernorates,
    governorateDropdownRef,
    imagePreview,
    imageError,
    onImageSelect,
    onRemoveImage,
    showPassword = false,
    onPasswordToggle,
    passwordErrors = [],
    t,
}) => {
    /**
     * Handle input change with proper type conversion
     */
    const handleChange = useCallback((newValue: any) => {
        // Convert value based on field type
        let processedValue = newValue;

        if (field.type === 'number' && typeof newValue === 'string') {
            processedValue = newValue === '' ? '' : parseFloat(newValue);
        }

        onChange(field.key as keyof FormData, processedValue);
    }, [field.key, field.type, onChange]);

    /**
     * Render field label with required indicator
     */
    const renderLabel = () => (
        <Label
            htmlFor={field.key}
            className={`text-sm font-semibold text-foreground flex items-center gap-2 ${className}`}
        >
            {t(field.label)}
            {field.validation?.required && (
                <span className="text-destructive text-lg">*</span>
            )}
            {!field.validation?.required && (
                <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">
                    {t('optional')}
                </span>
            )}
        </Label>
    );

    /**
     * Render error message
     */
    const renderErrorMessage = () => {
        if (!error || !errorMessage) return null;

        return (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200 bg-destructive/5 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">{errorMessage}</span>
            </div>
        );
    };

    /**
     * Render success message
     */
    const renderSuccessMessage = () => {
        if (!successMessage) return null;

        return (
            <div className="flex items-center gap-2 text-sm text-green-600 animate-in slide-in-from-top-1 duration-200 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">{successMessage}</span>
            </div>
        );
    };

    /**
     * Render appropriate input component based on field type
     */
    const renderInput = () => {
        const baseClassName = `h-12 transition-all duration-300 focus:border-primary hover:border-primary/50 rounded-xl ${className}`;
        const errorClassName = error ? 'border-destructive focus:border-destructive' : '';
        const finalClassName = `${baseClassName} ${errorClassName}`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
                return (
                    <Input
                        id={field.key}
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={t(field.placeholder)}
                        className={`${finalClassName} ${error ? 'border-destructive focus:border-destructive' : ''}`}
                        required={field.validation?.required}
                        disabled={disabled}
                    />
                );

            case 'password':
                return (
                    <PasswordField
                        id={field.key}
                        value={value || ''}
                        onChange={handleChange}
                        placeholder={t(field.placeholder)}
                        showPassword={showPassword || false}
                        onToggleVisibility={onPasswordToggle || (() => { })}
                        errors={passwordErrors}
                        label=""
                        required={field.validation?.required}
                        className={finalClassName}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        id={field.key}
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={t(field.placeholder)}
                        className={`${finalClassName} min-h-[100px] resize-none`}
                        rows={3}
                        disabled={disabled}
                    />
                );

            case 'select':
                return (
                    <select
                        id={field.key}
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        className={finalClassName}
                        disabled={disabled}
                    >
                        <option value="">{t(field.placeholder)}</option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.label)}
                            </option>
                        ))}
                    </select>
                );

            case 'number':
                return (
                    <Input
                        id={field.key}
                        type="number"
                        step="0.01"
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={t(field.placeholder)}
                        className={`${finalClassName} ${error ? 'border-destructive focus:border-destructive' : ''}`}
                        required={field.validation?.required}
                        disabled={disabled}
                    />
                );

            case 'file':
                return (
                    <ImageUploadField
                        imagePreview={imagePreview || null}
                        imageError={imageError || ''}
                        onImageSelect={onImageSelect || (() => { })}
                        onRemoveImage={onRemoveImage || (() => { })}
                    />
                );

            case 'multiselect':
                // Special handling for governorate selection
                if (field.key === 'governorateIds') {
                    return (
                        <GovernorateSelector
                            governorates={governorates}
                            selectedGovernorateIds={selectedGovernorateIds}
                            showDropdown={showGovernorateDropdown}
                            onToggleDropdown={onToggleGovernorateDropdown || (() => { })}
                            onGovernorateToggle={onGovernorateToggle || (() => { })}
                            onRemoveGovernorate={onRemoveGovernorate || (() => { })}
                            onClearAll={onClearAllGovernorates || (() => { })}
                            dropdownRef={governorateDropdownRef || { current: null }}
                        />
                    );
                }
                // Add other multiselect implementations as needed
                return null;

            default:
                console.warn(`Unsupported field type: ${field.type}`);
                return null;
        }
    };

    /**
     * Special handling for hospital selection
     */
    if (field.key === 'hospitalId') {
        return (
            <div className="space-y-3">
                {renderLabel()}
                <HospitalSelector
                    hospitals={hospitals}
                    selectedHospitalId={value || ''}
                    onHospitalSelect={(hospitalId) => handleChange(hospitalId)}
                />
                {renderErrorMessage()}
                {renderSuccessMessage()}
            </div>
        );
    }

    /**
     * Special handling for profile image and governorates to ensure 50% width
     */
    if (field.type === 'file' || field.type === 'multiselect') {
        return (
            <div className="space-y-3">
                {renderLabel()}
                {renderInput()}
                {renderErrorMessage()}
                {renderSuccessMessage()}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {renderLabel()}
            {renderInput()}
            {renderErrorMessage()}
            {renderSuccessMessage()}
        </div>
    );
});

GenericFormField.displayName = 'GenericFormField';

export default GenericFormField;
