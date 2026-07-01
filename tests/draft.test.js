// Testes da camada pura de rascunho (src/draft.js).
// draft.js é UMD; como o projeto é "type":"module", carregamos o arquivo
// fornecendo um `module` para acionar o caminho CommonJS do UMD.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDraftModule() {
  const src = readFileSync(resolve(import.meta.dirname, '../src/draft.js'), 'utf8');
  const mod = { exports: {} };
  new Function('module', 'exports', src)(mod, mod.exports);
  return mod.exports;
}
const Draft = loadDraftModule();

function memStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _map: m,
  };
}

const sampleDraft = {
  id: { cliente: 'ACME', projeto: 'P-1', consultor: 'Ana' },
  observacoes: 'linha 1\nlinha 2',
  photosNA: true,
  secq: { ban: 'sim', 5: 'nao', 6: null },
  fixed: { s1_0: { status: 'ok', fields: {} }, s2_0: { status: 'na', fields: {} } },
  bancadas: [{ id: 'ba_1', fields: { ambiente: 'Cozinha' }, cuba: 'na', modeloCuba: null, metalInstal: null }],
  dynEletros: [],
  dyn5: [],
  dyn6: [],
};

describe('draft — serialização', () => {
  it('faz round-trip serialize → parse preservando o conteúdo', () => {
    const raw = Draft.serializeDraft(sampleDraft);
    expect(typeof raw).toBe('string');
    expect(Draft.parseDraft(raw)).toEqual(sampleDraft);
  });

  it('embrulha com a versão esperada', () => {
    const parsed = JSON.parse(Draft.serializeDraft(sampleDraft));
    expect(parsed.version).toBe(Draft.DRAFT_VERSION);
    expect(parsed.data).toEqual(sampleDraft);
  });

  it('ignora JSON inválido', () => {
    expect(Draft.parseDraft('not json')).toBeNull();
    expect(Draft.parseDraft('')).toBeNull();
    expect(Draft.parseDraft(null)).toBeNull();
  });

  it('ignora versão incompatível', () => {
    expect(Draft.parseDraft(JSON.stringify({ version: 999, data: {} }))).toBeNull();
  });

  it('ignora envelope sem data válido', () => {
    expect(Draft.parseDraft(JSON.stringify({ version: 1 }))).toBeNull();
    expect(Draft.parseDraft(JSON.stringify({ version: 1, data: 'x' }))).toBeNull();
  });
});

describe('draft — storage', () => {
  it('salva e restaura via storage injetado', () => {
    const s = memStorage();
    expect(Draft.saveDraft(sampleDraft, s)).toBe(true);
    expect(s._map.has(Draft.DRAFT_KEY)).toBe(true);
    expect(Draft.loadDraft(s)).toEqual(sampleDraft);
  });

  it('loadDraft retorna null quando não há rascunho', () => {
    expect(Draft.loadDraft(memStorage())).toBeNull();
  });

  it('limpa o rascunho', () => {
    const s = memStorage();
    Draft.saveDraft(sampleDraft, s);
    expect(Draft.clearDraft(s)).toBe(true);
    expect(Draft.loadDraft(s)).toBeNull();
  });

  it('não lança se o storage falhar (ex.: file:// / modo privado)', () => {
    const broken = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    expect(Draft.saveDraft(sampleDraft, broken)).toBe(false);
    expect(Draft.loadDraft(broken)).toBeNull();
    expect(Draft.clearDraft(broken)).toBe(false);
  });

  it('retorna false/null quando não há storage disponível', () => {
    expect(Draft.saveDraft(sampleDraft, null)).toBe(false);
    // Sem storage e sem localStorage global (ambiente node), usa o padrão nulo.
  });
});
