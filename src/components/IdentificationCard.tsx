// Cartão de Identificação (controlado por React). Telefone com máscara e aviso
// de herança/acervo derivados do modelo.
import { useChecklist } from './store';
import { maskPhone } from '../domain';

export function IdentificationCard() {
  const { model, actions } = useChecklist();
  const v = (k: string) => model.id[k] || '';
  const set = (k: string) => (e: { target: { value: string } }) => actions.setId(k, e.target.value);

  return (
    <div className="card">
      <div className="sec-h"><span className="sec-t">Identificação</span></div>
      <div className="idgrid" id="idgrid">
        <div><label>Cliente</label><input data-id="cliente" value={v('cliente')} onChange={set('cliente')} required /></div>
        <div><label>Projeto / Pedido</label><input data-id="projeto" value={v('projeto')} onChange={set('projeto')} required /></div>
        <div><label>Consultor(a)</label><input data-id="consultor" value={v('consultor')} onChange={set('consultor')} required /></div>

        <div><label>Arquiteto(a) <span style={{ textTransform: 'none', fontWeight: 400 }}>(se houver)</span></label><input data-id="arquiteto" value={v('arquiteto')} onChange={set('arquiteto')} placeholder="Nome do arquiteto(a)" /></div>
        <div><label>Tipo de medição</label>
          <select data-id="tipo_medicao" value={v('tipo_medicao')} onChange={set('tipo_medicao')} required>
            <option value="">Selecionar</option>
            <option>Orientação</option>
            <option>Final</option>
          </select></div>
        <div><label>Loja</label>
          <select data-id="loja" value={v('loja')} onChange={set('loja')} required>
            <option value="">Selecionar</option>
            <option>Gabriel (São Paulo)</option>
            <option>Campinas</option>
          </select></div>

        <div className="full"><label>Endereço da obra (logradouro)</label><input data-id="endereco" value={v('endereco')} onChange={set('endereco')} required /></div>

        <div><label>Número</label><input data-id="numero" value={v('numero')} onChange={set('numero')} required /></div>
        <div><label>Complemento</label><input data-id="complemento" value={v('complemento')} onChange={set('complemento')} placeholder="Apto, bloco, casa…" /></div>
        <div><label>Ponto de referência</label><input data-id="referencia" value={v('referencia')} onChange={set('referencia')} placeholder="Próximo a…" /></div>

        <div><label>Responsável pela obra</label><input data-id="responsavel_obra" value={v('responsavel_obra')} onChange={set('responsavel_obra')} required /></div>
        <div><label>Telefone do responsável</label><input data-id="telefone_responsavel" type="tel" inputMode="numeric" placeholder="(00) 0 0000-0000" value={v('telefone_responsavel')} onChange={(e) => actions.setId('telefone_responsavel', maskPhone(e.target.value))} required /></div>
        <div><label>Tipo de obra</label>
          <select data-id="tipo" id="tipo" value={v('tipo')} onChange={set('tipo')} required>
            <option value="">Selecionar</option>
            <option>Obra nova</option>
            <option>Reforma</option>
            <option>Herança / acervo</option>
          </select></div>

        <div><label>Quantidade de ambientes a serem medidos</label><input data-id="qtd_ambientes" type="number" min="1" step="1" value={v('qtd_ambientes')} onChange={set('qtd_ambientes')} required /></div>
        <div><label>Data do preenchimento do checklist</label><input data-id="data_checklist" type="date" value={v('data_checklist')} onChange={set('data_checklist')} required /></div>
        <div><label>Data da solicitação da medição</label><input data-id="data_solicitacao_medicao" type="date" value={v('data_solicitacao_medicao')} onChange={set('data_solicitacao_medicao')} required /></div>

        <div className="full">
          <label>Link do SharePoint com as fotos da obra</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input data-id="link_fotos" id="link_fotos" placeholder="Cole o link do SharePoint com as fotos" style={{ flex: 1, minWidth: '200px' }} value={v('link_fotos')} disabled={model.photosNA} onChange={set('link_fotos')} />
            <button type="button" className={'seg-na' + (model.photosNA ? ' on-n' : '')} id="fotosNA" onClick={() => actions.setPhotosNA(!model.photosNA)}>Não se aplica</button>
          </div>
          <div className="hint-sm" id="fotosHint">{model.photosNA ? 'Sem fotos — marcado como não se aplica.' : 'Se ainda não houver fotos, marque “não se aplica”.'}</div>
        </div>
      </div>
      {model.id.tipo === 'Herança / acervo' && (
        <div className="heritage show" id="heritage">⚠ Obra de herança/acervo: atenção redobrada — confirme cada medida e registre divergências, pois é onde o ruído de informação mais ocorre.</div>
      )}
    </div>
  );
}
