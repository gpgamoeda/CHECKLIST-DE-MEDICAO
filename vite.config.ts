import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// App de página única (React + TS). Entrada: index.html (referencia src/main.tsx).
// Build gera dist/ (contrato mantido para o Cloudflare Pages). A pasta archive/
// não é referenciada pelo index.html, então não entra no bundle.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  // Vitest roda apenas os testes unitários/de comportamento em tests/.
  // Os testes e2e (e2e/**) são do Playwright — não do Vitest.
  test: {
    include: ['tests/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
