// Cabeçalho do checklist (marca, título e chamada). Estático.
export function Header() {
  return (
    <>
      <div className="kick">FABRILIS · MARCENARIA AUTORAL</div>
      <div className="hrow">
        <h1>CHECKLIST DE ENVIO PARA MEDIÇÃO</h1>
      </div>
      <div className="rule"></div>
      <p className="lead">
        Todo projeto enviado ao setor técnico deve ter os itens abaixo definidos. Cada item precisa ser
        resolvido — informado ou marcado como “não se aplica”. O resumo só é liberado quando não houver nenhum item em aberto.
      </p>
    </>
  );
}
