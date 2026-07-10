import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss' // Tells Vite to look for your postcss setup

export default defineConfig({
  plugins: [react()],
})