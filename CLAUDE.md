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

- HTML + CSS + JS puro, sem framework e sem dependências em runtime. Desde a
  Sprint 0.2.0 **não é mais arquivo único**: `index.html` referencia
  `src/styles.css` e `src/app.js` (JS é script clássico com `defer`, então abrir
  o `index.html` via `file://` continua funcionando).
- Ferramentas de dev: Node ≥ 20, Vitest (testes), html-validate (lint). Servidor
  de dev e build são scripts Node sem dependências, em `scripts/`.
- Alvo de deploy: **Cloudflare Pages** (`build` → `dist/`).
- Direção desejada (futuro, ainda não aplicado): React + TypeScript + Vite, com
  CSS Modules ou Tailwind. **Não migre tudo de uma vez.**

## Comandos

```bash
npm install         # instala ferramentas de dev
npm run dev         # servidor local em http://localhost:5173
npm run lint        # html-validate no index.html
npm test            # Vitest
npm run build       # gera dist/
npm run validate    # lint + test + build
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
- Saída = resumo imprimível + "Voltar e editar". **Não há autosave**: recarregar
  perde o preenchimento (limitação conhecida, ver roadmap).

## O que NÃO fazer

- Não reintroduzir versionamento por cópia de arquivo (`checklist-v6.html` etc.).
  Use Git + `CHANGELOG.md`.
- Não publicar a pasta `archive/` — ela é só referência histórica.
- Não alterar regras de negócio silenciosamente. Se mudar, registre no PR e no
  changelog.
- Não remover funcionalidades existentes sem justificativa registrada.
- Não abrir PR sem `npm run validate` verde.
