// Ação principal: gerar a solicitação. O estado disabled/hint é controlado por
// initApp() (via ids finish/hint).
export function Actions() {
  return (
    <div className="actions no-print">
      <button type="button" className="btn primary" id="finish" disabled>Gerar solicitação de medição</button>
      <span className="hint" id="hint">Resolva todos os itens para liberar o resumo.</span>
    </div>
  );
}
