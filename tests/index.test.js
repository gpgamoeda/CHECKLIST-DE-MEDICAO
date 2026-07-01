// Smoke tests da estrutura do app.
// Desde a Sprint 0.3.0 o app usa Vite + TypeScript: o index.html carrega
// src/main.ts (módulo), que importa os estilos e inicializa o checklist.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
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

  it('carrega o app via módulo Vite (src/main.ts) e sem código inline', () => {
    expect(html).toMatch(/<script[^>]+type="module"[^>]+src="\/src\/main\.ts"/);
    expect(html).not.toContain(':root{');
    expect(html).not.toContain('(function(){');
    expect(html).not.toContain('src/app.js');
  });

  it('corresponde à versão vigente v5 (não à v1 arquivada)', () => {
    expect(html).toContain('Bancadas, Cubas e Metais');
    expect(html).toContain('Observações Gerais');
    expect(html).toContain('Gerar solicitação de medição');
    expect(html).toContain('data-id="tipo_medicao"');
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

  it('mantém a UI de autosave (barra + botão limpar)', () => {
    expect(html).toContain('id="autosaveMsg"');
    expect(html).toContain('id="clearDraft"');
  });
});

describe('src/ — fontes TypeScript', () => {
  it('existem main.ts, app.ts, draft.ts, domain.ts e styles.css', () => {
    for (const f of ['src/main.ts', 'src/app.ts', 'src/draft.ts', 'src/domain.ts', 'src/styles.css']) {
      expect(existsSync(resolve(root, f))).toBe(true);
    }
  });

  it('app.ts exporta initApp, importa o domínio e não usa mais @ts-nocheck', () => {
    const app = read('src/app.ts');
    expect(app).toContain('export function initApp');
    expect(app).toContain("from './domain'");
    expect(app).toContain('function rowResolved');
    expect(app).not.toContain('@ts-nocheck');
  });

  it('domain.ts concentra dados e regras puras', () => {
    const domain = read('src/domain.ts');
    expect(domain).toContain('Refrigerador');
    expect(domain).toContain('export function maskPhone');
    expect(domain).toContain('export function isBancadaResolved');
    expect(domain).toContain('export function isIdentificationComplete');
  });

  it('styles.css contém o estilo do app', () => {
    const css = read('src/styles.css');
    expect(css).toContain(':root{');
    expect(css).toContain('@media print');
  });
});

describe('archive/ — histórico de versões', () => {
  it('preserva as versões anteriores (v1 a v4.1)', () => {
    for (const versao of ['v1', 'v2', 'v3', 'v4', 'v4.1']) {
      expect(existsSync(resolve(root, `archive/checklist-${versao}.html`))).toBe(true);
    }
  });
});
