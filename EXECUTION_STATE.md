# Execution State — Checklist de Medição Cloudflare

Estado de execução do ciclo de refatoração progressiva + Cloudflare Pages,
conforme o handoff pack. Atualizado a cada sprint.

## Estado geral

- Ciclo: Refatoração progressiva + Cloudflare Pages
- Repositório: `gpgamoeda/CHECKLIST-DE-MEDICAO`
- Branch base: `main`
- Último PR mergeado: #2 (Sprint 0.2.0 — modularização)
- Última versão: `0.2.1` (em PR)
- Próxima sprint: `0.3.0` — Vite + TypeScript base
- Modo de execução: loop autônomo, um branch/PR por sprint, merge quando os
  gates aplicáveis estão verdes.

## Checklist de sprints

| Sprint | Branch | PR | Status | Gates | Observações |
|---|---|---:|---|---|---|
| 0.1.0 | `claude/checklist-audit-sprint-0-z22izc` | #1 | Mergeada | lint+test+build | Auditoria e base |
| 0.2.0 | `claude/release-020-modularizacao-monolito` | #2 | Mergeada | lint+test+build | Extração CSS/JS byte-a-byte fiel |
| 0.2.1 | `claude/release-021-autosave-localstorage` | — | Em PR | lint+25 testes+build | Autosave local; testes jsdom de comportamento |
| 0.3.0 | `claude/release-030-vite-typescript-base` | | Pendente | | |
| 0.3.1 | `claude/release-031-domain-logic-tests` | | Pendente | | |
| 0.4.0 | `claude/release-040-react-shell` | | Pendente | | |
| 0.4.1 | `claude/release-041-componentizar-secoes-resumo` | | Pendente | | |
| 0.4.2 | `claude/release-042-qa-ux-a11y-print` | | Pendente | | |
| 0.5.0 | `claude/release-050-cloudflare-pages` | | Pendente | | Publicação exige credenciais humanas |
| 0.5.1 | `claude/release-051-retrospective-roadmap` | | Pendente | | |

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

## Riscos encontrados

- Nenhum bloqueante até 0.2.0. A cobertura de testes ainda é estrutural (string);
  testes de comportamento reais entram a partir da 0.3.1.

## Itens para revisão humana

- **0.5.0 (Cloudflare Pages):** a publicação real exige credenciais/autorização
  Cloudflare que o agente não possui. O loop prepara tudo e para antes de publicar.

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
