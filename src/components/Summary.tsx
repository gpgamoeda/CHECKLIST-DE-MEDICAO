// Resumo imprimível (Solicitação de Medição), renderizado a partir do modelo.
// O React já escapa o texto, então não é preciso esc() manual.
import type { ReactNode } from 'react';
import { useChecklist } from './store';
import { SEC1_ITEMS, SEC2_ITEMS, F2, CUBA_LABEL, MOD_LABEL, MET_LABEL, brDate } from '../domain';

function Parts({ items }: { items: Array<[string, string]> }) {
  const filtered = items.filter(([, v]) => v);
  return (
    <>
      {filtered.map(([label, value], i) => (
        <span key={label}>{i > 0 ? ' · ' : ''}<b>{label}:</b> {value}</span>
      ))}
    </>
  );
}

function multiline(text: string): ReactNode {
  return text.split('\n').map((line, i) => (
    <span key={i}>{i > 0 ? <br /> : null}{line}</span>
  ));
}

export function Summary({ onEdit }: { onEdit: () => void }) {
  const { model } = useChecklist();
  const id = model.id;

  let endr = id.endereco || '';
  if (id.numero) endr += ', nº ' + id.numero;
  if (id.complemento) endr += ' — ' + id.complemento;
  if (id.referencia) endr += ' (ref.: ' + id.referencia + ')';

  const obsGerais = (model.observacoes || '').trim();

  return (
    <div id="summary" className="show">
      <h1 style={{ fontSize: '22px', margin: 0 }}>Solicitação de Medição</h1>
      <div className="rule"></div>

      <div className="sum-sec">
        <h4>Identificação</h4>
        <div className="sum-line"><b>Cliente:</b> {id.cliente || ''} &nbsp;·&nbsp; <b>Projeto:</b> {id.projeto || ''}</div>
        <div className="sum-line"><b>Consultor(a):</b> {id.consultor || ''} &nbsp;·&nbsp; <b>Arquiteto(a):</b> {id.arquiteto ? id.arquiteto : <span className="sum-na">não informado</span>}</div>
        <div className="sum-line"><b>Loja:</b> {id.loja || ''}</div>
        <div className="sum-line"><b>Endereço da obra:</b> {endr}</div>
        <div className="sum-line"><b>Responsável pela obra:</b> {id.responsavel_obra || ''} &nbsp;·&nbsp; <b>Telefone:</b> {id.telefone_responsavel || ''}</div>
        <div className="sum-line"><b>Tipo de medição:</b> {id.tipo_medicao || ''} &nbsp;·&nbsp; <b>Tipo de obra:</b> {id.tipo || ''}</div>
        <div className="sum-line"><b>Quantidade de ambientes:</b> {id.qtd_ambientes || ''}</div>
        <div className="sum-line"><b>Fotos (SharePoint):</b> {model.photosNA ? <span className="sum-na">Não se aplica</span> : (id.link_fotos || '—')}</div>
        <div className="sum-line"><b>Data do preenchimento:</b> {brDate(id.data_checklist)} &nbsp;·&nbsp; <b>Data da solicitação da medição:</b> {brDate(id.data_solicitacao_medicao)}</div>
      </div>

      <div className="sum-sec">
        <h4>1 · Obra Civil Finalizada</h4>
        {SEC1_ITEMS.map((n, i) => {
          const s = model.fixed['s1_' + i];
          if (s.status === 'ok') return <div className="sum-line" key={i}>✔ {n}</div>;
          return <div className="sum-line sum-pend" key={i}>✖ {n} — pendente{s.fields.amb_pend ? ` (${s.fields.amb_pend})` : ''}: {s.fields.obs || ''}</div>;
        })}
      </div>

      <SummaryEletros />
      <SummaryBancadas />
      <SummaryDyn title="4 · Mobiliário de Terceiros" sec="5" />
      <SummaryDyn title="5 · Demais Itens que Interferem" sec="6" />

      <div className="sum-sec">
        <h4>6 · Observações Gerais</h4>
        {obsGerais
          ? <div className="sum-line">{multiline(obsGerais)}</div>
          : <div className="sum-line sum-na">Nenhuma observação registrada.</div>}
      </div>

      <div className="sum-sec">
        <h4>Termo de Responsabilidade</h4>
        <div className="sum-line">Itens definidos e não executados exigem o Termo de Responsabilidade pelas Medidas Informadas, assinado pelo cliente e anexado à pasta (SharePoint &gt; Público &gt; 01 - DOCUMENTOS COMERCIAIS).</div>
      </div>

      <div className="sign"><div>Consultor(a) responsável</div><div>Gerente</div></div>

      <div className="actions no-print">
        <button type="button" className="btn primary" id="prt" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        <button type="button" className="btn ghost" id="edit" onClick={onEdit}>Voltar e editar</button>
      </div>
    </div>
  );
}

function SummaryEletros() {
  const { model } = useChecklist();
  const def: ReactNode[] = [];
  const na: string[] = [];
  SEC2_ITEMS.forEach((n, i) => {
    const s = model.fixed['s2_' + i];
    if (s.status === 'def') {
      const parts: Array<[string, string]> = F2.map((f) => [f.l, s.fields[f.k] || '']);
      if (s.fields.alimentacao) parts.push(['Alimentação', s.fields.alimentacao]);
      if (s.fields.respiro) parts.push(['Respiro', s.fields.respiro + (s.fields.respiro === 'Sim' && s.fields.respiro_espec ? ` (${s.fields.respiro_espec})` : '')]);
      if (s.fields.obs_eletro) parts.push(['Observação', s.fields.obs_eletro]);
      const hasParts = parts.some(([, v]) => v);
      def.push(<div className="sum-line" key={'s2_' + i}>{n}{hasParts ? <> — <Parts items={parts} /></> : null}</div>);
    } else if (s.status === 'na') na.push(n);
  });
  model.dynEletros.forEach((e) => {
    const f = e.fields;
    const parts: Array<[string, string]> = [['Marca', f.marca || ''], ['Modelo', f.modelo || ''], ['Referência / Código', f.ref || ''], ['Dimensões', f.dim ? f.dim + ' mm' : '']];
    const nome = (f.ambiente ? f.ambiente + ' — ' : '') + (f.nome || 'Eletro adicional');
    const hasParts = parts.some(([, v]) => v);
    def.push(<div className="sum-line" key={e.id}><b>{nome}</b>{hasParts ? <> — <Parts items={parts} /></> : null}</div>);
  });
  return (
    <div className="sum-sec">
      <h4>2 · Eletrodomésticos</h4>
      {def.length ? def : <div className="sum-line sum-na">Nenhum item definido.</div>}
      {na.length ? <div className="sum-line sum-na"><b>Não se aplica:</b> {na.join(', ')}</div> : null}
    </div>
  );
}

function SummaryBancadas() {
  const { model } = useChecklist();
  if (model.secq.ban !== 'sim') {
    return <div className="sum-sec"><h4>3 · Bancadas, Cubas e Metais</h4><div className="sum-line sum-na">Sem bancadas / cubas — não se aplica.</div></div>;
  }
  return (
    <div className="sum-sec">
      <h4>3 · Bancadas, Cubas e Metais</h4>
      {model.bancadas.length === 0 && <div className="sum-line sum-na">Nenhum ambiente informado.</div>}
      {model.bancadas.map((b) => {
        const f = b.fields;
        const banParts = [f.material, f.modelo].filter(Boolean).join(' ');
        let cubaNode: ReactNode = null;
        if (b.cuba === 'na') {
          cubaNode = <div className="sum-line" style={{ paddingLeft: '14px' }}><b>Cuba:</b> <span className="sum-na">não se aplica</span></div>;
        } else if (b.cuba) {
          let ct = CUBA_LABEL[b.cuba] || b.cuba;
          if (b.cuba === 'louca' && b.modeloCuba) ct += ' · ' + MOD_LABEL[b.modeloCuba];
          const cParts = [f.cuba_marca, f.cuba_desc, f.cuba_ref].filter(Boolean).join(' · ');
          cubaNode = (
            <>
              <div className="sum-line" style={{ paddingLeft: '14px' }}><b>Cuba:</b> {ct}{cParts ? ' — ' + cParts : ''}{f.cuba_dim ? ` (${f.cuba_dim} mm)` : ''}</div>
              {b.metalInstal && (() => {
                const mParts = [f.metal_marca, f.metal_desc, f.metal_ref].filter(Boolean).join(' · ');
                return <div className="sum-line" style={{ paddingLeft: '14px' }}><b>Metal ({MET_LABEL[b.metalInstal]}):</b> {mParts || '—'}{f.metal_dim ? ` (${f.metal_dim} mm)` : ''}</div>;
              })()}
            </>
          );
        }
        return (
          <div key={b.id}>
            <div className="sum-line" style={{ borderBottom: 'none', paddingBottom: '1px', marginTop: '4px' }}><b>{f.ambiente || 'Ambiente'}</b></div>
            <div className="sum-line" style={{ paddingLeft: '14px' }}><b>Bancada:</b> {banParts || '—'}{f.dim ? ` (${f.dim} mm)` : ''}{f.saia ? `, saia ${f.saia} mm` : ''}</div>
            {cubaNode}
          </div>
        );
      })}
    </div>
  );
}

function SummaryDyn({ title, sec }: { title: string; sec: '5' | '6' }) {
  const { model } = useChecklist();
  const gate = model.secq[sec];
  const list = sec === '5' ? model.dyn5 : model.dyn6;
  return (
    <div className="sum-sec">
      <h4>{title}</h4>
      {gate === 'nao'
        ? <div className="sum-line sum-na">Não há itens que impactam o projeto.</div>
        : list.map((r) => {
          const f = r.fields;
          return <div className="sum-line" key={r.id}><b>{f.ambiente || ''}</b> — {f.desc || ''}{f.dim ? ` (${f.dim})` : ''}</div>;
        })}
    </div>
  );
}
