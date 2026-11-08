import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const adapter = process.env.VERCEL ? adapterVercel() : adapterNode();

export default defineConfig({
  plugins: [tailwindcss(), sveltekit({ adapter })],
  server: { port: 5173, strictPort: true }
});
