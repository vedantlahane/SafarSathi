import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  define: {
    // Defines 'global' as 'window' for libraries that need it (like sockjs-client)
    global: 'window', 
  },

})
