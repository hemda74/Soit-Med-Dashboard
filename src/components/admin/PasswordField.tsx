import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

interface PasswordFieldProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
    errors: string[];
    label: string;
    required?: boolean;
    className?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
    id,
    value,
    onChange,
    placeholder,
    showPassword,
    onToggleVisibility,
    errors,
    label,
    required = false,
    className = ''
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label} {required && '*'}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className={`pr-10 ${errors.length > 0 ? 'border-red-500' : ''} ${className}`}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary hover:text-white transition-colors duration-200"
                    onClick={onToggleVisibility}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>
            </div>
            {id === 'password' && (
                <p className="text-xs text-muted-foreground">
                    {t('passwordRequirements')}
                </p>
            )}
            {errors.length > 0 && (
                <div className="text-xs text-red-600">
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PasswordField;

