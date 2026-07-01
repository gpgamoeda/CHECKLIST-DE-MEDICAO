// Rascunho local (autosave) — camada pura e testável.
// Serializa/desserializa o rascunho e encapsula o acesso ao localStorage.
// Não depende do DOM. Carregado como script clássico no navegador (expõe
// `window.ChecklistDraft`) e também importável em testes (CommonJS).
//
// Privacidade: os dados ficam SOMENTE no navegador do usuário. Nada é enviado
// para servidor.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChecklistDraft = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DRAFT_KEY = 'checklist-medicao:draft:v1';
  var DRAFT_VERSION = 1;

  // Resolve o storage padrão (localStorage) de forma defensiva: em file://,
  // navegação privada ou ambientes sem Web Storage, ele pode não existir.
  function defaultStorage() {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (e) {
      return null;
    }
  }

  // Envelopa o rascunho com versão. Puro (sem timestamp) para ser determinístico.
  function serializeDraft(draft) {
    return JSON.stringify({ version: DRAFT_VERSION, data: draft });
  }

  // Retorna o rascunho (campo `data`) se o conteúdo for válido e da versão
  // esperada; caso contrário, retorna null (ignora com segurança).
  function parseDraft(raw) {
    if (typeof raw !== 'string' || !raw) return null;
    var obj;
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

  function saveDraft(draft, storage) {
    var s = storage || defaultStorage();
    if (!s) return false;
    try {
      s.setItem(DRAFT_KEY, serializeDraft(draft));
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadDraft(storage) {
    var s = storage || defaultStorage();
    if (!s) return null;
    try {
      return parseDraft(s.getItem(DRAFT_KEY));
    } catch (e) {
      return null;
    }
  }

  function clearDraft(storage) {
    var s = storage || defaultStorage();
    if (!s) return false;
    try {
      s.removeItem(DRAFT_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    DRAFT_KEY: DRAFT_KEY,
    DRAFT_VERSION: DRAFT_VERSION,
    serializeDraft: serializeDraft,
    parseDraft: parseDraft,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    clearDraft: clearDraft,
  };
}));
