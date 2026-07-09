// Store do checklist: mantém o Model em estado React, expõe ações de atualização
// e cuida do autosave (debounce) + restauração do rascunho local.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as Draft from '../draft';
import { Model, emptyModel, modelFromDraft, nextId } from '../model';
import { resizeAmbientes, parseAmbienteCount } from '../domain';

interface ChecklistStore {
  model: Model;
  autosaveMsg: string;
  restored: boolean;
  actions: Actions;
}

interface Actions {
  setId: (key: string, value: string) => void;
  setAmbiente: (index: number, value: string) => void;
  setPhotosNA: (on: boolean) => void;
  setObservacoes: (value: string) => void;
  setFixedStatus: (id: string, status: string) => void;
  setFixedField: (id: string, key: string, value: string) => void;
  addSec1Extra: () => void;
  removeSec1Extra: (id: string) => void;
  setSec1ExtraNome: (id: string, value: string) => void;
  setSec1ExtraStatus: (id: string, status: string) => void;
  setSec1ExtraField: (id: string, key: string, value: string) => void;
  addEletro: () => void;
  removeEletro: (id: string) => void;
  setEletroField: (id: string, key: string, value: string) => void;
  setGate: (sec: 'ban' | '5' | '6', value: 'sim' | 'nao') => void;
  addBancada: () => void;
  removeBancada: (id: string) => void;
  setBancadaField: (id: string, key: string, value: string) => void;
  setBancadaCuba: (id: string, value: string) => void;
  setBancadaModelo: (id: string, value: string) => void;
  setBancadaMetal: (id: string, value: string) => void;
  addDyn: (sec: '5' | '6') => void;
  removeDyn: (sec: '5' | '6', id: string) => void;
  setDynField: (sec: '5' | '6', id: string, key: string, value: string) => void;
  clearDraft: () => void;
}

const Ctx = createContext<ChecklistStore | null>(null);

const DEFAULT_MSG = 'O preenchimento é salvo automaticamente neste navegador.';

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => {
    const draft = Draft.loadDraft();
    return { model: draft ? modelFromDraft(draft) : emptyModel(), restored: !!draft };
  }, []);

  const [model, setModel] = useState<Model>(initial.model);
  const [autosaveMsg, setAutosaveMsg] = useState<string>(
    initial.restored ? 'Rascunho restaurado deste navegador.' : DEFAULT_MSG,
  );
  const skipFirstSave = useRef(true);
  const timer = useRef<any>(null);

  // Autosave com debounce, disparado a cada mudança do modelo (menos o mount).
  useEffect(() => {
    if (skipFirstSave.current) { skipFirstSave.current = false; return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (Draft.saveDraft(model)) setAutosaveMsg('Rascunho salvo ✓ neste navegador.');
    }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [model]);

  const actions = useMemo<Actions>(() => {
    const patchFixed = (id: string, patch: (f: Model['fixed'][string]) => Model['fixed'][string]) =>
      setModel((m) => ({ ...m, fixed: { ...m.fixed, [id]: patch(m.fixed[id]) } }));
    const mapList = <T extends { id: string }>(list: T[], id: string, patch: (x: T) => T): T[] =>
      list.map((x) => (x.id === id ? patch(x) : x));

    return {
      setId: (key, value) => setModel((m) => {
        const id = { ...m.id, [key]: value };
        // Ao mudar a quantidade, reajusta os campos de nome de ambiente
        // preservando os já preenchidos (0.6.4).
        if (key === 'qtd_ambientes') {
          return { ...m, id, ambientes: resizeAmbientes(m.ambientes, parseAmbienteCount(value)) };
        }
        return { ...m, id };
      }),
      setAmbiente: (index, value) => setModel((m) => {
        const ambientes = m.ambientes.slice();
        ambientes[index] = value;
        return { ...m, ambientes };
      }),
      setPhotosNA: (on) => setModel((m) => ({
        ...m, photosNA: on, id: on ? { ...m.id, link_fotos: '' } : m.id,
      })),
      setObservacoes: (value) => setModel((m) => ({ ...m, observacoes: value })),
      setFixedStatus: (id, status) => patchFixed(id, (f) => ({ ...f, status })),
      setFixedField: (id, key, value) => patchFixed(id, (f) => {
        const fields = { ...f.fields, [key]: value };
        if (key === 'respiro' && value !== 'Sim') fields.respiro_espec = '';
        return { ...f, fields };
      }),
      addSec1Extra: () => setModel((m) => ({
        ...m, sec1Extras: [...m.sec1Extras, { id: nextId('s1x'), nome: '', status: null, fields: {} }],
      })),
      removeSec1Extra: (id) => setModel((m) => ({ ...m, sec1Extras: m.sec1Extras.filter((e) => e.id !== id) })),
      setSec1ExtraNome: (id, value) => setModel((m) => ({
        ...m, sec1Extras: mapList(m.sec1Extras, id, (e) => ({ ...e, nome: value })),
      })),
      setSec1ExtraStatus: (id, status) => setModel((m) => ({
        ...m, sec1Extras: mapList(m.sec1Extras, id, (e) => ({ ...e, status })),
      })),
      setSec1ExtraField: (id, key, value) => setModel((m) => ({
        ...m, sec1Extras: mapList(m.sec1Extras, id, (e) => ({ ...e, fields: { ...e.fields, [key]: value } })),
      })),
      addEletro: () => setModel((m) => ({ ...m, dynEletros: [...m.dynEletros, { id: nextId('de'), fields: {} }] })),
      removeEletro: (id) => setModel((m) => ({ ...m, dynEletros: m.dynEletros.filter((e) => e.id !== id) })),
      setEletroField: (id, key, value) => setModel((m) => ({
        ...m, dynEletros: mapList(m.dynEletros, id, (e) => ({ ...e, fields: { ...e.fields, [key]: value } })),
      })),
      setGate: (sec, value) => setModel((m) => {
        if (sec === 'ban') {
          if (value === 'nao') return { ...m, secq: { ...m.secq, ban: 'nao' }, bancadas: [] };
          const bancadas = m.bancadas.length > 0 ? m.bancadas
            : [{ id: nextId('ba'), fields: {}, cuba: null, modeloCuba: null, metalInstal: null }];
          return { ...m, secq: { ...m.secq, ban: 'sim' }, bancadas };
        }
        const listKey = sec === '5' ? 'dyn5' : 'dyn6';
        if (value === 'nao') return { ...m, secq: { ...m.secq, [sec]: 'nao' } };
        const list = (m as any)[listKey] as { id: string; fields: Record<string, string> }[];
        const next = list.length > 0 ? list : [{ id: nextId('d' + sec), fields: {} }];
        return { ...m, secq: { ...m.secq, [sec]: 'sim' }, [listKey]: next };
      }),
      addBancada: () => setModel((m) => ({
        ...m, bancadas: [...m.bancadas, { id: nextId('ba'), fields: {}, cuba: null, modeloCuba: null, metalInstal: null }],
      })),
      removeBancada: (id) => setModel((m) => ({ ...m, bancadas: m.bancadas.filter((b) => b.id !== id) })),
      setBancadaField: (id, key, value) => setModel((m) => ({
        ...m, bancadas: mapList(m.bancadas, id, (b) => ({ ...b, fields: { ...b.fields, [key]: value } })),
      })),
      setBancadaCuba: (id, value) => setModel((m) => ({
        ...m, bancadas: mapList(m.bancadas, id, (b) => ({
          ...b,
          cuba: value || null,
          modeloCuba: value === 'louca' ? b.modeloCuba : null,
          metalInstal: (!value || value === 'na') ? null : b.metalInstal,
        })),
      })),
      setBancadaModelo: (id, value) => setModel((m) => ({
        ...m, bancadas: mapList(m.bancadas, id, (b) => ({ ...b, modeloCuba: value })),
      })),
      setBancadaMetal: (id, value) => setModel((m) => ({
        ...m, bancadas: mapList(m.bancadas, id, (b) => ({ ...b, metalInstal: value })),
      })),
      addDyn: (sec) => setModel((m) => {
        const listKey = sec === '5' ? 'dyn5' : 'dyn6';
        const list = (m as any)[listKey] as { id: string; fields: Record<string, string> }[];
        return { ...m, [listKey]: [...list, { id: nextId('d' + sec), fields: {} }] };
      }),
      removeDyn: (sec, id) => setModel((m) => {
        const listKey = sec === '5' ? 'dyn5' : 'dyn6';
        const list = (m as any)[listKey] as { id: string }[];
        return { ...m, [listKey]: list.filter((r) => r.id !== id) };
      }),
      setDynField: (sec, id, key, value) => setModel((m) => {
        const listKey = sec === '5' ? 'dyn5' : 'dyn6';
        const list = (m as any)[listKey] as { id: string; fields: Record<string, string> }[];
        return { ...m, [listKey]: mapList(list, id, (r) => ({ ...r, fields: { ...r.fields, [key]: value } })) };
      }),
      clearDraft: () => {
        Draft.clearDraft();
        setModel(emptyModel());
        setAutosaveMsg(DEFAULT_MSG);
      },
    };
  }, []);

  const value = useMemo(() => ({ model, autosaveMsg, restored: initial.restored, actions }), [model, autosaveMsg, initial.restored, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChecklist(): ChecklistStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useChecklist deve ser usado dentro de <ChecklistProvider>');
  return ctx;
}
