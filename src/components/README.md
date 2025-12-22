# Components Structure

This directory contains all React components organized by feature and responsibility.

## Structure Overview

```
src/components/
├── ui/                    # Pure UI components (shadcn/ui)
├── features/              # Feature-based components
│   ├── auth/              # Authentication related components
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Feature-specific hooks
│   │   └── types/         # Feature-specific types
│   ├── users/             # User management components
│   ├── sales/             # Sales reports components
│   ├── Admin/             # Admin panel components
│   └── layout/            # Layout components
├── shared/                # Shared components across features
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Shared custom hooks
│   └── types/             # Shared types
└── common/                # Common utilities and components
```

## Design Principles

### 1. Separation of Concerns

- **Logic**: Extracted into custom hooks
- **UI**: Pure presentational components
- **Types**: Feature-specific type definitions

### 2. Feature-Based Organization

Each feature has its own directory with:

- `components/` - UI components
- `hooks/` - Business logic hooks
- `types/` - Type definitions

### 3. Shared Components

Common components used across multiple features are placed in `shared/`.

## Component Patterns

### 1. Container/Presentational Pattern

```typescript
// Container Component (with logic)
export const LoginForm: React.FC = () => {
    const { form, showPassword, isLoading, onSubmit, togglePasswordVisibility, t } = useLoginForm();

    return (
        <LoginFormUI
            form={form}
            showPassword={showPassword}
            isLoading={isLoading}
            onSubmit={onSubmit}
            onTogglePasswordVisibility={togglePasswordVisibility}
            t={t}
        />
    );
};

// Presentational Component (UI only)
export const LoginFormUI: React.FC<LoginFormUIProps> = ({ ... }) => {
    return <div>...</div>;
};
```

### 2. Custom Hooks Pattern

```typescript
// Business logic in custom hook
export const useLoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	// ... other logic

	return {
		form,
		showPassword,
		isLoading,
		onSubmit,
		togglePasswordVisibility,
		t,
	};
};
```

## Usage Examples

### Importing Components

```typescript
// Import from feature
import { LoginForm } from '@/components/features/auth';

// Import shared components
import { LoadingSpinner, EmptyState } from '@/components/shared';

// Import UI components
import { Button } from '@/components/ui/button';
```

### Creating New Components

1. Create the hook in `features/[feature]/hooks/`
2. Create the UI component in `features/[feature]/components/`
3. Create the container component that uses both
4. Export from the feature's index file

## Benefits

1. **Maintainability**: Clear separation makes code easier to maintain
2. **Reusability**: Shared components reduce duplication
3. **Testability**: Logic and UI can be tested separately
4. **Scalability**: Feature-based organization scales well
5. **Developer Experience**: Clear structure makes onboarding easier

## Migration Guide

### Before (Mixed Logic and UI)

```typescript
export const LoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const { login } = useAuthStore();
	// ... logic mixed with UI

	return <div>...</div>;
};
```

### After (Separated Logic and UI)

```typescript
// Hook
export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthStore();
    // ... logic

    return { showPassword, setShowPassword, login, ... };
};

// UI Component
export const LoginFormUI = ({ showPassword, onToggle, ... }) => {
    return <div>...</div>;
};

// Container
export const LoginForm = () => {
    const props = useLoginForm();
    return <LoginFormUI {...props} />;
};
```

## Best Practices

1. **Keep UI components pure**: No business logic, only props
2. **Extract complex logic**: Use custom hooks for reusable logic
3. **Use TypeScript**: Define proper interfaces for all props
4. **Follow naming conventions**:
      - Hooks: `use[FeatureName]`
      - UI Components: `[ComponentName]UI`
      - Container Components: `[ComponentName]`
5. **Document components**: Add JSDoc comments for complex components
6. **Test both layers**: Test hooks and UI components separately

This directory contains all React components organized by feature and responsibility.

## Structure Overview

```
src/components/
├── ui/                    # Pure UI components (shadcn/ui)
├── features/              # Feature-based components
│   ├── auth/              # Authentication related components
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Feature-specific hooks
│   │   └── types/         # Feature-specific types
│   ├── users/             # User management components
│   ├── sales/             # Sales reports components
│   ├── Admin/             # Admin panel components
│   └── layout/            # Layout components
├── shared/                # Shared components across features
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Shared custom hooks
│   └── types/             # Shared types
└── common/                # Common utilities and components
```

## Design Principles

### 1. Separation of Concerns

- **Logic**: Extracted into custom hooks
- **UI**: Pure presentational components
- **Types**: Feature-specific type definitions

### 2. Feature-Based Organization

Each feature has its own directory with:

- `components/` - UI components
- `hooks/` - Business logic hooks
- `types/` - Type definitions

### 3. Shared Components

Common components used across multiple features are placed in `shared/`.

## Component Patterns

### 1. Container/Presentational Pattern

```typescript
// Container Component (with logic)
export const LoginForm: React.FC = () => {
    const { form, showPassword, isLoading, onSubmit, togglePasswordVisibility, t } = useLoginForm();

    return (
        <LoginFormUI
            form={form}
            showPassword={showPassword}
            isLoading={isLoading}
            onSubmit={onSubmit}
            onTogglePasswordVisibility={togglePasswordVisibility}
            t={t}
        />
    );
};

// Presentational Component (UI only)
export const LoginFormUI: React.FC<LoginFormUIProps> = ({ ... }) => {
    return <div>...</div>;
};
```

### 2. Custom Hooks Pattern

```typescript
// Business logic in custom hook
export const useLoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	// ... other logic

	return {
		form,
		showPassword,
		isLoading,
		onSubmit,
		togglePasswordVisibility,
		t,
	};
};
```

## Usage Examples

### Importing Components

```typescript
// Import from feature
import { LoginForm } from '@/components/features/auth';

// Import shared components
import { LoadingSpinner, EmptyState } from '@/components/shared';

// Import UI components
import { Button } from '@/components/ui/button';
```

### Creating New Components

1. Create the hook in `features/[feature]/hooks/`
2. Create the UI component in `features/[feature]/components/`
3. Create the container component that uses both
4. Export from the feature's index file

## Benefits

1. **Maintainability**: Clear separation makes code easier to maintain
2. **Reusability**: Shared components reduce duplication
3. **Testability**: Logic and UI can be tested separately
4. **Scalability**: Feature-based organization scales well
5. **Developer Experience**: Clear structure makes onboarding easier

## Migration Guide

### Before (Mixed Logic and UI)

```typescript
export const LoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const { login } = useAuthStore();
	// ... logic mixed with UI

	return <div>...</div>;
};
```

### After (Separated Logic and UI)

```typescript
// Hook
export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthStore();
    // ... logic

    return { showPassword, setShowPassword, login, ... };
};

// UI Component
export const LoginFormUI = ({ showPassword, onToggle, ... }) => {
    return <div>...</div>;
};

// Container
export const LoginForm = () => {
    const props = useLoginForm();
    return <LoginFormUI {...props} />;
};
```

## Best Practices

1. **Keep UI components pure**: No business logic, only props
2. **Extract complex logic**: Use custom hooks for reusable logic
3. **Use TypeScript**: Define proper interfaces for all props
4. **Follow naming conventions**:
      - Hooks: `use[FeatureName]`
      - UI Components: `[ComponentName]UI`
      - Container Components: `[ComponentName]`
5. **Document components**: Add JSDoc comments for complex components
6. **Test both layers**: Test hooks and UI components separately

This directory contains all React components organized by feature and responsibility.

## Structure Overview

```
src/components/
├── ui/                    # Pure UI components (shadcn/ui)
├── features/              # Feature-based components
│   ├── auth/              # Authentication related components
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Feature-specific hooks
│   │   └── types/         # Feature-specific types
│   ├── users/             # User management components
│   ├── sales/             # Sales reports components
│   ├── Admin/             # Admin panel components
│   └── layout/            # Layout components
├── shared/                # Shared components across features
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Shared custom hooks
│   └── types/             # Shared types
└── common/                # Common utilities and components
```

## Design Principles

### 1. Separation of Concerns

- **Logic**: Extracted into custom hooks
- **UI**: Pure presentational components
- **Types**: Feature-specific type definitions

### 2. Feature-Based Organization

Each feature has its own directory with:

- `components/` - UI components
- `hooks/` - Business logic hooks
- `types/` - Type definitions

### 3. Shared Components

Common components used across multiple features are placed in `shared/`.

## Component Patterns

### 1. Container/Presentational Pattern

```typescript
// Container Component (with logic)
export const LoginForm: React.FC = () => {
    const { form, showPassword, isLoading, onSubmit, togglePasswordVisibility, t } = useLoginForm();

    return (
        <LoginFormUI
            form={form}
            showPassword={showPassword}
            isLoading={isLoading}
            onSubmit={onSubmit}
            onTogglePasswordVisibility={togglePasswordVisibility}
            t={t}
        />
    );
};

// Presentational Component (UI only)
export const LoginFormUI: React.FC<LoginFormUIProps> = ({ ... }) => {
    return <div>...</div>;
};
```

### 2. Custom Hooks Pattern

```typescript
// Business logic in custom hook
export const useLoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	// ... other logic

	return {
		form,
		showPassword,
		isLoading,
		onSubmit,
		togglePasswordVisibility,
		t,
	};
};
```

## Usage Examples

### Importing Components

```typescript
// Import from feature
import { LoginForm } from '@/components/features/auth';

// Import shared components
import { LoadingSpinner, EmptyState } from '@/components/shared';

// Import UI components
import { Button } from '@/components/ui/button';
```

### Creating New Components

1. Create the hook in `features/[feature]/hooks/`
2. Create the UI component in `features/[feature]/components/`
3. Create the container component that uses both
4. Export from the feature's index file

## Benefits

1. **Maintainability**: Clear separation makes code easier to maintain
2. **Reusability**: Shared components reduce duplication
3. **Testability**: Logic and UI can be tested separately
4. **Scalability**: Feature-based organization scales well
5. **Developer Experience**: Clear structure makes onboarding easier

## Migration Guide

### Before (Mixed Logic and UI)

```typescript
export const LoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const { login } = useAuthStore();
	// ... logic mixed with UI

	return <div>...</div>;
};
```

### After (Separated Logic and UI)

```typescript
// Hook
export const useLoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthStore();
    // ... logic

    return { showPassword, setShowPassword, login, ... };
};

// UI Component
export const LoginFormUI = ({ showPassword, onToggle, ... }) => {
    return <div>...</div>;
};

// Container
export const LoginForm = () => {
    const props = useLoginForm();
    return <LoginFormUI {...props} />;
};
```

## Best Practices

1. **Keep UI components pure**: No business logic, only props
2. **Extract complex logic**: Use custom hooks for reusable logic
3. **Use TypeScript**: Define proper interfaces for all props
4. **Follow naming conventions**:
      - Hooks: `use[FeatureName]`
      - UI Components: `[ComponentName]UI`
      - Container Components: `[ComponentName]`
5. **Document components**: Add JSDoc comments for complex components
6. **Test both layers**: Test hooks and UI components separately
