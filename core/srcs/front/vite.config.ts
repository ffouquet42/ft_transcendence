import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem'))
    },
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'wss'
    },
    watch: {
      usePolling: true
    },
    proxy: {
  '/api': {
    target: 'https://localhost:3000',
    changeOrigin: true,
    secure: false,
    rewrite: path => path.replace(/^\/api/, '')
  },
  '/avatars': {
    target: 'https://localhost:3000',
    changeOrigin: true,
    secure: false
  }
}


  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/front_srcs'
    }
  }
}); 