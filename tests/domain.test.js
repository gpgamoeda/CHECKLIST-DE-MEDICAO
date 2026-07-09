// Testes das regras de negócio puras (src/domain.ts).
// Cobrem os casos exigidos pela Sprint 0.3.1 (identificação, seção 1, eletros,
// bancada/cuba, datas pt-BR e escape).
import { describe, it, expect } from 'vitest';
import {
  maskPhone, brDate, esc, SEC2_ITEMS, MAX_AMBIENTES,
  isSection1Resolved, isSec1ExtraResolved, isEletroResolved, isDynEletroResolved,
  isBancadaResolved, isDynResolved, isIdentificationComplete,
  parseAmbienteCount, resizeAmbientes, growAmbientes, clampAmbienteQtd,
  missingAmbientes, filledAmbientes,
} from '../src/domain.ts';

describe('formatação', () => {
  it('maskPhone aplica (00) 0 0000-0000 progressivamente', () => {
    expect(maskPhone('')).toBe('');
    expect(maskPhone('1')).toBe('(1');
    expect(maskPhone('11')).toBe('(11) ');
    expect(maskPhone('1199998888')).toBe('(11) 9999-8888'); // 10 dígitos (fixo)
    expect(maskPhone('11999998888')).toBe('(11) 9 9999-8888'); // 11 dígitos (celular)
    expect(maskPhone('(11) 9 9999-8888')).toBe('(11) 9 9999-8888'); // idempotente
    expect(maskPhone('119999988889999')).toBe('(11) 9 9999-8888'); // limita a 11 dígitos
  });

  it('brDate converte ISO em pt-BR e ignora formatos inválidos', () => {
    expect(brDate('2026-07-01')).toBe('01/07/2026');
    expect(brDate('')).toBe('');
    expect(brDate('01/07/2026')).toBe('01/07/2026'); // não-ISO passa escapado
  });

  it('esc neutraliza HTML bruto (evita injeção no resumo)', () => {
    expect(esc('<b>x</b> & <i>y</i>')).toBe('&lt;b&gt;x&lt;/b&gt; &amp; &lt;i&gt;y&lt;/i&gt;');
    expect(esc('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(esc(null)).toBe('');
  });
});

describe('identificação', () => {
  const base = {
    cliente: 'ACME', projeto: 'P1', consultor: 'Ana', tipo_medicao: 'Final', loja: 'Campinas',
    endereco: 'Rua A', numero: '100', responsavel_obra: 'João', telefone_responsavel: '(11) 9 9999-8888',
    tipo: 'Obra nova', qtd_ambientes: '3', data_checklist: '2026-07-01', data_solicitacao_medicao: '2026-07-02',
    link_fotos: 'https://sp/fotos', arquiteto: '', complemento: '', referencia: '',
  };

  it('incompleta não libera (campo obrigatório vazio)', () => {
    expect(isIdentificationComplete({ ...base, cliente: '' }, false)).toBe(false);
  });

  it('completa libera; campos opcionais podem ficar vazios', () => {
    expect(isIdentificationComplete(base, false)).toBe(true);
  });

  it('link de fotos é exigido, salvo "não se aplica"', () => {
    expect(isIdentificationComplete({ ...base, link_fotos: '' }, false)).toBe(false);
    expect(isIdentificationComplete({ ...base, link_fotos: '' }, true)).toBe(true);
  });

  it('exige um nome para cada ambiente da quantidade (0.6.4)', () => {
    // qtd 3 exige 3 nomes não vazios.
    expect(isIdentificationComplete(base, false, ['Cozinha', 'Lavanderia', ''])).toBe(false);
    expect(isIdentificationComplete(base, false, ['Cozinha', 'Lavanderia', '  '])).toBe(false); // só espaços
    expect(isIdentificationComplete(base, false, ['Cozinha', 'Lavanderia', 'Dormitório'])).toBe(true);
    // sem passar ambientes, a checagem de nomes é ignorada (retrocompat).
    expect(isIdentificationComplete(base, false)).toBe(true);
  });
});

describe('ambientes nomeados (0.6.4)', () => {
  it('parseAmbienteCount normaliza o texto da quantidade', () => {
    expect(parseAmbienteCount('3')).toBe(3);
    expect(parseAmbienteCount('')).toBe(0);
    expect(parseAmbienteCount('0')).toBe(0);
    expect(parseAmbienteCount('-2')).toBe(0);
    expect(parseAmbienteCount('abc')).toBe(0);
    expect(parseAmbienteCount('2.9')).toBe(2); // trunca
    expect(parseAmbienteCount(String(MAX_AMBIENTES + 10))).toBe(MAX_AMBIENTES); // limita
  });

  it('resizeAmbientes preserva nomes ao crescer e ao encolher', () => {
    expect(resizeAmbientes([], 3)).toEqual(['', '', '']);
    expect(resizeAmbientes(['Cozinha', 'Lavanderia'], 4)).toEqual(['Cozinha', 'Lavanderia', '', '']);
    expect(resizeAmbientes(['Cozinha', 'Lavanderia', 'Dormitório', 'Banho'], 2)).toEqual(['Cozinha', 'Lavanderia']);
    expect(resizeAmbientes(['Cozinha'], 0)).toEqual([]);
  });

  it('missingAmbientes e filledAmbientes apontam vazios e preenchidos', () => {
    expect(missingAmbientes(['Cozinha', '', '  ', 'Banho'])).toEqual([1, 2]);
    expect(filledAmbientes(['Cozinha', '', '  Lavanderia  '])).toEqual(['Cozinha', 'Lavanderia']);
  });

  it('growAmbientes cresce mas NUNCA trunca (protege contra perda ao reduzir)', () => {
    expect(growAmbientes([], 3)).toEqual(['', '', '']);
    expect(growAmbientes(['Cozinha'], 3)).toEqual(['Cozinha', '', '']);
    // count menor que o tamanho atual: mantém tudo (os excedentes só ficam ocultos).
    expect(growAmbientes(['Cozinha', 'Lavanderia', 'Dormitório'], 1)).toEqual(['Cozinha', 'Lavanderia', 'Dormitório']);
    expect(growAmbientes(['Cozinha', 'Lavanderia'], 0)).toEqual(['Cozinha', 'Lavanderia']);
  });

  it('clampAmbienteQtd limita inteiros acima do teto e ignora o resto', () => {
    expect(clampAmbienteQtd(String(MAX_AMBIENTES + 5))).toBe(String(MAX_AMBIENTES));
    expect(clampAmbienteQtd('10')).toBe('10');
    expect(clampAmbienteQtd('')).toBe('');
    expect(clampAmbienteQtd('abc')).toBe('abc');
  });
});

describe('seção 1 — obra civil', () => {
  it('concluído resolve', () => {
    expect(isSection1Resolved({ status: 'ok', fields: {} })).toBe(true);
  });
  it('pendente exige ambiente + motivo', () => {
    expect(isSection1Resolved({ status: 'pend', fields: {} })).toBe(false);
    expect(isSection1Resolved({ status: 'pend', fields: { amb_pend: 'Cozinha' } })).toBe(false);
    expect(isSection1Resolved({ status: 'pend', fields: { amb_pend: 'Cozinha', obs: 'Falta piso' } })).toBe(true);
  });
  it('sem status não resolve', () => {
    expect(isSection1Resolved({ status: null, fields: {} })).toBe(false);
  });
  it('N/A resolve sem exigir ambiente/motivo (0.6.4)', () => {
    expect(isSection1Resolved({ status: 'na', fields: {} })).toBe(true);
  });
});

describe('seção 1 — linhas extras (0.6.4)', () => {
  it('exige nome/descrição além do estado resolvido', () => {
    expect(isSec1ExtraResolved({ id: 'x', nome: '', status: 'ok', fields: {} })).toBe(false);
    expect(isSec1ExtraResolved({ id: 'x', nome: '   ', status: 'na', fields: {} })).toBe(false);
    expect(isSec1ExtraResolved({ id: 'x', nome: 'Varanda', status: 'ok', fields: {} })).toBe(true);
    expect(isSec1ExtraResolved({ id: 'x', nome: 'Varanda', status: 'na', fields: {} })).toBe(true);
  });
  it('extra pendente segue a regra de ambiente + motivo', () => {
    expect(isSec1ExtraResolved({ id: 'x', nome: 'Varanda', status: 'pend', fields: {} })).toBe(false);
    expect(isSec1ExtraResolved({ id: 'x', nome: 'Varanda', status: 'pend', fields: { amb_pend: 'Varanda', obs: 'Falta piso' } })).toBe(true);
  });
  it('extra sem estado não resolve', () => {
    expect(isSec1ExtraResolved({ id: 'x', nome: 'Varanda', status: null, fields: {} })).toBe(false);
  });
});

describe('seção 2 — eletrodomésticos', () => {
  const full = { ambiente: 'Cozinha', marca: 'X', modelo: 'Y', ref: 'R', dim: '600x600x600' };

  it('"não se aplica" resolve', () => {
    expect(isEletroResolved({ status: 'na', fields: {} }, 'Lava-louças')).toBe(true);
  });
  it('definido exige todos os campos de F2', () => {
    expect(isEletroResolved({ status: 'def', fields: { ...full, marca: '' } }, 'Lava-louças')).toBe(false);
    expect(isEletroResolved({ status: 'def', fields: full }, 'Lava-louças')).toBe(true);
  });
  it('itens com alimentação/respiro exigem os extras', () => {
    // Forno: alimentacao + respiro
    expect(isEletroResolved({ status: 'def', fields: full }, 'Forno')).toBe(false); // falta alimentacao/respiro
    expect(isEletroResolved({ status: 'def', fields: { ...full, alimentacao: 'Elétrico', respiro: 'Não' } }, 'Forno')).toBe(true);
    // respiro "Sim" exige especificação
    expect(isEletroResolved({ status: 'def', fields: { ...full, alimentacao: 'Elétrico', respiro: 'Sim' } }, 'Forno')).toBe(false);
    expect(isEletroResolved({ status: 'def', fields: { ...full, alimentacao: 'Elétrico', respiro: 'Sim', respiro_espec: '50mm' } }, 'Forno')).toBe(true);
  });

  it('Refrigerador/Freezer/Micro-ondas exigem respiro, mas não alimentação (0.6.1)', () => {
    for (const item of ['Refrigerador', 'Freezer', 'Micro-ondas']) {
      expect(isEletroResolved({ status: 'def', fields: full }, item)).toBe(false); // falta respiro
      expect(isEletroResolved({ status: 'def', fields: { ...full, respiro: 'Não' } }, item)).toBe(true); // sem alimentação
    }
  });

  it('Ar condicionado renomeado e sem campos extras (0.6.1)', () => {
    expect(SEC2_ITEMS).toContain('Ar condicionado (Painel/nicho/prateleira)');
    expect(SEC2_ITEMS).not.toContain('Ar condicionado');
    expect(isEletroResolved({ status: 'def', fields: full }, 'Ar condicionado (Painel/nicho/prateleira)')).toBe(true);
  });
});

describe('seção 3 — bancada / cuba / metal', () => {
  const banca = { ambiente: 'Cozinha', material: 'Quartzo', dim: '2000x600' };

  it('exige ambiente + material + dimensões', () => {
    expect(isBancadaResolved({ fields: { ambiente: 'Cozinha' }, cuba: 'na' })).toBe(false);
  });
  it('cuba "não se aplica" resolve sem metal', () => {
    expect(isBancadaResolved({ fields: banca, cuba: 'na' })).toBe(true);
  });
  it('cuba louça exige o modelo da cuba', () => {
    expect(isBancadaResolved({ fields: banca, cuba: 'louca', modeloCuba: null, metalInstal: 'parede' })).toBe(false);
    expect(isBancadaResolved({ fields: banca, cuba: 'louca', modeloCuba: 'apoio', metalInstal: 'parede' })).toBe(true);
  });
  it('havendo cuba, exige a instalação do metal', () => {
    expect(isBancadaResolved({ fields: banca, cuba: 'inox', metalInstal: null })).toBe(false);
    expect(isBancadaResolved({ fields: banca, cuba: 'inox', metalInstal: 'bancada' })).toBe(true);
  });
});

describe('itens dinâmicos', () => {
  it('mobiliário/demais exigem ambiente + descrição + dimensões', () => {
    expect(isDynResolved({ fields: { ambiente: 'Quarto', desc: 'Cama' } })).toBe(false);
    expect(isDynResolved({ fields: { ambiente: 'Quarto', desc: 'Cama', dim: '1.6m' } })).toBe(true);
  });
  it('eletro adicional exige os campos completos', () => {
    expect(isDynEletroResolved({ fields: { ambiente: 'Cozinha', nome: 'Cervejeira', marca: 'X', modelo: 'Y', ref: 'R' } })).toBe(false);
    expect(isDynEletroResolved({ fields: { ambiente: 'Cozinha', nome: 'Cervejeira', marca: 'X', modelo: 'Y', ref: 'R', dim: '500' } })).toBe(true);
  });
});
