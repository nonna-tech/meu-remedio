// ===== Persistência =====
const DB_KEY = 'mr_remedios';
const CAL_KEY = 'mr_calendar';
const getAll = () => JSON.parse(localStorage.getItem(DB_KEY) || '[]');
const saveAll = (arr) => localStorage.setItem(DB_KEY, JSON.stringify(arr));
const getCal = () => JSON.parse(localStorage.getItem(CAL_KEY) || '{}');
const saveCal = (obj) => localStorage.setItem(CAL_KEY, JSON.stringify(obj));

// ===== Perfil =====
const boasVindas = document.getElementById('boasVindas');
const nomeInput = document.getElementById('nomeUsuario');
document.addEventListener('DOMContentLoaded', () => {
  const nome = localStorage.getItem('mr_usuario') || '';
  if (nomeInput) { nomeInput.value = nome; }
  if (boasVindas && nome) boasVindas.textContent = `Olá, ${nome}!`;
});
document.getElementById('formUser')?.addEventListener('submit', e => {
  e.preventDefault();
  const nome = nomeInput.value.trim();
  localStorage.setItem('mr_usuario', nome);
  if (boasVindas) boasVindas.textContent = `Olá, ${nome}!`;
});

// ===== Chips (botões) =====
function setupChips(){
  document.querySelectorAll('.chips').forEach(group => {
    group.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.chip'); if(!btn) return;
      const outroTarget = btn.dataset.outro;
      if(outroTarget){
        const el = document.getElementById(outroTarget+'Outro');
        if(el){ el.classList.toggle('hidden'); el.focus(); }
        return;
      }
      group.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}
setupChips();

function chipValue(groupName){
  const g = document.querySelector(`.chips[data-group="${groupName}"]`);
  const sel = g?.querySelector('.chip.selected');
  if(sel) return sel.dataset.value;
  if(groupName==='dose'){
    const outro = document.getElementById('doseOutro');
    if(outro && !outro.classList.contains('hidden') && outro.value.trim()) return outro.value.trim();
  }
  if(groupName==='qtd'){
    const outro = document.getElementById('qtdOutro');
    if(outro && !outro.classList.contains('hidden') && outro.value.trim()) return outro.value.trim();
  }
  if(groupName==='tipo'){
    const outro = document.getElementById('tipoOutro');
    if(outro && !outro.classList.contains('hidden') && outro.value.trim()) return outro.value.trim();
  }
  return '';
}

// ===== Upload/Prévia de fotos =====
function fileToDataURL(file, cb){
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}
const fotoReceita = document.getElementById('fotoReceita');
const fotoMedicamento = document.getElementById('fotoMedicamento');
const prevReceita = document.getElementById('prevReceita');
const prevMedicamento = document.getElementById('prevMedicamento');

let fotoReceitaData = '';
let fotoMedicamentoData = '';

fotoReceita?.addEventListener('change', (e)=>{
  const f = e.target.files?.[0];
  if(!f) return;
  fileToDataURL(f, (data)=>{ fotoReceitaData = data; prevReceita.src=data; prevReceita.classList.remove('hidden'); });
});
fotoMedicamento?.addEventListener('change', (e)=>{
  const f = e.target.files?.[0];
  if(!f) return;
  fileToDataURL(f, (data)=>{ fotoMedicamentoData = data; prevMedicamento.src=data; prevMedicamento.classList.remove('hidden'); });
});

// ===== Cadastro/Listagem/Editar/Pausar =====
const formMed = document.getElementById('formMed');
const listaDiv = document.getElementById('lista');
const editIdInput = document.getElementById('editId');
const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
const btnSalvar = document.getElementById('btnSalvar');

function renderLista(){
  if (!listaDiv) return;
  const dados = getAll();
  if (dados.length === 0){ listaDiv.innerHTML = '<p>Nenhum remédio cadastrado.</p>'; return; }
  listaDiv.innerHTML = '';
  dados.forEach((r, idx) => {
    const el = document.createElement('div');
    el.className = 'list-item' + (r.ativo ? '' : ' item-paused');
    el.innerHTML = `
      <div>
        <div><strong>${r.nome}</strong> <span class="badge ${r.ativo ? '' : 'badge-paused'}">${r.tipo}</span></div>
        <div>${r.dose ? r.dose + ' · ' : ''}${r.qtd ? r.qtd + ' un · ' : ''}horário: <strong>${r.hora || '--:--'}</strong></div>
        <div class="thumbs">
          ${r.fotoReceita ? '<a target="_blank" href="'+r.fotoReceita+'">📄 Receita</a>' : ''}
          ${r.fotoMedicamento ? ' <a target="_blank" href="'+r.fotoMedicamento+'">💊 Foto</a>' : ''}
        </div>
      </div>
      <div class="actions">
        <button class="btn-icon toggle" title="Pausar/Ativar" data-idx="${idx}">${r.ativo ? '🔔' : '🔕'}</button>
        <button class="btn-icon edit" title="Editar" data-idx="${idx}">✏️</button>
        <button class="btn-icon del" title="Excluir" data-idx="${idx}">❌</button>
      </div>
    `;
    listaDiv.appendChild(el);
  });

  listaDiv.querySelectorAll('.toggle').forEach(b=>b.addEventListener('click', (ev)=>{
    const i = Number(ev.currentTarget.getAttribute('data-idx'));
    const arr = getAll(); arr[i].ativo = !arr[i].ativo; saveAll(arr); renderLista();
  }));
  listaDiv.querySelectorAll('.del').forEach(b=>b.addEventListener('click', (ev)=>{
    const i = Number(ev.currentTarget.getAttribute('data-idx'));
    const arr = getAll(); arr.splice(i,1); saveAll(arr); renderLista();
  }));
  listaDiv.querySelectorAll('.edit').forEach(b=>b.addEventListener('click', (ev)=>{
    const i = Number(ev.currentTarget.getAttribute('data-idx'));
    const arr = getAll(); const r = arr[i];
    // preencher formulário
    editIdInput.value = r.id;
    document.getElementById('medNome').value = r.nome;
    document.getElementById('medHora').value = r.hora || '';
    // limpar chips selecionados anteriores
    document.querySelectorAll('.chip.selected').forEach(c=>c.classList.remove('selected'));
    // selecionar chips conforme valores
    selectChip('tipo', r.tipo);
    selectChip('dose', r.dose);
    selectChip('qtd',  r.qtd);
    // fotos (pré-visualização)
    if(r.fotoReceita){ prevReceita.src = r.fotoReceita; prevReceita.classList.remove('hidden'); fotoReceitaData = r.fotoReceita; }
    if(r.fotoMedicamento){ prevMedicamento.src = r.fotoMedicamento; prevMedicamento.classList.remove('hidden'); fotoMedicamentoData = r.fotoMedicamento; }
    // UI de edição
    btnCancelarEdicao.classList.remove('hidden');
    btnSalvar.textContent = 'Salvar alterações';
    window.scrollTo({top:0, behavior:'smooth'});
  }));
}

function selectChip(groupName, value){
  const g = document.querySelector(`.chips[data-group="${groupName}"]`);
  if(!g) return;
  // 'outro' caso não bata com chips existentes
  let matched = false;
  g.querySelectorAll('.chip').forEach(ch=>{
    if(ch.dataset.value === value){
      ch.classList.add('selected'); matched = true;
    } else {
      ch.classList.remove('selected');
    }
  });
  if(!matched && value){
    // abre campo 'Outro' correspondente e preenche
    const outroInput = document.getElementById(groupName+'Outro');
    if(outroInput){ outroInput.classList.remove('hidden'); outroInput.value = value; }
  }
}

btnCancelarEdicao?.addEventListener('click', ()=>{
  editIdInput.value = '';
  formMed.reset();
  document.querySelectorAll('.chip.selected').forEach(c=>c.classList.remove('selected'));
  btnCancelarEdicao.classList.add('hidden');
  btnSalvar.textContent = 'Salvar';
  if(prevReceita){ prevReceita.src=''; prevReceita.classList.add('hidden'); }
  if(prevMedicamento){ prevMedicamento.src=''; prevMedicamento.classList.add('hidden'); }
  fotoReceitaData = ''; fotoMedicamentoData = '';
});

formMed?.addEventListener('submit', e => {
  e.preventDefault();
  const arr = getAll();
  const isEditing = !!editIdInput.value;
  const item = {
    id: isEditing ? editIdInput.value : crypto.randomUUID(),
    nome: document.getElementById('medNome').value.trim(),
    tipo: chipValue('tipo') || 'pílula',
    dose: chipValue('dose'),
    qtd:  chipValue('qtd'),
    hora: document.getElementById('medHora').value,
    fotoReceita: fotoReceitaData,
    fotoMedicamento: fotoMedicamentoData,
    ativo: true
  };

  if(isEditing){
    const idx = arr.findIndex(x => x.id === editIdInput.value);
    if(idx >= 0){
      // preserva estado 'ativo' anterior
      item.ativo = arr[idx].ativo;
      arr[idx] = item;
    }
  } else {
    arr.push(item);
  }
  saveAll(arr);
  renderLista();

  // reset UI
  formMed.reset();
  document.querySelectorAll('.chip.selected').forEach(c=>c.classList.remove('selected'));
  btnCancelarEdicao.classList.add('hidden');
  btnSalvar.textContent = 'Salvar';
  if(prevReceita){ prevReceita.src=''; prevReceita.classList.add('hidden'); }
  if(prevMedicamento){ prevMedicamento.src=''; prevMedicamento.classList.add('hidden'); }
  fotoReceitaData = ''; fotoMedicamentoData = '';
  editIdInput.value = '';

  notificar(isEditing ? 'Alterações salvas' : `Lembrete salvo para ${item.nome} às ${item.hora}`);
  tocarSom();
});

// ===== Notificação/Som & Alarmes =====
function tocarSom(){ document.getElementById('beep')?.play(); }
function notificar(txt){
  if(Notification.permission === 'granted') new Notification('MeuRemédio', { body: txt });
  else console.log(txt);
}
function checarAlarmes(){
  const arr = getAll();
  const agora = new Date();
  const hh = String(agora.getHours()).padStart(2,'0');
  const mm = String(agora.getMinutes()).padStart(2,'0');
  const hhmm = `${hh}:${mm}`;
  arr.forEach(r=>{
    if(r.ativo && r.hora === hhmm){
      notificar(`Hora de tomar ${r.nome}`);
      tocarSom();
    }
  });
  setTimeout(checarAlarmes, 60000);
}
checarAlarmes();
renderLista();