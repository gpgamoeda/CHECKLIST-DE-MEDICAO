# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### A fazer (próximas sprints)
- Extrair CSS e JS do `index.html` para módulos separados.
- Adicionar autosave em `localStorage` (evitar perda de preenchimento).
- Migrar a base para Vite + TypeScript e, em seguida, componentizar em React.

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
