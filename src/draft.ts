// Rascunho local (autosave) — camada pura e testável.
// Serializa/desserializa o rascunho e encapsula o acesso ao localStorage.
// Não depende do DOM.
//
// Privacidade: os dados ficam SOMENTE no navegador do usuário. Nada é enviado
// para servidor.

export const DRAFT_KEY = 'checklist-medicao:draft:v1';
export const DRAFT_VERSION = 1;

// Estrutura do rascunho serializado (aberta nesta fase; tipagem forte vem na 0.3.1).
export type Draft = Record<string, any>;

// Resolve o storage padrão (localStorage) de forma defensiva: em file://,
// navegação privada ou ambientes sem Web Storage, ele pode não existir.
function defaultStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch (e) {
    return null;
  }
}

// Envelopa o rascunho com versão. Puro (sem timestamp) para ser determinístico.
export function serializeDraft(draft: Draft): string {
  return JSON.stringify({ version: DRAFT_VERSION, data: draft });
}

// Retorna o rascunho (campo `data`) se o conteúdo for válido e da versão
// esperada; caso contrário, retorna null (ignora com segurança).
export function parseDraft(raw: unknown): Draft | null {
  if (typeof raw !== 'string' || !raw) return null;
  let obj: any;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  if (obj.version !== DRAFT_VERSION) return null;
  if (!obj.data || typeof obj.data !== 'object') return null;
  return obj.data;
}

export function saveDraft(draft: Draft, storage?: Storage | null): boolean {
  const s = storage || defaultStorage();
  if (!s) return false;
  try {
    s.setItem(DRAFT_KEY, serializeDraft(draft));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadDraft(storage?: Storage | null): Draft | null {
  const s = storage || defaultStorage();
  if (!s) return null;
  try {
    return parseDraft(s.getItem(DRAFT_KEY));
  } catch (e) {
    return null;
  }
}

export function clearDraft(storage?: Storage | null): boolean {
  const s = storage || defaultStorage();
  if (!s) return false;
  try {
    s.removeItem(DRAFT_KEY);
    return true;
  } catch (e) {
    return false;
  }
}
