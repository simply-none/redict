import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/redict/',
  plugins: [
    vue(),
  ],
  
  build: {
    rollupOptions: {
      // output: {
      //   manualChunks: (id) => {
      //     console.log(id, 'id')
      //   }
      // }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0'
  }
})
