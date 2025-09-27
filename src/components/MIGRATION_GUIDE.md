# Component Migration Guide

This guide helps migrate existing components to the new structure.

## Migration Steps

### 1. Identify Component Type

- **Simple UI Component**: Move to `shared/components/`
- **Feature-Specific UI**: Move to `features/[feature]/components/`
- **Complex Component with Logic**: Split into hook + UI component

### 2. Extract Logic to Custom Hook

```typescript
// Before
export const MyComponent = () => {
	const [state, setState] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		// ... logic
	};

	return <div>...</div>;
};

// After
// hooks/useMyComponent.ts
export const useMyComponent = () => {
	const [state, setState] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		// ... logic
	};

	return { state, loading, handleClick };
};

// components/MyComponentUI.tsx
export const MyComponentUI = ({ state, loading, onHandleClick }) => {
	return <div>...</div>;
};

// components/MyComponent.tsx
export const MyComponent = () => {
	const props = useMyComponent();
	return <MyComponentUI {...props} />;
};
```

### 3. Use Shared Components

Replace common patterns with shared components:

```typescript
// Instead of custom loading
<div className="animate-spin...">Loading...</div>

// Use
<LoadingSpinner size="md" text="Loading..." />

// Instead of custom error display
<Card className="border-red-200...">
    <p className="text-red-800">{error}</p>
</Card>

// Use
<ErrorDisplay error={error} onDismiss={onDismiss} />

// Instead of custom empty state
<Card>
    <div className="text-center">
        <Icon className="h-12 w-12..." />
        <h3>No Data</h3>
        <p>Description</p>
    </div>
</Card>

// Use
<EmptyState icon={Icon} title="No Data" description="Description" />
```

### 4. Update Imports

```typescript
// Old imports
import { MyComponent } from '@/components/MyComponent';

// New imports
import { MyComponent } from '@/components/features/[feature]';
import { LoadingSpinner } from '@/components/shared';
```

## Common Patterns to Replace

### Modal State Management

```typescript
// Instead of
const [isOpen, setIsOpen] = useState(false);
const open = () => setIsOpen(true);
const close = () => setIsOpen(false);

// Use
const { isOpen, open, close } = useModal();
```

### Toggle State

```typescript
// Instead of
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(!isOpen);

// Use
const { isOpen, toggle } = useToggle();
```

### Search Functionality

```typescript
// Instead of custom search logic
const [searchTerm, setSearchTerm] = useState('');
const filteredData = data.filter((item) =>
	item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

// Use
const { searchTerm, filteredData, handleSearch } = useSearch({
	data,
	searchFields: ['name', 'description'],
});
```

## File Structure Checklist

- [ ] Create feature directory: `features/[feature]/`
- [ ] Create subdirectories: `components/`, `hooks/`, `types/`
- [ ] Extract logic to custom hook
- [ ] Create UI component
- [ ] Create container component
- [ ] Update index.ts exports
- [ ] Update import statements
- [ ] Test functionality
- [ ] Remove old files

## Benefits After Migration

1. **Better Separation**: Logic and UI are clearly separated
2. **Reusability**: Shared components reduce duplication
3. **Testability**: Hooks and UI can be tested independently
4. **Maintainability**: Changes are easier to make and track
5. **Consistency**: All components follow the same patterns

This guide helps migrate existing components to the new structure.

## Migration Steps

### 1. Identify Component Type

- **Simple UI Component**: Move to `shared/components/`
- **Feature-Specific UI**: Move to `features/[feature]/components/`
- **Complex Component with Logic**: Split into hook + UI component

### 2. Extract Logic to Custom Hook

```typescript
// Before
export const MyComponent = () => {
	const [state, setState] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		// ... logic
	};

	return <div>...</div>;
};

// After
// hooks/useMyComponent.ts
export const useMyComponent = () => {
	const [state, setState] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		// ... logic
	};

	return { state, loading, handleClick };
};

// components/MyComponentUI.tsx
export const MyComponentUI = ({ state, loading, onHandleClick }) => {
	return <div>...</div>;
};

// components/MyComponent.tsx
export const MyComponent = () => {
	const props = useMyComponent();
	return <MyComponentUI {...props} />;
};
```

### 3. Use Shared Components

Replace common patterns with shared components:

```typescript
// Instead of custom loading
<div className="animate-spin...">Loading...</div>

// Use
<LoadingSpinner size="md" text="Loading..." />

// Instead of custom error display
<Card className="border-red-200...">
    <p className="text-red-800">{error}</p>
</Card>

// Use
<ErrorDisplay error={error} onDismiss={onDismiss} />

// Instead of custom empty state
<Card>
    <div className="text-center">
        <Icon className="h-12 w-12..." />
        <h3>No Data</h3>
        <p>Description</p>
    </div>
</Card>

// Use
<EmptyState icon={Icon} title="No Data" description="Description" />
```

### 4. Update Imports

```typescript
// Old imports
import { MyComponent } from '@/components/MyComponent';

// New imports
import { MyComponent } from '@/components/features/[feature]';
import { LoadingSpinner } from '@/components/shared';
```

## Common Patterns to Replace

### Modal State Management

```typescript
// Instead of
const [isOpen, setIsOpen] = useState(false);
const open = () => setIsOpen(true);
const close = () => setIsOpen(false);

// Use
const { isOpen, open, close } = useModal();
```

### Toggle State

```typescript
// Instead of
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(!isOpen);

// Use
const { isOpen, toggle } = useToggle();
```

### Search Functionality

```typescript
// Instead of custom search logic
const [searchTerm, setSearchTerm] = useState('');
const filteredData = data.filter((item) =>
	item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

// Use
const { searchTerm, filteredData, handleSearch } = useSearch({
	data,
	searchFields: ['name', 'description'],
});
```

## File Structure Checklist

- [ ] Create feature directory: `features/[feature]/`
- [ ] Create subdirectories: `components/`, `hooks/`, `types/`
- [ ] Extract logic to custom hook
- [ ] Create UI component
- [ ] Create container component
- [ ] Update index.ts exports
- [ ] Update import statements
- [ ] Test functionality
- [ ] Remove old files

## Benefits After Migration

1. **Better Separation**: Logic and UI are clearly separated
2. **Reusability**: Shared components reduce duplication
3. **Testability**: Hooks and UI can be tested independently
4. **Maintainability**: Changes are easier to make and track
5. **Consistency**: All components follow the same patterns

This guide helps migrate existing components to the new structure.

## Migration Steps

### 1. Identify Component Type

- **Simple UI Component**: Move to `shared/components/`
- **Feature-Specific UI**: Move to `features/[feature]/components/`
- **Complex Component with Logic**: Split into hook + UI component

### 2. Extract Logic to Custom Hook

```typescript
// Before
export const MyComponent = () => {
	const [state, setState] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		// ... logic
	};

	return <div>...</div>;
};

// After
// hooks/useMyComponent.ts
export const useMyComponent = () => {
	const [state, setState] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		// ... logic
	};

	return { state, loading, handleClick };
};

// components/MyComponentUI.tsx
export const MyComponentUI = ({ state, loading, onHandleClick }) => {
	return <div>...</div>;
};

// components/MyComponent.tsx
export const MyComponent = () => {
	const props = useMyComponent();
	return <MyComponentUI {...props} />;
};
```

### 3. Use Shared Components

Replace common patterns with shared components:

```typescript
// Instead of custom loading
<div className="animate-spin...">Loading...</div>

// Use
<LoadingSpinner size="md" text="Loading..." />

// Instead of custom error display
<Card className="border-red-200...">
    <p className="text-red-800">{error}</p>
</Card>

// Use
<ErrorDisplay error={error} onDismiss={onDismiss} />

// Instead of custom empty state
<Card>
    <div className="text-center">
        <Icon className="h-12 w-12..." />
        <h3>No Data</h3>
        <p>Description</p>
    </div>
</Card>

// Use
<EmptyState icon={Icon} title="No Data" description="Description" />
```

### 4. Update Imports

```typescript
// Old imports
import { MyComponent } from '@/components/MyComponent';

// New imports
import { MyComponent } from '@/components/features/[feature]';
import { LoadingSpinner } from '@/components/shared';
```

## Common Patterns to Replace

### Modal State Management

```typescript
// Instead of
const [isOpen, setIsOpen] = useState(false);
const open = () => setIsOpen(true);
const close = () => setIsOpen(false);

// Use
const { isOpen, open, close } = useModal();
```

### Toggle State

```typescript
// Instead of
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(!isOpen);

// Use
const { isOpen, toggle } = useToggle();
```

### Search Functionality

```typescript
// Instead of custom search logic
const [searchTerm, setSearchTerm] = useState('');
const filteredData = data.filter((item) =>
	item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

// Use
const { searchTerm, filteredData, handleSearch } = useSearch({
	data,
	searchFields: ['name', 'description'],
});
```

## File Structure Checklist

- [ ] Create feature directory: `features/[feature]/`
- [ ] Create subdirectories: `components/`, `hooks/`, `types/`
- [ ] Extract logic to custom hook
- [ ] Create UI component
- [ ] Create container component
- [ ] Update index.ts exports
- [ ] Update import statements
- [ ] Test functionality
- [ ] Remove old files

## Benefits After Migration

1. **Better Separation**: Logic and UI are clearly separated
2. **Reusability**: Shared components reduce duplication
3. **Testability**: Hooks and UI can be tested independently
4. **Maintainability**: Changes are easier to make and track
5. **Consistency**: All components follow the same patterns



