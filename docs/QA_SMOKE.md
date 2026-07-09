# Smoke manual — QA antes do deploy

Roteiro rápido de verificação manual. O fluxo crítico é coberto automaticamente
por `npm run test:e2e` (Playwright); este documento serve para conferência humana
(impressão/PDF, responsividade), que o e2e não valida por completo.

## Preparação

```bash
npm run dev      # ou: npm run build && npm run preview
```

Abra `http://localhost:5173`.

## Fluxo crítico

1. Preencha a **Identificação** (cliente, projeto, consultor, loja, endereço +
   número, responsável + telefone, tipo de medição, tipo de obra, ambientes,
   datas, link das fotos ou "não se aplica").
2. Confirme que o **telefone** recebe a máscara `(00) 0 0000-0000`.
3. Confirme que **Tipo de obra** oferece apenas "Obra nova" e "Reforma" (a opção
   "Herança / acervo" foi removida na 0.6.1).
3a. **Nomes de ambientes (0.6.4):** informe **Quantidade de ambientes = 3** e
    confirme que aparecem `Ambiente 1`, `Ambiente 2`, `Ambiente 3`. Preencha dois e
    deixe um vazio — a geração fica **bloqueada** (campo vazio destacado + aviso).
    Aumente para 4 e confirme que os nomes já digitados são preservados; volte a 2
    e confirme que ficam ativos só os dois primeiros. Confirme que **diminuir apenas
    oculta** os excedentes: volte a 3/4 e veja o nome do 3º reaparecer (nada foi
    apagado). Preencha todos.
4. **Seção 1:** marque itens como Concluído / Pendente / **N/A** (pendência pede
   ambiente + motivo; N/A libera o item sem virar pendência). Use
   **"+ Adicionar ambiente"** para criar uma linha extra, nomeie-a e escolha um
   estado; remova para conferir.
5. **Seção 2:** marque eletros como Definido (com campos) ou "não se aplica";
   adicione um eletro extra e remova.
6. **Seção 3:** responda "Sim"; num ambiente, escolha **Louça** e confirme que
   aparece o **modelo da cuba**; escolha **Inox** e confirme que aparece o
   **metal**; marque a instalação.
7. **Seções 4 e 5:** responda "Sim/Não"; adicione/remova itens.
8. **Seção 6:** escreva uma observação.
9. Confirme que a **barra de progresso** chega a 100% e o botão
   **"Gerar solicitação de medição"** libera.

## Resumo, impressão e edição

10. Gere a solicitação e confira o **resumo** — os **nomes dos ambientes** devem
    aparecer na Identificação; itens/linhas **N/A** aparecem como "não se aplica"
    (nunca como pendência); pendências reais continuam destacadas.
11. **Imprimir / Salvar PDF:** confira que só o resumo aparece (sem a barra, sem
    botões) e que o layout está legível.
12. **Voltar e editar:** confirme que o preenchimento continua lá.

## Autosave

13. Recarregue a página (F5) e confirme que o preenchimento é **restaurado** (aviso
    "Rascunho restaurado").
14. Clique em **"Limpar rascunho"**, confirme, e veja o formulário reiniciar.

## Responsividade

15. Reduza a janela (ou use o modo dispositivo do navegador) para **mobile** e
    **tablet**; confirme que os grids colapsam e nada quebra de forma grave.

Registre no PR qualquer divergência encontrada.
