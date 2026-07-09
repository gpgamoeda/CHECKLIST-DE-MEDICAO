# Roadmap

Plano de evolução por releases pequenas. Cada release é uma sprint curta, em branch
própria, com PR revisável e `npm run validate` verde antes do merge. Datas não são
fixas; a ordem e o tamanho dos passos importam mais que o calendário.

O princípio geral: **mudanças pequenas, revisáveis e reversíveis, preservando o
comportamento a cada passo.** Nada de reescrever tudo de uma vez.

---

## ✅ 0.6.4 — Ambientes nomeados, N/A em Obra Civil e linhas extras (concluída)

- Identificação gera N campos de nome de ambiente a partir da quantidade
  (preserva nomes ao crescer/encolher; bloqueia com campo vazio). Obra Civil
  ganha o estado **N/A** (conta como resolvido) e **"+ Adicionar ambiente"**
  (linhas extras). Resumo lista os ambientes; N/A não vira pendência.
  Compatível com rascunhos antigos. Issue #15. `validate` + `test:e2e` verdes.

## ✅ 0.6.3 — Impressão à prova de dispositivo + HTML sem cache (concluída)

- Print em preto puro/peso 500 (iOS Quartz clareia tons médios) + `print-color-adjust`.
- `_headers`: HTML com `no-cache` → após deploy, navegador puxa CSS novo.

## ✅ 0.6.2 — Contraste na impressão do resumo (concluída)

- `@media print` com tinta escura de alto contraste (4,2→11,1:1 nos secundários) e
  linha-título por borda (imprimia como background e sumia). Tela FRS intocada.

## ✅ 0.6.1 — Ajustes de conteúdo do formulário (concluída)

- Seção 2: Ar condicionado renomeado (Painel/nicho/prateleira) e sem extras;
  "Alimentação" removida de Micro-ondas/Freezer/Refrigerador. Identificação sem a
  opção "Herança / acervo". Seção 1 sem "(Jamile)". Regras registradas no changelog.

## ✅ 0.6.0 — Repaginação visual com tema FRS (concluída)

- Tema FRS aplicado em `src/styles.css` + fonte Manrope no `index.html`. Somente
  visual — comportamento, regras e deploy inalterados. `validate` + `test:e2e` verdes.

---

## ✅ 0.1.0 — Sprint 0: auditoria e base (concluída)

- Diagnóstico técnico do estado atual.
- Documentação mínima (README, CLAUDE, CHANGELOG, docs).
- Consolidação do versionamento: v5 → `index.html`; v1–v4.1 → `archive/`.
- Toolchain mínima: `dev`, `build`, `lint`, `test`, `validate`.
- Sem mudança de comportamento do app.

Este ciclo segue o handoff pack "Cloudflare" (sprints pequenas até publicar no
Cloudflare Pages). Bloco A reduz risco sem framework; B moderniza build/tipos; C
introduz React incremental; D publica.

### Bloco A — reduzir risco sem framework

## ✅ 0.2.0 — Modularização segura do monólito (concluída)

- CSS extraído para `src/styles.css` e JS para `src/app.js`, referenciados pelo
  `index.html`. Extração byte-a-byte fiel — comportamento idêntico.
- Build passa a copiar `src/` para `dist/`; smoke tests atualizados.

## ✅ 0.2.1 — Autosave local em `localStorage` (concluída)

- Salva/restaura rascunho automaticamente (debounce); ação de limpar rascunho.
- Sem envio ao servidor; regra de conclusão inalterada.
- Módulo puro `src/draft.js` + testes de serialização e de comportamento (jsdom).

### Bloco B — base moderna de build e tipos

## ✅ 0.3.0 — Vite + TypeScript base (concluída)

- Vite como dev server/build (mantendo `build` → `dist/`); TypeScript configurado
  com `npm run typecheck` (no `validate`). Sem React ainda.
- `app.ts` com `@ts-nocheck` temporário — a tipagem forte é a 0.3.1.

## ✅ 0.3.1 — Tipagem de regras de negócio e testes reais (concluída)

- `src/domain.ts` tipado com dados + formatação + regras de "resolvido"; app passa
  a importar o domínio (fonte única) e removeu o `@ts-nocheck`.
- Testes reais das regras (identificação, seção 1, eletros, bancada/cuba, datas,
  escape).

### Bloco C — React incremental

## ✅ 0.4.0 — React shell e componentização inicial (concluída)

- React + ReactDOM + plugin Vite React; shell em componentes (Header, ProgressBar,
  Identificação, Seções-esqueleto, Termo, Ações, Footer).
- `initApp()` retorna teardown, chamado no `useEffect` do `App`; sem duplicar
  estado. Testes de comportamento renderizam o app React.

## ✅ 0.4.1 — Componentização das seções e resumo imprimível (concluída)

- Formulário e resumo em componentes React controlados; estado no
  `ChecklistProvider` (+ `src/model.ts`). `app.ts` imperativo removido.
- Campos condicionais (cuba) e listas dinâmicas em React; "voltar e editar" e
  autosave preservados.

## ✅ 0.4.2 — QA de UX, a11y, responsividade e impressão/PDF (concluída)

- **Playwright** cobrindo o fluxo crítico em navegador real (`test:e2e`); smoke
  manual em `docs/QA_SMOKE.md`. A11y básica: `aria-live`/`role=progressbar`,
  botões com `type`. Sem redesign.

### Bloco D — Cloudflare Pages

## ✅ 0.5.0 — Preparação e publicação via Cloudflare Pages (concluída)

- Publicado em https://checklist-de-medicao.pages.dev (`public/_headers`,
  `docs/DEPLOY_CLOUDFLARE.md`, `npm run deploy`). Smoke pós-deploy OK.

## ✅ 0.5.1 — Retrospectiva e roadmap seguinte (concluída)

- Retrospectiva em `docs/release-0.5/RETROSPECTIVE.md` (PRs/versões, arquitetura,
  riscos, próximo roadmap). **Ciclo 0.2.0 → 0.5.1 concluído.**

## Próximo roadmap (sugerido)

Detalhes em `docs/release-0.5/RETROSPECTIVE.md`:

1. Deploy contínuo (integração Git do Cloudflare) + rotação do token.
2. Acessibilidade: associar `label`↔campo e reativar `input-missing-label`.
3. Saída além do PDF (export JSON / envio) — provável Pages Functions.
4. Histórico de solicitações (export local ou, com decisão humana, KV/D1).
5. Integração com CRM/estúdio e guia visual da Fabrilis.

---

## Fora de escopo (por ora)

- Redesign visual completo.
- Autenticação/controle de acesso.
- Backend antes de existir necessidade concreta de persistência ou integração.
