import { test, expect } from '@playwright/test';

// Fluxo crítico em navegador real: preencher a identificação mínima, resolver os
// itens, liberar e gerar a solicitação, voltar e editar, e confirmar o autosave
// após recarregar.
test('preencher → concluir → resumo → voltar/editar → autosave', async ({ page }) => {
  await page.goto('/');

  // Identificação mínima.
  await page.fill('#idgrid [data-id="cliente"]', 'ACME Marcenaria');
  await page.fill('#idgrid [data-id="projeto"]', 'P-1');
  await page.fill('#idgrid [data-id="consultor"]', 'Ana');
  await page.selectOption('#idgrid [data-id="tipo_medicao"]', 'Final');
  await page.selectOption('#idgrid [data-id="loja"]', 'Campinas');
  await page.fill('#idgrid [data-id="endereco"]', 'Rua A');
  await page.fill('#idgrid [data-id="numero"]', '100');
  await page.fill('#idgrid [data-id="responsavel_obra"]', 'João');
  await page.fill('#idgrid [data-id="telefone_responsavel"]', '11999998888');
  await page.selectOption('#idgrid [data-id="tipo"]', 'Obra nova');
  await page.fill('#idgrid [data-id="qtd_ambientes"]', '3');
  // Nomear os 3 ambientes gerados pela quantidade (0.6.4).
  await page.fill('#idgrid [data-amb="0"]', 'Cozinha');
  await page.fill('#idgrid [data-amb="1"]', 'Lavanderia');
  await page.fill('#idgrid [data-amb="2"]', 'Dormitório');
  await page.fill('#idgrid [data-id="data_checklist"]', '2026-07-01');
  await page.fill('#idgrid [data-id="data_solicitacao_medicao"]', '2026-07-02');
  await page.fill('#idgrid [data-id="link_fotos"]', 'https://sharepoint/fotos');

  // Telefone mascarado.
  await expect(page.locator('#idgrid [data-id="telefone_responsavel"]')).toHaveValue('(11) 9 9999-8888');

  // Seção 1: todos concluídos...
  const s1 = page.locator('#sec1 .seg[data-id]');
  for (let i = 0; i < (await s1.count()); i++) {
    await s1.nth(i).locator('[data-s="ok"]').click();
  }
  // ...exceto o primeiro item, marcado como N/A (deve continuar liberando).
  await page.click('.seg[data-id="s1_0"] [data-s="na"]');
  // ...e o segundo, marcado como Pendente (ambiente + motivo).
  await page.click('.seg[data-id="s1_1"] [data-s="pend"]');
  await page.fill('[data-fk="amb_pend"][data-fid="s1_1"]', 'Cozinha');
  await page.fill('[data-fk="obs"][data-fid="s1_1"]', 'Falta rejunte');
  // Ambiente extra dentro de Obra Civil, marcado como N/A.
  await page.click('[data-add="s1x"]');
  await page.fill('#sec1-extras [data-xk="nome"]', 'Varanda gourmet');
  await page.click('#sec1-extras .seg[data-xid] [data-s="na"]');
  // Seção 2: todos "não se aplica".
  const s2 = page.locator('#sec2 .seg[data-id]');
  for (let i = 0; i < (await s2.count()); i++) {
    await s2.nth(i).locator('[data-s="na"]').click();
  }
  // Portões 3/4/5: não.
  await page.click('.seg[data-secq="ban"] [data-v="nao"]');
  await page.click('.seg[data-secq="5"] [data-v="nao"]');
  await page.click('.seg[data-secq="6"] [data-v="nao"]');

  // Botão liberado → gera resumo.
  const finish = page.locator('#finish');
  await expect(finish).toBeEnabled();
  await finish.click();

  const summary = page.locator('#summary');
  await expect(summary).toContainText('Solicitação de Medição');
  await expect(summary).toContainText('ACME Marcenaria');
  // Ambientes nomeados, pendência real e extra N/A refletidos no resumo (0.6.4).
  await expect(summary).toContainText('Cozinha');
  await expect(summary).toContainText('Falta rejunte');
  await expect(summary).toContainText('Varanda gourmet');

  // Voltar e editar preserva o estado.
  await page.click('#edit');
  await expect(page.locator('#idgrid [data-id="cliente"]')).toHaveValue('ACME Marcenaria');
  await expect(finish).toBeEnabled();

  // Aguarda o autosave persistir o modelo completo no localStorage.
  await expect.poll(async () => page.evaluate(() => {
    const raw = localStorage.getItem('checklist-medicao:draft:v1');
    return raw ? JSON.parse(raw).data?.id?.cliente : null;
  })).toBe('ACME Marcenaria');

  // Recarregar → autosave restaura.
  await page.reload();
  await expect(page.locator('#idgrid [data-id="cliente"]')).toHaveValue('ACME Marcenaria');
  await expect(page.locator('#autosaveMsg')).toContainText(/restaurad/i);
});
