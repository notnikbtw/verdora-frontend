import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const productionBase =
    process.env.VITE_BASE_PATH ||
    (repoName ? `/${repoName}/` : '/verdora-frontend/');

  return {
    base: mode === 'production' ? productionBase : '/',
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@api': path.resolve(__dirname, './src/api'),
        '@fixtures': path.resolve(__dirname, './src/fixtures'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
  };
});
