# Checklist de Envio para Medição — FABRILIS

**Produção:** https://checklist-de-medicao.pages.dev (Cloudflare Pages)

Ferramenta interna de página única (single-page) usada por consultores da FABRILIS
(marcenaria autoral) para **preparar e conferir a solicitação de medição** de um
projeto antes de enviá-lo ao setor técnico.

O consultor preenche a identificação da obra e percorre um checklist por seções
(obra civil, eletrodomésticos, bancadas/cubas/metais, mobiliário de terceiros,
demais itens e observações). O botão de gerar a solicitação só é liberado quando
**todos os itens estão resolvidos** — informados ou marcados como "não se aplica".
Ao final, gera um resumo imprimível (Imprimir / Salvar PDF).

> **Uso interno.** Não coleta nem envia dados a nenhum servidor: tudo acontece no
> navegador e o resultado sai por impressão/PDF.

---

## Stack atual

- **Front-end:** React + TypeScript. O `index.html` tem só `<div id="root">` e
  carrega `src/main.tsx` (Vite), que monta o `<App/>` (shell em
  `src/components/`). As regras de negócio puras estão em `src/domain.ts`, o
  rascunho em `src/draft.ts` e a lógica imperativa (itens dinâmicos, autosave,
  resumo) em `src/app.ts` — acionada pelo `App` no `useEffect` de montagem.
- **Build/dev:** [Vite](https://vitejs.dev) + [TypeScript](https://www.typescriptlang.org) + [React](https://react.dev).
- **Dependências em runtime:** nenhuma (o bundle final é estático).
- **Persistência:** rascunho local em `localStorage` (autosave); nada é enviado a
  servidor.
- **Ferramentas (dev):** Node ≥ 20, [Vitest](https://vitest.dev) (testes, incl.
  comportamento em jsdom) e [html-validate](https://html-validate.org) (lint).

Uma auditoria detalhada está em [`docs/DIAGNOSTICO.md`](docs/DIAGNOSTICO.md) e o
plano de evolução em [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## Como rodar localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Servidor de desenvolvimento Vite (http://localhost:5173)
npm run dev

# 3. Validações
npm run typecheck   # checagem de tipos (tsc --noEmit)
npm run lint        # valida a estrutura do HTML
npm test            # roda os testes (Vitest)
npm run build       # gera a pasta dist/ pronta para deploy
npm run preview     # serve o dist/ para conferência
npm run validate    # typecheck + lint + test + build em sequência
```

## Scripts disponíveis

| Script               | O que faz                                              |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Servidor de desenvolvimento Vite (porta 5173)          |
| `npm run build`      | Gera o bundle estático em `dist/` (Vite)               |
| `npm run preview`    | Serve o `dist/` para conferência                       |
| `npm run typecheck`  | Checagem de tipos com `tsc --noEmit`                   |
| `npm run lint`       | Valida `index.html` com html-validate                  |
| `npm test`           | Roda os testes com Vitest                              |
| `npm run test:watch` | Testes em modo watch                                   |
| `npm run test:e2e`   | Fluxo crítico em navegador real (Playwright)           |
| `npm run validate`   | `typecheck` + `lint` + `test` + `build`                |

O `validate` **não** inclui o e2e (que exige navegador/servidor); rode
`npm run test:e2e` à parte. Há um roteiro de smoke manual em
[`docs/QA_SMOKE.md`](docs/QA_SMOKE.md).

---

## Estrutura do projeto

```
.
├── index.html            # Entrada (#root + carrega src/main.tsx via Vite). Publicado.
├── src/
│   ├── main.tsx          # Ponto de entrada: importa estilos e monta <App/>
│   ├── components/       # Shell React (App, Header, ProgressBar, Identificação, Seções…)
│   ├── app.ts            # Lógica imperativa (estado, itens dinâmicos, autosave, resumo)
│   ├── domain.ts         # Regras de negócio puras + tipos (fonte única)
│   ├── draft.ts          # Autosave local: serialização do rascunho
│   ├── styles.css        # Estilos do app
│   └── vite-env.d.ts     # Tipos do Vite (ex.: import de .css)
├── archive/              # Snapshots históricos (v1 a v4.1). Não são publicados.
│   └── README.md
├── docs/
│   ├── DIAGNOSTICO.md    # Auditoria técnica do estado inicial
│   └── ROADMAP.md        # Evolução planejada por releases
├── tests/
│   ├── index.test.js     # Smoke tests da estrutura
│   ├── draft.test.js     # Testes da serialização do rascunho
│   └── autosave.dom.test.js  # Testes de comportamento (jsdom): autosave, restauração, conclusão
├── tsconfig.json         # Configuração do TypeScript
├── vite.config.ts        # Configuração do Vite (build → dist/)
├── .htmlvalidate.json    # Configuração do lint
├── package.json
├── CHANGELOG.md
└── CLAUDE.md             # Instruções para sessões de IA/dev futuras
```

---

## Autosave e privacidade

Desde a versão 0.2.1, o preenchimento é salvo automaticamente no `localStorage`
do navegador e restaurado quando o app é reaberto — evitando perder o trabalho ao
recarregar ou fechar a página por engano. Há um botão **"Limpar rascunho"** para
reiniciar.

Os dados ficam **apenas no navegador de quem preenche**: nada é enviado a nenhum
servidor. Se o `localStorage` não estiver disponível (por exemplo, ao abrir via
`file://` com restrições ou em navegação privada), o app continua funcionando,
apenas sem o autosave.

## Deploy (Cloudflare Pages)

Publicado em **https://checklist-de-medicao.pages.dev**.

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 20 (ver `.nvmrc`)

Deploy manual: `npm run deploy` (requer `CLOUDFLARE_API_TOKEN` e
`CLOUDFLARE_ACCOUNT_ID` no ambiente — **nunca** comitar o token). Detalhes e a
opção de integração com Git (deploy automático a cada push na `main`) em
[`docs/DEPLOY_CLOUDFLARE.md`](docs/DEPLOY_CLOUDFLARE.md).

---

## Histórico de versões

O app nasceu como uma sequência de arquivos HTML numerados (`checklist-v1` … `v5`).
Na Sprint 0 essa evolução foi consolidada: a **v5** passou a ser o `index.html`
vigente e as versões anteriores foram movidas para [`archive/`](archive/) como
referência histórica. A partir daqui, o versionamento é feito por Git + `CHANGELOG.md`,
não por cópia de arquivo. Veja [`CHANGELOG.md`](CHANGELOG.md).
