// @vitest-environment jsdom
// Testes de comportamento sobre o app React real: renderizam <App/> (que aciona
// initApp() no efeito) e exercitam autosave, restauração e o fluxo de conclusão.
// São a rede de segurança de comportamento para a componentização (0.4.x).
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { App } from '../src/components/App';
import * as Draft from '../src/draft';

beforeEach(() => {
  localStorage.clear();
  // APIs não implementadas no jsdom, usadas pelo resumo/impressão.
  window.print = () => {};
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
});
afterEach(() => { cleanup(); }); // desmonta → teardown remove listeners de documento

function fireInput(sel: string, value: string) {
  const el = document.querySelector(sel) as HTMLInputElement;
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
function fireChange(sel: string, value: string) {
  const el = document.querySelector(sel) as HTMLSelectElement;
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
function click(sel: string) {
  (document.querySelector(sel) as HTMLElement).click();
}

describe('shell React', () => {
  it('renderiza as 6 seções e os campos de identificação', () => {
    render(<App />);
    const titulos = Array.from(document.querySelectorAll('.sec-t')).map((e) => e.textContent);
    for (const t of ['Identificação', 'Obra Civil Finalizada', 'Eletrodomésticos', 'Bancadas, Cubas e Metais', 'Mobiliário de Terceiros', 'Demais Itens que Interferem no Projeto', 'Observações Gerais']) {
      expect(titulos).toContain(t);
    }
    for (const campo of ['cliente', 'projeto', 'consultor', 'loja', 'endereco', 'responsavel_obra']) {
      expect(document.querySelector(`#idgrid [data-id="${campo}"]`)).not.toBeNull();
    }
    // initApp preencheu a seção 1 (12 itens) e a 2 (19 itens).
    expect(document.querySelectorAll('#sec1 .item').length).toBe(12);
    expect(document.querySelectorAll('#sec2 .item').length).toBe(19);
  });
});

describe('restauração de rascunho', () => {
  it('reconstrói identificação, item fixo e bancada ao montar', () => {
    Draft.saveDraft({
      id: { cliente: 'ACME Marcenaria', projeto: 'P-42' },
      observacoes: 'obs de teste',
      photosNA: false,
      secq: { ban: 'sim', 5: null, 6: null },
      fixed: { s1_0: { status: 'ok', fields: {} } },
      bancadas: [{ id: 'ba_test', fields: { ambiente: 'Cozinha', material: 'Quartzo', dim: '2000x600' }, cuba: 'na', modeloCuba: null, metalInstal: null }],
      dynEletros: [], dyn5: [], dyn6: [],
    }, localStorage);

    render(<App />);

    expect((document.querySelector('#idgrid [data-id="cliente"]') as HTMLInputElement).value).toBe('ACME Marcenaria');
    expect((document.getElementById('observacoes_gerais') as HTMLTextAreaElement).value).toBe('obs de teste');
    expect(document.querySelector('.seg[data-id="s1_0"] [data-s="ok"]')!.classList.contains('on-y')).toBe(true);
    expect(document.querySelector('#bancadasRows .subcard')).not.toBeNull();
    expect((document.querySelector('[data-fid="ba_test"][data-fk="ambiente"]') as HTMLInputElement).value).toBe('Cozinha');
    expect(document.getElementById('autosaveMsg')!.textContent).toMatch(/restaurad/i);
  });

  it('ignora com segurança um rascunho corrompido', () => {
    localStorage.setItem('checklist-medicao:draft:v1', '{lixo');
    expect(() => render(<App />)).not.toThrow();
    expect((document.querySelector('#idgrid [data-id="cliente"]') as HTMLInputElement).value).toBe('');
  });
});

describe('autosave', () => {
  it('salva as edições no localStorage (após o debounce)', async () => {
    render(<App />);
    fireInput('#idgrid [data-id="cliente"]', 'Cliente X');
    click('.seg[data-id="s1_0"] [data-s="ok"]');
    await new Promise((r) => setTimeout(r, 500));

    const draft = Draft.loadDraft(localStorage);
    expect(draft).not.toBeNull();
    expect(draft!.id.cliente).toBe('Cliente X');
    expect(draft!.fixed.s1_0.status).toBe('ok');
  });

  it('expõe o botão de limpar rascunho', () => {
    render(<App />);
    expect(document.getElementById('clearDraft')).not.toBeNull();
  });
});

describe('fluxo de conclusão (regra preservada)', () => {
  it('libera o botão e gera o resumo quando tudo é resolvido', () => {
    render(<App />);

    fireInput('#idgrid [data-id="cliente"]', 'ACME');
    fireInput('#idgrid [data-id="projeto"]', 'P-1');
    fireInput('#idgrid [data-id="consultor"]', 'Ana');
    fireChange('#idgrid [data-id="tipo_medicao"]', 'Final');
    fireChange('#idgrid [data-id="loja"]', 'Campinas');
    fireInput('#idgrid [data-id="endereco"]', 'Rua A');
    fireInput('#idgrid [data-id="numero"]', '100');
    fireInput('#idgrid [data-id="responsavel_obra"]', 'João');
    fireInput('#idgrid [data-id="telefone_responsavel"]', '11999998888');
    fireChange('#idgrid [data-id="tipo"]', 'Obra nova');
    fireInput('#idgrid [data-id="qtd_ambientes"]', '3');
    fireInput('#idgrid [data-id="data_checklist"]', '2026-07-01');
    fireInput('#idgrid [data-id="data_solicitacao_medicao"]', '2026-07-02');
    fireInput('#idgrid [data-id="link_fotos"]', 'https://sharepoint/fotos');

    document.querySelectorAll('#sec1 .seg[data-id]').forEach((seg) => (seg.querySelector('[data-s="ok"]') as HTMLElement).click());
    document.querySelectorAll('#sec2 .seg[data-id]').forEach((seg) => (seg.querySelector('[data-s="na"]') as HTMLElement).click());
    click('.seg[data-secq="ban"] [data-v="nao"]');
    click('.seg[data-secq="5"] [data-v="nao"]');
    click('.seg[data-secq="6"] [data-v="nao"]');

    const finish = document.getElementById('finish') as HTMLButtonElement;
    expect(finish.disabled).toBe(false);

    finish.click();
    const summary = document.getElementById('summary')!;
    expect(summary.classList.contains('show')).toBe(true);
    expect(summary.innerHTML).toContain('Solicitação de Medição');
  });
});
