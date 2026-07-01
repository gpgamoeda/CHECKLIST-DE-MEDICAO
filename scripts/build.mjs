// Build mínimo, sem dependências: gera a pasta `dist/` pronta para deploy
// (ex.: Cloudflare Pages). Hoje o app é estático, então o "build" apenas copia
// os artefatos publicáveis para dist/. Serve de base para o build real (Vite)
// nas próximas sprints — o contrato (comando `build` → saída `dist/`) já fica pronto.
import { cp, mkdir, readFile, rm, writeFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

// Arquivos/pastas da raiz que devem ir para o deploy.
// `src/` contém o CSS e o JS extraídos do monólito na Sprint 0.2.0.
const STATIC_ENTRIES = ['index.html', 'src'];
// Pasta opcional de assets públicos (criada em sprints futuras, se necessário).
const PUBLIC_DIR = 'public';

async function exists(path) {
  try {
    await readdir(path);
    return true;
  } catch {
    return false;
  }
}

async function build() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  for (const entry of STATIC_ENTRIES) {
    await cp(join(ROOT, entry), join(DIST, entry), { recursive: true });
  }

  if (await exists(join(ROOT, PUBLIC_DIR))) {
    await cp(join(ROOT, PUBLIC_DIR), DIST, { recursive: true });
  }

  // Marca simples da versão publicada, útil para conferir o deploy.
  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  await writeFile(join(DIST, 'VERSION.txt'), `${pkg.name} ${pkg.version}\n`, 'utf8');

  console.log(`Build concluído em dist/ (versão ${pkg.version}).`);
}

build().catch((err) => {
  console.error('Falha no build:', err);
  process.exit(1);
});
