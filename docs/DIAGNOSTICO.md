# Diagnóstico técnico — estado inicial

Auditoria realizada na Sprint 0, antes de qualquer alteração de comportamento.
Serve de base para o [roadmap](ROADMAP.md) de evolução.

## 1. O que o projeto faz

É uma ferramenta interna de página única para consultores da FABRILIS montarem a
**solicitação de medição** de um projeto de marcenaria. O fluxo:

1. **Identificação da obra** — cliente, projeto, consultor, arquiteto (opcional),
   loja, endereço detalhado, responsável e telefone, tipo de medição, tipo de obra,
   quantidade de ambientes, datas e link das fotos (ou "não se aplica").
2. **Checklist por seções:**
   - **1. Obra Civil Finalizada** — cada item "Concluído" ou "Pendente" (pendência
     pede ambiente + motivo).
   - **2. Eletrodomésticos** — "Definido" (marca, modelo, referência, dimensões e,
     para alguns, alimentação/respiro) ou "não se aplica"; permite adicionar itens
     fora da lista.
   - **3. Bancadas, Cubas e Metais** — por ambiente; o tipo de cuba condiciona os
     campos seguintes (cuba e metal).
   - **4. Mobiliário de Terceiros** e **5. Demais Itens** — listas dinâmicas
     condicionadas a "sim/não".
   - **6. Observações Gerais** — texto livre, opcional.
3. **Barra de progresso** que só libera o botão quando **todos os itens estão
   resolvidos**.
4. **Resumo imprimível** (Imprimir / Salvar PDF) + "Voltar e editar".

Regras de apoio: máscara de telefone, datas em pt-BR no resumo, aviso especial para
obras de "herança/acervo" e destaque para o Termo de Responsabilidade.

## 2. Stack atual

| Camada        | Tecnologia                                                      |
| ------------- | -------------------------------------------------------------- |
| UI            | HTML + CSS (`<style>` inline) em arquivo único                  |
| Lógica        | JavaScript puro (vanilla) dentro de uma IIFE no próprio HTML    |
| Estado        | Objeto `state` em memória + variáveis de módulo                 |
| Persistência  | Nenhuma                                                         |
| Build/deploy  | Nenhum (arquivo aberto direto no navegador)                    |
| Testes/lint   | Nenhum                                                          |

## 3. Principais riscos

- **Perda de dados (alto).** Sem persistência: um refresh ou fechamento acidental
  apaga todo o preenchimento — e o formulário é longo. É o risco de UX mais grave.
- **Ponto de entrada desatualizado (corrigido nesta sprint).** O `index.html`
  publicado era a **v1**, enquanto a versão real em uso era a **v5**. Qualquer
  deploy padrão (Cloudflare Pages, GitHub Pages) serviria a versão antiga.
- **Ausência de rede de segurança.** Sem testes, lint ou build, qualquer edição
  no arquivo de 875 linhas podia quebrar o app sem aviso.
- **Sem registro do que foi enviado.** A saída é só impressão/PDF; nada fica
  gravado nem é enviado a um sistema — não há histórico nem rastreabilidade.
- **Escape de HTML mínimo.** A montagem do resumo usa uma função `esc()` que trata
  apenas `& < >`. É suficiente para o uso atual (texto, não atributos), mas frágil
  se a renderização mudar.

## 4. Problemas de arquitetura

- **Versionamento por cópia de arquivo.** O histórico virou `checklist-v1..v5.html`
  no mesmo diretório, em vez de usar Git. Gera duplicação e confusão sobre "qual é
  o atual". *Tratado na Sprint 0: v5 promovida a `index.html`, demais em `archive/`.*
- **Arquivo único monolítico.** HTML, CSS e ~560 linhas de JS convivem em um só
  arquivo, dificultando leitura, reuso e teste.
- **Estado global mutável + acoplamento por strings de id.** O estado é indexado
  por ids como `s1_0`, `s2_3`, `ba_...`, `de_...`, com regras espalhadas por
  `rowResolved`, `update` e a montagem do resumo. Qualquer mudança exige entender
  o arquivo inteiro.
- **Lógica de apresentação e de negócio misturadas.** Renderização por
  `innerHTML` + delegação de eventos no `document`, sem separação clara entre
  dados, validação e view.

## 5. Problemas de UI/UX

- **Sem autosave nem rascunho** — a maior dor prática (ver riscos).
- **Formulário longo, sem navegação entre seções** nem recolhimento; em telas
  pequenas exige muita rolagem.
- **Saída única por impressão.** Não há exportação de dados (JSON/CSV) nem envio;
  dificulta integrar com outros sistemas ou guardar o que foi medido.
- **Acessibilidade limitada.** `label`s não associados aos campos via `for/id`,
  estados comunicados sobretudo por cor, botões de segmento sem `aria`.
- **"Voltar e editar" descarta o resumo sem confirmação** (impacto pequeno).

## 6. Proposta de evolução por releases

Resumo (detalhes em [ROADMAP.md](ROADMAP.md)):

- **0.1.0 — Sprint 0 (esta):** auditoria, documentação, consolidação da base e
  toolchain mínima de validação. Sem mudança de comportamento.
- **0.2.0:** extrair CSS e JS do HTML para módulos; adicionar autosave em
  `localStorage`; primeiros testes unitários das funções puras (máscara, datas,
  validação).
- **0.3.0:** introduzir Vite + TypeScript mantendo o comportamento; deploy contínuo
  no Cloudflare Pages.
- **0.4.0:** componentizar as seções em React + TS, com CSS Modules ou Tailwind;
  testes de componente (Vitest) e um teste de fluxo crítico com Playwright.
- **0.5.0+:** decidir persistência/registro (localStorage → possível D1/KV via
  Pages Functions) e exportação estruturada da solicitação, se houver necessidade
  real de histórico/integração.

### Princípios

Mudanças pequenas, revisáveis e reversíveis; comportamento preservado a cada passo;
nada de redesign completo nem de reescrever tudo de uma vez.
