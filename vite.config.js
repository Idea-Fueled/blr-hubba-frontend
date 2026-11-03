import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import fs from 'node:fs';
import path from 'node:path';

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexPath = path.join(distDir, 'index.html');
      const fallbackPath = path.join(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, fallbackPath);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), spaFallbackPlugin()],
    define: {
      'process.env.REACT_APP_RAZORPAY_KEY_ID': JSON.stringify(env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_TJBNRm6AQQSCwm'),
    }
  };
});
