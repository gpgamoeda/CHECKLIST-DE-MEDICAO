// Esqueleto das 6 seções do checklist. As linhas dinâmicas (itens, bancadas,
// eletros, listas) são preenchidas por initApp() nos containers por id. A
// componentização do conteúdo dinâmico é a Sprint 0.4.1.
export function ChecklistSections() {
  return (
    <>
      {/* SEÇÃO 1 */}
      <div className="card" id="card-1">
        <div className="sec-h"><span className="sec-n">1</span><span className="sec-t">Obra Civil Finalizada</span>
          <span className="badge guide">GUIA DE AVALIAÇÃO DAS FOTOS</span></div>
        <div className="sec-d">Base para a avaliação prévia da obra (Jamile). Marque cada item como concluído ou pendente. Itens pendentes embasam o Termo de Responsabilidade.</div>
        <div id="sec1"></div>
      </div>

      {/* SEÇÃO 2 */}
      <div className="card" id="card-2">
        <div className="sec-h"><span className="sec-n">2</span><span className="sec-t">Eletrodomésticos</span></div>
        <div className="sec-d">Informar marca, modelo e dimensões de cada item, ou marcar “não se aplica”. Use “+ Adicionar eletrodoméstico” para itens que não estejam na lista.</div>
        <div id="sec2"></div>
        <div id="eletrosExtra"></div>
        <button type="button" className="addbtn" id="addEletro">+ Adicionar eletrodoméstico</button>
      </div>

      {/* SEÇÃO 3 — BANCADAS, CUBAS E METAIS */}
      <div className="card" id="card-3">
        <div className="sec-h"><span className="sec-n">3</span><span className="sec-t">Bancadas, Cubas e Metais</span></div>
        <div className="sec-d">Cada ambiente reúne, num cartão só, a bancada, a cuba que ela recebe e o metal. O tipo de cuba define o que será pedido em seguida — se não houver cuba, marque “Não se aplica”.</div>
        <div className="secq">
          <span>Há bancadas / cubas no projeto?</span>
          <div className="seg" data-secq="ban">
            <button type="button" data-v="sim">Sim</button>
            <button type="button" data-v="nao">Não</button>
          </div>
        </div>
        <div className="dyn-wrap" id="wrapban">
          <div id="bancadasRows"></div>
          <button type="button" className="addbtn" id="addBancada">+ Adicionar ambiente</button>
        </div>
      </div>

      {/* SEÇÃO 4 */}
      <div className="card" id="card-5">
        <div className="sec-h"><span className="sec-n">4</span><span className="sec-t">Mobiliário de Terceiros</span></div>
        <div className="sec-d">Cama, escrivaninha, criados-mudos, móveis de acervo — qualquer móvel que impacte o projeto (abertura de porta de roupeiro, circulação).</div>
        <div className="secq">
          <span>Há mobiliário de terceiros que impacta o projeto?</span>
          <div className="seg" data-secq="5">
            <button type="button" data-v="sim">Sim</button>
            <button type="button" data-v="nao">Não</button>
          </div>
        </div>
        <div className="dyn-wrap" id="wrap5">
          <div id="rows5"></div>
          <button type="button" className="addbtn" data-add="5">+ Adicionar item</button>
        </div>
      </div>

      {/* SEÇÃO 5 */}
      <div className="card" id="card-6">
        <div className="sec-h"><span className="sec-n">5</span><span className="sec-t">Demais Itens que Interferem no Projeto</span></div>
        <div className="sec-d">TV em nicho, objetos de coleção/decoração e outros itens que ocupem ou condicionem o ambiente.</div>
        <div className="secq">
          <span>Há outros itens que interferem no projeto?</span>
          <div className="seg" data-secq="6">
            <button type="button" data-v="sim">Sim</button>
            <button type="button" data-v="nao">Não</button>
          </div>
        </div>
        <div className="dyn-wrap" id="wrap6">
          <div id="rows6"></div>
          <button type="button" className="addbtn" data-add="6">+ Adicionar item</button>
        </div>
      </div>

      {/* SEÇÃO 6 — OBSERVAÇÕES */}
      <div className="card" id="card-7">
        <div className="sec-h"><span className="sec-n">6</span><span className="sec-t">Observações Gerais</span></div>
        <div className="sec-d">Campo livre para qualquer informação adicional relevante para a medição. Opcional.</div>
        <div className="fields show one">
          <div className="f"><textarea data-id="observacoes_gerais" id="observacoes_gerais" rows={3} placeholder="Escreva aqui observações gerais sobre o projeto ou a obra…" style={{ resize: 'vertical' }}></textarea></div>
        </div>
      </div>
    </>
  );
}
