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

## 0.2.0 — Modularização e autosave (sem framework)

- Extrair o `<style>` para `src/styles.css` e o `<script>` para módulos JS em
  `src/` (ex.: `state.js`, `validation.js`, `format.js`, `summary.js`).
- Cobrir as funções puras com testes unitários de verdade (máscara de telefone,
  formatação de data, escape, regras de `rowResolved`).
- **Autosave em `localStorage`** com opção de limpar o rascunho — resolve o maior
  risco de UX (perda de preenchimento).
- Critério de pronto: comportamento idêntico ao atual + testes cobrindo a lógica
  extraída.

## 0.3.0 — Vite + TypeScript

- Introduzir Vite como servidor de dev e build (mantendo o mesmo contrato
  `build` → `dist/` já usado pelo Cloudflare Pages).
- Migrar os módulos de `src/` para TypeScript, adicionando `typecheck` ao
  `validate`.
- Sem componentização ainda; foco em tipar e ter build/dev modernos.

## 0.4.0 — React + componentização de UI

- Componentizar as seções em React + TypeScript (uma seção por vez).
- Adotar **CSS Modules** (mais simples e alinhado ao escopo) — reavaliar Tailwind
  se a quantidade de estilos justificar.
- Testes de componente com Vitest + Testing Library.
- Um teste de fluxo crítico com **Playwright**: preencher o mínimo → liberar o
  botão → gerar resumo → imprimir.

## 0.5.0+ — Persistência e integração (se houver necessidade real)

- Avaliar persistência além do `localStorage`. Só introduzir back-end se houver
  necessidade concreta de histórico/multiusuário:
  - **localStorage** — rascunho por navegador (já em 0.2.0).
  - **Cloudflare KV** — se bastar guardar solicitações simples por chave.
  - **Cloudflare D1** — se for preciso consultar/relacionar solicitações.
  - Camada de API via **Cloudflare Pages Functions / Workers**, apenas se necessário.
- Exportação estruturada da solicitação (JSON/PDF) para integrar com outros
  sistemas da FABRILIS.

---

## Fora de escopo (por ora)

- Redesign visual completo.
- Autenticação/controle de acesso.
- Backend antes de existir necessidade concreta de persistência ou integração.
