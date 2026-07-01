// Barra de progresso + linha de autosave. Deriva o progresso do modelo.
import { useChecklist } from './store';
import { computeProgress } from '../model';

export function ProgressBar() {
  const { model, autosaveMsg, actions } = useChecklist();
  const { resolved, total } = computeProgress(model);
  const pct = total ? Math.round((resolved / total) * 100) : 0;

  const onClear = () => {
    const ok = typeof window !== 'undefined' && typeof window.confirm === 'function'
      ? window.confirm('Limpar o rascunho salvo neste navegador? O formulário será reiniciado.')
      : true;
    if (ok) actions.clearDraft();
  };

  return (
    <div className="bar no-print">
      <div className="barflex">
        <div className="track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="fill" id="fill" style={{ width: pct + '%' }}></div></div>
        <div className="count" id="count" aria-live="polite">{resolved} de {total} itens resolvidos</div>
      </div>
      <div className="barflex autosave-row">
        <span className="autosave-msg" id="autosaveMsg" aria-live="polite">{autosaveMsg}</span>
        <button type="button" className="autosave-clear" id="clearDraft" onClick={onClear}>Limpar rascunho</button>
      </div>
    </div>
  );
}
