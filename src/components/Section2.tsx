// Seção 2 — Eletrodomésticos. "Definido" (com campos + extras) ou "não se aplica".
// Permite adicionar eletrodomésticos fora da lista. Controlado por React.
import { useChecklist } from './store';
import { SEC2_ITEMS, F2, ELETRO_EXTRAS } from '../domain';

export function Section2() {
  const { model, actions } = useChecklist();
  return (
    <div className="card" id="card-2">
      <div className="sec-h"><span className="sec-n">2</span><span className="sec-t">Eletrodomésticos</span></div>
      <div className="sec-d">Informar marca, modelo e dimensões de cada item, ou marcar “não se aplica”. Use “+ Adicionar eletrodoméstico” para itens que não estejam na lista.</div>
      <div id="sec2">
        {SEC2_ITEMS.map((name, i) => {
          const id = 's2_' + i;
          const item = model.fixed[id];
          const status = item.status;
          const ex = ELETRO_EXTRAS[name];
          const fv = (k: string) => item.fields[k] || '';
          return (
            <div className="item" key={id}>
              <div className="item-top">
                <span className="item-name">{name}</span>
                <span className={'state ' + (status === 'def' ? 'ok' : '')}>{status === 'def' ? 'DEFINIDO' : status === 'na' ? 'N/A' : ''}</span>
                <div className="seg" data-id={id}>
                  <button type="button" data-s="def" className={status === 'def' ? 'on-y' : ''} onClick={() => actions.setFixedStatus(id, 'def')}>Definido</button>
                  <button type="button" data-s="na" className={status === 'na' ? 'on-n' : ''} onClick={() => actions.setFixedStatus(id, 'na')}>Não se aplica</button>
                </div>
              </div>
              <div className={'fields' + (status === 'def' ? ' show' : '')} id={'f_' + id}>
                {F2.map((f) => (
                  <div className="f" key={f.k}><label>{f.l} *</label><input data-fk={f.k} data-fid={id} value={fv(f.k)} onChange={(e) => actions.setFixedField(id, f.k, e.target.value)} /></div>
                ))}
                {ex?.alimentacao && (
                  <div className="f"><label>Alimentação *</label>
                    <select data-fk="alimentacao" data-fid={id} value={fv('alimentacao')} onChange={(e) => actions.setFixedField(id, 'alimentacao', e.target.value)}>
                      <option value="">Selecionar</option><option>Elétrico</option><option>Gás</option>
                    </select></div>
                )}
                {ex?.respiro && (
                  <>
                    <div className="f"><label>Necessidade de respiro *</label>
                      <select data-fk="respiro" data-fid={id} value={fv('respiro')} onChange={(e) => actions.setFixedField(id, 'respiro', e.target.value)}>
                        <option value="">Selecionar</option><option>Sim</option><option>Não</option>
                      </select></div>
                    {item.fields.respiro === 'Sim' && (
                      <div className="f" id={'respesp_' + id}><label>Especificação do respiro *</label><input data-fk="respiro_espec" data-fid={id} value={fv('respiro_espec')} placeholder="Dimensão / tipo do respiro" onChange={(e) => actions.setFixedField(id, 'respiro_espec', e.target.value)} /></div>
                    )}
                  </>
                )}
                {ex?.obs && (
                  <div className="f"><label>Observação</label><input data-fk="obs_eletro" data-fid={id} value={fv('obs_eletro')} placeholder="Caso haja painel, especificar modelo/localização" onChange={(e) => actions.setFixedField(id, 'obs_eletro', e.target.value)} /></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div id="eletrosExtra">
        {model.dynEletros.map((e) => {
          const fv = (k: string) => e.fields[k] || '';
          const ch = (k: string) => (ev: { target: { value: string } }) => actions.setEletroField(e.id, k, ev.target.value);
          return (
            <div className="subcard" id={'row_' + e.id} key={e.id}>
              <div className="subhead"><span>Eletrodoméstico adicional</span>
                <button type="button" className="rm" onClick={() => actions.removeEletro(e.id)}>Remover</button></div>
              <div className="fields show">
                <div className="f"><label>Ambiente *</label><input data-fk="ambiente" data-fid={e.id} value={fv('ambiente')} placeholder="Ex.: Cozinha" onChange={ch('ambiente')} /></div>
                <div className="f"><label>Eletrodoméstico *</label><input data-fk="nome" data-fid={e.id} value={fv('nome')} placeholder="Ex.: Cervejeira dupla" onChange={ch('nome')} /></div>
                <div className="f"><label>Marca *</label><input data-fk="marca" data-fid={e.id} value={fv('marca')} onChange={ch('marca')} /></div>
              </div>
              <div className="fields show">
                <div className="f"><label>Modelo *</label><input data-fk="modelo" data-fid={e.id} value={fv('modelo')} onChange={ch('modelo')} /></div>
                <div className="f"><label>Referência / Código *</label><input data-fk="ref" data-fid={e.id} value={fv('ref')} onChange={ch('ref')} /></div>
                <div className="f"><label>Dimensões (L×A×P) em mm *</label><input data-fk="dim" data-fid={e.id} value={fv('dim')} onChange={ch('dim')} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <button type="button" className="addbtn" id="addEletro" onClick={() => actions.addEletro()}>+ Adicionar eletrodoméstico</button>
    </div>
  );
}
