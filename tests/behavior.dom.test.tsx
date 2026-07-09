// @vitest-environment jsdom
// Testes de comportamento do app React componentizado: renderizam <App/> e
// exercitam estrutura, restauração, autosave, campos condicionais, fluxo de
// conclusão e "voltar e editar".
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { App } from '../src/components/App';
import * as Draft from '../src/draft';

beforeEach(() => {
  localStorage.clear();
  window.print = () => {};
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
});
afterEach(() => { cleanup(); });

const change = (sel: string, value: string) => fireEvent.change(document.querySelector(sel)!, { target: { value } });
const click = (sel: string) => fireEvent.click(document.querySelector(sel)!);

function completeForm() {
  change('#idgrid [data-id="cliente"]', 'ACME');
  change('#idgrid [data-id="projeto"]', 'P-1');
  change('#idgrid [data-id="consultor"]', 'Ana');
  change('#idgrid [data-id="tipo_medicao"]', 'Final');
  change('#idgrid [data-id="loja"]', 'Campinas');
  change('#idgrid [data-id="endereco"]', 'Rua A');
  change('#idgrid [data-id="numero"]', '100');
  change('#idgrid [data-id="responsavel_obra"]', 'João');
  change('#idgrid [data-id="telefone_responsavel"]', '11999998888');
  change('#idgrid [data-id="tipo"]', 'Obra nova');
  change('#idgrid [data-id="qtd_ambientes"]', '3');
  change('#idgrid [data-amb="0"]', 'Cozinha');
  change('#idgrid [data-amb="1"]', 'Lavanderia');
  change('#idgrid [data-amb="2"]', 'Dormitório');
  change('#idgrid [data-id="data_checklist"]', '2026-07-01');
  change('#idgrid [data-id="data_solicitacao_medicao"]', '2026-07-02');
  change('#idgrid [data-id="link_fotos"]', 'https://sharepoint/fotos');
  document.querySelectorAll('#sec1 .seg[data-id]').forEach((seg) => fireEvent.click(seg.querySelector('[data-s="ok"]')!));
  document.querySelectorAll('#sec2 .seg[data-id]').forEach((seg) => fireEvent.click(seg.querySelector('[data-s="na"]')!));
  click('.seg[data-secq="ban"] [data-v="nao"]');
  click('.seg[data-secq="5"] [data-v="nao"]');
  click('.seg[data-secq="6"] [data-v="nao"]');
}

describe('estrutura', () => {
  it('renderiza as 6 seções, os campos e os itens fixos', () => {
    render(<App />);
    const titulos = Array.from(document.querySelectorAll('.sec-t')).map((e) => e.textContent);
    for (const t of ['Identificação', 'Obra Civil Finalizada', 'Eletrodomésticos', 'Bancadas, Cubas e Metais', 'Mobiliário de Terceiros', 'Demais Itens que Interferem no Projeto', 'Observações Gerais']) {
      expect(titulos).toContain(t);
    }
    for (const campo of ['cliente', 'projeto', 'consultor', 'loja', 'endereco', 'responsavel_obra']) {
      expect(document.querySelector(`#idgrid [data-id="${campo}"]`)).not.toBeNull();
    }
    expect(document.querySelectorAll('#sec1 .item').length).toBe(12);
    expect(document.querySelectorAll('#sec2 .item').length).toBe(19);
    expect((document.getElementById('finish') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('restauração de rascunho', () => {
  it('reconstrói identificação, item fixo e bancada ao montar', () => {
    Draft.saveDraft({
      id: { cliente: 'ACME Marcenaria', projeto: 'P-42' },
      observacoes: 'obs de teste', photosNA: false,
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
    expect((document.querySelector('[data-cuba][data-fid="ba_test"]') as HTMLSelectElement).value).toBe('na');
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
    change('#idgrid [data-id="cliente"]', 'Cliente X');
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

describe('campos condicionais — bancada/cuba', () => {
  it('cuba "louça" pede o modelo; "inox" libera o metal', () => {
    render(<App />);
    click('.seg[data-secq="ban"] [data-v="sim"]'); // adiciona 1 bancada
    const cubaSel = document.querySelector('[data-cuba]')!;
    const fid = cubaSel.getAttribute('data-fid')!;

    fireEvent.change(cubaSel, { target: { value: 'louca' } });
    expect(document.querySelector(`#modblk_${fid}`)).not.toBeNull(); // seletor de modelo aparece

    fireEvent.change(cubaSel, { target: { value: 'inox' } });
    expect(document.querySelector(`#modblk_${fid}`)).toBeNull(); // some
    expect(document.querySelector(`#metblk_${fid}`)).not.toBeNull(); // metal aparece
  });
});

describe('ambientes nomeados (0.6.4)', () => {
  it('a quantidade gera N campos e ajusta ao crescer/encolher preservando nomes', () => {
    render(<App />);
    change('#idgrid [data-id="qtd_ambientes"]', '3');
    expect(document.querySelectorAll('#ambientesGrid [data-amb]').length).toBe(3);

    change('#idgrid [data-amb="0"]', 'Cozinha');
    change('#idgrid [data-amb="1"]', 'Lavanderia');

    // Aumentar preserva os já preenchidos.
    change('#idgrid [data-id="qtd_ambientes"]', '4');
    const inputs = () => Array.from(document.querySelectorAll('#ambientesGrid [data-amb]')) as HTMLInputElement[];
    expect(inputs().length).toBe(4);
    expect(inputs()[0].value).toBe('Cozinha');
    expect(inputs()[1].value).toBe('Lavanderia');
    expect(inputs()[3].value).toBe('');

    // Diminuir mantém os primeiros e remove excedentes.
    change('#idgrid [data-id="qtd_ambientes"]', '2');
    expect(inputs().length).toBe(2);
    expect(inputs()[0].value).toBe('Cozinha');
    expect(inputs()[1].value).toBe('Lavanderia');
  });

  it('ambiente sem nome bloqueia a geração da solicitação', () => {
    render(<App />);
    completeForm();
    expect((document.getElementById('finish') as HTMLButtonElement).disabled).toBe(false);
    // Esvaziar um nome de ambiente volta a travar o botão.
    change('#idgrid [data-amb="2"]', '   ');
    expect((document.getElementById('finish') as HTMLButtonElement).disabled).toBe(true);
    expect(document.getElementById('ambientesHint')).not.toBeNull();
  });
});

describe('obra civil — N/A e ambientes extras (0.6.4)', () => {
  it('N/A resolve o item e não aparece como pendência no resumo', () => {
    render(<App />);
    completeForm();
    // Muda o primeiro item de Concluído para N/A — segue liberado.
    click('.seg[data-id="s1_0"] [data-s="na"]');
    const finish = document.getElementById('finish') as HTMLButtonElement;
    expect(finish.disabled).toBe(false);
    fireEvent.click(finish);
    const summary = document.getElementById('summary')!;
    expect(summary.innerHTML).toContain('não se aplica');
    expect(summary.querySelectorAll('.sum-pend').length).toBe(0);
  });

  it('linha extra participa da validação e do resumo', () => {
    render(<App />);
    completeForm();
    const finish = () => document.getElementById('finish') as HTMLButtonElement;

    // Adicionar um ambiente extra ainda sem nome/estado trava a geração.
    click('[data-add="s1x"]');
    expect(document.querySelectorAll('#sec1-extras .subcard').length).toBe(1);
    expect(finish().disabled).toBe(true);

    // Preencher nome e marcar N/A resolve o extra.
    change('#sec1-extras [data-xk="nome"]', 'Varanda gourmet');
    click('#sec1-extras .seg[data-xid] [data-s="na"]');
    expect(finish().disabled).toBe(false);

    fireEvent.click(finish());
    expect(document.getElementById('summary')!.innerHTML).toContain('Varanda gourmet');
  });
});

describe('fluxo de conclusão e voltar/editar', () => {
  it('libera o botão, gera o resumo e preserva o estado ao voltar', () => {
    render(<App />);
    completeForm();

    const finish = document.getElementById('finish') as HTMLButtonElement;
    expect(finish.disabled).toBe(false);

    fireEvent.click(finish);
    const summary = document.getElementById('summary')!;
    expect(summary.classList.contains('show')).toBe(true);
    expect(summary.innerHTML).toContain('Solicitação de Medição');
    expect(summary.innerHTML).toContain('ACME');

    // Voltar e editar preserva o preenchimento.
    fireEvent.click(document.getElementById('edit')!);
    expect(document.getElementById('summary')).toBeNull();
    expect((document.querySelector('#idgrid [data-id="cliente"]') as HTMLInputElement).value).toBe('ACME');
    expect((document.getElementById('finish') as HTMLButtonElement).disabled).toBe(false);
  });
});
