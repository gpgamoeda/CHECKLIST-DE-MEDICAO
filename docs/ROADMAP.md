# Roadmap

Plano de evolução por releases pequenas. Cada release é uma sprint curta, em branch
própria, com PR revisável e `npm run validate` verde antes do merge. Datas não são
fixas; a ordem e o tamanho dos passos importam mais que o calendário.

O princípio geral: **mudanças pequenas, revisáveis e reversíveis, preservando o
comportamento a cada passo.** Nada de reescrever tudo de uma vez.

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

## 0.3.0 — Vite + TypeScript base

- Vite como dev server/build (mantendo `build` → `dist/`); TypeScript configurado
  com `npm run typecheck`. Sem React ainda.

## 0.3.1 — Tipagem de regras de negócio e testes reais

- Tipos para identificação, seções, itens, pendências, eletros, bancadas e resumo.
- Testes reais das funções puras (máscara, datas, escape, progresso, validação,
  resumo, rascunho).

### Bloco C — React incremental

## 0.4.0 — React shell e componentização inicial

- React + ReactDOM + plugin Vite React; shell/layout/cabeçalho/progresso/ações.
- Estado e regras preservados.

## 0.4.1 — Componentização das seções e resumo imprimível

- Seções e resumo em componentes; campos condicionais e listas dinâmicas.
- "Voltar e editar" e autosave preservados.

## 0.4.2 — QA de UX, a11y, responsividade e impressão/PDF

- Labels/foco/teclado, responsividade mínima, impressão/PDF; **Playwright** para o
  fluxo crítico. Sem redesign.

### Bloco D — Cloudflare Pages

## 0.5.0 — Preparação e publicação via Cloudflare Pages

- `docs/DEPLOY_CLOUDFLARE.md`, `_headers`/`_redirects` se necessário, config de
  Pages (`build` → `dist`, Node 20). Publicação só com credenciais/autorização
  humana — caso contrário, parar com instruções manuais.

## 0.5.1 — Retrospectiva e roadmap seguinte

- Retrospectiva do ciclo, lista de PRs/versões, riscos e próximos passos
  (envio da solicitação, histórico/exportação, backend leve, etc.).

---

## Fora de escopo (por ora)

- Redesign visual completo.
- Autenticação/controle de acesso.
- Backend antes de existir necessidade concreta de persistência ou integração.
