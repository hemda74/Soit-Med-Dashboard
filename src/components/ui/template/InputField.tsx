import type React from "react";
import type { FC } from "react";

interface InputProps {
    type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
    id?: string;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    min?: string;
    max?: string;
    step?: number;
    disabled?: boolean;
    success?: boolean;
    error?: boolean;
    hint?: string;
}

const Input: FC<InputProps> = ({
    type = "text",
    id,
    name,
    placeholder,
    value,
    onChange,
    className = "",
    min,
    max,
    step,
    disabled = false,
    success = false,
    error = false,
    hint,
}) => {
    let inputClasses = ` h-11 w-full rounded-lg appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 text-black dark:text-black dark:placeholder:text-gray-500 ${className}`;

    if (disabled) {
        inputClasses += ` text-gray-500 border border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 opacity-40`;
    } else if (error) {
        inputClasses += `  border-l-4 border-l-red-500 border-r border-b border-t border-red-200 focus:border-l-red-600 focus:border-r-red-300 focus:border-b-red-300 focus:border-t-red-300 focus:ring-red-500/10 text-black dark:text-black dark:border-red-200 dark:focus:border-l-red-600 dark:focus:border-r-red-400 dark:focus:border-b-red-400 dark:focus:border-t-red-400`;
    } else if (success) {
        inputClasses += `  border border-success-500 focus:border-success-300 focus:ring-success-500/20 text-black dark:text-black dark:border-success-500 dark:focus:border-success-800`;
    } else {
        inputClasses += ` bg-transparent text-black border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-black dark:focus:border-brand-800`;
    }

    return (
        <div className="relative">
            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={inputClasses}
            />

            {hint && (
                <p
                    className={`mt-1.5 text-xs ${error
                        ? "text-error-500"
                        : success
                            ? "text-success-500"
                            : "text-gray-500"
                        }`}
                >
                    {hint}
                </p>
            )}
        </div>
    );
};

export default Input;

