/**
 * Time constants for stale time and debounce delays
 */
export const STALE_TIME = {
	SHORT: 5 * 60 * 1000, // 5 minutes
	MEDIUM: 10 * 60 * 1000, // 10 minutes
	LONG: 30 * 60 * 1000, // 30 minutes
	VERY_SHORT: 30 * 1000, // 30 seconds
} as const;

export const DEBOUNCE_DELAY = {
	SEARCH: 500, // milliseconds
	FILTER: 300,
} as const;

