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
  `src/main.tsx`, que monta o `<App/>` (shell em `src/components/`: Header,
  ProgressBar, IdentificationCard, ChecklistSections, Termo, Actions, Footer). O
  `App` chama `initApp()` (de `src/app.ts`) no `useEffect`, que gerencia estado,
  itens dinâmicos, autosave e resumo imperativamente sobre o DOM; `initApp()`
  retorna um teardown (removido no unmount). **Abrir o `index.html` cru via
  `file://` não é o fluxo** (use `npm run dev`).
- Componentização incremental: em 0.4.0 o shell é React, mas o **conteúdo dinâmico
  das seções ainda é montado por `initApp()`**. Ao migrar uma parte para React,
  não duplique estado e mantenha os testes de comportamento verdes.
- As **regras de negócio puras e os tipos** vivem em `src/domain.ts` (fonte única);
  `src/app.ts` é a camada de DOM que importa o domínio. Ao mudar regra, altere o
  `domain.ts` e o teste correspondente (`tests/domain.test.js`).
- Ferramentas de dev: Node ≥ 20, Vite (dev/build), TypeScript (`typecheck`),
  Vitest (testes, incl. comportamento em jsdom), html-validate (lint).
- Alvo de deploy: **Cloudflare Pages** (`build` → `dist/`).
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
npm run validate    # typecheck + lint + test + build
```

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
