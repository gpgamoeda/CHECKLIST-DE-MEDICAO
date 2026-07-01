// Seções 4 e 5 — listas dinâmicas condicionadas a um "sim/não". Reutilizadas para
// Mobiliário de Terceiros (sec "5") e Demais Itens (sec "6").
import { useChecklist } from './store';

interface Props {
  num: string;
  cardId: string;
  sec: '5' | '6';
  title: string;
  desc: string;
  question: string;
  phDesc: string;
  titulo: string;
}

export function DynSection({ num, cardId, sec, title, desc, question, phDesc, titulo }: Props) {
  const { model, actions } = useChecklist();
  const gate = model.secq[sec];
  const list = sec === '5' ? model.dyn5 : model.dyn6;
  return (
    <div className="card" id={cardId}>
      <div className="sec-h"><span className="sec-n">{num}</span><span className="sec-t">{title}</span></div>
      <div className="sec-d">{desc}</div>
      <div className="secq">
        <span>{question}</span>
        <div className="seg" data-secq={sec}>
          <button type="button" data-v="sim" className={gate === 'sim' ? 'on-y' : ''} onClick={() => actions.setGate(sec, 'sim')}>Sim</button>
          <button type="button" data-v="nao" className={gate === 'nao' ? 'on-n' : ''} onClick={() => actions.setGate(sec, 'nao')}>Não</button>
        </div>
      </div>
      <div className={'dyn-wrap' + (gate === 'sim' ? ' show' : '')} id={'wrap' + sec}>
        <div id={'rows' + sec}>
          {list.map((r, idx) => {
            const fv = (k: string) => r.fields[k] || '';
            const ch = (k: string) => (e: { target: { value: string } }) => actions.setDynField(sec, r.id, k, e.target.value);
            return (
              <div className="subcard" id={'row_' + r.id} key={r.id}>
                <div className="subhead"><span className={'dyn-title-' + sec}>{titulo} {idx + 1}</span>
                  <button type="button" className="rm" onClick={() => actions.removeDyn(sec, r.id)}>Remover</button></div>
                <div className="fields show">
                  <div className="f"><label>Ambiente *</label><input data-fk="ambiente" data-fid={r.id} value={fv('ambiente')} placeholder="Ex.: Dormitório" onChange={ch('ambiente')} /></div>
                  <div className="f"><label>Descrição *</label><input data-fk="desc" data-fid={r.id} value={fv('desc')} placeholder={phDesc} onChange={ch('desc')} /></div>
                  <div className="f"><label>Dimensões / observação *</label><input data-fk="dim" data-fid={r.id} value={fv('dim')} onChange={ch('dim')} /></div>
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" className="addbtn" data-add={sec} onClick={() => actions.addDyn(sec)}>+ Adicionar item</button>
      </div>
    </div>
  );
}

export function Section4() {
  return (
    <DynSection num="4" cardId="card-5" sec="5" title="Mobiliário de Terceiros"
      desc="Cama, escrivaninha, criados-mudos, móveis de acervo — qualquer móvel que impacte o projeto (abertura de porta de roupeiro, circulação)."
      question="Há mobiliário de terceiros que impacta o projeto?" phDesc="Ex.: cama queen, criado-mudo" titulo="Móvel" />
  );
}

export function Section5() {
  return (
    <DynSection num="5" cardId="card-6" sec="6" title="Demais Itens que Interferem no Projeto"
      desc="TV em nicho, objetos de coleção/decoração e outros itens que ocupem ou condicionem o ambiente."
      question="Há outros itens que interferem no projeto?" phDesc={'Ex.: TV em nicho 65"'} titulo="Item" />
  );
}
