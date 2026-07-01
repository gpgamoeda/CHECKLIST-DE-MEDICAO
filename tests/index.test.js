// Testes de fumaça (smoke tests) da Sprint 0.
// Objetivo: travar o comportamento estrutural atual do app e garantir que
// index.html é a versão vigente (v5) — sem depender de DOM/navegador.
// À medida que o código for extraído para módulos (próximas sprints), estes
// testes serão substituídos por testes unitários das funções puras.
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

  it('mantém o app como single-file (um <style> e um <script>)', () => {
    expect(html.match(/<style/g)).toHaveLength(1);
    expect(html.match(/<script/g)).toHaveLength(1);
  });

  it('corresponde à versão vigente v5 (não à v1 arquivada)', () => {
    // Marcadores introduzidos na evolução até a v5.
    expect(html).toContain('Bancadas, Cubas e Metais');
    expect(html).toContain('Observações Gerais');
    expect(html).toContain('Refrigerador');
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

describe('archive/ — histórico de versões', () => {
  it('preserva as versões anteriores (v1 a v4.1)', () => {
    for (const versao of ['v1', 'v2', 'v3', 'v4', 'v4.1']) {
      expect(existsSync(resolve(root, `archive/checklist-${versao}.html`))).toBe(true);
    }
  });
});
