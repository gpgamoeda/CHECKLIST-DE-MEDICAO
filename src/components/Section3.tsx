// Seção 3 — Bancadas, Cubas e Metais. Por ambiente; o tipo de cuba condiciona os
// campos seguintes (louça exige modelo; havendo cuba, exige a instalação do metal).
import { useChecklist } from './store';
import { MOD_LABEL } from '../domain';

const MODELOS = ['apoio', 'sobrepor', 'embutir', 'semi'] as const;

export function Section3() {
  const { model, actions } = useChecklist();
  const ban = model.secq.ban;

  return (
    <div className="card" id="card-3">
      <div className="sec-h"><span className="sec-n">3</span><span className="sec-t">Bancadas, Cubas e Metais</span></div>
      <div className="sec-d">Cada ambiente reúne, num cartão só, a bancada, a cuba que ela recebe e o metal. O tipo de cuba define o que será pedido em seguida — se não houver cuba, marque “Não se aplica”.</div>
      <div className="secq">
        <span>Há bancadas / cubas no projeto?</span>
        <div className="seg" data-secq="ban">
          <button type="button" data-v="sim" className={ban === 'sim' ? 'on-y' : ''} onClick={() => actions.setGate('ban', 'sim')}>Sim</button>
          <button type="button" data-v="nao" className={ban === 'nao' ? 'on-n' : ''} onClick={() => actions.setGate('ban', 'nao')}>Não</button>
        </div>
      </div>
      <div className={'dyn-wrap' + (ban === 'sim' ? ' show' : '')} id="wrapban">
        <div id="bancadasRows">
          {model.bancadas.map((b, idx) => {
            const showCuba = !!b.cuba && b.cuba !== 'na';
            const isLouca = b.cuba === 'louca';
            const cubaReady = showCuba && (!isLouca || !!b.modeloCuba);
            const fv = (k: string) => b.fields[k] || '';
            const ch = (k: string) => (e: { target: { value: string } }) => actions.setBancadaField(b.id, k, e.target.value);
            return (
              <div className="subcard" id={'row_' + b.id} key={b.id}>
                <div className="subhead"><span className="ba-title">Bancada / Ambiente {idx + 1}</span>
                  <button type="button" className="rm" onClick={() => actions.removeBancada(b.id)}>Remover</button></div>

                <div className="grp-label first">Bancada</div>
                <div className="fields show">
                  <div className="f"><label>Ambiente *</label><input data-fk="ambiente" data-fid={b.id} value={fv('ambiente')} placeholder="Ex.: Cozinha, Banheiro suíte" onChange={ch('ambiente')} /></div>
                  <div className="f"><label>Material *</label><input data-fk="material" data-fid={b.id} value={fv('material')} placeholder="Ex.: quartzo, granito, mármore" onChange={ch('material')} /></div>
                  <div className="f"><label>Modelo</label><input data-fk="modelo" data-fid={b.id} value={fv('modelo')} placeholder="Cor / linha" onChange={ch('modelo')} /></div>
                </div>
                <div className="fields show two">
                  <div className="f"><label>Dimensões (L×P) em mm *</label><input data-fk="dim" data-fid={b.id} value={fv('dim')} onChange={ch('dim')} /></div>
                  <div className="f"><label>Altura da saia (mm)</label><input data-fk="saia" data-fid={b.id} value={fv('saia')} onChange={ch('saia')} /></div>
                </div>

                <div className="grp-label">Tipo de cuba</div>
                <div className="fields show one">
                  <div className="f"><select data-cuba data-fid={b.id} value={b.cuba || ''} onChange={(e) => actions.setBancadaCuba(b.id, e.target.value)}>
                    <option value="">Selecionar</option>
                    <option value="inox">Inox</option>
                    <option value="louca">Louça, vidro ou acrílico</option>
                    <option value="esculpida">Esculpida</option>
                    <option value="na">Não se aplica</option>
                  </select></div>
                </div>

                {showCuba && (
                  <div id={'cubablk_' + b.id}>
                    <div className="grp-label">Cuba — especificação</div>
                    {isLouca && (
                      <div id={'modblk_' + b.id}>
                        <div className="f" style={{ marginBottom: '8px' }}><label>Modelo da cuba</label>
                          <div className="seg multi" data-segrole="modelo" data-fid={b.id}>
                            {MODELOS.map((mod) => (
                              <button type="button" key={mod} data-modelo={mod} className={b.modeloCuba === mod ? 'on-y' : ''} onClick={() => actions.setBancadaModelo(b.id, mod)}>{MOD_LABEL[mod]}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {cubaReady && (
                      <div id={'cubaf_' + b.id}>
                        <div className="fields show">
                          <div className="f"><label>Marca</label><input data-fk="cuba_marca" data-fid={b.id} value={fv('cuba_marca')} onChange={ch('cuba_marca')} /></div>
                          <div className="f"><label>Descrição</label><input data-fk="cuba_desc" data-fid={b.id} value={fv('cuba_desc')} onChange={ch('cuba_desc')} /></div>
                          <div className="f"><label>Referência / Código</label><input data-fk="cuba_ref" data-fid={b.id} value={fv('cuba_ref')} onChange={ch('cuba_ref')} /></div>
                        </div>
                        <div className="fields show one">
                          <div className="f"><label>Largura × Altura × Profundidade da cuba (mm)</label><input data-fk="cuba_dim" data-fid={b.id} value={fv('cuba_dim')} onChange={ch('cuba_dim')} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {cubaReady && (
                  <div id={'metblk_' + b.id}>
                    <div className="grp-label">Metais</div>
                    <div className="f" style={{ marginBottom: '8px' }}><label>Instalação do metal</label>
                      <div className="seg" data-segrole="metal" data-fid={b.id}>
                        <button type="button" data-metal="parede" className={b.metalInstal === 'parede' ? 'on-y' : ''} onClick={() => actions.setBancadaMetal(b.id, 'parede')}>Parede</button>
                        <button type="button" data-metal="bancada" className={b.metalInstal === 'bancada' ? 'on-y' : ''} onClick={() => actions.setBancadaMetal(b.id, 'bancada')}>Bancada</button>
                      </div>
                    </div>
                    {b.metalInstal && (
                      <div id={'metf_' + b.id}>
                        <div className="fields show">
                          <div className="f"><label>Marca</label><input data-fk="metal_marca" data-fid={b.id} value={fv('metal_marca')} onChange={ch('metal_marca')} /></div>
                          <div className="f"><label>Descrição</label><input data-fk="metal_desc" data-fid={b.id} value={fv('metal_desc')} onChange={ch('metal_desc')} /></div>
                          <div className="f"><label>Referência / Código</label><input data-fk="metal_ref" data-fid={b.id} value={fv('metal_ref')} onChange={ch('metal_ref')} /></div>
                        </div>
                        <div className="fields show one">
                          <div className="f"><label>Largura × Altura × Profundidade do metal (mm)</label><input data-fk="metal_dim" data-fid={b.id} value={fv('metal_dim')} onChange={ch('metal_dim')} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" className="addbtn" id="addBancada" onClick={() => actions.addBancada()}>+ Adicionar ambiente</button>
      </div>
    </div>
  );
}
