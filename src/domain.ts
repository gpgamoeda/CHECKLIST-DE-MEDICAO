// Domínio do checklist — tipos, dados e funções puras (sem DOM).
// É a fonte única das regras de negócio: o app (src/app.ts) importa daqui e os
// testes exercitam estas funções diretamente. Alterar regra aqui = alterar a regra
// do produto (registrar no PR e no changelog).

// ---------- Tipos ----------
export type Section1Status = 'ok' | 'pend' | 'na' | null;
export type DefStatus = 'def' | 'na' | null;
export type CubaType = 'inox' | 'louca' | 'esculpida' | 'na' | null;
export type MetalInstal = 'parede' | 'bancada' | null;
export type CubaModelo = 'apoio' | 'sobrepor' | 'embutir' | 'semi' | null;

export type Fields = Record<string, string>;

export interface ItemState {
  status?: string | null;
  fields: Fields;
  cuba?: string | null;
  modeloCuba?: string | null;
  metalInstal?: string | null;
}

export interface FieldDef {
  l: string; // label
  k: string; // key
  r: boolean; // required
}

export interface EletroExtra {
  alimentacao?: boolean;
  respiro?: boolean;
  obs?: boolean;
}

// Linha extra de Obra Civil (0.6.4): um ambiente/item não previsto na lista
// padrão, com nome/descrição livre e o mesmo modelo de estado dos itens fixos.
export interface Sec1Extra {
  id: string;
  nome: string;
  status: string | null;
  fields: Fields;
}

// ---------- Dados ----------
export const SEC1_ITEMS: string[] = [
  'Revestimentos instalados em todos os ambientes (pisos, paredes, azulejos)',
  'Forro / gesso concluído, com altura final definida',
  'Cortineiro executado, com medidas confirmadas',
  'Aberturas de portas finalizadas (vãos, batentes e vistas)',
  'Rodapés definidos',
  'Pontos hidráulicos posicionados (água quente e fria, esgoto)',
  'Pontos elétricos posicionados (tomadas, interruptores, saídas para eletros)',
  'Ambiente livre de entulho e estrutura antiga',
  'Base de alvenaria (cozinha)',
  'Base de alvenaria (lavanderia)',
  'Ponto de aspiração central',
  'Ponto de ar condicionado',
];

export const SEC2_ITEMS: string[] = [
  'Refrigerador', 'Freezer', 'Cooktop / Fogão', 'Forno', 'Micro-ondas',
  'Coifa / Depurador', 'Ar condicionado (Painel/nicho/prateleira)', 'Lava-louças', 'Máquina de lavar', 'Secadora', 'Adega', 'Cervejeira',
  'Icemaker', 'Purificador de água', 'Triturador de resíduos', 'Gaveta aquecida', 'Gaveta refrigerada',
  'Cafeteira embutida', 'Frigobar',
];

// Campos exigidos de cada eletrodoméstico "Definido".
export const F2: FieldDef[] = [
  { l: 'Ambiente', k: 'ambiente', r: true },
  { l: 'Marca', k: 'marca', r: true },
  { l: 'Modelo', k: 'modelo', r: true },
  { l: 'Referência / Código', k: 'ref', r: true },
  { l: 'Dimensões (L×A×P) em mm', k: 'dim', r: true },
];

// Campos extras por eletrodoméstico.
// 0.6.1: "Alimentação" só em Cooktop/Fogão e Forno (removida de Micro-ondas,
// Refrigerador e Freezer); Ar condicionado ficou sem campos extras.
export const ELETRO_EXTRAS: Record<string, EletroExtra> = {
  'Cooktop / Fogão': { alimentacao: true, respiro: false },
  'Forno': { alimentacao: true, respiro: true },
  'Micro-ondas': { respiro: true },
  'Refrigerador': { respiro: true },
  'Freezer': { respiro: true },
};

export const CUBA_LABEL: Record<string, string> = {
  inox: 'Inox', louca: 'Louça, vidro ou acrílico', esculpida: 'Esculpida', na: 'Não se aplica',
};
export const MOD_LABEL: Record<string, string> = {
  apoio: 'Apoio', sobrepor: 'Sobrepor', embutir: 'Embutir', semi: 'Semi-encaixe',
};
export const MET_LABEL: Record<string, string> = { parede: 'Parede', bancada: 'Bancada' };

// Campos de identificação que NÃO são obrigatórios.
export const OPTIONAL_ID_FIELDS: Record<string, true> = {
  link_fotos: true, arquiteto: true, complemento: true, referencia: true,
};

// ---------- Formatação ----------

// Escapa &, < e > para uso seguro em conteúdo do resumo.
export function esc(t: string | null | undefined): string {
  return (t || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' } as Record<string, string>)[c]);
}

// Máscara de telefone brasileiro: (00) 0 0000-0000.
export function maskPhone(value: string | null | undefined): string {
  let d = (value || '').replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  let r = '(' + d.slice(0, 2);
  if (d.length < 2) return r;
  r += ') ';
  if (d.length <= 6) { r += d.slice(2); return r; }
  if (d.length <= 10) { r += d.slice(2, 6) + '-' + d.slice(6, 10); return r; }
  return r + d.slice(2, 3) + ' ' + d.slice(3, 7) + '-' + d.slice(7, 11);
}

// Converte 'YYYY-MM-DD' para 'DD/MM/YYYY'; se não casar, devolve escapado.
export function brDate(v: string | null | undefined): string {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return esc(v);
  const p = v.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

// ---------- Validação (regras de "resolvido") ----------

function filled(v: string | undefined): boolean {
  return !!(v && v.trim());
}

// Seção 1 (obra civil): concluído ou "não se aplica" (N/A) resolvem; pendente
// exige ambiente + motivo. (0.6.4: N/A passa a contar como resolvido.)
export function isSection1Resolved(s: ItemState): boolean {
  if (s.status === 'ok' || s.status === 'na') return true;
  if (s.status === 'pend') return !!(s.fields.amb_pend && s.fields.obs);
  return false;
}

// Linha extra de Obra Civil (0.6.4): além do estado resolvido, exige um
// nome/descrição não vazio para não gerar linha inconsistente no resumo.
export function isSec1ExtraResolved(s: Sec1Extra): boolean {
  if (!filled(s.nome)) return false;
  return isSection1Resolved({ status: s.status, fields: s.fields });
}

// Seção 2 (eletrodoméstico fixo): "não se aplica", ou "definido" com os campos
// obrigatórios (incluindo os extras: alimentação, respiro + especificação).
export function isEletroResolved(s: ItemState, itemName: string): boolean {
  if (s.status === 'na') return true;
  if (s.status !== 'def') return false;
  if (!F2.every((f) => !f.r || filled(s.fields[f.k]))) return false;
  const ex = ELETRO_EXTRAS[itemName];
  if (ex) {
    if (ex.alimentacao && !s.fields.alimentacao) return false;
    if (ex.respiro) {
      if (!s.fields.respiro) return false;
      if (s.fields.respiro === 'Sim' && !filled(s.fields.respiro_espec)) return false;
    }
  }
  return true;
}

// Eletrodoméstico adicional (dinâmico).
export function isDynEletroResolved(s: ItemState): boolean {
  const f = s.fields;
  return !!(f.ambiente && f.nome && f.marca && f.modelo && f.ref && f.dim);
}

// Bancada/cuba/metal (seção 3): ambiente + material + dim; tipo de cuba; se louça,
// exige modelo; se houver cuba, exige a instalação do metal.
export function isBancadaResolved(s: ItemState): boolean {
  if (!(s.fields.ambiente && s.fields.material && s.fields.dim)) return false;
  if (!s.cuba) return false;
  if (s.cuba === 'na') return true;
  if (s.cuba === 'louca' && !s.modeloCuba) return false;
  if (!s.metalInstal) return false;
  return true;
}

// Item dinâmico das seções 4 e 5 (mobiliário / demais itens).
export function isDynResolved(s: ItemState): boolean {
  const f = s.fields;
  return !!(f.ambiente && f.desc && f.dim);
}

// Identificação: todos os campos não-opcionais preenchidos; link de fotos exigido
// a menos que esteja marcado "não se aplica". (0.6.4) Se `ambientes` for passado,
// todos os nomes derivados da "Quantidade de ambientes" precisam estar preenchidos.
export function isIdentificationComplete(
  values: Record<string, string>,
  photosNA: boolean,
  ambientes?: string[],
): boolean {
  for (const key of Object.keys(values)) {
    if (OPTIONAL_ID_FIELDS[key]) continue;
    if (!filled(values[key])) return false;
  }
  if (!photosNA && !filled(values.link_fotos)) return false;
  if (ambientes) {
    const count = parseAmbienteCount(values.qtd_ambientes);
    for (let i = 0; i < count; i++) {
      if (!filled(ambientes[i])) return false;
    }
  }
  return true;
}

// ---------- Ambientes nomeados (Identificação, 0.6.4) ----------

// Limite defensivo para não renderizar uma quantidade absurda de campos caso o
// usuário digite um número enorme na "Quantidade de ambientes".
export const MAX_AMBIENTES = 60;

// Converte o texto da "Quantidade de ambientes" em um inteiro entre 0 e
// MAX_AMBIENTES. Valores vazios/inválidos/≤0 viram 0.
export function parseAmbienteCount(qtd: string | null | undefined): number {
  const n = Math.floor(Number((qtd || '').trim()));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, MAX_AMBIENTES);
}

// Helper de baixo nível: ajusta a lista ao tamanho exato (pad no fim / trunca o
// excedente). Usado por growAmbientes (caso de padding); o fluxo do app nunca
// trunca — reduzir a quantidade só oculta os campos, sem apagar nomes.
export function resizeAmbientes(ambientes: string[], count: number): string[] {
  const next = ambientes.slice(0, count);
  while (next.length < count) next.push('');
  return next;
}

// Garante ao menos `count` posições SEM truncar: preserva todos os nomes já
// digitados. Reduzir/limpar a quantidade apenas oculta os excedentes (a UI
// renderiza `count`), então aumentar de novo restaura os nomes na mesma sessão —
// evita perda acidental ao editar a quantidade (risco R2 do handoff).
export function growAmbientes(ambientes: string[], count: number): string[] {
  return ambientes.length >= count ? ambientes : resizeAmbientes(ambientes, count);
}

// Limita o texto da "Quantidade de ambientes" ao teto (MAX_AMBIENTES) para o
// resumo não divergir da lista renderizada/validada. Só toca em inteiros puros
// acima do teto; deixa vazio/parcial/inválido como o usuário digitou.
export function clampAmbienteQtd(value: string): string {
  const t = (value || '').trim();
  if (/^\d+$/.test(t) && Number(t) > MAX_AMBIENTES) return String(MAX_AMBIENTES);
  return value;
}

// Índices (0-based) dos ambientes ainda sem nome — para apontar o que falta.
export function missingAmbientes(ambientes: string[]): number[] {
  const out: number[] = [];
  ambientes.forEach((a, i) => { if (!filled(a)) out.push(i); });
  return out;
}

// Nomes de ambientes já preenchidos (fonte principal reutilizável por outras
// seções, ex.: sugestões de "ambiente pendente" na Obra Civil).
export function filledAmbientes(ambientes: string[]): string[] {
  return ambientes.map((a) => a.trim()).filter(Boolean);
}
