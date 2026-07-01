// Barra de progresso + linha de autosave. Os valores (fill/count/mensagem) são
// atualizados imperativamente por initApp() via ids; aqui só o esqueleto.
export function ProgressBar() {
  return (
    <div className="bar no-print">
      <div className="barflex">
        <div className="track"><div className="fill" id="fill"></div></div>
        <div className="count" id="count">0 de 0 itens resolvidos</div>
      </div>
      <div className="barflex autosave-row">
        <span className="autosave-msg" id="autosaveMsg">O preenchimento é salvo automaticamente neste navegador.</span>
        <button type="button" className="autosave-clear" id="clearDraft">Limpar rascunho</button>
      </div>
    </div>
  );
}
