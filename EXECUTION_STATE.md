# Execution State — Checklist de Medição Cloudflare

Estado de execução do ciclo de refatoração progressiva + Cloudflare Pages,
conforme o handoff pack. Atualizado a cada sprint.

## Estado geral

- Ciclo: Refatoração progressiva + Cloudflare Pages (concluído) → repaginação visual
- Repositório: `gpgamoeda/CHECKLIST-DE-MEDICAO`
- Branch base: `main`
- Último PR mergeado: #12 (Release 0.6.1 — ajustes de conteúdo)
- Última versão: `0.6.2` (em PR — contraste na impressão)
- Deploy: **automático** (integração Git do Cloudflare Pages ativa; merge na `main` publica)
- Próxima sprint: — (próximo roadmap em `docs/release-0.5/RETROSPECTIVE.md`)
- Produção: https://checklist-de-medicao.pages.dev (publicado)
- Modo de execução: loop autônomo, um branch/PR por sprint, merge quando os
  gates aplicáveis estão verdes.

## Checklist de sprints

| Sprint | Branch | PR | Status | Gates | Observações |
|---|---|---:|---|---|---|
| 0.1.0 | `claude/checklist-audit-sprint-0-z22izc` | #1 | Mergeada | lint+test+build | Auditoria e base |
| 0.2.0 | `claude/release-020-modularizacao-monolito` | #2 | Mergeada | lint+test+build | Extração CSS/JS byte-a-byte fiel |
| 0.2.1 | `claude/release-021-autosave-localstorage` | #3 | Mergeada | lint+25 testes+build | Autosave local; testes jsdom de comportamento |
| 0.3.0 | `claude/release-030-vite-typescript-base` | #4 | Mergeada | typecheck+lint+25 testes+build | Vite+TS |
| 0.3.1 | `claude/release-031-domain-logic-tests` | #5 | Mergeada | typecheck+lint+44 testes+build | domain.ts tipado; @ts-nocheck removido |
| 0.4.0 | `claude/release-040-react-shell` | #6 | Mergeada | typecheck+lint+41 testes+build | React shell; initApp com teardown |
| 0.4.1 | `claude/release-041-componentizar-secoes-resumo` | #7 | Mergeada | typecheck+lint+43 testes+build | Componentização completa; app.ts removido; estado no React |
| 0.4.2 | `claude/release-042-qa-ux-a11y-print` | #8 | Mergeada | typecheck+lint+43 testes+build+e2e | Playwright fluxo crítico (real) verde; a11y básica |
| 0.5.0 | `claude/release-050-cloudflare-pages` | #9 | Mergeada | validate+deploy+smoke | Publicado em checklist-de-medicao.pages.dev |
| 0.5.1 | `claude/release-051-retrospective-roadmap` | #10 | Mergeada | validate | Retrospectiva; ciclo concluído |
| 0.6.0 | `release/0.6.0-frs-visual-theme` | #11 | Mergeada + publicada | validate+e2e+build+smoke visual | Tema FRS (só visual); Manrope + styles.css |
| 0.6.1 | `release/0.6.1-ajustes-formulario` | #12 | Mergeada | validate (45 testes)+e2e | Ajustes eletros/identificação/obra civil; regras registradas |
| 0.6.2 | `release/0.6.2-contraste-impressao` | — | Em PR | validate+e2e+PDF antes/depois | Alto contraste no print; .rule vira borda |

## Decisões tomadas

- **0.2.0:** JS extraído como script clássico com `defer` (não `type="module"`)
  para preservar a abertura do `index.html` via `file://`. A migração para módulos
  ES ocorre na 0.3.0 com Vite.
- **0.2.0:** mantido um único `src/app.js` (em vez de quebrar em vários módulos)
  para minimizar risco de regressão nesta etapa mecânica; a separação fina em
  módulos vem na 0.3.1.
- **0.2.1:** `src/draft.js` em UMD (script clássico no navegador + importável em
  teste), preservando `file://`. Autosave com debounce disparado a partir de
  `update()` e de um listener de campos; restauração recria as linhas dinâmicas
  reutilizando as funções `addBancada/addEletro/addDyn` com preset.
- **0.2.1:** adicionado `jsdom` (dev-only) para testes de comportamento — passam a
  ser a rede de segurança dos refactors seguintes (React etc.).
- **0.3.0:** app.ts recebeu `// @ts-nocheck` (migração incremental) — a tipagem
  forte do domínio é o escopo da 0.3.1. Vite bundla `index.html` → `dist/`
  (assets com hash); `archive/` fica fora do bundle por não ser referenciado.
- **0.3.0:** testes de comportamento passaram a montar um `JSDOM` próprio por caso
  e chamar `initApp()` do módulo TS (isola listeners e estado por teste).
- **0.4.1:** o `Model` React reutiliza o MESMO formato do rascunho (draft), então o
  autosave/restauração continuam compatíveis (sem bump de versão da chave). Estado
  centralizado no `ChecklistProvider`; "voltar e editar" só alterna a exibição.
  `app.ts` imperativo removido; testes migrados para `fireEvent` (React).

## Riscos encontrados

- Nenhum bloqueante até 0.2.0. A cobertura de testes ainda é estrutural (string);
  testes de comportamento reais entram a partir da 0.3.1.

## Itens para revisão humana

- **Token Cloudflare:** o usuário forneceu um API token para a publicação e disse
  que vai **rotacioná-lo** depois. O token foi usado apenas via variável de ambiente
  no deploy; **não** está em nenhum arquivo do repositório. Rotacionar após o ciclo.
- **Integração Git (opcional):** para deploy automático a cada push na `main`,
  conectar o repo no painel do Cloudflare Pages (ver `docs/DEPLOY_CLOUDFLARE.md`).

## Confirmações permanentes

- [x] Regras de negócio preservadas ou mudanças documentadas.
- [x] Sem backend antes de decisão humana.
- [x] Sem D1/KV/R2/Workers.
- [x] Sem envio de dados do formulário para servidor.
- [x] Sem secrets/tokens no repositório.
- [x] `archive/` não publicado.
- [x] Build continua gerando `dist/`.
- [x] Impressão/PDF preservado.
- [x] Autosave local documentado. (0.2.1 — README, CLAUDE, CHANGELOG)
- [x] Cloudflare DNS/domínio não alterados sem aprovação.
