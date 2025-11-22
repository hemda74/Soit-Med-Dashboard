// Performance monitoring utilities for dashboard

export interface PerformanceMetric {
	name: string;
	value: number;
	rating: 'good' | 'needs-improvement' | 'poor';
	timestamp: number;
	url?: string;
	userAgent?: string;
}

export interface WebVitals {
	// Core Web Vitals
	lcp?: number; // Largest Contentful Paint
	fid?: number; // First Input Delay
	cls?: number; // Cumulative Layout Shift
	// Other metrics
	fcp?: number; // First Contentful Paint
	ttfb?: number; // Time to First Byte
	inp?: number; // Interaction to Next Paint
}

class PerformanceMonitor {
	private metrics: PerformanceMetric[] = [];
	private maxMetrics = 100; // Keep last 100 metrics

	/**
	 * Record a performance metric
	 */
	recordMetric(
		name: string,
		value: number,
		rating: 'good' | 'needs-improvement' | 'poor' = 'good'
	): void {
		const metric: PerformanceMetric = {
			name,
			value,
			rating,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		};

		this.metrics.push(metric);

		// Keep only last N metrics
		if (this.metrics.length > this.maxMetrics) {
			this.metrics.shift();
		}

		// Send to backend (optional)
		this.sendMetricToBackend(metric);
	}

	/**
	 * Measure function execution time
	 */
	async measureFunction<T>(
		name: string,
		fn: () => Promise<T> | T
	): Promise<T> {
		const start = performance.now();
		try {
			const result = await fn();
			const duration = performance.now() - start;
			this.recordMetric(
				name,
				duration,
				this.getRating(duration, 1000)
			);
			return result;
		} catch (error) {
			const duration = performance.now() - start;
			this.recordMetric(`${name}_error`, duration, 'poor');
			throw error;
		}
	}

	/**
	 * Measure API call performance
	 */
	async measureApiCall<T>(
		endpoint: string,
		apiCall: () => Promise<T>
	): Promise<T> {
		const start = performance.now();
		try {
			const result = await apiCall();
			const duration = performance.now() - start;
			const rating = this.getRating(duration, 2000); // 2s threshold for API calls
			this.recordMetric(`api_${endpoint}`, duration, rating);
			return result;
		} catch (error) {
			const duration = performance.now() - start;
			this.recordMetric(
				`api_${endpoint}_error`,
				duration,
				'poor'
			);
			throw error;
		}
	}

	/**
	 * Measure component render time
	 */
	measureComponentRender(
		componentName: string,
		renderTime: number
	): void {
		const rating = this.getRating(renderTime, 16); // 16ms = 60fps threshold
		this.recordMetric(
			`render_${componentName}`,
			renderTime,
			rating
		);
	}

	/**
	 * Get all metrics
	 */
	getMetrics(): PerformanceMetric[] {
		return [...this.metrics];
	}

	/**
	 * Get metrics by name
	 */
	getMetricsByName(name: string): PerformanceMetric[] {
		return this.metrics.filter((m) => m.name === name);
	}

	/**
	 * Get average metric value
	 */
	getAverageMetric(name: string): number {
		const metrics = this.getMetricsByName(name);
		if (metrics.length === 0) return 0;
		const sum = metrics.reduce((acc, m) => acc + m.value, 0);
		return sum / metrics.length;
	}

	/**
	 * Clear all metrics
	 */
	clearMetrics(): void {
		this.metrics = [];
	}

	/**
	 * Get rating based on threshold
	 */
	private getRating(
		value: number,
		threshold: number
	): 'good' | 'needs-improvement' | 'poor' {
		if (value < threshold * 0.75) return 'good';
		if (value < threshold * 1.5) return 'needs-improvement';
		return 'poor';
	}

	/**
	 * Send metric to backend (optional - implement based on your backend)
	 */
	private async sendMetricToBackend(
		metric: PerformanceMetric
	): Promise<void> {
		// Only send in production or if explicitly enabled
		if (
			import.meta.env.PROD &&
			import.meta.env.VITE_ENABLE_PERFORMANCE_LOGGING ===
				'true'
		) {
			try {
				const { getApiBaseUrl } = await import(
					'@/utils/apiConfig'
				);
				const apiUrl = getApiBaseUrl();
				await fetch(
					`${apiUrl}/api/Performance/metric`,
					{
						method: 'POST',
						headers: {
							'Content-Type':
								'application/json',
						},
						body: JSON.stringify(metric),
						keepalive: true, // Send even if page is unloading
					}
				);
			} catch (error) {
				// Silently fail - don't break the app
			}
		}
	}
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(): void {
	if (typeof window === 'undefined') return;

	import('web-vitals').then(
		({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
			onCLS((metric) => {
				const rating =
					metric.value < 0.1
						? 'good'
						: metric.value < 0.25
						? 'needs-improvement'
						: 'poor';
				performanceMonitor.recordMetric(
					'CLS',
					metric.value,
					rating
				);
			});

			onFID((metric) => {
				const rating =
					metric.value < 100
						? 'good'
						: metric.value < 300
						? 'needs-improvement'
						: 'poor';
				performanceMonitor.recordMetric(
					'FID',
					metric.value,
					rating
				);
			});

			onFCP((metric) => {
				const rating =
					metric.value < 1800
						? 'good'
						: metric.value < 3000
						? 'needs-improvement'
						: 'poor';
				performanceMonitor.recordMetric(
					'FCP',
					metric.value,
					rating
				);
			});

			onLCP((metric) => {
				const rating =
					metric.value < 2500
						? 'good'
						: metric.value < 4000
						? 'needs-improvement'
						: 'poor';
				performanceMonitor.recordMetric(
					'LCP',
					metric.value,
					rating
				);
			});

			onTTFB((metric) => {
				const rating =
					metric.value < 800
						? 'good'
						: metric.value < 1800
						? 'needs-improvement'
						: 'poor';
				performanceMonitor.recordMetric(
					'TTFB',
					metric.value,
					rating
				);
			});

			onINP((metric) => {
				const rating =
					metric.value < 200
						? 'good'
						: metric.value < 500
						? 'needs-improvement'
						: 'poor';
				performanceMonitor.recordMetric(
					'INP',
					metric.value,
					rating
				);
			});
		}
	);
}

/**
 * React Profiler callback for component performance
 */
export function onRenderCallback(
	id: string,
	phase: 'mount' | 'update' | 'nested-update',
	actualDuration: number,
	baseDuration: number,
	startTime: number,
	commitTime: number
): void {
	if (import.meta.env.DEV) {
		console.log('Component render:', {
			id,
			phase,
			actualDuration: `${actualDuration.toFixed(2)}ms`,
			baseDuration: `${baseDuration.toFixed(2)}ms`,
		});
	}

	// Only track slow renders in production
	if (import.meta.env.PROD && actualDuration > 16) {
		performanceMonitor.measureComponentRender(id, actualDuration);
	}
}
