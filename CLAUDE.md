# CLAUDE.md — instruções do projeto

Instruções para agentes de IA e pessoas desenvolvedoras que forem trabalhar neste
repositório em sessões futuras. Leia antes de alterar qualquer coisa.

## O que é este projeto

Ferramenta interna da **FABRILIS** (marcenaria autoral): um **checklist de envio
para medição**. Um consultor preenche a identificação da obra e percorre um
checklist por seções; ao final gera um resumo imprimível (PDF) que serve de
solicitação de medição para o setor técnico. Não há back-end nem persistência —
tudo roda no navegador.

O app vigente é o **`index.html`** (equivalente à antiga "v5"). As versões
anteriores estão em `archive/` apenas como histórico.

## Stack e restrições

- **React + TypeScript + Vite.** O `index.html` tem só `<div id="root">` e carrega
  `src/main.tsx`, que monta o `<App/>`. **Abrir o `index.html` cru via `file://`
  não é o fluxo** (use `npm run dev`).
- **Estado no React** (`src/components/store.tsx` — `ChecklistProvider` + hook
  `useChecklist`): guarda o `Model` (de `src/model.ts`, mesmo formato do rascunho),
  expõe ações e cuida do autosave (debounce) + restauração. Progresso/conclusão
  vêm de `computeProgress`/`isComplete` (model.ts), que usam as regras de
  `src/domain.ts`.
- **Componentes** (`src/components/`): `App` (alterna form ⇄ `Summary`), `Header`,
  `ProgressBar`, `IdentificationCard`, `Section1`, `Section2`, `Section3`
  (bancada/cuba/metal condicionais), `DynSection` (seções 4 e 5), `Section6`,
  `Termo`, `Actions`, `Summary`. "Voltar e editar" só alterna a exibição — o estado
  fica no provider, então o preenchimento é preservado.
- Ao mexer em regra, altere `src/domain.ts` (+ `tests/domain.test.js`); ao mexer em
  UI/fluxo, mantenha `tests/behavior.dom.test.tsx` (renderiza `<App/>`) verde.
- As **regras de negócio puras e os tipos** vivem em `src/domain.ts` (fonte única);
  `src/app.ts` é a camada de DOM que importa o domínio. Ao mudar regra, altere o
  `domain.ts` e o teste correspondente (`tests/domain.test.js`).
- Ferramentas de dev: Node ≥ 20, Vite (dev/build), TypeScript (`typecheck`),
  Vitest (testes, incl. comportamento em jsdom), html-validate (lint).
- Deploy: **Cloudflare Pages** (`build` → `dist/`), publicado em
  https://checklist-de-medicao.pages.dev. `npm run deploy` (Wrangler) com
  `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` no ambiente — **nunca** comitar o
  token. Ver `docs/DEPLOY_CLOUDFLARE.md`.
- Direção desejada: componentizar em React (mantendo CSS atual / CSS Modules).
  **Não migre tudo de uma vez.**

## Comandos

```bash
npm install         # instala dependências
npm run dev         # servidor Vite em http://localhost:5173
npm run typecheck   # tsc --noEmit
npm run lint        # html-validate no index.html
npm test            # Vitest
npm run build       # Vite build → dist/
npm run preview     # serve o dist/ para conferência
npm run test:e2e    # Playwright (fluxo crítico, navegador real) — gate separado
npm run validate    # typecheck + lint + test + build
```

O `validate` não inclui o e2e (exige navegador/servidor). O e2e usa o Chromium
pré-instalado (`/opt/pw-browsers/chromium`); não rode `playwright install`.
Roteiro de smoke manual: `docs/QA_SMOKE.md`.

## Forma de trabalho (obrigatória)

Este projeto segue um padrão de releases pequenas:

1. **Uma branch por sprint** com nome claro (ex.: `refactor/sprint-1-...`).
2. **Sprints pequenas e seguras** — nada de reescrever tudo de uma vez.
3. **PR revisável** ao final de cada sprint, com: resumo, escopo, arquivos
   alterados, validações executadas, riscos e próximos passos.
4. **Rodar `npm run validate`** antes de abrir o PR — não abra PR com pipeline
   vermelho.
5. **Atualizar o `CHANGELOG.md`** a cada mudança relevante (formato Keep a
   Changelog + SemVer).
6. **Documentar decisões técnicas** relevantes (em `docs/` ou no PR).

## Regras de negócio essenciais (não quebrar sem registrar)

- A solicitação só é liberada quando **todos os itens estão resolvidos**
  (informados ou "não se aplica"); a barra de progresso reflete isso.
- **Identificação:** obrigatórios cliente, projeto, consultor, loja, endereço +
  número, responsável + telefone, tipo de medição, tipo de obra, quantidade de
  ambientes, datas e link das fotos (ou "não se aplica"). Opcionais: arquiteto,
  complemento, ponto de referência, observações gerais.
- Telefone usa máscara `(00) 0 0000-0000`; datas são exibidas no resumo em pt-BR.
- Obra "Herança / acervo" dispara um aviso de atenção redobrada.
- **Seção 1 (Obra Civil):** cada item é "Concluído" ou "Pendente" (pendência exige
  ambiente + motivo). Pendências embasam o Termo de Responsabilidade.
- **Seção 2 (Eletrodomésticos):** "Definido" (com campos) ou "não se aplica".
  Alguns itens têm campos extras (alimentação, necessidade de respiro). É possível
  adicionar eletrodomésticos fora da lista.
- **Seção 3 (Bancadas, Cubas e Metais):** por ambiente. O **tipo de cuba**
  (Inox / Louça / Esculpida / Não se aplica) define os campos seguintes; "Louça"
  ainda pede o modelo (apoio/sobrepor/embutir/semi-encaixe). Depois vêm os campos
  de metal (parede/bancada).
- **Seções 4 e 5:** listas dinâmicas condicionadas a um "sim/não".
- **Seção 6 (Observações):** campo livre, opcional.
- Saída = resumo imprimível + "Voltar e editar".
- **Autosave local (desde 0.2.1):** o preenchimento é salvo no `localStorage` do
  navegador e restaurado ao reabrir; há botão "Limpar rascunho". Os dados ficam
  **só no navegador** — nada vai para servidor. Serialização em `src/draft.js`
  (chave versionada `checklist-medicao:draft:v1`); acesso ao storage é defensivo
  (funciona sem autosave se indisponível). Não apagar o rascunho ao gerar a
  solicitação.

## O que NÃO fazer

- Não reintroduzir versionamento por cópia de arquivo (`checklist-v6.html` etc.).
  Use Git + `CHANGELOG.md`.
- Não publicar a pasta `archive/` — ela é só referência histórica.
- Não alterar regras de negócio silenciosamente. Se mudar, registre no PR e no
  changelog.
- Não remover funcionalidades existentes sem justificativa registrada.
- Não abrir PR sem `npm run validate` verde.
