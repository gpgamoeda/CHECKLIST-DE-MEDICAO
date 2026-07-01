# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

_Sem itens pendentes. Próximo roadmap sugerido em
`docs/release-0.5/RETROSPECTIVE.md`._

## [0.6.2] — 2026-07-01

Release 0.6.2 — **Correção de contraste na impressão do resumo** (regressão
introduzida pelo tema FRS na 0.6.0). Somente `@media print`; tela inalterada.

### Corrigido
- Na impressão, a paleta FRS é trocada por **tinta escura de alto contraste**:
  corpo/títulos em preto (21:1), textos secundários ("não informado", lista
  "não se aplica", assinaturas) de `#807B72` (4,2:1) para `#3F3B33` (**11,1:1**),
  pendências de terracota `#B43C1E` (5,8:1) para `#8C2D12` (**8,4:1**) e
  separadores pontilhados escurecidos.
- A **linha sob os títulos** (`.rule`) era um `background` — que impressoras
  descartam — e **sumia no PDF**; virou `border-top`, que imprime sempre.

### Notas
- Medição feita sob mídia de impressão em Chromium real, com PDFs antes/depois
  gerados como o usuário imprime (sem fundos). Tela (tema FRS) intocada.
- Deploy: automático via integração Git do Cloudflare Pages (merge na `main`
  publica).

## [0.6.1] — 2026-07-01

Release 0.6.1 — Ajustes de conteúdo do formulário solicitados pelo produto.
**Inclui mudanças de regra de obrigatoriedade — registradas abaixo.**

### Alterado (Seção 2 — Eletrodomésticos)
- Item "Ar condicionado" renomeado para **"Ar condicionado (Painel/nicho/prateleira)"**.
- Removido o campo **"Observação"** do Ar condicionado (item ficou sem campos extras).
- Removido o drop **"Alimentação"** de **Micro-ondas**, **Freezer** e **Refrigerador** —
  a alimentação **deixa de ser obrigatória** nesses itens (o respiro continua).
  "Alimentação" permanece apenas em Cooktop/Fogão e Forno.

### Alterado (Identificação)
- Removida a opção **"Herança / acervo"** do drop "Tipo de obra" (restam
  "Obra nova" e "Reforma"). O aviso de atenção redobrada correspondente só pode
  aparecer para rascunhos antigos que ainda tenham esse valor salvo.

### Alterado (Seção 1 — Obra Civil)
- Texto de orientação sem a menção "(Jamile)": "Base para a avaliação prévia da
  obra. Marque cada item como concluído ou pendente. …".

### Compatibilidade
- Rascunhos salvos continuam válidos (as chaves internas dos itens não mudaram).
  Valores antigos de "alimentação"/"observação" preservados no rascunho passam a
  ser ignorados pela validação.

### Testes
- Testes de domínio atualizados/adicionados: Refrigerador/Freezer/Micro-ondas
  exigem respiro mas não alimentação; Ar condicionado renomeado e sem extras.
  Total: 45 testes + e2e verdes.

## [0.6.0] — 2026-07-01

Release 0.6.0 — **Repaginação visual com o tema FRS** (Fabrilis Relationship
Studio). Mudança **somente visual**: comportamento, regras, validações, autosave,
fluxo do resumo e deploy inalterados.

### Alterado
- **Fonte Manrope** (Google Fonts) carregada no `<head>` do `index.html` e aplicada
  globalmente.
- **`src/styles.css` repaginado para o tema FRS:**
  - paleta: fundo bege quente `--paper #E9E7E2`, texto `--ink #15140F`, muted
    `#807B72`, bordas `#D3CFC7` + `--border-hi #9A958B`, vermelho terracota
    `#B43C1E`, verde dessaturado `#0F783C`, âmbar `#9A6E0E`;
  - cards em branco quente (`#FBFAF7`) com sombra sutil; subcards `#F4F2ED`;
  - **badges de estado** (concluído/pendente/N.A., guia, herança) com fundos
    tonais translúcidos;
  - **inputs** com foco em borda escura + `box-shadow` sutil e hover de borda;
  - **hovers** em botões ghost / adicionar / autosave / segmentos;
  - **primário** com `:active { translateY(1px) }`;
  - **termo** com borda esquerda terracota.
- `@media print` reforçado: o **resumo imprimível continua com fundo branco**.

### Não alterado
- Componentes React, store, `domain`/`model`, regras de negócio, validações,
  autosave, geração do resumo e deploy Cloudflare.

### QA
- `npm run validate` verde (43 testes), `npm run test:e2e` verde (fluxo crítico em
  navegador real) e `npm run build` OK. Smoke visual por screenshots (desktop,
  resumo e mobile): Manrope carregada, fundo bege, cards/badges/inputs no tema FRS,
  foco visível, mobile sem quebra e resumo branco em impressão.

## [0.5.1] — 2026-07-01

Sprint 0.5.1 — Retrospectiva e fechamento do ciclo. Somente documentação.

### Adicionado
- `docs/release-0.5/RETROSPECTIVE.md`: PRs/versões entregues, mudanças de
  arquitetura, regras preservadas, riscos reduzidos/remanescentes, decisões
  técnicas e o próximo roadmap sugerido.

### Notas
- Ciclo de refatoração + publicação (0.2.0 → 0.5.0) **concluído**: de monólito
  `index.html` para React + TS + Vite, testado (43 unit + e2e) e publicado no
  Cloudflare Pages, sem quebrar comportamento nem regras de negócio.

## [0.5.0] — 2026-07-01

Sprint 0.5.0 — **Publicação no Cloudflare Pages.**

### Adicionado
- App publicado em **https://checklist-de-medicao.pages.dev** (Cloudflare Pages,
  projeto `checklist-de-medicao`).
- `public/_headers`: cabeçalhos de segurança (X-Frame-Options, nosniff,
  Referrer-Policy, Permissions-Policy) e cache longo para os assets com hash.
- Script `npm run deploy` (Wrangler; token via variável de ambiente, nunca comitado).
- `docs/DEPLOY_CLOUDFLARE.md`: configuração de deploy (build `npm run build`, saída
  `dist`, Node 20), integração com Git e deploy manual via Wrangler.

### Deploy / smoke
- Deploy inicial via `wrangler pages deploy dist` (upload direto). Smoke pós-deploy:
  HTTP 200, cabeçalhos do `_headers` aplicados, `#root` + bundle React servidos.

### Notas
- Nova dependência apenas de deploy: `wrangler` (dev). Sem backend/Functions/D1/KV.
  Nenhum secret no repositório.

## [0.4.2] — 2026-07-01

Sprint 0.4.2 — QA de UX/acessibilidade + **Playwright** no fluxo crítico. Sem
mudança de regra de negócio.

### Adicionado
- **Playwright** (`@playwright/test`) com um teste e2e do fluxo crítico em navegador
  real (`e2e/critical-flow.spec.ts`): preencher identificação → resolver itens →
  liberar e gerar a solicitação → conferir o resumo → voltar e editar (estado
  preservado) → recarregar e confirmar o autosave. Script `npm run test:e2e`.
- `playwright.config.ts` usa o Chromium pré-instalado do ambiente e sobe o app via
  Vite; documentação de smoke manual em `docs/QA_SMOKE.md`.

### Melhorado (acessibilidade básica)
- Barra de progresso com `role="progressbar"` + `aria-valuenow`; contagem de itens
  e mensagem de autosave com `aria-live="polite"` (anúncio para leitores de tela).
- Todos os botões já usam `type="button"` (evita submit acidental).

### Notas
- `npm run validate` segue como `typecheck + lint + test + build`; o e2e é um gate
  **separado** (`test:e2e`), pois exige navegador/servidor. Nova dependência apenas
  de teste: `@playwright/test`. 43 testes unitários + 1 e2e.

## [0.4.1] — 2026-07-01

Sprint 0.4.1 — Componentização das seções e do resumo em **React** (estado
reativo). Comportamento preservado (coberto pelos testes que renderizam o app).

### Alterado
- O formulário e o resumo passaram a ser **componentes React controlados**, com o
  estado no `ChecklistProvider` (`src/components/store.tsx`). Fim da montagem
  imperativa: **`src/app.ts` foi removido** (assim como o shell estático
  `ChecklistSections.tsx`).
- Novo `src/model.ts`: tipo `Model` (mesmo formato do rascunho salvo, então o
  autosave segue compatível), `computeProgress`, `isComplete` e `modelFromDraft`.
- Componentes por seção: `Section1`, `Section2`, `Section3` (bancada/cuba/metal
  com campos condicionais), `DynSection` (seções 4 e 5), `Section6`, além de
  `IdentificationCard`, `ProgressBar`, `Actions` e `Summary` (resumo imprimível).
- **"Voltar e editar"** agora só alterna a exibição (form ⇄ resumo); o estado é
  preservado por estar no provider. O resumo usa o escape automático do React.

### Testes
- `tests/behavior.dom.test.tsx` reescrito para interações React (`fireEvent`):
  estrutura, restauração de rascunho, autosave, **campos condicionais da cuba**
  (louça pede modelo; inox libera metal), fluxo de conclusão gerando o resumo e
  **"voltar e editar" preservando o preenchimento**. 43 testes verdes.

### Notas
- Sem dependências novas. Regras de obrigatoriedade inalteradas (mesmas funções de
  `src/domain.ts`). Build/`dist/` OK; `archive/` fora do bundle.

## [0.4.0] — 2026-07-01

Sprint 0.4.0 — Introdução do **React** (shell/casca), de forma incremental.
Comportamento preservado (testes de comportamento agora renderizam o app React).

### Adicionado
- **React + ReactDOM + `@vitejs/plugin-react`.** O `index.html` agora tem só
  `<div id="root">` e carrega `src/main.tsx`, que monta o `<App/>`.
- **Componentes do shell** em `src/components/`: `App`, `Header`, `ProgressBar`,
  `IdentificationCard`, `ChecklistSections`, `Termo`, `Actions`, `Footer`. São o
  esqueleto (estático) — preservam todos os `id`/`class`/`data-*`.
- Testes de comportamento reescritos com `@testing-library/react`
  (`tests/behavior.dom.test.tsx`): renderizam `<App/>` e exercitam a estrutura,
  restauração de rascunho, autosave e o **fluxo de conclusão** (gera o resumo).

### Alterado
- `initApp()` passou a **retornar um teardown** (remove os listeners de documento
  e cancela o autosave pendente); o `App` o chama no `useEffect` de montagem/
  desmontagem. Isso evita acúmulo de listeners e dá ciclo de vida correto.
- Sem duplicação de estado: o React renderiza o esqueleto uma vez; `initApp()`
  continua dono do estado, dos itens dinâmicos, do autosave e do resumo (a
  migração desse conteúdo para React é a 0.4.1).

### Notas
- Dependências novas previstas pela sprint: `react`, `react-dom`,
  `@vitejs/plugin-react` (runtime) e `@testing-library/react` +
  `@testing-library/dom` (teste). Bundle e `dist/` OK; `archive/` fora do build.
  41 testes verdes.

## [0.3.1] — 2026-07-01

Sprint 0.3.1 — Tipagem das regras de negócio e testes reais. **Sem mudança de
comportamento** (as funções extraídas são as mesmas que o app já usava).

### Adicionado
- **`src/domain.ts`**: módulo puro e tipado com os dados (itens das seções,
  campos, rótulos), a formatação (`maskPhone`, `brDate`, `esc`) e as regras de
  "resolvido" (`isSection1Resolved`, `isEletroResolved`, `isDynEletroResolved`,
  `isBancadaResolved`, `isDynResolved`, `isIdentificationComplete`). É a **fonte
  única** das regras.
- **`tests/domain.test.js`**: testes das regras — identificação incompleta/completa
  e link de fotos, pendência de obra civil (ambiente+motivo), eletro definido com
  campos e extras (alimentação/respiro), cuba louça exigindo modelo, metal
  obrigatório com cuba, datas em pt-BR e escape de HTML.

### Alterado
- `src/app.ts` passou a **importar** o domínio (removendo as definições
  duplicadas) e virou um dispatcher fino em `rowResolved`/`idComplete`. O
  `// @ts-nocheck` foi **removido**: o módulo agora é type-checked (os acessos ao
  DOM usam helpers `byId`/`qs`/`qsa` que retornam `any`).

### Notas
- As mudanças são somente de organização/tipagem; os testes de comportamento em
  jsdom (autosave, restauração e fluxo de conclusão) seguem verdes, confirmando a
  preservação do comportamento. Total: 44 testes.

## [0.3.0] — 2026-07-01

Sprint 0.3.0 — Base moderna de build: **Vite + TypeScript**. Comportamento do app
preservado (coberto pelos testes de comportamento em jsdom).

### Adicionado
- **Vite** como servidor de desenvolvimento (`npm run dev`) e build
  (`npm run build` → `dist/`), com `npm run preview` para conferir o build.
- **TypeScript** configurado (`tsconfig.json`) e script `npm run typecheck`
  (`tsc --noEmit`), agora parte do `npm run validate`.
- `src/main.ts` como ponto de entrada (importa os estilos e chama `initApp`).

### Alterado
- `src/draft.js` → `src/draft.ts` (módulo ES com tipos; fim do UMD).
- `src/app.js` → `src/app.ts`: a IIFE virou `export function initApp()` e passou a
  importar `draft` por módulo (em vez do global `window.ChecklistDraft`). O módulo
  ainda usa `// @ts-nocheck` — a tipagem forte do domínio vem na 0.3.1.
- `index.html` carrega o app via `<script type="module" src="/src/main.ts">`; o
  CSS passou a ser importado pelo `main.ts` (Vite injeta no build).
- `package.json`: scripts migrados para Vite/TS; `validate` agora roda
  `typecheck → lint → test → build`.

### Removido
- Scripts próprios `scripts/dev-server.mjs` e `scripts/build.mjs` (o Vite assume
  dev e build).

### Nota de comportamento
- O contrato `npm run build` → `dist/` foi mantido (Cloudflare Pages), e a pasta
  `archive/` continua fora do build.
- Como o app agora é servido/empacotado pelo Vite (módulos ES), **abrir o
  `index.html` cru via `file://` deixa de ser o fluxo** — use `npm run dev` em
  desenvolvimento e o `dist/` publicado em produção.
- Testes migrados para os módulos TS (25 testes, incluindo os de comportamento em
  jsdom que exercitam autosave, restauração e o fluxo de conclusão).

## [0.2.1] — 2026-07-01

Sprint 0.2.1 — Autosave local em `localStorage`. Resolve o maior risco de UX
identificado na auditoria: perda do preenchimento ao recarregar/fechar a página.

### Adicionado
- **Autosave local:** o preenchimento é salvo automaticamente no `localStorage`
  do navegador (com debounce) e **restaurado** ao reabrir o app. Inclui
  identificação, itens das seções, gates sim/não e todas as linhas dinâmicas
  (bancadas, eletros adicionais, mobiliário e demais itens).
- Indicador discreto de "salvo/restaurado" e botão **"Limpar rascunho"** (pede
  confirmação e reinicia o formulário).
- Módulo puro e testável `src/draft.js` (`serializeDraft`, `parseDraft`,
  `saveDraft`, `loadDraft`, `clearDraft`) com chave versionada
  `checklist-medicao:draft:v1`.
- Testes: unitários da serialização (round-trip, JSON inválido, versão
  incompatível, limpeza, storage indisponível) e testes de comportamento em jsdom
  (restauração da identificação/itens/bancada, autosave com debounce, rascunho
  corrompido ignorado com segurança e **fluxo de conclusão preservado**).

### Privacidade
- Os dados ficam **somente no navegador do usuário**. Nada é enviado a servidor.
  O acesso ao `localStorage` é defensivo: se indisponível (ex.: `file://` restrito
  ou navegação privada), o app segue funcionando sem autosave.

### Notas
- A regra de conclusão do checklist não foi alterada. O rascunho **não** é apagado
  ao gerar a solicitação (só pelo botão "Limpar rascunho").
- Nova dependência apenas de teste: `jsdom` (para os testes de comportamento).

## [0.2.0] — 2026-07-01

Sprint 0.2.0 — Modularização segura do monólito. **Sem alterar o comportamento
do app.**

### Alterado
- **O app deixou de ser single-file.** O CSS e o JavaScript, antes embutidos no
  `index.html`, foram extraídos para `src/styles.css` e `src/app.js`. O
  `index.html` passa a referenciá-los via `<link>` e `<script src>`. A extração é
  byte-a-byte fiel ao conteúdo original (verificado no PR), então o comportamento
  é idêntico.
- O `<script>` externo é um script clássico com `defer` (não `type="module"`),
  o que preserva a possibilidade de abrir o `index.html` diretamente via `file://`.
- `scripts/build.mjs` agora copia também a pasta `src/` para `dist/`.

### Testes
- Os smoke tests foram atualizados para a estrutura modular: verificam as
  referências externas de CSS/JS, a ausência de código inline, a presença dos
  arquivos em `src/` e que o build copia HTML+CSS+JS para `dist/` sem incluir
  `archive/`.

## [0.1.0] — 2026-07-01

Primeira release marcada. Sprint 0 — auditoria e organização da base, **sem
alterar o comportamento do app**.

### Adicionado
- Documentação inicial: `README.md`, `CLAUDE.md`, este `CHANGELOG.md`,
  `docs/DIAGNOSTICO.md` (auditoria) e `docs/ROADMAP.md` (evolução por releases).
- Toolchain mínima de desenvolvimento, sem framework: `package.json` com scripts
  `dev`, `build`, `lint`, `test` e `validate`.
- Servidor de desenvolvimento estático sem dependências (`scripts/dev-server.mjs`).
- Build estático sem dependências que gera `dist/` (`scripts/build.mjs`), pronto
  para deploy no Cloudflare Pages.
- Lint de HTML com html-validate (`.htmlvalidate.json`), focado em correção
  estrutural.
- Testes de fumaça com Vitest (`tests/index.test.js`) travando a estrutura do app.
- Arquivos de padronização: `.gitignore`, `.editorconfig`, `.nvmrc`.

### Alterado
- **`index.html` agora contém a versão vigente do app (antiga "v5").** Antes, o
  `index.html` era a v1 — a mais antiga —, o que faria qualquer deploy padrão
  publicar uma versão desatualizada. A mudança preserva o comportamento do
  produto atual (v5) e corrige o ponto de entrada.

### Movido
- As versões anteriores (v1 a v4.1) foram movidas para `archive/` como referência
  histórica. A antiga `index.html` (v1) virou `archive/checklist-v1.html`. A partir
  daqui, o versionamento passa a ser feito por Git + changelog, não por cópia de
  arquivo.

### Notas
- Nenhuma regra de negócio foi alterada. O conteúdo do app publicado é
  byte-a-byte igual ao da antiga `checklist-v5.html`.
