# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### A fazer (próximas sprints)
- Componentizar em React de forma incremental (0.4.x).

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
