import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Le decimos a Vite que nuestro frontend está en la carpeta "frontend"
  root: 'frontend',
  plugins: [react()],
  server: {
    // Redirigimos todas las llamadas a la API hacia tu servidor backend
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});