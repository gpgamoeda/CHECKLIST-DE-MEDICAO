// @vitest-environment node
// Testes de comportamento: montam o index.html num JSDOM próprio a cada boot
// (listeners limpos) e chamam initApp() do módulo real. São a rede de segurança
// de comportamento para os refactors seguintes (React etc.).
import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { initApp } from '../src/app.ts';
import * as Draft from '../src/draft.ts';

const root = resolve(import.meta.dirname, '..');
const htmlSrc = readFileSync(resolve(root, 'index.html'), 'utf8');

// Sobe o app num DOM novo e isolado. O <script type=module> do index.html não é
// executado pelo JSDOM (sem loader), então chamamos initApp() manualmente.
function boot(seedDraft) {
  const dom = new JSDOM(htmlSrc, { url: 'http://localhost/' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;
  window.print = () => {};
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  if (seedDraft) window.localStorage.setItem(Draft.DRAFT_KEY, Draft.serializeDraft(seedDraft));
  initApp();
  return window.document;
}

function setInput(doc, sel, value) {
  const el = doc.querySelector(sel);
  el.value = value;
  el.dispatchEvent(new global.window.Event('input', { bubbles: true }));
}
function setSelect(doc, sel, value) {
  const el = doc.querySelector(sel);
  el.value = value;
  el.dispatchEvent(new global.window.Event('change', { bubbles: true }));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('restauração de rascunho', () => {
  it('reconstrói identificação, item fixo e bancada dinâmica ao carregar', () => {
    const doc = boot({
      id: { cliente: 'ACME Marcenaria', projeto: 'P-42' },
      observacoes: 'obs de teste',
      photosNA: false,
      secq: { ban: 'sim', 5: null, 6: null },
      fixed: { s1_0: { status: 'ok', fields: {} } },
      bancadas: [{ id: 'ba_test', fields: { ambiente: 'Cozinha', material: 'Quartzo', dim: '2000x600' }, cuba: 'na', modeloCuba: null, metalInstal: null }],
      dynEletros: [],
      dyn5: [],
      dyn6: [],
    });

    expect(doc.querySelector('#idgrid [data-id="cliente"]').value).toBe('ACME Marcenaria');
    expect(doc.querySelector('#idgrid [data-id="projeto"]').value).toBe('P-42');
    expect(doc.getElementById('observacoes_gerais').value).toBe('obs de teste');
    expect(doc.querySelector('.seg[data-id="s1_0"] [data-s="ok"]').classList.contains('on-y')).toBe(true);
    const banca = doc.querySelector('#bancadasRows .subcard');
    expect(banca).not.toBeNull();
    expect(doc.querySelector('[data-fid="ba_test"][data-fk="ambiente"]').value).toBe('Cozinha');
    expect(doc.querySelector('[data-cuba][data-fid="ba_test"]').value).toBe('na');
    expect(doc.getElementById('autosaveMsg').textContent).toMatch(/restaurad/i);
  });

  it('ignora com segurança um rascunho corrompido', () => {
    const dom = new JSDOM(htmlSrc, { url: 'http://localhost/' });
    dom.window.localStorage.setItem('checklist-medicao:draft:v1', '{lixo');
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;
    expect(() => initApp()).not.toThrow();
    expect(dom.window.document.querySelector('#idgrid [data-id="cliente"]').value).toBe('');
  });
});

describe('autosave', () => {
  it('salva as edições no localStorage (com debounce)', () => {
    vi.useFakeTimers();
    const doc = boot();
    setInput(doc, '#idgrid [data-id="cliente"]', 'Cliente X');
    doc.querySelector('.seg[data-id="s1_0"] [data-s="ok"]').click();
    vi.advanceTimersByTime(600);

    const draft = Draft.loadDraft(global.localStorage);
    expect(draft).not.toBeNull();
    expect(draft.id.cliente).toBe('Cliente X');
    expect(draft.fixed.s1_0.status).toBe('ok');
  });

  it('expõe o botão de limpar rascunho', () => {
    const doc = boot();
    expect(doc.getElementById('clearDraft')).not.toBeNull();
  });
});

describe('fluxo de conclusão (regra preservada)', () => {
  it('libera o botão e gera o resumo quando tudo é resolvido', () => {
    const doc = boot();

    setInput(doc, '#idgrid [data-id="cliente"]', 'ACME');
    setInput(doc, '#idgrid [data-id="projeto"]', 'P-1');
    setInput(doc, '#idgrid [data-id="consultor"]', 'Ana');
    setSelect(doc, '#idgrid [data-id="tipo_medicao"]', 'Final');
    setSelect(doc, '#idgrid [data-id="loja"]', 'Campinas');
    setInput(doc, '#idgrid [data-id="endereco"]', 'Rua A');
    setInput(doc, '#idgrid [data-id="numero"]', '100');
    setInput(doc, '#idgrid [data-id="responsavel_obra"]', 'João');
    setInput(doc, '#idgrid [data-id="telefone_responsavel"]', '11999998888');
    setSelect(doc, '#idgrid [data-id="tipo"]', 'Obra nova');
    setInput(doc, '#idgrid [data-id="qtd_ambientes"]', '3');
    setInput(doc, '#idgrid [data-id="data_checklist"]', '2026-07-01');
    setInput(doc, '#idgrid [data-id="data_solicitacao_medicao"]', '2026-07-02');
    setInput(doc, '#idgrid [data-id="link_fotos"]', 'https://sharepoint/fotos');

    doc.querySelectorAll('#sec1 .seg[data-id]').forEach((seg) => seg.querySelector('[data-s="ok"]').click());
    doc.querySelectorAll('#sec2 .seg[data-id]').forEach((seg) => seg.querySelector('[data-s="na"]').click());
    doc.querySelector('.seg[data-secq="ban"] [data-v="nao"]').click();
    doc.querySelector('.seg[data-secq="5"] [data-v="nao"]').click();
    doc.querySelector('.seg[data-secq="6"] [data-v="nao"]').click();

    const finish = doc.getElementById('finish');
    expect(finish.disabled).toBe(false);

    finish.click();
    const summary = doc.getElementById('summary');
    expect(summary.classList.contains('show')).toBe(true);
    expect(summary.innerHTML).toContain('Solicitação de Medição');
  });
});
