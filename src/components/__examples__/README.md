# Performance Monitoring Examples

This directory contains example usage of performance monitoring hooks and utilities.

## Quick Start

### Track Component Performance

```typescript
import { usePerformance } from '@/hooks/usePerformance';

function MyComponent() {
  usePerformance('MyComponent');
  // Component automatically tracks render time
}
```

### Track API Calls

```typescript
import { useApiPerformance } from '@/hooks/usePerformance';

function MyComponent() {
  const { measureApiCall } = useApiPerformance();
  
  const fetchData = async () => {
    return measureApiCall('users', async () => {
      return await api.getUsers();
    });
  };
}
```

See `PerformanceExample.tsx` for more examples.

