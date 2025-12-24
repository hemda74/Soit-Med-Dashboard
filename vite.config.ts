import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Vendor chunks
					if (id.includes('node_modules')) {
						if (
							id.includes('react') ||
							id.includes(
								'react-dom'
							) ||
							id.includes(
								'react-router'
							)
						) {
							return 'react-vendor';
						}
						if (id.includes('@radix-ui')) {
							return 'ui-vendor';
						}
						if (
							id.includes(
								'recharts'
							) ||
							id.includes('chart.js')
						) {
							return 'chart-vendor';
						}
						// Other vendor libraries
						return 'vendor';
					}
					// Feature-based code splitting
					if (id.includes('/dashboards/')) {
						if (
							id.includes(
								'SalesManager'
							) ||
							id.includes(
								'SalesSupport'
							)
						) {
							return 'sales-dashboard';
						}
						if (id.includes('SuperAdmin')) {
							return 'Admin-dashboard';
						}
						if (
							id.includes(
								'Maintenance'
							)
						) {
							return 'maintenance-dashboard';
						}
					}
				},
			},
		},
		chunkSizeWarningLimit: 1000,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		// Allow the dev server to be reached from other devices on the LAN
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			// Proxy static file requests to backend to avoid CORS issues
			// Uses VITE_API_BASE_URL from .env file, falls back to localhost
			'/products': {
				target:
					process.env.VITE_API_BASE_URL ||
					'http://10.10.9.108:5117',
				changeOrigin: true,
				secure: false,
			},
			'/images': {
				target:
					process.env.VITE_API_BASE_URL ||
					'http://10.10.9.108:5117',
				changeOrigin: true,
				secure: false,
			},
			'/offers': {
				target:
					process.env.VITE_API_BASE_URL ||
					'http://10.10.9.108:5117',
				changeOrigin: true,
				secure: false,
			},
			'/uploads': {
				target:
					process.env.VITE_API_BASE_URL ||
					'http://10.10.9.108:5117',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
