# Testing Guide

This project uses **Vitest** for unit and integration testing, along with **React Testing Library** for component testing.

## Setup

Install dependencies:
```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

## Writing Tests

### Component Tests

Example component test (`src/components/__tests__/Button.test.tsx`):

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Store Tests

Example store test (`src/stores/__tests__/authStore.test.ts`):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initializes with no user', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });
});
```

## Test Structure

```
src/
├── components/
│   ├── __tests__/          # Component tests
│   └── Button.tsx
├── stores/
│   ├── __tests__/          # Store tests
│   └── authStore.ts
└── test/
    └── setup.ts            # Test setup file
```

## Best Practices

1. **Test user behavior**, not implementation details
2. **Use `screen.getByRole`** for accessible queries
3. **Mock external dependencies** (API calls, services)
4. **Keep tests isolated** - each test should be independent
5. **Use descriptive test names** that explain what is being tested

## Coverage

Coverage reports are generated in the `coverage/` directory. Aim for:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

