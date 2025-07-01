import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // server: {
  //   proxy: {
  //     '/api/finance' : 'http://localhost:8080/',
  //   }
  // },

    server: {
    proxy: {
      '/api/finance' : 'https://personal-finance-assistant-ai-agent-smoky.vercel.app',
    }
  },

  plugins: [
    react(),
    tailwindcss(),
  ],
  
})
