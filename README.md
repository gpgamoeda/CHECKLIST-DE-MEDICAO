# Checklist de Envio para Medição — FABRILIS

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

- **Front-end:** HTML + CSS + JavaScript puro (vanilla), sem framework.
- **Arquitetura:** `index.html` (marcação) referencia `src/styles.css` (estilos) e
  `src/app.js` (lógica, uma IIFE). O JS é carregado como script clássico com
  `defer`, então o `index.html` também funciona aberto direto via `file://`.
- **Dependências em runtime:** nenhuma.
- **Persistência:** nenhuma (o estado vive apenas em memória; recarregar a página
  perde o preenchimento).
- **Ferramentas (dev):** Node ≥ 20, [Vitest](https://vitest.dev) (testes) e
  [html-validate](https://html-validate.org) (lint). O servidor de desenvolvimento
  e o build são scripts Node sem dependências (`scripts/`).

Uma auditoria detalhada está em [`docs/DIAGNOSTICO.md`](docs/DIAGNOSTICO.md) e o
plano de evolução em [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## Como rodar localmente

Não é obrigatório instalar nada para usar o app — basta abrir `index.html` no
navegador. Para o fluxo de desenvolvimento (servidor local, lint, testes, build):

```bash
# 1. Instalar as ferramentas de desenvolvimento
npm install

# 2. Servidor local (http://localhost:5173)
npm run dev

# 3. Validações
npm run lint        # valida a estrutura do HTML
npm test            # roda os testes (Vitest)
npm run build       # gera a pasta dist/ pronta para deploy
npm run validate    # lint + test + build em sequência
```

## Scripts disponíveis

| Script            | O que faz                                                        |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Servidor estático local (porta 5173; use `PORT=8080` para trocar) |
| `npm run build`   | Copia os artefatos publicáveis para `dist/`                      |
| `npm run lint`    | Valida `index.html` com html-validate                            |
| `npm test`        | Roda os testes com Vitest                                        |
| `npm run test:watch` | Testes em modo watch                                          |
| `npm run validate`| `lint` + `test` + `build`                                        |

---

## Estrutura do projeto

```
.
├── index.html            # App vigente (marcação). É o que roda e o que é publicado.
├── src/
│   ├── styles.css        # Estilos extraídos do index.html (Sprint 0.2.0)
│   ├── app.js            # Lógica do checklist extraída do index.html (Sprint 0.2.0)
│   └── draft.js          # Autosave local: serialização do rascunho (Sprint 0.2.1)
├── archive/              # Snapshots históricos (v1 a v4.1). Não são publicados.
│   └── README.md
├── docs/
│   ├── DIAGNOSTICO.md    # Auditoria técnica do estado atual
│   └── ROADMAP.md        # Evolução planejada por releases
├── scripts/
│   ├── dev-server.mjs    # Servidor estático de desenvolvimento (sem deps)
│   └── build.mjs         # Gera dist/ (sem deps)
├── tests/
│   └── index.test.js     # Smoke tests da estrutura do app
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

O projeto já está preparado para o Cloudflare Pages:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 20 (ver `.nvmrc`)

O `build` atual apenas copia o app estático para `dist/`. Quando a migração para
Vite acontecer (ver roadmap), o mesmo contrato (`build` → `dist/`) continua válido.

---

## Histórico de versões

O app nasceu como uma sequência de arquivos HTML numerados (`checklist-v1` … `v5`).
Na Sprint 0 essa evolução foi consolidada: a **v5** passou a ser o `index.html`
vigente e as versões anteriores foram movidas para [`archive/`](archive/) como
referência histórica. A partir daqui, o versionamento é feito por Git + `CHANGELOG.md`,
não por cópia de arquivo. Veja [`CHANGELOG.md`](CHANGELOG.md).
