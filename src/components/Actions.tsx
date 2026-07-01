// Ação principal: gerar a solicitação. Só habilita quando tudo está resolvido.
import { useChecklist } from './store';
import { isComplete } from '../model';

export function Actions({ onFinish }: { onFinish: () => void }) {
  const { model } = useChecklist();
  const ok = isComplete(model);
  return (
    <div className="actions no-print">
      <button type="button" className="btn primary" id="finish" disabled={!ok} onClick={onFinish}>Gerar solicitação de medição</button>
      <span className={'hint' + (ok ? ' ok' : '')} id="hint">
        {ok ? 'Tudo resolvido — gere a solicitação.' : 'Resolva todos os itens para liberar o resumo.'}
      </span>
    </div>
  );
}
