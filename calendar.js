// ===== Calendário simples =====
const calDiv = document.getElementById('calendario');
const mesAnoEl = document.getElementById('mesAno');
const prevBtn = document.getElementById('prevMes');
const nextBtn = document.getElementById('proxMes');
const calData = document.getElementById('calData');
const calTexto = document.getElementById('calTexto');
const btnAddCal = document.getElementById('btnAddCal');
const calEventos = document.getElementById('calEventos');

let ref = new Date(); ref.setDate(1);

function desenhar(){
  if(!calDiv) return;
  calDiv.innerHTML='';
  const ano = ref.getFullYear();
  const mes = ref.getMonth();
  mesAnoEl.textContent = ref.toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
  const primeiro = new Date(ano, mes, 1);
  const inicioIdx = (primeiro.getDay()+6)%7;
  const ultimoDia = new Date(ano, mes+1, 0).getDate();
  const nomes = ['S','T','Q','Q','S','S','D'];
  nomes.forEach(n=>{ const h=document.createElement('div'); h.className='dia'; h.style.fontWeight='bold'; h.textContent=n; calDiv.appendChild(h); });
  for(let i=0;i<inicioIdx;i++){ const b=document.createElement('div'); b.className='dia'; calDiv.appendChild(b); }
  const calObj = getCal();
  for(let d=1; d<=ultimoDia; d++){
    const cell = document.createElement('div'); cell.className='dia';
    const num = document.createElement('div'); num.className='num'; num.textContent=d; cell.appendChild(num);
    const dataStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const eventos = calObj[dataStr] || [];
    if(eventos.length){ const m=document.createElement('div'); m.className='marcado'; m.textContent=eventos.length+' ev.'; cell.appendChild(m); }
    cell.addEventListener('click', ()=>{ calData.value=dataStr; listarEventosDia(dataStr); });
    calDiv.appendChild(cell);
  }
}
function listarEventosDia(dataStr){
  const all = getCal(); const evs = all[dataStr] || [];
  calEventos.innerHTML = `<h4>Eventos em ${dataStr}</h4>` + (evs.length? '': '<p>Nenhum evento.</p>');
  evs.forEach((e,i)=>{
    const div=document.createElement('div'); div.className='ev'; div.textContent=e;
    const bt=document.createElement('button'); bt.textContent='Excluir'; bt.className='btn-icon'; bt.style.marginLeft='8px';
    bt.addEventListener('click', ()=>{ evs.splice(i,1); all[dataStr]=evs; saveCal(all); listarEventosDia(dataStr); desenhar(); });
    div.appendChild(bt); calEventos.appendChild(div);
  });
}
prevBtn?.addEventListener('click', ()=>{ ref.setMonth(ref.getMonth()-1); desenhar(); });
nextBtn?.addEventListener('click', ()=>{ ref.setMonth(ref.getMonth()+1); desenhar(); });
btnAddCal?.addEventListener('click', ()=>{
  const d = calData.value; const t = calTexto.value.trim();
  if(!d || !t) return;
  const all = getCal(); all[d]=all[d]||[]; all[d].push(t); saveCal(all);
  calTexto.value=''; listarEventosDia(d); desenhar();
});
desenhar();