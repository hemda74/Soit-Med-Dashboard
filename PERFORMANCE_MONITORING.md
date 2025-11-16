# Performance Monitoring Guide

This project includes comprehensive performance monitoring to track and optimize application performance.

## Features

- **Web Vitals Monitoring**: Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
- **Component Performance**: Measures React component render times
- **API Performance**: Tracks API call durations
- **Custom Metrics**: Record custom performance metrics
- **Performance Dashboard**: Development-only performance monitor component

## Setup

Performance monitoring is automatically initialized when the app starts. No additional setup required.

## Usage

### Measuring Component Performance

```typescript
import { usePerformance } from '@/hooks/usePerformance';

function MyComponent() {
  usePerformance('MyComponent'); // Automatically tracks render time
  
  return <div>...</div>;
}
```

### Measuring API Calls

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

### Measuring Custom Functions

```typescript
import { performanceMonitor } from '@/utils/performance';

const result = await performanceMonitor.measureFunction(
  'dataProcessing',
  async () => {
    // Your function here
    return processData();
  }
);
```

### Recording Custom Metrics

```typescript
import { performanceMonitor } from '@/utils/performance';

performanceMonitor.recordMetric(
  'custom_operation',
  150, // duration in ms
  'good' // rating: 'good' | 'needs-improvement' | 'poor'
);
```

## Performance Monitor Component

In development mode, you can add the PerformanceMonitor component to see real-time metrics:

```typescript
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

function App() {
  return (
    <>
      {/* Your app */}
      <PerformanceMonitor /> {/* Shows in dev mode only */}
    </>
  );
}
```

## Web Vitals Thresholds

- **LCP (Largest Contentful Paint)**: 
  - Good: < 2.5s
  - Needs Improvement: 2.5s - 4s
  - Poor: > 4s

- **FID (First Input Delay)**:
  - Good: < 100ms
  - Needs Improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS (Cumulative Layout Shift)**:
  - Good: < 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25

- **FCP (First Contentful Paint)**:
  - Good: < 1.8s
  - Needs Improvement: 1.8s - 3s
  - Poor: > 3s

- **TTFB (Time to First Byte)**:
  - Good: < 800ms
  - Needs Improvement: 800ms - 1.8s
  - Poor: > 1.8s

- **INP (Interaction to Next Paint)**:
  - Good: < 200ms
  - Needs Improvement: 200ms - 500ms
  - Poor: > 500ms

## Backend Integration

Performance metrics are automatically sent to the backend in production (if `VITE_ENABLE_PERFORMANCE_LOGGING=true`).

### Backend Endpoint

```
POST /api/Performance/metric
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "LCP",
  "value": 2500,
  "rating": "good",
  "timestamp": 1234567890,
  "url": "https://example.com/page",
  "userAgent": "..."
}
```

## Environment Variables

- `VITE_ENABLE_PERFORMANCE_LOGGING`: Set to `"true"` to enable backend logging (default: disabled)

## Best Practices

1. **Measure critical paths**: Focus on user-facing operations
2. **Set appropriate thresholds**: Adjust thresholds based on your app's requirements
3. **Monitor trends**: Track metrics over time to identify regressions
4. **Use in production**: Enable backend logging to track real user performance
5. **Don't over-measure**: Only measure what matters

## React Profiler Integration

The app uses React Profiler to automatically track component render times. Slow renders (>16ms) are automatically logged in production.

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

