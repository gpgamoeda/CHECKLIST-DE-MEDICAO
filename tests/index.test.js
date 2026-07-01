// Smoke tests da estrutura do app.
// A partir da Sprint 0.2.0 o app deixou de ser single-file: o CSS vive em
// src/styles.css e o JS em src/app.js, referenciados pelo index.html.
// Estes testes travam essa estrutura e a presença das regras/marcadores da
// versão vigente, sem depender de DOM/navegador.
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (relPath) => readFileSync(resolve(root, relPath), 'utf8');

describe('index.html — página vigente', () => {
  const html = read('index.html');

  it('é um documento HTML pt-BR bem formado', () => {
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toContain('lang="pt-BR"');
    expect(html).toContain('<title>Checklist de Envio para Medição — FABRILIS</title>');
  });

  it('referencia CSS e JS externos (não é mais single-file)', () => {
    expect(html).toMatch(/<link[^>]+rel="stylesheet"[^>]+href="src\/styles\.css"/);
    expect(html).toMatch(/<script[^>]+src="src\/app\.js"/);
    // Não deve restar CSS/JS inline no HTML.
    expect(html).not.toContain(':root{');
    expect(html).not.toContain('(function(){');
  });

  it('corresponde à versão vigente v5 (não à v1 arquivada)', () => {
    // Marcadores que vivem no HTML.
    expect(html).toContain('Bancadas, Cubas e Metais');
    expect(html).toContain('Observações Gerais');
    expect(html).toContain('Gerar solicitação de medição');
    expect(html).toContain('data-id="tipo_medicao"');
    // Marcadores exclusivos da v1 não devem estar presentes.
    expect(html).not.toContain('Concluir e gerar resumo');
    expect(html).not.toContain('Cubas e Louças');
  });

  it('contém as 6 seções do checklist', () => {
    for (const titulo of [
      'Obra Civil Finalizada',
      'Eletrodomésticos',
      'Bancadas, Cubas e Metais',
      'Mobiliário de Terceiros',
      'Demais Itens que Interferem no Projeto',
      'Observações Gerais',
    ]) {
      expect(html).toContain(titulo);
    }
  });

  it('mantém os campos de identificação obrigatórios do fluxo', () => {
    for (const campo of ['cliente', 'projeto', 'consultor', 'loja', 'endereco', 'responsavel_obra']) {
      expect(html).toContain(`data-id="${campo}"`);
    }
  });
});

describe('src/ — CSS e JS extraídos', () => {
  it('src/styles.css existe e contém o estilo do app', () => {
    expect(existsSync(resolve(root, 'src/styles.css'))).toBe(true);
    const css = read('src/styles.css');
    expect(css).toContain(':root{');
    expect(css).toContain('.card{');
    expect(css).toContain('@media print');
  });

  it('src/app.js existe e contém a lógica do checklist', () => {
    expect(existsSync(resolve(root, 'src/app.js'))).toBe(true);
    const js = read('src/app.js');
    expect(js).toContain('(function(){');
    // Regras/dados que vivem no JS.
    expect(js).toContain('Refrigerador');
    expect(js).toContain('function rowResolved');
    expect(js).toContain('function maskPhone');
  });
});

describe('archive/ — histórico de versões', () => {
  it('preserva as versões anteriores (v1 a v4.1)', () => {
    for (const versao of ['v1', 'v2', 'v3', 'v4', 'v4.1']) {
      expect(existsSync(resolve(root, `archive/checklist-${versao}.html`))).toBe(true);
    }
  });
});

describe('build — dist/ publicável', () => {
  beforeAll(() => {
    execFileSync('node', ['scripts/build.mjs'], { cwd: root, stdio: 'ignore' });
  });

  it('copia HTML, CSS e JS para dist/', () => {
    expect(existsSync(resolve(root, 'dist/index.html'))).toBe(true);
    expect(existsSync(resolve(root, 'dist/src/styles.css'))).toBe(true);
    expect(existsSync(resolve(root, 'dist/src/app.js'))).toBe(true);
  });

  it('não publica a pasta archive/', () => {
    expect(existsSync(resolve(root, 'dist/archive'))).toBe(false);
  });
});
