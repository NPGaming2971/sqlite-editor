import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({ template: { transformAssetUrls } }),
		quasar({
			autoImportComponentCase: 'pascal',
			sassVariables: 'src/assets/quasar-var.sass'
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	envDir: '.env',
	esbuild: {},
	build: {
		target: 'chrome89'
	},
	base: './'
});
