// App do checklist (camada de DOM). As regras de negócio puras, os dados e os
// tipos vivem em src/domain.ts; aqui ficam a montagem da UI, o estado e a ligação
// com o DOM. Este módulo é type-checked (o domínio é tipado); os acessos ao DOM
// usam helpers que retornam `any` para manter o glue leve.
import * as Draft from './draft';
import {
  SEC1_ITEMS as sec1items,
  SEC2_ITEMS as sec2items,
  F2,
  ELETRO_EXTRAS as eletroExtras,
  CUBA_LABEL,
  MOD_LABEL,
  MET_LABEL,
  esc,
  maskPhone,
  brDate,
  isSection1Resolved,
  isEletroResolved,
  isDynEletroResolved,
  isBancadaResolved,
  isDynResolved,
  isIdentificationComplete,
} from './domain';

export function initApp(): () => void {
  // Helpers de DOM (retornam `any` para manter o glue leve; a lógica de negócio
  // tipada está em domain.ts).
  const byId = (id: string): any => document.getElementById(id);
  const qs = (sel: string, root: any = document): any => root.querySelector(sel);
  const qsa = (sel: string, root: any = document): any[] => Array.from(root.querySelectorAll(sel));

  // Listeners de nível de documento, rastreados para remoção no teardown (React
  // chama o teardown ao desmontar, evitando acúmulo de handlers).
  const docListeners: Array<[string, any]> = [];
  const on = (type: string, handler: any) => { (document as any).addEventListener(type, handler); docListeners.push([type, handler]); };

  const state: Record<string, any> = {}; // id -> {status, fields:{}}
  let secq: Record<string, any> = {ban:null, 5:null, 6:null};
  const dynRows: Record<string, string[]> = {5:[], 6:[]};
  let bancadas: string[] = [];
  let dynEletros: string[] = [];
  let photosNA = false;

  // ---------- AUTOSAVE (rascunho local) ----------
  let restoring = false;    // true enquanto o rascunho é aplicado ao carregar
  let autosaveReady = false; // só salva depois do build + restauração inicial
  let saveTimer: any = null;
  const SAVE_DELAY = 400;

  function fieldClass(fields){ return fields.length===2?"two":fields.length===1?"one":""; }

  // Escreve valores salvos nos inputs/selects de um item (por data-fid/data-fk).
  function setFieldValues(id, fields){
    if(!fields) return;
    Object.keys(fields).forEach(k=>{
      const el=qs('[data-fid="'+id+'"][data-fk="'+k+'"]');
      if(el && fields[k]!=null) el.value=fields[k];
    });
  }

  // ---------- DEFINIDO/NA ROWS (eletros) ----------
  function renderDefRows(containerId, items, fields, prefix){
    const c = byId(containerId);
    items.forEach((name,i)=>{
      const id = prefix+"_"+i;
      state[id] = {status:null, fields:{}};
      let fh='<div class="fields" id="f_'+id+'">';
      fields.forEach(f=>{ fh += '<div class="f"><label>'+f.l+(f.r?' *':'')+
        '</label><input data-fk="'+f.k+'" data-fid="'+id+'"></div>'; });
      const ex = (prefix==="s2") ? eletroExtras[name] : null;
      if(ex){
        if(ex.alimentacao){
          fh += '<div class="f"><label>Alimentação *</label>'+
            '<select data-fk="alimentacao" data-fid="'+id+'"><option value="">Selecionar</option><option>Elétrico</option><option>Gás</option></select></div>';
        }
        if(ex.respiro){
          fh += '<div class="f"><label>Necessidade de respiro *</label>'+
            '<select data-fk="respiro" data-fid="'+id+'"><option value="">Selecionar</option><option>Sim</option><option>Não</option></select></div>'+
            '<div class="f" id="respesp_'+id+'" style="display:none;"><label>Especificação do respiro *</label>'+
            '<input data-fk="respiro_espec" data-fid="'+id+'" placeholder="Dimensão / tipo do respiro"></div>';
        }
        if(ex.obs){
          fh += '<div class="f"><label>Observação</label>'+
            '<input data-fk="obs_eletro" data-fid="'+id+'" placeholder="Caso haja painel, especificar modelo/localização"></div>';
        }
      }
      fh += '</div>';
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML =
        '<div class="item-top"><span class="item-name">'+name+'</span>'+
        '<span class="state" id="st_'+id+'"></span>'+
        '<div class="seg" data-id="'+id+'">'+
          '<button type="button" data-s="def">Definido</button>'+
          '<button type="button" data-s="na">Não se aplica</button>'+
        '</div></div>'+ fh;
      c.appendChild(row);
    });
  }

  // ---------- DYNAMIC ELETROS ----------
  function addEletro(preset?){
    const id=preset?preset.id:("de_"+Date.now());
    dynEletros.push(id); state[id]={status:"def", fields:preset?Object.assign({},preset.fields):{}, dynEletro:true};
    const c=byId("eletrosExtra");
    const sub=document.createElement("div"); sub.className="subcard"; sub.id="row_"+id;
    sub.innerHTML=
      '<div class="subhead"><span>Eletrodoméstico adicional</span>'+
        '<button type="button" class="rm" data-rm-el="'+id+'">Remover</button></div>'+
      '<div class="fields show">'+
        '<div class="f"><label>Ambiente *</label><input data-fk="ambiente" data-fid="'+id+'" placeholder="Ex.: Cozinha"></div>'+
        '<div class="f"><label>Eletrodoméstico *</label><input data-fk="nome" data-fid="'+id+'" placeholder="Ex.: Cervejeira dupla"></div>'+
        '<div class="f"><label>Marca *</label><input data-fk="marca" data-fid="'+id+'"></div>'+
      '</div>'+
      '<div class="fields show">'+
        '<div class="f"><label>Modelo *</label><input data-fk="modelo" data-fid="'+id+'"></div>'+
        '<div class="f"><label>Referência / Código *</label><input data-fk="ref" data-fid="'+id+'"></div>'+
        '<div class="f"><label>Dimensões (L×A×P) em mm *</label><input data-fk="dim" data-fid="'+id+'"></div>'+
      '</div>';
    c.appendChild(sub);
    if(preset) setFieldValues(id, state[id].fields);
    update();
  }

  // ---------- BANCADAS / CUBAS / METAIS ----------
  function addBancada(preset?){
    const id=preset?preset.id:("ba_"+Date.now());
    bancadas.push(id);
    state[id]={dynBancada:true, fields:preset?Object.assign({},preset.fields):{},
      cuba:preset?(preset.cuba||null):null,
      modeloCuba:preset?(preset.modeloCuba||null):null,
      metalInstal:preset?(preset.metalInstal||null):null};
    renderBancada(id);
    if(preset){
      setFieldValues(id, state[id].fields);
      const cubaSel=qs('[data-cuba][data-fid="'+id+'"]');
      if(cubaSel && state[id].cuba) cubaSel.value=state[id].cuba;
      if(state[id].modeloCuba){ const mb=byId("modblk_"+id); const b=mb&&mb.querySelector('[data-modelo="'+state[id].modeloCuba+'"]'); if(b) b.classList.add("on-y"); }
      if(state[id].metalInstal){ const meb=byId("metblk_"+id); const b=meb&&meb.querySelector('[data-metal="'+state[id].metalInstal+'"]'); if(b) b.classList.add("on-y"); }
      updateBancadaVis(id);
    }
    update();
  }
  function renderBancada(id){
    const c=byId("bancadasRows");
    const sub=document.createElement("div"); sub.className="subcard"; sub.id="row_"+id;
    sub.innerHTML=`
      <div class="subhead"><span class="ba-title">Bancada / Ambiente</span>
        <button type="button" class="rm" data-rm-ban="${id}">Remover</button></div>

      <div class="grp-label first">Bancada</div>
      <div class="fields show">
        <div class="f"><label>Ambiente *</label><input data-fk="ambiente" data-fid="${id}" placeholder="Ex.: Cozinha, Banheiro suíte"></div>
        <div class="f"><label>Material *</label><input data-fk="material" data-fid="${id}" placeholder="Ex.: quartzo, granito, mármore"></div>
        <div class="f"><label>Modelo</label><input data-fk="modelo" data-fid="${id}" placeholder="Cor / linha"></div>
      </div>
      <div class="fields show two">
        <div class="f"><label>Dimensões (L×P) em mm *</label><input data-fk="dim" data-fid="${id}"></div>
        <div class="f"><label>Altura da saia (mm)</label><input data-fk="saia" data-fid="${id}"></div>
      </div>

      <div class="grp-label">Tipo de cuba</div>
      <div class="fields show one">
        <div class="f"><select data-cuba data-fid="${id}">
          <option value="">Selecionar</option>
          <option value="inox">Inox</option>
          <option value="louca">Louça, vidro ou acrílico</option>
          <option value="esculpida">Esculpida</option>
          <option value="na">Não se aplica</option>
        </select></div>
      </div>

      <div id="cubablk_${id}" style="display:none;">
        <div class="grp-label">Cuba — especificação</div>
        <div id="modblk_${id}" style="display:none;">
          <div class="f" style="margin-bottom:8px;"><label>Modelo da cuba</label>
            <div class="seg multi" data-segrole="modelo" data-fid="${id}">
              <button type="button" data-modelo="apoio">Apoio</button>
              <button type="button" data-modelo="sobrepor">Sobrepor</button>
              <button type="button" data-modelo="embutir">Embutir</button>
              <button type="button" data-modelo="semi">Semi-encaixe</button>
            </div>
          </div>
        </div>
        <div id="cubaf_${id}" style="display:none;">
          <div class="fields show">
            <div class="f"><label>Marca</label><input data-fk="cuba_marca" data-fid="${id}"></div>
            <div class="f"><label>Descrição</label><input data-fk="cuba_desc" data-fid="${id}"></div>
            <div class="f"><label>Referência / Código</label><input data-fk="cuba_ref" data-fid="${id}"></div>
          </div>
          <div class="fields show one">
            <div class="f"><label>Largura × Altura × Profundidade da cuba (mm)</label><input data-fk="cuba_dim" data-fid="${id}"></div>
          </div>
        </div>
      </div>

      <div id="metblk_${id}" style="display:none;">
        <div class="grp-label">Metais</div>
        <div class="f" style="margin-bottom:8px;"><label>Instalação do metal</label>
          <div class="seg" data-segrole="metal" data-fid="${id}">
            <button type="button" data-metal="parede">Parede</button>
            <button type="button" data-metal="bancada">Bancada</button>
          </div>
        </div>
        <div id="metf_${id}" style="display:none;">
          <div class="fields show">
            <div class="f"><label>Marca</label><input data-fk="metal_marca" data-fid="${id}"></div>
            <div class="f"><label>Descrição</label><input data-fk="metal_desc" data-fid="${id}"></div>
            <div class="f"><label>Referência / Código</label><input data-fk="metal_ref" data-fid="${id}"></div>
          </div>
          <div class="fields show one">
            <div class="f"><label>Largura × Altura × Profundidade do metal (mm)</label><input data-fk="metal_dim" data-fid="${id}"></div>
          </div>
        </div>
      </div>
    `;
    c.appendChild(sub);
    renumberBancadas();
  }
  function renumberBancadas(){
    [...qsa("#bancadasRows .ba-title")].forEach((el,i)=>{
      el.textContent="Bancada / Ambiente "+(i+1);
    });
  }
  function clearBancadas(){
    byId("bancadasRows").innerHTML="";
    bancadas.forEach(id=>delete state[id]); bancadas=[];
  }
  function updateBancadaVis(id){
    const s=state[id]; if(!s) return;
    const cuba=s.cuba;
    const showCuba = !!cuba && cuba!=="na";
    const isLouca = cuba==="louca";
    const cubaReady = showCuba && (!isLouca || !!s.modeloCuba);
    const set=(elId,on)=>{const el=byId(elId); if(el) el.style.display=on?"":"none";};
    set("cubablk_"+id, showCuba);
    set("modblk_"+id, isLouca);
    set("cubaf_"+id, cubaReady);
    set("metblk_"+id, cubaReady);
    set("metf_"+id, cubaReady && !!s.metalInstal);
  }

  // ---------- SECTION 1 ----------
  function renderSec1(){
    const c = byId("sec1");
    sec1items.forEach((name,i)=>{
      const id="s1_"+i; state[id]={status:null, fields:{}};
      const row=document.createElement("div"); row.className="item";
      row.innerHTML=
        '<div class="item-top"><span class="item-name">'+name+'</span>'+
        '<span class="state" id="st_'+id+'"></span>'+
        '<div class="seg" data-id="'+id+'">'+
          '<button type="button" data-s="ok">Concluído</button>'+
          '<button type="button" data-s="pend">Pendente</button>'+
        '</div></div>'+
        '<div class="fields two" id="f_'+id+'">'+
          '<div class="f"><label>Ambiente pendente *</label><input data-fk="amb_pend" data-fid="'+id+'" placeholder="Onde está pendente"></div>'+
          '<div class="f"><label>Motivo da pendência *</label><input data-fk="obs" data-fid="'+id+'" placeholder="O que falta executar"></div>'+
        '</div>';
      c.appendChild(row);
    });
  }

  // ---------- DYNAMIC ROWS (sec 5, 6) ----------
  function addDyn(sec, preset?){
    const id=preset?preset.id:("d"+sec+"_"+Date.now());
    dynRows[sec].push(id); state[id]={status:"def", fields:preset?Object.assign({},preset.fields):{}, dyn:true};
    const c=byId("rows"+sec);
    const titulo = sec==="5" ? "Móvel" : "Item";
    const phDesc = sec==="5" ? "Ex.: cama queen, criado-mudo" : "Ex.: TV em nicho 65\"";
    const sub=document.createElement("div"); sub.className="subcard"; sub.id="row_"+id;
    sub.innerHTML=
      '<div class="subhead"><span class="dyn-title-'+sec+'">'+titulo+'</span>'+
        '<button type="button" class="rm" data-rm="'+id+'">Remover</button></div>'+
      '<div class="fields show">'+
        '<div class="f"><label>Ambiente *</label><input data-fk="ambiente" data-fid="'+id+'" placeholder="Ex.: Dormitório"></div>'+
        '<div class="f"><label>Descrição *</label><input data-fk="desc" data-fid="'+id+'" placeholder="'+phDesc+'"></div>'+
        '<div class="f"><label>Dimensões / observação *</label><input data-fk="dim" data-fid="'+id+'"></div>'+
      '</div>';
    c.appendChild(sub); renumberDyn(sec);
    if(preset) setFieldValues(id, state[id].fields);
    update();
  }
  function renumberDyn(sec){
    const t = sec==="5" ? "Móvel " : "Item ";
    [...qsa('.dyn-title-'+sec)].forEach((el,i)=>{ el.textContent=t+(i+1); });
  }

  // ---------- VALIDATION ----------
  // Dispatcher fino: as regras puras estão em src/domain.ts.
  function rowResolved(id){
    const s=state[id]; if(!s) return false;
    if(s.dynBancada) return isBancadaResolved(s);
    if(s.dyn) return isDynResolved(s);
    if(s.dynEletro) return isDynEletroResolved(s);
    if(id.startsWith("s1_")) return isSection1Resolved(s);
    if(id.startsWith("s2_")) return isEletroResolved(s, sec2items[parseInt(id.split("_")[1],10)]);
    if(s.status==="na") return true;
    return false;
  }
  function idComplete(){
    const values: Record<string,string> = {};
    qsa('#idgrid [data-id]').forEach(el=>{ values[el.dataset.id]=el.value; });
    return isIdentificationComplete(values, photosNA);
  }
  function fixedIds(){ return Object.keys(state).filter(id=>!state[id].dyn && !state[id].dynBancada); }

  function update(){
    const ids = fixedIds();
    let resolved = ids.filter(rowResolved).length;
    let total = ids.length;
    let gTotal=0, gOk=0;
    // bancadas (section 3)
    gTotal++;
    if(secq.ban==="nao") gOk++;
    else if(secq.ban==="sim"){
      const bs=bancadas.filter(id=>byId("row_"+id));
      if(bs.length>0 && bs.every(rowResolved)) gOk++;
    }
    // dyn-row gates: 5, 6
    [5,6].forEach(s=>{ gTotal++; if(secq[s]==="nao") gOk++; else if(secq[s]==="sim"){
      const rows=dynRows[s].filter(id=>byId("row_"+id));
      if(rows.length>0 && rows.every(rowResolved)) gOk++; }});
    total+=gTotal; resolved+=gOk;
    if(idComplete()){ resolved++; } total++;

    const pct = total? Math.round(resolved/total*100):0;
    byId("fill").style.width=pct+"%";
    byId("count").textContent = resolved+" de "+total+" itens resolvidos";
    const ok = resolved===total;
    const btn=byId("finish"); btn.disabled=!ok;
    const hint=byId("hint");
    if(ok){ hint.textContent="Tudo resolvido — gere a solicitação."; hint.classList.add("ok"); }
    else { hint.textContent="Resolva todos os itens para liberar o resumo."; hint.classList.remove("ok"); }
    scheduleSave();
  }

  // ---------- STATE BADGES ----------
  function paintState(id){
    const st=byId("st_"+id); if(!st) return;
    const s=state[id];
    if(id.startsWith("s1_")){
      st.className="state "+(s.status==="ok"?"ok":s.status==="pend"?"pend":"");
      st.textContent = s.status==="ok"?"CONCLUÍDO":s.status==="pend"?"PENDENTE":"";
    } else {
      st.className="state "+(s.status==="def"?"ok":s.status==="na"?"":"");
      st.textContent = s.status==="def"?"DEFINIDO":s.status==="na"?"N/A":"";
    }
  }

  // ---------- EVENTS ----------
  on("click",function(e: any){
    if(e.target.id==="fotosNA"){
      photosNA=!photosNA;
      const inp=byId("link_fotos");
      e.target.classList.toggle("on-n",photosNA);
      inp.disabled=photosNA; if(photosNA) inp.value="";
      byId("fotosHint").textContent=photosNA?"Sem fotos — marcado como não se aplica.":"Se ainda não houver fotos, marque “não se aplica”.";
      update(); return;
    }
    // segmented bancada (modelo da cuba / instalação do metal)
    const segR=e.target.closest('.seg[data-segrole]');
    if(segR && (e.target.dataset.modelo || e.target.dataset.metal)){
      const id=segR.dataset.fid, role=segR.dataset.segrole;
      [...segR.querySelectorAll('button')].forEach(b=>b.classList.remove('on-y'));
      e.target.classList.add('on-y');
      if(role==="modelo") state[id].modeloCuba=e.target.dataset.modelo;
      else state[id].metalInstal=e.target.dataset.metal;
      updateBancadaVis(id); update(); return;
    }
    // item state (def/na/ok/pend)
    const seg=e.target.closest(".seg[data-id]");
    if(seg && e.target.dataset.s){
      const id=seg.dataset.id, v=e.target.dataset.s;
      state[id].status=v;
      [...seg.querySelectorAll("button")].forEach(b=>{b.classList.remove("on-y","on-n");});
      if(v==="def"||v==="ok"){ e.target.classList.add("on-y"); }
      else { e.target.classList.add("on-n"); }
      const f=byId("f_"+id);
      if(f){ const show = (v==="def"||v==="pend"); f.classList.toggle("show",show); }
      paintState(id); update(); return;
    }
    // section yes/no gates
    const sq=e.target.closest(".seg[data-secq]");
    if(sq && e.target.dataset.v){
      const sec=sq.dataset.secq, v=e.target.dataset.v; secq[sec]=v;
      [...sq.querySelectorAll("button")].forEach(b=>b.classList.remove("on-y","on-n"));
      e.target.classList.add(v==="sim"?"on-y":"on-n");
      byId("wrap"+sec).classList.toggle("show",v==="sim");
      if(sec==="ban"){ if(v==="sim"){ if(bancadas.length===0) addBancada(); } else clearBancadas(); }
      else { if(v==="sim" && dynRows[sec].length===0) addDyn(sec); }
      update(); return;
    }
    if(e.target.id==="addBancada"){ addBancada(); return; }
    if(e.target.id==="addEletro"){ addEletro(); return; }
    if(e.target.dataset.add){ addDyn(e.target.dataset.add); return; }
    if(e.target.dataset.rmBan){
      const id=e.target.dataset.rmBan; const r=byId("row_"+id);
      if(r) r.remove(); delete state[id]; bancadas=bancadas.filter(x=>x!==id);
      renumberBancadas(); update(); return;
    }
    if(e.target.dataset.rmEl){
      const id=e.target.dataset.rmEl; const r=byId("row_"+id);
      if(r) r.remove(); delete state[id]; dynEletros=dynEletros.filter(x=>x!==id); update(); return;
    }
    if(e.target.dataset.rm){
      const id=e.target.dataset.rm; const r=byId("row_"+id);
      if(r) r.remove(); delete state[id];
      [5,6].forEach(s=>dynRows[s]=dynRows[s].filter(x=>x!==id));
      renumberDyn("5"); renumberDyn("6"); update(); return;
    }
  });

  on("input",function(e: any){
    if(e.target.dataset.id==="telefone_responsavel"){ e.target.value=maskPhone(e.target.value); }
    const fid=e.target.dataset.fid, fk=e.target.dataset.fk;
    if(fid && fk){ state[fid].fields[fk]=e.target.value; if(state[fid].status) paintState(fid); update(); }
    if(e.target.dataset.id!==undefined && e.target.closest("#idgrid")) update();
  });
  on("change",function(e: any){
    // selects de campo (alimentação / respiro dos eletros)
    if(e.target.dataset.fid && e.target.dataset.fk && e.target.dataset.cuba===undefined){
      const id=e.target.dataset.fid, fk=e.target.dataset.fk;
      state[id].fields[fk]=e.target.value;
      if(fk==="respiro"){
        const esp=byId("respesp_"+id);
        if(esp) esp.style.display = e.target.value==="Sim" ? "" : "none";
        if(e.target.value!=="Sim") state[id].fields.respiro_espec="";
      }
      update();
    }
    // tipo de cuba
    if(e.target.dataset.cuba!==undefined && e.target.dataset.fid){
      const id=e.target.dataset.fid, s=state[id]; s.cuba=e.target.value||null;
      if(s.cuba!=="louca"){ s.modeloCuba=null; const mb=byId("modblk_"+id); if(mb) [...mb.querySelectorAll('button')].forEach(b=>b.classList.remove('on-y')); }
      if(!s.cuba || s.cuba==="na"){ s.metalInstal=null; const meb=byId("metblk_"+id); if(meb) [...meb.querySelectorAll('button')].forEach(b=>b.classList.remove('on-y')); }
      updateBancadaVis(id); update(); return;
    }
    if(e.target.id==="tipo"){
      byId("heritage").classList.toggle("show", e.target.value==="Herança / acervo");
    }
    if(e.target.closest("#idgrid")) update();
  });

  // ---------- AUTOSAVE: coleta / restauração / persistência ----------
  function collectDraft(){
    const idVals={};
    qsa('#idgrid [data-id]').forEach(el=>{ idVals[el.dataset.id]=el.value; });
    const obsEl=byId("observacoes_gerais");
    const fixed={};
    Object.keys(state).forEach(k=>{
      if(k.startsWith("s1_")||k.startsWith("s2_")){
        fixed[k]={status:state[k].status, fields:Object.assign({},state[k].fields)};
      }
    });
    const mapRows=(list)=>list.filter(id=>state[id]).map(id=>({id:id, fields:Object.assign({},state[id].fields)}));
    const bancadasArr=bancadas.filter(id=>state[id]).map(id=>({
      id:id, fields:Object.assign({},state[id].fields),
      cuba:state[id].cuba, modeloCuba:state[id].modeloCuba, metalInstal:state[id].metalInstal
    }));
    return {
      id:idVals,
      observacoes: obsEl?obsEl.value:"",
      photosNA: photosNA,
      secq: {ban:secq.ban, 5:secq[5], 6:secq[6]},
      fixed: fixed,
      bancadas: bancadasArr,
      dynEletros: mapRows(dynEletros),
      dyn5: mapRows(dynRows[5]),
      dyn6: mapRows(dynRows[6])
    };
  }

  function applyDraft(d){
    if(!d || typeof d!=="object") return;
    // Identificação
    if(d.id){
      qsa('#idgrid [data-id]').forEach(el=>{
        if(d.id[el.dataset.id]!=null) el.value=d.id[el.dataset.id];
      });
    }
    const tipoEl=qs('#idgrid [data-id="tipo"]');
    if(tipoEl){ byId("heritage").classList.toggle("show", tipoEl.value==="Herança / acervo"); }
    const obsEl=byId("observacoes_gerais");
    if(obsEl && d.observacoes!=null) obsEl.value=d.observacoes;
    // Fotos "não se aplica"
    if(d.photosNA){
      photosNA=true;
      const inp=byId("link_fotos"); const btn=byId("fotosNA");
      if(btn) btn.classList.add("on-n");
      if(inp){ inp.disabled=true; inp.value=""; }
      const fh=byId("fotosHint"); if(fh) fh.textContent="Sem fotos — marcado como não se aplica.";
    }
    // Itens fixos (seções 1 e 2)
    if(d.fixed){
      Object.keys(d.fixed).forEach(id=>{
        if(!state[id]) return;
        const fs=d.fixed[id];
        state[id].status=fs.status;
        state[id].fields=Object.assign({}, fs.fields);
        const seg=qs('.seg[data-id="'+id+'"]');
        if(seg && fs.status){
          seg.querySelectorAll("button").forEach(b=>b.classList.remove("on-y","on-n"));
          const b=seg.querySelector('[data-s="'+fs.status+'"]');
          if(b) b.classList.add((fs.status==="def"||fs.status==="ok")?"on-y":"on-n");
        }
        const f=byId("f_"+id);
        if(f) f.classList.toggle("show", fs.status==="def"||fs.status==="pend");
        setFieldValues(id, fs.fields);
        if(fs.fields && fs.fields.respiro==="Sim"){ const esp=byId("respesp_"+id); if(esp) esp.style.display=""; }
        paintState(id);
      });
    }
    // Gates de seção (reflete botão + visibilidade; linhas recriadas abaixo)
    ["ban",5,6].forEach(sec=>{
      const v=d.secq?d.secq[sec]:undefined;
      if(!v) return;
      secq[sec]=v;
      const sq=qs('.seg[data-secq="'+sec+'"]');
      if(sq){
        sq.querySelectorAll("button").forEach(b=>b.classList.remove("on-y","on-n"));
        const b=sq.querySelector('[data-v="'+(v==="sim"?"sim":"nao")+'"]');
        if(b) b.classList.add(v==="sim"?"on-y":"on-n");
      }
      const wrap=byId("wrap"+sec);
      if(wrap) wrap.classList.toggle("show", v==="sim");
    });
    // Linhas dinâmicas
    if(Array.isArray(d.bancadas)) d.bancadas.forEach(b=>addBancada(b));
    if(Array.isArray(d.dynEletros)) d.dynEletros.forEach(e=>addEletro(e));
    if(Array.isArray(d.dyn5)) d.dyn5.forEach(r=>addDyn("5", r));
    if(Array.isArray(d.dyn6)) d.dyn6.forEach(r=>addDyn("6", r));
    update();
  }

  function hasDraftApi(){ return true; }
  function setAutosaveMsg(txt){ const m=byId("autosaveMsg"); if(m) m.textContent=txt; }
  function persist(){
    if(!hasDraftApi()) return;
    try{ if(Draft.saveDraft(collectDraft())) setAutosaveMsg("Rascunho salvo ✓ neste navegador."); }catch(e){}
  }
  function scheduleSave(){
    if(!autosaveReady || restoring) return;
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer=setTimeout(persist, SAVE_DELAY);
  }
  function autosaveFieldListener(e: any){
    if(e.target && e.target.closest && e.target.closest("#form")) scheduleSave();
  }

  // ---------- BUILD ----------
  renderSec1();
  renderDefRows("sec2", sec2items, F2, "s2");
  update();

  // Restaura rascunho salvo neste navegador, se houver e for válido.
  try{
    const draft = hasDraftApi() ? Draft.loadDraft() : null;
    if(draft){
      restoring=true;
      applyDraft(draft);
      restoring=false;
      setAutosaveMsg("Rascunho restaurado deste navegador.");
    }
  }catch(e){ restoring=false; }
  autosaveReady=true;

  // Autosave para digitação em campos de texto (inclui observações gerais).
  on("input", autosaveFieldListener);
  on("change", autosaveFieldListener);

  // Limpar rascunho.
  const clearBtn=byId("clearDraft");
  if(clearBtn){
    clearBtn.addEventListener("click", function(){
      const ok = (typeof window!=="undefined" && typeof window.confirm==="function")
        ? window.confirm("Limpar o rascunho salvo neste navegador? O formulário será reiniciado.")
        : true;
      if(!ok) return;
      try{ if(hasDraftApi()) Draft.clearDraft(); }catch(e){}
      if(typeof window!=="undefined" && window.location && typeof window.location.reload==="function") window.location.reload();
    });
  }

  // ---------- SUMMARY ----------
  byId("finish").addEventListener("click",function(){
    const g=id=>{const el=qs('#idgrid [data-id="'+id+'"]');return el?el.value:"";};
    let h='<h1 style="font-size:22px;margin:0;">Solicitação de Medição</h1>';
    h+='<div class="rule"></div>';
    let endr=esc(g("endereco"));
    if(g("numero")) endr+=', nº '+esc(g("numero"));
    if(g("complemento")) endr+=' — '+esc(g("complemento"));
    if(g("referencia")) endr+=' (ref.: '+esc(g("referencia"))+')';
    h+='<div class="sum-sec"><h4>Identificação</h4>'+
       '<div class="sum-line"><b>Cliente:</b> '+esc(g("cliente"))+' &nbsp;·&nbsp; <b>Projeto:</b> '+esc(g("projeto"))+'</div>'+
       '<div class="sum-line"><b>Consultor(a):</b> '+esc(g("consultor"))+' &nbsp;·&nbsp; <b>Arquiteto(a):</b> '+(g("arquiteto")?esc(g("arquiteto")):'<span class="sum-na">não informado</span>')+'</div>'+
       '<div class="sum-line"><b>Loja:</b> '+esc(g("loja"))+'</div>'+
       '<div class="sum-line"><b>Endereço da obra:</b> '+endr+'</div>'+
       '<div class="sum-line"><b>Responsável pela obra:</b> '+esc(g("responsavel_obra"))+' &nbsp;·&nbsp; <b>Telefone:</b> '+esc(g("telefone_responsavel"))+'</div>'+
       '<div class="sum-line"><b>Tipo de medição:</b> '+esc(g("tipo_medicao"))+' &nbsp;·&nbsp; <b>Tipo de obra:</b> '+esc(g("tipo"))+'</div>'+
       '<div class="sum-line"><b>Quantidade de ambientes:</b> '+esc(g("qtd_ambientes"))+'</div>'+
       '<div class="sum-line"><b>Fotos (SharePoint):</b> '+(photosNA?'<span class="sum-na">Não se aplica</span>':esc(g("link_fotos")||'—'))+'</div>'+
       '<div class="sum-line"><b>Data do preenchimento:</b> '+brDate(g("data_checklist"))+' &nbsp;·&nbsp; <b>Data da solicitação da medição:</b> '+brDate(g("data_solicitacao_medicao"))+'</div></div>';

    h+='<div class="sum-sec"><h4>1 · Obra Civil Finalizada</h4>';
    sec1items.forEach((n,i)=>{const s=state["s1_"+i];
      if(s.status==="ok") h+='<div class="sum-line">✔ '+n+'</div>';
      else h+='<div class="sum-line sum-pend">✖ '+n+' — pendente'+(s.fields.amb_pend?' ('+esc(s.fields.amb_pend)+')':'')+': '+esc(s.fields.obs||'')+'</div>';});
    h+='</div>';

    h+=sumEletros();
    h+=sumBancadas();
    h+=sumDyn("4 · Mobiliário de Terceiros",5);
    h+=sumDyn("5 · Demais Itens que Interferem",6);

    const obsGerais=(byId("observacoes_gerais").value||"").trim();
    h+='<div class="sum-sec"><h4>6 · Observações Gerais</h4>'+
       (obsGerais?'<div class="sum-line">'+esc(obsGerais).replace(/\n/g,'<br>')+'</div>':'<div class="sum-line sum-na">Nenhuma observação registrada.</div>')+'</div>';

    h+='<div class="sum-sec"><h4>Termo de Responsabilidade</h4><div class="sum-line">Itens definidos e não executados exigem o Termo de Responsabilidade pelas Medidas Informadas, assinado pelo cliente e anexado à pasta (SharePoint &gt; Público &gt; 01 - DOCUMENTOS COMERCIAIS).</div></div>';
    h+='<div class="sign"><div>Consultor(a) responsável</div><div>Gerente</div></div>';

    const sum=byId("summary"); sum.innerHTML=h; sum.classList.add("show");
    const bar=document.createElement("div"); bar.className="actions no-print";
    bar.innerHTML='<button type="button" class="btn primary" id="prt">Imprimir / Salvar PDF</button>'+
                  '<button type="button" class="btn ghost" id="edit">Voltar e editar</button>';
    sum.appendChild(bar);
    byId("form").style.display="none";
    sum.scrollIntoView({behavior:"smooth"});
    byId("prt").onclick=()=>window.print();
    byId("edit").onclick=()=>{
      sum.classList.remove("show"); sum.innerHTML="";
      byId("form").style.display="";
      window.scrollTo({top:0,behavior:"smooth"});
    };
  });

  function sumEletros(){
    let def="", na="";
    sec2items.forEach((n,i)=>{const s=state["s2_"+i];
      if(s.status==="def"){
        let arr=F2.map(f=>s.fields[f.k]?'<b>'+f.l.replace(' *','')+':</b> '+esc(s.fields[f.k]):null);
        if(s.fields.alimentacao) arr.push('<b>Alimentação:</b> '+esc(s.fields.alimentacao));
        if(s.fields.respiro) arr.push('<b>Respiro:</b> '+esc(s.fields.respiro)+(s.fields.respiro==="Sim"&&s.fields.respiro_espec?' ('+esc(s.fields.respiro_espec)+')':''));
        if(s.fields.obs_eletro) arr.push('<b>Observação:</b> '+esc(s.fields.obs_eletro));
        let parts=arr.filter(Boolean).join(' · ');
        def+='<div class="sum-line">'+n+(parts?' — '+parts:'')+'</div>';
      } else if(s.status==="na") na+=n+", ";
    });
    dynEletros.forEach(id=>{const s=state[id]; if(!s)return; const f=s.fields;
      const parts=[f.marca?'<b>Marca:</b> '+esc(f.marca):null,
        f.modelo?'<b>Modelo:</b> '+esc(f.modelo):null,
        f.ref?'<b>Referência / Código:</b> '+esc(f.ref):null,
        f.dim?'<b>Dimensões:</b> '+esc(f.dim)+' mm':null].filter(Boolean).join(' · ');
      const nome=(f.ambiente?esc(f.ambiente)+' — ':'')+esc(f.nome||'Eletro adicional');
      def+='<div class="sum-line"><b>'+nome+'</b>'+(parts?' — '+parts:'')+'</div>';});
    let h='<div class="sum-sec"><h4>2 · Eletrodomésticos</h4>'+(def||'<div class="sum-line sum-na">Nenhum item definido.</div>');
    if(na) h+='<div class="sum-line sum-na"><b>Não se aplica:</b> '+esc(na.replace(/, $/,''))+'</div>';
    return h+'</div>';
  }
  function sumBancadas(){
    let h='<div class="sum-sec"><h4>3 · Bancadas, Cubas e Metais</h4>';
    if(secq.ban!=="sim"){ return h+'<div class="sum-line sum-na">Sem bancadas / cubas — não se aplica.</div></div>'; }
    let any=false;
    bancadas.forEach(id=>{const s=state[id]; if(!s)return; any=true; const f=s.fields;
      h+='<div class="sum-line" style="border-bottom:none;padding-bottom:1px;margin-top:4px;"><b>'+esc(f.ambiente||'Ambiente')+'</b></div>';
      const banParts=[f.material,f.modelo].filter(Boolean).join(' ');
      h+='<div class="sum-line" style="padding-left:14px;"><b>Bancada:</b> '+(banParts?esc(banParts):'—')+(f.dim?' ('+esc(f.dim)+' mm)':'')+(f.saia?', saia '+esc(f.saia)+' mm':'')+'</div>';
      if(s.cuba==="na"){
        h+='<div class="sum-line" style="padding-left:14px;"><b>Cuba:</b> <span class="sum-na">não se aplica</span></div>';
      } else if(s.cuba){
        let ct=CUBA_LABEL[s.cuba]||s.cuba;
        if(s.cuba==="louca" && s.modeloCuba) ct+=' · '+MOD_LABEL[s.modeloCuba];
        const cParts=[f.cuba_marca,f.cuba_desc,f.cuba_ref].filter(Boolean).join(' · ');
        h+='<div class="sum-line" style="padding-left:14px;"><b>Cuba:</b> '+esc(ct)+(cParts?' — '+esc(cParts):'')+(f.cuba_dim?' ('+esc(f.cuba_dim)+' mm)':'')+'</div>';
        if(s.metalInstal){
          const mParts=[f.metal_marca,f.metal_desc,f.metal_ref].filter(Boolean).join(' · ');
          h+='<div class="sum-line" style="padding-left:14px;"><b>Metal ('+esc(MET_LABEL[s.metalInstal])+'):</b> '+(mParts?esc(mParts):'—')+(f.metal_dim?' ('+esc(f.metal_dim)+' mm)':'')+'</div>';
        }
      }
    });
    if(!any) h+='<div class="sum-line sum-na">Nenhum ambiente informado.</div>';
    return h+'</div>';
  }
  function sumDyn(title, sec){
    let h='<div class="sum-sec"><h4>'+title+'</h4>';
    if(secq[sec]==="nao"){ h+='<div class="sum-line sum-na">Não há itens que impactam o projeto.</div>'; }
    else{ dynRows[sec].forEach(id=>{const s=state[id]; if(s){ const f=s.fields; h+='<div class="sum-line"><b>'+esc(f.ambiente||'')+'</b> — '+esc(f.desc||'')+(f.dim?' ('+esc(f.dim)+')':'')+'</div>';}});}
    return h+'</div>';
  }

  // Teardown: remove os listeners de documento e cancela o autosave pendente.
  return function teardown(){
    docListeners.forEach(([type, handler]) => (document as any).removeEventListener(type, handler));
    if(saveTimer) clearTimeout(saveTimer);
  };
}
