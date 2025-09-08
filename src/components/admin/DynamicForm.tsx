import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Info } from 'lucide-react';
import type { FormField as UserFormField, ValidationError, UserRole } from '@/types/userCreation.types';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Note: Using native select for now - can be replaced with custom select component later
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

interface DynamicFormProps {
    role: UserRole;
    baseFields: UserFormField[];
    roleSpecificFields: UserFormField[];
    referenceData: {
        hospitals: Array<{ id: string; name: string }>;
        governorates: Array<{ governorateId: number; name: string; createdAt: string; isActive: boolean; engineerCount: number }>;
        departments: Array<{ id: number; name: string }>;
    };
    onSubmit: (data: Record<string, any>) => void;
    onBack: () => void;
    isLoading?: boolean;
    errors?: ValidationError[];
}

// Create dynamic Zod schema based on fields
const createFormSchema = (fields: UserFormField[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
        let fieldSchema: z.ZodTypeAny;

        switch (field.type) {
            case 'email':
                fieldSchema = z.string().email('Invalid email address');
                break;
            case 'password':
                fieldSchema = z.string().min(6, 'Password must be at least 6 characters');
                if (field.validation?.pattern) {
                    fieldSchema = (fieldSchema as z.ZodString).regex(
                        new RegExp(field.validation.pattern),
                        'Password does not meet requirements'
                    );
                }
                break;
            case 'number':
                fieldSchema = z.coerce.number();
                if (field.validation?.min !== undefined) {
                    fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min);
                }
                if (field.validation?.max !== undefined) {
                    fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max);
                }
                break;
            case 'multiselect':
                fieldSchema = z.array(z.union([z.string(), z.number()]));
                break;
            case 'boolean':
                fieldSchema = z.boolean();
                break;
            default:
                fieldSchema = z.string();
                if (field.validation?.minLength) {
                    fieldSchema = (fieldSchema as z.ZodString).min(field.validation.minLength);
                }
                if (field.validation?.maxLength) {
                    fieldSchema = (fieldSchema as z.ZodString).max(field.validation.maxLength);
                }
        }

        if (!field.required) {
            fieldSchema = fieldSchema.optional();
        }

        schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
};

export function DynamicForm({
    role,
    baseFields,
    roleSpecificFields,
    referenceData,
    onSubmit,
    onBack,
    isLoading,
    errors,
}: DynamicFormProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = React.useState<Record<string, boolean>>({});

    const allFields = [...baseFields, ...roleSpecificFields];
    const formSchema = createFormSchema(allFields);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: allFields.reduce((acc, field) => {
            acc[field.name] = field.type === 'multiselect' ? [] : '';
            return acc;
        }, {} as Record<string, any>),
    });

    const handleSubmit = (data: Record<string, any>) => {
        onSubmit(data);
    };

    const togglePasswordVisibility = (fieldName: string) => {
        setShowPassword(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const renderField = (field: UserFormField) => {
        const getOptions = () => {
            // Handle predefined options
            if (field.options) {
                return field.options;
            }

            // Handle dynamic options based on field name
            switch (field.name) {
                case 'hospitalId':
                    return referenceData.hospitals.map(h => ({ value: h.id, label: h.name }));
                case 'governorateIds':
                    return referenceData.governorates.map(g => ({ value: g.governorateId, label: g.name }));
                case 'departmentId':
                    return referenceData.departments.map(d => ({ value: d.id, label: d.name }));
                default:
                    return [];
            }
        };

        return (
            <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-2">
                            {field.label}
                            {field.required && <span className="text-destructive">*</span>}
                        </FormLabel>

                        <FormControl>
                            {field.type === 'password' ? (
                                <div className="relative">
                                    <Input
                                        type={showPassword[field.name] ? 'text' : 'password'}
                                        placeholder={field.placeholder}
                                        {...formField}
                                        value={(formField.value as string) || ''}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => togglePasswordVisibility(field.name)}
                                    >
                                        {showPassword[field.name] ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            ) : field.type === 'select' || getOptions().length > 0 ? (
                                <select
                                    {...formField}
                                    value={(formField.value as string) || ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">
                                        {field.placeholder || `Select ${field.label}`}
                                    </option>
                                    {getOptions().map((option) => (
                                        <option key={option.value} value={option.value.toString()}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === 'multiselect' ? (
                                <div className="space-y-2">
                                    {getOptions().map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`${field.name}-${option.value}`}
                                                checked={Array.isArray(formField.value) && formField.value.includes(option.value)}
                                                onChange={(e) => {
                                                    const currentValues = Array.isArray(formField.value) ? formField.value : [];
                                                    if (e.target.checked) {
                                                        formField.onChange([...currentValues, option.value]);
                                                    } else {
                                                        formField.onChange(
                                                            currentValues.filter((v: any) => v !== option.value)
                                                        );
                                                    }
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={`${field.name}-${option.value}`}>
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    placeholder={field.placeholder}
                                    {...formField}
                                    value={(formField.value as string) || ''}
                                />
                            )}
                        </FormControl>

                        {field.validation && (
                            <FormDescription className="flex items-center gap-1 text-xs">
                                <Info className="h-3 w-3" />
                                {field.type === 'password' && 'Must be at least 6 characters'}
                                {field.type === 'string' && field.validation.minLength &&
                                    `Minimum ${field.validation.minLength} characters`}
                                {field.type === 'number' && field.validation.min !== undefined &&
                                    `Minimum value: ${field.validation.min}`}
                            </FormDescription>
                        )}

                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                    {t('createUser')} - {role}
                </h2>
                <p className="text-muted-foreground mt-2">
                    {t('fillUserDetails')}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Base Fields */}
                    {baseFields.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('basicInformation')}</CardTitle>
                                <CardDescription>{t('basicInformationDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {baseFields.map(renderField)}
                            </CardContent>
                        </Card>
                    )}

                    {/* Role-Specific Fields */}
                    {roleSpecificFields.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {t('roleSpecificInformation')} - {role}
                                </CardTitle>
                                <CardDescription>
                                    {t('roleSpecificInformationDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {roleSpecificFields.map(renderField)}
                            </CardContent>
                        </Card>
                    )}

                    {/* Display API errors */}
                    {errors && errors.length > 0 && (
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive text-base">
                                    {t('validationErrors')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index} className="text-sm text-destructive">
                                            <strong>{error.field}:</strong> {error.message}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={isLoading}
                        >
                            {t('back')}
                        </Button>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                    {t('creating')}
                                </>
                            ) : (
                                t('createUser')
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
