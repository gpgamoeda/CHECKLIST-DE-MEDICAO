// Cartão de Identificação da obra. Os campos são não-controlados (uncontrolled):
// initApp() lê/escreve seus valores via `data-id`. A máscara de telefone e o aviso
// de herança/acervo são aplicados por initApp().
export function IdentificationCard() {
  return (
    <div className="card">
      <div className="sec-h"><span className="sec-t">Identificação</span></div>
      <div className="idgrid" id="idgrid">
        <div><label>Cliente</label><input data-id="cliente" required /></div>
        <div><label>Projeto / Pedido</label><input data-id="projeto" required /></div>
        <div><label>Consultor(a)</label><input data-id="consultor" required /></div>

        <div><label>Arquiteto(a) <span style={{ textTransform: 'none', fontWeight: 400 }}>(se houver)</span></label><input data-id="arquiteto" placeholder="Nome do arquiteto(a)" /></div>
        <div><label>Tipo de medição</label>
          <select data-id="tipo_medicao" defaultValue="" required>
            <option value="">Selecionar</option>
            <option>Orientação</option>
            <option>Final</option>
          </select></div>
        <div><label>Loja</label>
          <select data-id="loja" defaultValue="" required>
            <option value="">Selecionar</option>
            <option>Gabriel (São Paulo)</option>
            <option>Campinas</option>
          </select></div>

        <div className="full"><label>Endereço da obra (logradouro)</label><input data-id="endereco" required /></div>

        <div><label>Número</label><input data-id="numero" required /></div>
        <div><label>Complemento</label><input data-id="complemento" placeholder="Apto, bloco, casa…" /></div>
        <div><label>Ponto de referência</label><input data-id="referencia" placeholder="Próximo a…" /></div>

        <div><label>Responsável pela obra</label><input data-id="responsavel_obra" required /></div>
        <div><label>Telefone do responsável</label><input data-id="telefone_responsavel" type="tel" inputMode="numeric" placeholder="(00) 0 0000-0000" required /></div>
        <div><label>Tipo de obra</label>
          <select data-id="tipo" id="tipo" defaultValue="" required>
            <option value="">Selecionar</option>
            <option>Obra nova</option>
            <option>Reforma</option>
            <option>Herança / acervo</option>
          </select></div>

        <div><label>Quantidade de ambientes a serem medidos</label><input data-id="qtd_ambientes" type="number" min="1" step="1" required /></div>
        <div><label>Data do preenchimento do checklist</label><input data-id="data_checklist" type="date" required /></div>
        <div><label>Data da solicitação da medição</label><input data-id="data_solicitacao_medicao" type="date" required /></div>

        <div className="full">
          <label>Link do SharePoint com as fotos da obra</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input data-id="link_fotos" id="link_fotos" placeholder="Cole o link do SharePoint com as fotos" style={{ flex: 1, minWidth: '200px' }} />
            <button type="button" className="seg-na" id="fotosNA">Não se aplica</button>
          </div>
          <div className="hint-sm" id="fotosHint">Se ainda não houver fotos, marque “não se aplica”.</div>
        </div>
      </div>
      <div className="heritage" id="heritage">⚠ Obra de herança/acervo: atenção redobrada — confirme cada medida e registre divergências, pois é onde o ruído de informação mais ocorre.</div>
    </div>
  );
}
