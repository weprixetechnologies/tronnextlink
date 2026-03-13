import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // Use relative paths for assets
    plugins: [react(), tailwindcss()],
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'https://api-backend-tronnext.duckdns.org',
                changeOrigin: true,
            }
        }
    }
})
