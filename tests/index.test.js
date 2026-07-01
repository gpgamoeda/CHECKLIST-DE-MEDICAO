// Smoke tests da estrutura do projeto.
// Desde a Sprint 0.4.0 o app é React + Vite: index.html tem só #root e carrega
// src/main.tsx, que monta o shell React. A checagem de comportamento (seções,
// campos, fluxo) fica em tests/behavior.dom.test.tsx (renderiza <App/>).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (relPath) => readFileSync(resolve(root, relPath), 'utf8');

describe('index.html — casca React', () => {
  const html = read('index.html');

  it('é um documento HTML pt-BR bem formado', () => {
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toContain('lang="pt-BR"');
    expect(html).toContain('<title>Checklist de Envio para Medição — FABRILIS</title>');
  });

  it('tem #root e carrega o app via módulo Vite (src/main.tsx), sem código inline', () => {
    expect(html).toContain('<div id="root">');
    expect(html).toMatch(/<script[^>]+type="module"[^>]+src="\/src\/main\.tsx"/);
    expect(html).not.toContain(':root{');
    expect(html).not.toContain('(function(){');
  });
});

describe('src/ — fontes', () => {
  it('existem entrada, módulos e componentes', () => {
    for (const f of [
      'src/main.tsx', 'src/app.ts', 'src/draft.ts', 'src/domain.ts', 'src/styles.css',
      'src/components/App.tsx', 'src/components/Header.tsx', 'src/components/ProgressBar.tsx',
      'src/components/IdentificationCard.tsx', 'src/components/ChecklistSections.tsx',
      'src/components/Actions.tsx', 'src/components/Footer.tsx', 'src/components/Termo.tsx',
    ]) {
      expect(existsSync(resolve(root, f))).toBe(true);
    }
  });

  it('app.ts exporta initApp (com teardown), importa o domínio e é type-checked', () => {
    const app = read('src/app.ts');
    expect(app).toContain('export function initApp(): () => void');
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

  it('os componentes mantêm os marcadores da versão vigente (não a v1)', () => {
    const sections = read('src/components/ChecklistSections.tsx');
    expect(sections).toContain('Bancadas, Cubas e Metais');
    expect(sections).toContain('Observações Gerais');
    expect(sections).not.toContain('Cubas e Louças');
    expect(read('src/components/IdentificationCard.tsx')).toContain('data-id="tipo_medicao"');
    expect(read('src/components/Actions.tsx')).toContain('Gerar solicitação de medição');
  });
});

describe('archive/ — histórico de versões', () => {
  it('preserva as versões anteriores (v1 a v4.1)', () => {
    for (const versao of ['v1', 'v2', 'v3', 'v4', 'v4.1']) {
      expect(existsSync(resolve(root, `archive/checklist-${versao}.html`))).toBe(true);
    }
  });
});
