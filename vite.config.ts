import { defineConfig } from 'vite';

// App estático de página única. Entrada: index.html (referencia src/main.ts).
// Build gera dist/ (contrato mantido para o Cloudflare Pages). A pasta archive/
// não é referenciada pelo index.html, então não entra no bundle.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
