// Seção 1 — Obra Civil Finalizada. Cada item: Concluído, Pendente (com ambiente +
// motivo) ou N/A (não se aplica). Também permite adicionar ambientes/linhas
// extras. Reaproveita a lista de ambientes da Identificação como fonte de
// sugestões (fonte principal). Controlado por React.
import { useChecklist } from './store';
import { SEC1_ITEMS, filledAmbientes } from '../domain';

// Trio de estados Concluído / Pendente / N/A reutilizado por itens fixos e extras.
function StateSeg({ status, onSet, dataAttr }: { status: string | null; onSet: (s: string) => void; dataAttr: Record<string, string> }) {
  return (
    <>
      <span className={'state ' + (status === 'ok' ? 'ok' : status === 'pend' ? 'pend' : status === 'na' ? 'na' : '')}>
        {status === 'ok' ? 'CONCLUÍDO' : status === 'pend' ? 'PENDENTE' : status === 'na' ? 'N/A' : ''}
      </span>
      <div className="seg multi" {...dataAttr}>
        <button type="button" data-s="ok" className={status === 'ok' ? 'on-y' : ''} onClick={() => onSet('ok')}>Concluído</button>
        <button type="button" data-s="pend" className={status === 'pend' ? 'on-n' : ''} onClick={() => onSet('pend')}>Pendente</button>
        <button type="button" data-s="na" className={status === 'na' ? 'on-na' : ''} onClick={() => onSet('na')}>N/A</button>
      </div>
    </>
  );
}

export function Section1() {
  const { model, actions } = useChecklist();
  const ambList = filledAmbientes(model.ambientes);
  return (
    <div className="card" id="card-1">
      <div className="sec-h"><span className="sec-n">1</span><span className="sec-t">Obra Civil Finalizada</span>
        <span className="badge guide">GUIA DE AVALIAÇÃO DAS FOTOS</span></div>
      <div className="sec-d">Base para a avaliação prévia da obra. Marque cada item como concluído, pendente ou não se aplica (N/A). Itens pendentes embasam o Termo de Responsabilidade.</div>

      {/* Sugestões de ambiente reutilizando a lista da Identificação. */}
      {ambList.length > 0 && (
        <datalist id="amb-list">
          {ambList.map((a) => <option value={a} key={a} />)}
        </datalist>
      )}

      <div id="sec1">
        {SEC1_ITEMS.map((name, i) => {
          const id = 's1_' + i;
          const item = model.fixed[id];
          const status = item.status;
          return (
            <div className="item" key={id}>
              <div className="item-top">
                <span className="item-name">{name}</span>
                <StateSeg status={status} onSet={(s) => actions.setFixedStatus(id, s)} dataAttr={{ 'data-id': id }} />
              </div>
              <div className={'fields two' + (status === 'pend' ? ' show' : '')} id={'f_' + id}>
                <div className="f"><label>Ambiente pendente *</label><input data-fk="amb_pend" data-fid={id} list="amb-list" value={item.fields.amb_pend || ''} placeholder="Onde está pendente" onChange={(e) => actions.setFixedField(id, 'amb_pend', e.target.value)} /></div>
                <div className="f"><label>Motivo da pendência *</label><input data-fk="obs" data-fid={id} value={item.fields.obs || ''} placeholder="O que falta executar" onChange={(e) => actions.setFixedField(id, 'obs', e.target.value)} /></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ambientes/linhas extras — complementam a lista padrão (0.6.4). */}
      <div id="sec1-extras">
        {model.sec1Extras.map((ex, idx) => (
          <div className="subcard" id={'s1x_' + ex.id} key={ex.id}>
            <div className="subhead"><span>Ambiente extra {idx + 1}</span>
              <button type="button" className="rm" onClick={() => actions.removeSec1Extra(ex.id)}>Remover</button></div>
            <div className="fields one show">
              <div className="f"><label>Ambiente / item *</label><input data-xk="nome" data-xid={ex.id} list="amb-list" value={ex.nome} placeholder="Ex.: Varanda gourmet" onChange={(e) => actions.setSec1ExtraNome(ex.id, e.target.value)} /></div>
            </div>
            <div className="item-top" style={{ marginTop: '8px' }}>
              <StateSeg status={ex.status} onSet={(s) => actions.setSec1ExtraStatus(ex.id, s)} dataAttr={{ 'data-xid': ex.id }} />
            </div>
            <div className={'fields two' + (ex.status === 'pend' ? ' show' : '')} id={'fx_' + ex.id}>
              <div className="f"><label>Ambiente pendente *</label><input data-xfk="amb_pend" data-xid={ex.id} list="amb-list" value={ex.fields.amb_pend || ''} placeholder="Onde está pendente" onChange={(e) => actions.setSec1ExtraField(ex.id, 'amb_pend', e.target.value)} /></div>
              <div className="f"><label>Motivo da pendência *</label><input data-xfk="obs" data-xid={ex.id} value={ex.fields.obs || ''} placeholder="O que falta executar" onChange={(e) => actions.setSec1ExtraField(ex.id, 'obs', e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="addbtn" data-add="s1x" onClick={() => actions.addSec1Extra()}>+ Adicionar ambiente</button>
    </div>
  );
}
