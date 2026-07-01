(function(){
  // ---------- DATA ----------
  const sec1items = [
    "Revestimentos instalados em todos os ambientes (pisos, paredes, azulejos)",
    "Forro / gesso concluído, com altura final definida",
    "Cortineiro executado, com medidas confirmadas",
    "Aberturas de portas finalizadas (vãos, batentes e vistas)",
    "Rodapés definidos",
    "Pontos hidráulicos posicionados (água quente e fria, esgoto)",
    "Pontos elétricos posicionados (tomadas, interruptores, saídas para eletros)",
    "Ambiente livre de entulho e estrutura antiga",
    "Base de alvenaria (cozinha)",
    "Base de alvenaria (lavanderia)",
    "Ponto de aspiração central",
    "Ponto de ar condicionado"
  ];
  const sec2items = ["Refrigerador","Freezer","Cooktop / Fogão","Forno","Micro-ondas",
    "Coifa / Depurador","Ar condicionado","Lava-louças","Máquina de lavar","Secadora","Adega","Cervejeira",
    "Icemaker","Purificador de água","Triturador de resíduos","Gaveta aquecida","Gaveta refrigerada",
    "Cafeteira embutida","Frigobar"];

  const F2 = [{l:"Ambiente",k:"ambiente",r:true},{l:"Marca",k:"marca",r:true},{l:"Modelo",k:"modelo",r:true},{l:"Referência / Código",k:"ref",r:true},{l:"Dimensões (L×A×P) em mm",k:"dim",r:true}];
  // campos extras por eletrodoméstico
  const eletroExtras = {
    "Cooktop / Fogão":{alimentacao:true, respiro:false},
    "Forno":{alimentacao:true, respiro:true},
    "Micro-ondas":{alimentacao:true, respiro:true},
    "Refrigerador":{alimentacao:true, respiro:true},
    "Freezer":{alimentacao:true, respiro:true},
    "Ar condicionado":{obs:true}
  };

  const CUBA_LABEL = {inox:"Inox", louca:"Louça, vidro ou acrílico", esculpida:"Esculpida", na:"Não se aplica"};
  const MOD_LABEL  = {apoio:"Apoio", sobrepor:"Sobrepor", embutir:"Embutir", semi:"Semi-encaixe"};
  const MET_LABEL  = {parede:"Parede", bancada:"Bancada"};

  const state = {}; // id -> {status, fields:{}}
  let secq = {ban:null, 5:null, 6:null};
  const dynRows = {5:[], 6:[]};
  let bancadas = [];
  let dynEletros = [];
  let photosNA = false;

  function fieldClass(fields){ return fields.length===2?"two":fields.length===1?"one":""; }

  // ---------- DEFINIDO/NA ROWS (eletros) ----------
  function renderDefRows(containerId, items, fields, prefix){
    const c = document.getElementById(containerId);
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
  function addEletro(){
    const id="de_"+Date.now();
    dynEletros.push(id); state[id]={status:"def", fields:{}, dynEletro:true};
    const c=document.getElementById("eletrosExtra");
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
    c.appendChild(sub); update();
  }

  // ---------- BANCADAS / CUBAS / METAIS ----------
  function addBancada(){
    const id="ba_"+Date.now();
    bancadas.push(id);
    state[id]={dynBancada:true, fields:{}, cuba:null, modeloCuba:null, metalInstal:null};
    renderBancada(id); update();
  }
  function renderBancada(id){
    const c=document.getElementById("bancadasRows");
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
    [...document.querySelectorAll("#bancadasRows .ba-title")].forEach((el,i)=>{
      el.textContent="Bancada / Ambiente "+(i+1);
    });
  }
  function clearBancadas(){
    document.getElementById("bancadasRows").innerHTML="";
    bancadas.forEach(id=>delete state[id]); bancadas=[];
  }
  function updateBancadaVis(id){
    const s=state[id]; if(!s) return;
    const cuba=s.cuba;
    const showCuba = !!cuba && cuba!=="na";
    const isLouca = cuba==="louca";
    const cubaReady = showCuba && (!isLouca || !!s.modeloCuba);
    const set=(elId,on)=>{const el=document.getElementById(elId); if(el) el.style.display=on?"":"none";};
    set("cubablk_"+id, showCuba);
    set("modblk_"+id, isLouca);
    set("cubaf_"+id, cubaReady);
    set("metblk_"+id, cubaReady);
    set("metf_"+id, cubaReady && !!s.metalInstal);
  }

  // ---------- SECTION 1 ----------
  function renderSec1(){
    const c = document.getElementById("sec1");
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
  function addDyn(sec){
    const id="d"+sec+"_"+Date.now();
    dynRows[sec].push(id); state[id]={status:"def", fields:{}, dyn:true};
    const c=document.getElementById("rows"+sec);
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
    c.appendChild(sub); renumberDyn(sec); update();
  }
  function renumberDyn(sec){
    const t = sec==="5" ? "Móvel " : "Item ";
    [...document.querySelectorAll('.dyn-title-'+sec)].forEach((el,i)=>{ el.textContent=t+(i+1); });
  }

  // ---------- VALIDATION ----------
  function rowResolved(id){
    const s=state[id]; if(!s) return false;
    if(s.dynBancada){
      if(!(s.fields.ambiente && s.fields.material && s.fields.dim)) return false;
      if(!s.cuba) return false;
      if(s.cuba==="na") return true;
      if(s.cuba==="louca" && !s.modeloCuba) return false;
      if(!s.metalInstal) return false;
      return true;
    }
    if(s.dyn){ return !!(s.fields.ambiente && s.fields.desc && s.fields.dim); }
    if(s.dynEletro){ return !!(s.fields.ambiente && s.fields.nome && s.fields.marca && s.fields.modelo && s.fields.ref && s.fields.dim); }
    if(id.startsWith("s1_")){
      if(s.status==="ok") return true;
      if(s.status==="pend") return !!(s.fields.amb_pend && s.fields.obs); return false;
    }
    if(s.status==="na") return true;
    if(id.startsWith("s2_")){
      if(s.status!=="def") return false;
      if(!F2.every(f=>!f.r||(s.fields[f.k]&&s.fields[f.k].trim()))) return false;
      const ex = eletroExtras[sec2items[parseInt(id.split("_")[1],10)]];
      if(ex){
        if(ex.alimentacao && !s.fields.alimentacao) return false;
        if(ex.respiro){
          if(!s.fields.respiro) return false;
          if(s.fields.respiro==="Sim" && !(s.fields.respiro_espec && s.fields.respiro_espec.trim())) return false;
        }
      }
      return true;
    }
    return false;
  }
  function idComplete(){
    const optional={link_fotos:1, arquiteto:1, complemento:1, referencia:1};
    const els=[...document.querySelectorAll('#idgrid [data-id]')];
    for(const el of els){
      if(optional[el.dataset.id]) continue;
      if(!el.value.trim()) return false;
    }
    const lf=document.querySelector('#idgrid [data-id="link_fotos"]');
    if(!photosNA && !(lf && lf.value.trim())) return false;
    return true;
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
      const bs=bancadas.filter(id=>document.getElementById("row_"+id));
      if(bs.length>0 && bs.every(rowResolved)) gOk++;
    }
    // dyn-row gates: 5, 6
    [5,6].forEach(s=>{ gTotal++; if(secq[s]==="nao") gOk++; else if(secq[s]==="sim"){
      const rows=dynRows[s].filter(id=>document.getElementById("row_"+id));
      if(rows.length>0 && rows.every(rowResolved)) gOk++; }});
    total+=gTotal; resolved+=gOk;
    if(idComplete()){ resolved++; } total++;

    const pct = total? Math.round(resolved/total*100):0;
    document.getElementById("fill").style.width=pct+"%";
    document.getElementById("count").textContent = resolved+" de "+total+" itens resolvidos";
    const ok = resolved===total;
    const btn=document.getElementById("finish"); btn.disabled=!ok;
    const hint=document.getElementById("hint");
    if(ok){ hint.textContent="Tudo resolvido — gere a solicitação."; hint.classList.add("ok"); }
    else { hint.textContent="Resolva todos os itens para liberar o resumo."; hint.classList.remove("ok"); }
  }

  // ---------- STATE BADGES ----------
  function paintState(id){
    const st=document.getElementById("st_"+id); if(!st) return;
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
  document.addEventListener("click",function(e){
    if(e.target.id==="fotosNA"){
      photosNA=!photosNA;
      const inp=document.getElementById("link_fotos");
      e.target.classList.toggle("on-n",photosNA);
      inp.disabled=photosNA; if(photosNA) inp.value="";
      document.getElementById("fotosHint").textContent=photosNA?"Sem fotos — marcado como não se aplica.":"Se ainda não houver fotos, marque “não se aplica”.";
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
      const f=document.getElementById("f_"+id);
      if(f){ const show = (v==="def"||v==="pend"); f.classList.toggle("show",show); }
      paintState(id); update(); return;
    }
    // section yes/no gates
    const sq=e.target.closest(".seg[data-secq]");
    if(sq && e.target.dataset.v){
      const sec=sq.dataset.secq, v=e.target.dataset.v; secq[sec]=v;
      [...sq.querySelectorAll("button")].forEach(b=>b.classList.remove("on-y","on-n"));
      e.target.classList.add(v==="sim"?"on-y":"on-n");
      document.getElementById("wrap"+sec).classList.toggle("show",v==="sim");
      if(sec==="ban"){ if(v==="sim"){ if(bancadas.length===0) addBancada(); } else clearBancadas(); }
      else { if(v==="sim" && dynRows[sec].length===0) addDyn(sec); }
      update(); return;
    }
    if(e.target.id==="addBancada"){ addBancada(); return; }
    if(e.target.id==="addEletro"){ addEletro(); return; }
    if(e.target.dataset.add){ addDyn(e.target.dataset.add); return; }
    if(e.target.dataset.rmBan){
      const id=e.target.dataset.rmBan; const r=document.getElementById("row_"+id);
      if(r) r.remove(); delete state[id]; bancadas=bancadas.filter(x=>x!==id);
      renumberBancadas(); update(); return;
    }
    if(e.target.dataset.rmEl){
      const id=e.target.dataset.rmEl; const r=document.getElementById("row_"+id);
      if(r) r.remove(); delete state[id]; dynEletros=dynEletros.filter(x=>x!==id); update(); return;
    }
    if(e.target.dataset.rm){
      const id=e.target.dataset.rm; const r=document.getElementById("row_"+id);
      if(r) r.remove(); delete state[id];
      [5,6].forEach(s=>dynRows[s]=dynRows[s].filter(x=>x!==id));
      renumberDyn("5"); renumberDyn("6"); update(); return;
    }
  });

  document.addEventListener("input",function(e){
    if(e.target.dataset.id==="telefone_responsavel"){ e.target.value=maskPhone(e.target.value); }
    const fid=e.target.dataset.fid, fk=e.target.dataset.fk;
    if(fid && fk){ state[fid].fields[fk]=e.target.value; if(state[fid].status) paintState(fid); update(); }
    if(e.target.dataset.id!==undefined && e.target.closest("#idgrid")) update();
  });
  document.addEventListener("change",function(e){
    // selects de campo (alimentação / respiro dos eletros)
    if(e.target.dataset.fid && e.target.dataset.fk && e.target.dataset.cuba===undefined){
      const id=e.target.dataset.fid, fk=e.target.dataset.fk;
      state[id].fields[fk]=e.target.value;
      if(fk==="respiro"){
        const esp=document.getElementById("respesp_"+id);
        if(esp) esp.style.display = e.target.value==="Sim" ? "" : "none";
        if(e.target.value!=="Sim") state[id].fields.respiro_espec="";
      }
      update();
    }
    // tipo de cuba
    if(e.target.dataset.cuba!==undefined && e.target.dataset.fid){
      const id=e.target.dataset.fid, s=state[id]; s.cuba=e.target.value||null;
      if(s.cuba!=="louca"){ s.modeloCuba=null; const mb=document.getElementById("modblk_"+id); if(mb) [...mb.querySelectorAll('button')].forEach(b=>b.classList.remove('on-y')); }
      if(!s.cuba || s.cuba==="na"){ s.metalInstal=null; const meb=document.getElementById("metblk_"+id); if(meb) [...meb.querySelectorAll('button')].forEach(b=>b.classList.remove('on-y')); }
      updateBancadaVis(id); update(); return;
    }
    if(e.target.id==="tipo"){
      document.getElementById("heritage").classList.toggle("show", e.target.value==="Herança / acervo");
    }
    if(e.target.closest("#idgrid")) update();
  });

  // ---------- BUILD ----------
  renderSec1();
  renderDefRows("sec2", sec2items, F2, "s2");
  update();

  // ---------- SUMMARY ----------
  document.getElementById("finish").addEventListener("click",function(){
    const g=id=>{const el=document.querySelector('#idgrid [data-id="'+id+'"]');return el?el.value:"";};
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

    const obsGerais=(document.getElementById("observacoes_gerais").value||"").trim();
    h+='<div class="sum-sec"><h4>6 · Observações Gerais</h4>'+
       (obsGerais?'<div class="sum-line">'+esc(obsGerais).replace(/\n/g,'<br>')+'</div>':'<div class="sum-line sum-na">Nenhuma observação registrada.</div>')+'</div>';

    h+='<div class="sum-sec"><h4>Termo de Responsabilidade</h4><div class="sum-line">Itens definidos e não executados exigem o Termo de Responsabilidade pelas Medidas Informadas, assinado pelo cliente e anexado à pasta (SharePoint &gt; Público &gt; 01 - DOCUMENTOS COMERCIAIS).</div></div>';
    h+='<div class="sign"><div>Consultor(a) responsável</div><div>Gerente</div></div>';

    const sum=document.getElementById("summary"); sum.innerHTML=h; sum.classList.add("show");
    const bar=document.createElement("div"); bar.className="actions no-print";
    bar.innerHTML='<button type="button" class="btn primary" id="prt">Imprimir / Salvar PDF</button>'+
                  '<button type="button" class="btn ghost" id="edit">Voltar e editar</button>';
    sum.appendChild(bar);
    document.getElementById("form").style.display="none";
    sum.scrollIntoView({behavior:"smooth"});
    document.getElementById("prt").onclick=()=>window.print();
    document.getElementById("edit").onclick=()=>{
      sum.classList.remove("show"); sum.innerHTML="";
      document.getElementById("form").style.display="";
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
  function maskPhone(value){
    let d=(value||'').replace(/\D/g,'').slice(0,11);
    if(!d) return '';
    let r='('+d.slice(0,2);
    if(d.length<2) return r;
    r+=') ';
    if(d.length<=6){ r+=d.slice(2); return r; }
    if(d.length<=10){ r+=d.slice(2,6)+'-'+d.slice(6,10); return r; }
    return r+d.slice(2,3)+' '+d.slice(3,7)+'-'+d.slice(7,11);
  }
  function brDate(v){ if(!v||!/^\d{4}-\d{2}-\d{2}$/.test(v)) return esc(v); const p=v.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }
  function esc(t){return (t||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
})();
