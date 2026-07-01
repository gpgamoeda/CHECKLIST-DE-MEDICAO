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
      'src/main.tsx', 'src/model.ts', 'src/draft.ts', 'src/domain.ts', 'src/styles.css',
      'src/components/App.tsx', 'src/components/store.tsx', 'src/components/Header.tsx',
      'src/components/ProgressBar.tsx', 'src/components/IdentificationCard.tsx',
      'src/components/Section1.tsx', 'src/components/Section2.tsx', 'src/components/Section3.tsx',
      'src/components/DynSection.tsx', 'src/components/Section6.tsx', 'src/components/Summary.tsx',
      'src/components/Actions.tsx', 'src/components/Footer.tsx', 'src/components/Termo.tsx',
    ]) {
      expect(existsSync(resolve(root, f))).toBe(true);
    }
  });

  it('não há mais o app imperativo (app.ts) nem @ts-nocheck no src', () => {
    expect(existsSync(resolve(root, 'src/app.ts'))).toBe(false);
    for (const f of ['src/model.ts', 'src/domain.ts', 'src/components/store.tsx', 'src/components/App.tsx']) {
      expect(read(f)).not.toContain('@ts-nocheck');
    }
  });

  it('model.ts calcula progresso a partir do domínio', () => {
    const model = read('src/model.ts');
    expect(model).toContain('export function computeProgress');
    expect(model).toContain('export function isComplete');
    expect(model).toContain("from './domain'");
  });

  it('domain.ts concentra dados e regras puras', () => {
    const domain = read('src/domain.ts');
    expect(domain).toContain('Refrigerador');
    expect(domain).toContain('export function maskPhone');
    expect(domain).toContain('export function isBancadaResolved');
    expect(domain).toContain('export function isIdentificationComplete');
  });

  it('os componentes mantêm os marcadores da versão vigente (não a v1)', () => {
    expect(read('src/components/Section3.tsx')).toContain('Bancadas, Cubas e Metais');
    expect(read('src/components/Section6.tsx')).toContain('Observações Gerais');
    expect(read('src/components/IdentificationCard.tsx')).toContain('data-id="tipo_medicao"');
    expect(read('src/components/Actions.tsx')).toContain('Gerar solicitação de medição');
    expect(read('src/components/Summary.tsx')).not.toContain('Cubas e Louças');
  });
});

describe('archive/ — histórico de versões', () => {
  it('preserva as versões anteriores (v1 a v4.1)', () => {
    for (const versao of ['v1', 'v2', 'v3', 'v4', 'v4.1']) {
      expect(existsSync(resolve(root, `archive/checklist-${versao}.html`))).toBe(true);
    }
  });
});
