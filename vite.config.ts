import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'configure-response-headers',
          configureServer(server) {
            server.middlewares.use((_req, res, next) => {
              res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
              res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
              next();
            });
          },
        },
      ],
      optimizeDeps: {
        exclude: ['@imgly/background-removal'],
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
