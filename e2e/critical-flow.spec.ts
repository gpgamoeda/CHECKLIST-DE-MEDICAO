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
  await page.fill('#idgrid [data-id="data_checklist"]', '2026-07-01');
  await page.fill('#idgrid [data-id="data_solicitacao_medicao"]', '2026-07-02');
  await page.fill('#idgrid [data-id="link_fotos"]', 'https://sharepoint/fotos');

  // Telefone mascarado.
  await expect(page.locator('#idgrid [data-id="telefone_responsavel"]')).toHaveValue('(11) 9 9999-8888');

  // Seção 1: todos concluídos.
  const s1 = page.locator('#sec1 .seg[data-id]');
  for (let i = 0; i < (await s1.count()); i++) {
    await s1.nth(i).locator('[data-s="ok"]').click();
  }
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
