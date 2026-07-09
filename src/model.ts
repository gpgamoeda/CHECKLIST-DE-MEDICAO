// Modelo de estado do checklist (fonte do React) + cálculo de progresso.
// O formato é o MESMO do rascunho salvo (src/draft.ts), então o autosave é
// direto e compatível com rascunhos anteriores.
import {
  SEC1_ITEMS, SEC2_ITEMS,
  isSection1Resolved, isSec1ExtraResolved, isEletroResolved, isDynEletroResolved,
  isBancadaResolved, isDynResolved, isIdentificationComplete,
  growAmbientes, parseAmbienteCount,
} from './domain';
import type { Sec1Extra } from './domain';

export interface FixedItem { status: string | null; fields: Record<string, string>; }
export interface DynEletro { id: string; fields: Record<string, string>; }
export interface Bancada {
  id: string;
  fields: Record<string, string>;
  cuba: string | null;
  modeloCuba: string | null;
  metalInstal: string | null;
}
export interface DynItem { id: string; fields: Record<string, string>; }
export type Gate = 'sim' | 'nao' | null;

export interface Model {
  id: Record<string, string>;
  ambientes: string[]; // nomes dos ambientes (derivados de qtd_ambientes) — 0.6.4
  observacoes: string;
  photosNA: boolean;
  secq: { ban: Gate; 5: Gate; 6: Gate };
  fixed: Record<string, FixedItem>; // chaves s1_0.. e s2_0..
  sec1Extras: Sec1Extra[]; // linhas extras de Obra Civil — 0.6.4
  bancadas: Bancada[];
  dynEletros: DynEletro[];
  dyn5: DynItem[];
  dyn6: DynItem[];
}

export function emptyModel(): Model {
  const fixed: Record<string, FixedItem> = {};
  SEC1_ITEMS.forEach((_, i) => { fixed['s1_' + i] = { status: null, fields: {} }; });
  SEC2_ITEMS.forEach((_, i) => { fixed['s2_' + i] = { status: null, fields: {} }; });
  return {
    id: {}, ambientes: [], observacoes: '', photosNA: false,
    secq: { ban: null, 5: null, 6: null },
    fixed, sec1Extras: [], bancadas: [], dynEletros: [], dyn5: [], dyn6: [],
  };
}

// Normaliza um rascunho carregado para um Model completo (garante todas as chaves).
export function modelFromDraft(draft: any): Model {
  const m = emptyModel();
  if (!draft || typeof draft !== 'object') return m;
  if (draft.id && typeof draft.id === 'object') m.id = { ...draft.id };
  // Ambientes: aceita rascunhos antigos sem a lista (inicializa a partir de
  // qtd_ambientes) e reconcilia o tamanho com a quantidade informada.
  const ambDraft = Array.isArray(draft.ambientes) ? draft.ambientes.map((x: any) => String(x ?? '')) : [];
  m.ambientes = growAmbientes(ambDraft, parseAmbienteCount(m.id.qtd_ambientes));
  if (typeof draft.observacoes === 'string') m.observacoes = draft.observacoes;
  m.photosNA = !!draft.photosNA;
  if (draft.secq && typeof draft.secq === 'object') {
    m.secq = { ban: draft.secq.ban ?? null, 5: draft.secq[5] ?? null, 6: draft.secq[6] ?? null };
  }
  if (draft.fixed && typeof draft.fixed === 'object') {
    for (const k of Object.keys(m.fixed)) {
      const f = draft.fixed[k];
      if (f && typeof f === 'object') m.fixed[k] = { status: f.status ?? null, fields: { ...(f.fields || {}) } };
    }
  }
  const arr = (x: any): any[] => (Array.isArray(x) ? x : []);
  m.sec1Extras = arr(draft.sec1Extras).map((e) => ({
    id: String(e.id), nome: typeof e.nome === 'string' ? e.nome : '',
    status: e.status ?? null, fields: { ...(e.fields || {}) },
  }));
  m.bancadas = arr(draft.bancadas).map((b) => ({
    id: String(b.id), fields: { ...(b.fields || {}) },
    cuba: b.cuba ?? null, modeloCuba: b.modeloCuba ?? null, metalInstal: b.metalInstal ?? null,
  }));
  m.dynEletros = arr(draft.dynEletros).map((e) => ({ id: String(e.id), fields: { ...(e.fields || {}) } }));
  m.dyn5 = arr(draft.dyn5).map((r) => ({ id: String(r.id), fields: { ...(r.fields || {}) } }));
  m.dyn6 = arr(draft.dyn6).map((r) => ({ id: String(r.id), fields: { ...(r.fields || {}) } }));
  return m;
}

// Progresso: replica exatamente a contagem original — cada item fixo e cada
// eletro adicional conta 1; as seções 3/4/5 contam 1 "portão" cada; a
// identificação conta 1.
export function computeProgress(m: Model): { resolved: number; total: number } {
  let resolved = 0;
  let total = 0;
  SEC1_ITEMS.forEach((_, i) => { total++; if (isSection1Resolved(m.fixed['s1_' + i])) resolved++; });
  m.sec1Extras.forEach((ex) => { total++; if (isSec1ExtraResolved(ex)) resolved++; });
  SEC2_ITEMS.forEach((name, i) => { total++; if (isEletroResolved(m.fixed['s2_' + i], name)) resolved++; });
  m.dynEletros.forEach((e) => { total++; if (isDynEletroResolved(e)) resolved++; });

  total++; // seção 3 (bancadas)
  if (m.secq.ban === 'nao') resolved++;
  else if (m.secq.ban === 'sim' && m.bancadas.length > 0 && m.bancadas.every(isBancadaResolved)) resolved++;

  total++; // seção 4
  if (m.secq[5] === 'nao') resolved++;
  else if (m.secq[5] === 'sim' && m.dyn5.length > 0 && m.dyn5.every(isDynResolved)) resolved++;

  total++; // seção 5
  if (m.secq[6] === 'nao') resolved++;
  else if (m.secq[6] === 'sim' && m.dyn6.length > 0 && m.dyn6.every(isDynResolved)) resolved++;

  total++; // identificação (inclui os nomes de ambientes desde a 0.6.4)
  if (isIdentificationComplete(m.id, m.photosNA, m.ambientes)) resolved++;

  return { resolved, total };
}

export function isComplete(m: Model): boolean {
  const { resolved, total } = computeProgress(m);
  return resolved === total;
}

// Gera ids únicos para linhas dinâmicas (chaves React estáveis).
let counter = 0;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}
