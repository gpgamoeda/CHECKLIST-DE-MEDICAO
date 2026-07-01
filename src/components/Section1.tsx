// Seção 1 — Obra Civil Finalizada. Cada item: Concluído ou Pendente (com
// ambiente + motivo). Controlado por React.
import { useChecklist } from './store';
import { SEC1_ITEMS } from '../domain';

export function Section1() {
  const { model, actions } = useChecklist();
  return (
    <div className="card" id="card-1">
      <div className="sec-h"><span className="sec-n">1</span><span className="sec-t">Obra Civil Finalizada</span>
        <span className="badge guide">GUIA DE AVALIAÇÃO DAS FOTOS</span></div>
      <div className="sec-d">Base para a avaliação prévia da obra (Jamile). Marque cada item como concluído ou pendente. Itens pendentes embasam o Termo de Responsabilidade.</div>
      <div id="sec1">
        {SEC1_ITEMS.map((name, i) => {
          const id = 's1_' + i;
          const item = model.fixed[id];
          const status = item.status;
          return (
            <div className="item" key={id}>
              <div className="item-top">
                <span className="item-name">{name}</span>
                <span className={'state ' + (status === 'ok' ? 'ok' : status === 'pend' ? 'pend' : '')}>
                  {status === 'ok' ? 'CONCLUÍDO' : status === 'pend' ? 'PENDENTE' : ''}
                </span>
                <div className="seg" data-id={id}>
                  <button type="button" data-s="ok" className={status === 'ok' ? 'on-y' : ''} onClick={() => actions.setFixedStatus(id, 'ok')}>Concluído</button>
                  <button type="button" data-s="pend" className={status === 'pend' ? 'on-n' : ''} onClick={() => actions.setFixedStatus(id, 'pend')}>Pendente</button>
                </div>
              </div>
              <div className={'fields two' + (status === 'pend' ? ' show' : '')} id={'f_' + id}>
                <div className="f"><label>Ambiente pendente *</label><input data-fk="amb_pend" data-fid={id} value={item.fields.amb_pend || ''} placeholder="Onde está pendente" onChange={(e) => actions.setFixedField(id, 'amb_pend', e.target.value)} /></div>
                <div className="f"><label>Motivo da pendência *</label><input data-fk="obs" data-fid={id} value={item.fields.obs || ''} placeholder="O que falta executar" onChange={(e) => actions.setFixedField(id, 'obs', e.target.value)} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
