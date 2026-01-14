import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        mobile: 'mobile.html',
      }
    }
  },
  plugins: [ mkcert() ],

  server: {
    port: 3000,
    proxy: {
      '/peerjs': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // Importante para WebSocket
        rewrite: (path) => path
      }
    }
  }
})
