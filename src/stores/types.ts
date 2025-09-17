// Comprehensive TypeScript types for all Zustand stores

// Base store interface
export interface BaseStore {
	isLoading?: boolean;
	error?: string | null;
	lastUpdated?: number;
}

// Store action types
export type StoreAction<T = any> = {
	type: string;
	payload?: T;
	timestamp: number;
};

// Store middleware types
export type StoreMiddleware<T> = (
	config: (set: any, get: any, api: any) => T
) => (set: any, get: any, api: any) => T;

// Persistence configuration
export interface PersistConfig<T> {
	name: string;
	partialize?: (state: T) => Partial<T>;
	version?: number;
	migrate?: (persistedState: any, version: number) => T;
	merge?: (persistedState: any, currentState: T) => T;
}

// Devtools configuration
export interface DevtoolsConfig {
	name: string;
	enabled?: boolean;
	serialize?: boolean;
	actionSanitizer?: (action: any) => any;
	stateSanitizer?: (state: any) => any;
}

// Store selectors
export type StoreSelector<T, R> = (state: T) => R;

// Store listener types
export type StoreListener<T> = (state: T, previousState: T) => void;

// Store subscription types
export type StoreSubscription = () => void;

// Common store patterns
export interface AsyncAction<T = any> {
	loading: boolean;
	error: string | null;
	data: T | null;
	execute: (...args: any[]) => Promise<void>;
	reset: () => void;
}

// Store state status
export type StoreStatus = 'idle' | 'loading' | 'success' | 'error';

// Store action creators
export interface ActionCreators<T> {
	[key: string]: (...args: any[]) => Partial<T> | Promise<Partial<T>>;
}

// Store computed values
export type ComputedValue<T, R> = (state: T) => R;

// Store validation
export interface StoreValidator<T> {
	validate: (state: T) => boolean;
	errors: string[];
}

// Store hydration
export interface HydrationState {
	hasHydrated: boolean;
	hydrationError: Error | null;
}

// Store reset functionality
export interface Resettable {
	reset: () => void;
	resetToDefaults: () => void;
}

// Store undo/redo functionality
export interface UndoRedo<T> {
	history: T[];
	currentIndex: number;
	canUndo: boolean;
	canRedo: boolean;
	undo: () => void;
	redo: () => void;
	clearHistory: () => void;
}

// Store caching
export interface CacheConfig {
	ttl?: number; // Time to live in milliseconds
	maxSize?: number;
	strategy?: 'lru' | 'fifo' | 'ttl';
}

// Store optimistic updates
export interface OptimisticUpdate<T> {
	id: string;
	type: string;
	payload: T;
	rollback: () => void;
	commit: () => void;
}

// Store batch updates
export interface BatchUpdate<T> {
	updates: Array<(state: T) => Partial<T>>;
	execute: () => void;
	clear: () => void;
}

// Store event system
export type StoreEvent<T = any> = {
	type: string;
	payload: T;
	timestamp: number;
	source: string;
};

export type StoreEventHandler<T = any> = (event: StoreEvent<T>) => void;

export interface EventEmitter {
	on: <T>(eventType: string, handler: StoreEventHandler<T>) => () => void;
	off: <T>(eventType: string, handler: StoreEventHandler<T>) => void;
	emit: <T>(eventType: string, payload: T) => void;
	clear: () => void;
}

// Store metrics and analytics
export interface StoreMetrics {
	actionCount: Record<string, number>;
	lastActionTime: Record<string, number>;
	averageActionTime: Record<string, number>;
	errorCount: number;
	totalActions: number;
}

// Store debugging information
export interface StoreDebugInfo {
	name: string;
	version: string;
	createdAt: number;
	lastAction: string | null;
	stateSize: number;
	subscriptionCount: number;
	metrics: StoreMetrics;
}

// Global store registry
export interface StoreRegistry {
	stores: Map<string, any>;
	register: (name: string, store: any) => void;
	unregister: (name: string) => void;
	get: <T>(name: string) => T | undefined;
	getAll: () => Record<string, any>;
	clear: () => void;
}

// Store factory
export interface StoreFactory<T> {
	create: (config: any) => T;
	createWithMiddleware: (
		config: any,
		middleware: StoreMiddleware<T>[]
	) => T;
	createPersistent: (config: any, persistConfig: PersistConfig<T>) => T;
}
