// ======================================================
// CONFIGURAÇÃO E SESSÃO
// ======================================================

const api = 'http://localhost:3000/fisica';
const apiUsuarios = 'http://localhost:3000/usuarios';

const usuario = sessionStorage.getItem('usuario');
const tipo = sessionStorage.getItem('tipo');
const expira = sessionStorage.getItem('expira');

const formUsuario = document.getElementById('formUsuario');
const u_usuario = document.getElementById('u_usuario');
const u_senha = document.getElementById('u_senha');
const u_tipo = document.getElementById('u_tipo');
const listaUsuarios = document.getElementById('listaUsuarios');

const lista = document.getElementById('lista');
const editar = document.querySelector('.fisica-lista');
const listaExcluir = document.getElementById('listaExcluir');
const tipoLogado = sessionStorage.getItem('tipo')?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

// Controle de permissão de menu
const menuUsuarios = document.getElementById('menuUsuarios');
if (menuUsuarios && tipo !== 'ADMIN') {
    menuUsuarios.style.display = 'none';
}

// Alterar tema
const tema = localStorage.getItem('tema_' + usuario);

if (tema === 'dark') {
    document.body.classList.add('dark');
}

if (!usuario || !tipo || !expira || Date.now() > expira) {
    sessionStorage.clear();
    window.location.href = '../login.html';
}

// Cabeçalho
document.getElementById('usuarioTopo').textContent = `Usuário: ${usuario}`;


// Headers
const headersAuth = {
    'Content-Type': 'application/json',
    'x-user': usuario,
    'x-tipo': tipo
};

// Controle
let editandoFisica = null;

// ======================================================
// INTERFACE
// ======================================================

function alterarTitulo(texto) {
    document.getElementById('tituloTela').textContent = texto;
}

function notificar(msg, tipo = 'info') {
  const n = document.getElementById('notificacao');
  n.textContent = msg;
  n.className = `notificacao show ${tipo}`;

  setTimeout(() => {
    n.classList.remove('show');
  }, 3000);
}


// ======================================================
// ABAS
// ======================================================

function mostrar(id) { 
  document.querySelectorAll('.aba').forEach(a => a.style.display = 'none');
  document.getElementById(id).style.display = 'block';

  document.querySelectorAll('.menu li').forEach(li => li.classList.remove('ativo'));
  const abaMenu = document.querySelector(`[data-aba="${id}"]`);
  if (abaMenu) abaMenu.classList.add('ativo');

  const acoes = document.getElementById('acoesSelecionadas');
  if (acoes) acoes.style.display = 'none'; // 🔥 sempre esconder ao trocar aba

  if (id === 'cadastro') {
    alterarTitulo('CADASTRO DE PESSOA FISICA');
    editandoFisica = null;                 // ZERA MODO EDIÇÃO
    document.getElementById('formCadastro').reset(); // LIMPA FORM
  }

  if (id === 'editar') {
    alterarTitulo('EDITAR PESSOA FISICA');
    carregarFisica();
  }

  if (id === 'excluir') {
    alterarTitulo('EXCLUIR PESSOA FISICA');
    carregarFisica();
    document.getElementById('acoesSelecionadas').style.display = 'none';
    document.getElementById('contadorSelecionados').textContent = 0;
  }

  if (id === 'listaAba') {
    alterarTitulo('VISUALIZAR PESSOA FISICA');
    carregarFisica();
  }
}

// ======================================================
// PESSOA FISICA
// ======================================================

async function carregarFisica() {
  const res = await fetch(api, { headers: headersAuth });
  const dados = await res.json();

  dados.sort((a, b) => {
    const [ac, af] = a.cod_completo.split('-').map(Number);
    const [bc, bf] = b.cod_completo.split('-').map(Number);
    return ac !== bc ? ac - bc : af - bf;
  });

  lista.innerHTML = '';
  editar.innerHTML = '';
  listaExcluir.innerHTML = '';

  dados.forEach(e => {
    lista.innerHTML += `
      <tr>
        <td>${e.nome}</td>
        <td>${e.cod_completo}</td>
        <td>${e.cod}</td>
        <td>${e.municipio}</td>
        <td>${e.cpf}</td>
      </tr>`;

    editar.innerHTML += `
      <div class="fisica-card">
        <button onclick="editarFisica(${e.id})">Editar</button>
        <span>${e.cod_completo} - ${e.nome}</span>
      </div>`;

    listaExcluir.innerHTML += `
      <tr>
        <td>
          <input type="checkbox" class="checkExcluir" onchange="verificarSelecionados()" data-id="${e.id}" data-cod="${e.cod_completo}" data-nome="${e.nome}" >
        </td>
        <td>${e.nome}</td>
        <td>${e.cod_completo}</td>
        <td>${e.cod}</td>
        <td>${e.municipio}</td>
        <td>${e.cpf}</td>
      </tr>`;
  });
}

async function editarFisica(id) {
  const res = await fetch(api + '/' + id, { headers: headersAuth });
  if (!res.ok) return notificar('Erro ao buscar Pessoa Fisica');

  const e = await res.json();

  document.getElementById('nome').value = e.nome;
  cod_completo.value = e.cod_completo;
  cod.value = e.cod;
  municipio.value = e.municipio;
  cpf.value = e.cpf;

  editandoFisica = id;
  mostrar('cadastro');
  alterarTitulo('EDITAR PESSOA FISICA');
}

async function confirmarExclusaoFisica() {
  const checks = document.querySelectorAll('.checkExcluir:checked');
  if (!checks.length) return notificar('Selecione pessoa fisica.');

  const lista = [...checks]
    .map(c => `${c.dataset.cod} - ${c.dataset.nome}`)
    .join('\n');

  const ok = await confirmar(
    'Excluir Fisica',
    'Deseja realmente excluir as pessoas fisicas selecionados?'
  );

  if (!ok) return;

  for (const c of checks) {
    await fetch(api + '/' + c.dataset.id, {
      method: 'DELETE',
      headers: headersAuth
    });
  }

  notificar('Pessoas Fisicas excluídas com sucesso', 'sucesso');
  document.getElementById('acoesSelecionadas').style.display = 'none';
  carregarFisica();
}

function verificarSelecionados() {
  const checks = document.querySelectorAll('.checkExcluir:checked');
  const acoes = document.getElementById('acoesSelecionadas');
  const contador = document.getElementById('contadorSelecionados');

  const total = checks.length;
  contador.textContent = total;

  if (total > 0) {
    acoes.style.display = 'block';
  } else {
    acoes.style.display = 'none';
  }
}

// Remove qualquer caractere que não seja número
cpf.addEventListener('input', () => {
  cpf.value = cpf.value.replace(/\D/g, '');
});


formCadastro.addEventListener('submit', async e => {
    e.preventDefault();
   
    const dados = {
        nome: document.getElementById('nome').value,
        cod_completo: cod_completo.value,
        cod: cod.value,
        municipio: municipio.value,
        cpf: cpf.value,
    };

  const metodo = editandoFisica ? 'PUT' : 'POST';
  const url = editandoFisica ? api + '/' + editandoFisica : api;

  const res = await fetch(url, {
    method: metodo,
    headers: headersAuth,
    body: JSON.stringify(dados)
  });

  if (!res.ok) {
    const r = await res.json();
    return notificar(r.erro || 'Erro ao salvar');
  }

  notificar('Pessoa Fisica salva com sucesso', 'sucesso');
  formCadastro.reset();
  editandoFisica = null;
  carregarFisica();
  mostrar('listaAba');
});

function voltar() {
  window.location.href = '../home/home.html';
}


// ======================================================
// INIT
// ======================================================

carregarFisica();
mostrar('cadastro');