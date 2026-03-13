import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // Atualizado para HTTPS e porta 5001 para evitar Redirect HTTP->HTTPS
        target: 'http://20.226.201.157', 
        changeOrigin: true,
        secure: false, // Permite certificados HTTPS auto-assinados (comum em dev/localhost)
      },
    },
  },
})

 