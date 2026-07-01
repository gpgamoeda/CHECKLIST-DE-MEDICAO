// Seção 6 — Observações Gerais. Campo livre, opcional. Controlado por React.
import { useChecklist } from './store';

export function Section6() {
  const { model, actions } = useChecklist();
  return (
    <div className="card" id="card-7">
      <div className="sec-h"><span className="sec-n">6</span><span className="sec-t">Observações Gerais</span></div>
      <div className="sec-d">Campo livre para qualquer informação adicional relevante para a medição. Opcional.</div>
      <div className="fields show one">
        <div className="f"><textarea data-id="observacoes_gerais" id="observacoes_gerais" rows={3} placeholder="Escreva aqui observações gerais sobre o projeto ou a obra…" style={{ resize: 'vertical' }} value={model.observacoes} onChange={(e) => actions.setObservacoes(e.target.value)} /></div>
      </div>
    </div>
  );
}
