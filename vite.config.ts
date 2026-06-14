import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	build: {
		target: 'es2015',
		cssTarget: 'chrome61',
	},
	server: {
		host: '127.0.0.1',
		port: 5174,
		strictPort: true,
		hmr: {
			host: '127.0.0.1',
			port: 5174,
		},
	},
});
