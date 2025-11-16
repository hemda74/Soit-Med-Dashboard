import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		proxy: {
			// Proxy static file requests to backend to avoid CORS issues
			'/products': {
				target: 'http://localhost:5117',
				changeOrigin: true,
				secure: false,
			},
			'/images': {
				target: 'http://localhost:5117',
				changeOrigin: true,
				secure: false,
			},
			'/offers': {
				target: 'http://localhost:5117',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
