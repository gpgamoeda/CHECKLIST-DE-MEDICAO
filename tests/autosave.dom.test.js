// @vitest-environment jsdom
// Testes de comportamento em jsdom: carregam o index.html + src/draft.js +
// src/app.js e exercitam autosave, restauração e o fluxo de conclusão.
// São a rede de segurança de comportamento para os refactors seguintes.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlSrc = readFileSync(resolve(root, 'index.html'), 'utf8');
const draftSrc = readFileSync(resolve(root, 'src/draft.js'), 'utf8');
const appSrc = readFileSync(resolve(root, 'src/app.js'), 'utf8');
const bodyInner = htmlSrc.match(/<body>([\s\S]*)<\/body>/)[1];

function loadDraftModule() {
  const mod = { exports: {} };
  new Function('module', 'exports', draftSrc)(mod, mod.exports);
  return mod.exports;
}

// Sobe o app: injeta o markup, faz o bridge do ChecklistDraft e executa app.js.
function boot() {
  document.body.innerHTML = bodyInner; // scripts via innerHTML não executam (ok)
  window.print = () => {};
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  const Draft = loadDraftModule();
  globalThis.ChecklistDraft = Draft;
  window.ChecklistDraft = Draft;
  new Function(appSrc)();
  return Draft;
}

function setInput(sel, value) {
  const el = document.querySelector(sel);
  el.value = value;
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
  return el;
}
function setSelect(sel, value) {
  const el = document.querySelector(sel);
  el.value = value;
  el.dispatchEvent(new window.Event('change', { bubbles: true }));
  return el;
}
function click(sel) {
  const el = document.querySelector(sel);
  el.click();
  return el;
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});
afterEach(() => {
  vi.useRealTimers();
});

describe('restauração de rascunho', () => {
  it('reconstrói identificação, item fixo e bancada dinâmica ao carregar', () => {
    const Draft = loadDraftModule();
    Draft.saveDraft({
      id: { cliente: 'ACME Marcenaria', projeto: 'P-42' },
      observacoes: 'obs de teste',
      photosNA: false,
      secq: { ban: 'sim', 5: null, 6: null },
      fixed: { s1_0: { status: 'ok', fields: {} } },
      bancadas: [{ id: 'ba_test', fields: { ambiente: 'Cozinha', material: 'Quartzo', dim: '2000x600' }, cuba: 'na', modeloCuba: null, metalInstal: null }],
      dynEletros: [],
      dyn5: [],
      dyn6: [],
    }, localStorage);

    boot();

    expect(document.querySelector('#idgrid [data-id="cliente"]').value).toBe('ACME Marcenaria');
    expect(document.querySelector('#idgrid [data-id="projeto"]').value).toBe('P-42');
    expect(document.getElementById('observacoes_gerais').value).toBe('obs de teste');
    // item fixo restaurado (botão marcado)
    expect(document.querySelector('.seg[data-id="s1_0"] [data-s="ok"]').classList.contains('on-y')).toBe(true);
    // bancada dinâmica recriada com valores
    const banca = document.querySelector('#bancadasRows .subcard');
    expect(banca).not.toBeNull();
    expect(document.querySelector('[data-fid="ba_test"][data-fk="ambiente"]').value).toBe('Cozinha');
    expect(document.querySelector('[data-cuba][data-fid="ba_test"]').value).toBe('na');
    // indicador
    expect(document.getElementById('autosaveMsg').textContent).toMatch(/restaurad/i);
  });

  it('ignora com segurança um rascunho corrompido', () => {
    localStorage.setItem('checklist-medicao:draft:v1', '{lixo');
    expect(() => boot()).not.toThrow();
    expect(document.querySelector('#idgrid [data-id="cliente"]').value).toBe('');
  });
});

describe('autosave', () => {
  it('salva as edições no localStorage (com debounce)', () => {
    vi.useFakeTimers();
    boot();
    setInput('#idgrid [data-id="cliente"]', 'Cliente X');
    click('.seg[data-id="s1_0"] [data-s="ok"]');
    vi.advanceTimersByTime(600);

    const draft = loadDraftModule().loadDraft(localStorage);
    expect(draft).not.toBeNull();
    expect(draft.id.cliente).toBe('Cliente X');
    expect(draft.fixed.s1_0.status).toBe('ok');
  });

  it('expõe o botão de limpar rascunho', () => {
    boot();
    expect(document.getElementById('clearDraft')).not.toBeNull();
  });
});

describe('fluxo de conclusão (regra preservada)', () => {
  it('libera o botão e gera o resumo quando tudo é resolvido', () => {
    boot();

    // Identificação obrigatória
    setInput('#idgrid [data-id="cliente"]', 'ACME');
    setInput('#idgrid [data-id="projeto"]', 'P-1');
    setInput('#idgrid [data-id="consultor"]', 'Ana');
    setSelect('#idgrid [data-id="tipo_medicao"]', 'Final');
    setSelect('#idgrid [data-id="loja"]', 'Campinas');
    setInput('#idgrid [data-id="endereco"]', 'Rua A');
    setInput('#idgrid [data-id="numero"]', '100');
    setInput('#idgrid [data-id="responsavel_obra"]', 'João');
    setInput('#idgrid [data-id="telefone_responsavel"]', '11999998888');
    setSelect('#idgrid [data-id="tipo"]', 'Obra nova');
    setInput('#idgrid [data-id="qtd_ambientes"]', '3');
    setInput('#idgrid [data-id="data_checklist"]', '2026-07-01');
    setInput('#idgrid [data-id="data_solicitacao_medicao"]', '2026-07-02');
    setInput('#idgrid [data-id="link_fotos"]', 'https://sharepoint/fotos');

    // Seção 1: todos concluídos
    document.querySelectorAll('#sec1 .seg[data-id]').forEach((seg) => {
      seg.querySelector('[data-s="ok"]').click();
    });
    // Seção 2: todos "não se aplica"
    document.querySelectorAll('#sec2 .seg[data-id]').forEach((seg) => {
      seg.querySelector('[data-s="na"]').click();
    });
    // Gates 3/4/5: não
    click('.seg[data-secq="ban"] [data-v="nao"]');
    click('.seg[data-secq="5"] [data-v="nao"]');
    click('.seg[data-secq="6"] [data-v="nao"]');

    const finish = document.getElementById('finish');
    expect(finish.disabled).toBe(false);

    finish.click();
    const summary = document.getElementById('summary');
    expect(summary.classList.contains('show')).toBe(true);
    expect(summary.innerHTML).toContain('Solicitação de Medição');
  });
});
