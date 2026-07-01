# Retrospectiva — Ciclo de refatoração + publicação (0.2.0 → 0.5.0)

Fecha o ciclo do handoff "Cloudflare": levar o checklist do monólito pós-Sprint 0
até um app React + TS moderno, testado e publicado no Cloudflare Pages, **sem
quebrar o comportamento** e sem mudar regras de negócio.

## PRs e versões entregues

| Sprint | Versão | PR | Entrega |
|---|---|---:|---|
| Sprint 0 | 0.1.0 | #1 | Auditoria, docs mínimas, consolidação (v5 → `index.html`, `archive/`), toolchain |
| 0.2.0 | 0.2.0 | #2 | Modularização: CSS/JS extraídos do `index.html` (byte-a-byte fiel) |
| 0.2.1 | 0.2.1 | #3 | Autosave local em `localStorage` (salvar/restaurar/limpar) |
| 0.3.0 | 0.3.0 | #4 | Base Vite + TypeScript (dev/build/typecheck) |
| 0.3.1 | 0.3.1 | #5 | Tipagem do domínio (`domain.ts`) + testes de regras; fim do `@ts-nocheck` |
| 0.4.0 | 0.4.0 | #6 | React shell; `initApp()` com teardown |
| 0.4.1 | 0.4.1 | #7 | Componentização das seções e do resumo (estado no React); `app.ts` removido |
| 0.4.2 | 0.4.2 | #8 | QA + Playwright (fluxo crítico real); a11y básica |
| 0.5.0 | 0.5.0 | #9 | Publicação no Cloudflare Pages |

Cada sprint: branch própria, PR revisável, `npm run validate` verde, changelog e
docs atualizados, e merge só no verde.

## O que mudou na arquitetura

- **De** um único `index.html` (HTML + CSS + JS numa IIFE) **para** React + TypeScript
  + Vite, com:
  - `src/domain.ts` — regras de negócio puras e tipadas (fonte única);
  - `src/model.ts` — estado (`Model`) + progresso/conclusão;
  - `src/draft.ts` — serialização do rascunho (autosave);
  - `src/components/` — `store` (estado/ações/autosave) + componentes por seção +
    `Summary`.
- Build/deploy: `npm run build` (Vite) → `dist/` → Cloudflare Pages.
- Versionamento por Git + `CHANGELOG.md` (fim das cópias `checklist-vN.html`;
  histórico preservado em `archive/`).

## Regras de negócio preservadas

Liberação só com todos os itens resolvidos; obrigatoriedade da identificação
(incl. link de fotos ou "não se aplica"); máscara de telefone; datas pt-BR; aviso
de herança/acervo; seção 1 (concluído/pendente); seção 2 (definido/N.A. + extras);
seção 3 (tipo de cuba condicionando cuba/metal; louça pede modelo); seções 4/5
(listas sim/não); observações; resumo imprimível + "voltar e editar". Tudo coberto
por testes (`domain.test.js`, `behavior.dom.test.tsx`, e2e Playwright).

## Riscos reduzidos

- **Perda de preenchimento** → autosave local (0.2.1).
- **Ponto de entrada desatualizado** → v5 promovida a `index.html` (Sprint 0).
- **Sem rede de segurança** → 43 testes (unitários + comportamento) + 1 e2e real.
- **Monólito difícil de manter** → módulos + componentes tipados.
- **Regras “escondidas” em strings** → `domain.ts` tipado e testado.

## Riscos / limitações remanescentes

- **Sem histórico/registro**: a saída é impressão/PDF; nada é enviado nem guardado
  além do rascunho local do navegador.
- **Autosave com debounce (~400ms)**: recarregar imediatamente após digitar pode
  perder o último caractere.
- **Acessibilidade parcial**: há `aria-live`/`role`, mas a associação
  `label`↔campo (for/id) ainda é incremental; a regra `input-missing-label` do lint
  segue relaxada.
- **Deploy manual**: publicado por upload direto (Wrangler). A integração Git
  (deploy automático) ainda não foi conectada no painel.
- **Token Cloudflare**: usado só via variável de ambiente (não comitado); deve ser
  **rotacionado** pelo responsável.

## Decisões técnicas importantes

- Extração byte-a-byte na 0.2.0 (baixo risco antes de modernizar).
- Rascunho e `Model` compartilham o mesmo formato → autosave compatível entre
  versões.
- React introduzido em duas etapas (shell → componentização), com testes de
  comportamento renderizando o app real como rede de segurança.
- Regras puras isoladas em `domain.ts` para testar sem DOM.

## Fora de escopo (mantido)

Backend/Workers/Functions, D1/KV/R2, autenticação, envio automático ao setor
técnico, histórico multiusuário, dashboard, integração com CRM e redesign visual.

## Próximo roadmap sugerido

1. **Deploy contínuo**: conectar a integração Git do Cloudflare Pages (auto-deploy
   na `main` + previews de PR) e rotacionar o token.
2. **Acessibilidade**: associar `label`↔campo em todos os inputs e reativar
   `input-missing-label` no lint.
3. **Saída além do PDF**: exportar a solicitação em JSON e/ou enviá-la (e-mail ou
   integração interna) — provavelmente exigindo Cloudflare Pages Functions.
4. **Histórico**: guardar solicitações (local export ou, se houver necessidade
   real e decisão humana, KV/D1).
5. **Integração**: alinhar com CRM/estúdio da Fabrilis e com o guia visual da marca.
