import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { optimizeCss } from "carbon-preprocess-svelte";

export default defineConfig({
	plugins: [process.env.NODE_ENV === 'production' ? optimizeCss() : false, sveltekit()]
});
