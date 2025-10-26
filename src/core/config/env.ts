interface ImportMetaEnv {
	readonly MODE?: string;
	readonly DEV?: boolean;
	readonly PROD?: boolean;
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_SIGNALR_URL?: string;
}

const meta = import.meta as { env?: ImportMetaEnv };

export const ENV_CONFIG = {
	MODE: meta.env?.MODE || 'development',
	IS_DEV: meta.env?.DEV || false,
	IS_PROD: meta.env?.PROD || false,
	API_BASE_URL:
		meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api',
	SIGNALR_URL: meta.env?.VITE_SIGNALR_URL || 'http://localhost:3000/hubs',
} as const;

