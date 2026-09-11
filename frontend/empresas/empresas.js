// ======================================================
// CONFIGURAÇÃO E SESSÃO
// ======================================================

const api = 'http://localhost:3000/empresas';
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
const editar = document.querySelector('.empresa-lista');
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
let editandoEmpresa = null;

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
    alterarTitulo('CADASTRO DE EMPRESA');
    editandoEmpresa = null;                 // ZERA MODO EDIÇÃO
    document.getElementById('formCadastro').reset(); // LIMPA FORM
  }

  if (id === 'editar') {
    alterarTitulo('EDITAR EMPRESA');
    carregarEmpresas();
  }

  if (id === 'excluir') {
    alterarTitulo('EXCLUIR EMPRESA');
    carregarEmpresas();

    document.getElementById('acoesSelecionadas').style.display = 'none';
    document.getElementById('contadorSelecionados').textContent = 0;
  }

  if (id === 'listaAba') {
    alterarTitulo('VISUALIZAR EMPRESAS');
    carregarEmpresas();
  }
}

// ======================================================
// EMPRESAS
// ======================================================

async function carregarEmpresas(ativarScroll = false) {
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
        <td>${e.razao_social}</td>
        <td>${e.cod_completo}</td>
        <td>${e.cod}</td>
        <td>${e.filial}</td>
        <td>${e.municipio}</td>
        <td>${e.cnpj}</td>
        <td>${e.ccm}</td>
        <td>${e.regime_tributario}</td>
        <td>${e.dia_previa_1}</td>
        <td>${e.dia_previa_2}</td>
        <td>${e.data_guia_iss}</td>
        <td class="${e.nota_do_milhao ? 'sim' : 'nao'}">${e.nota_do_milhao ? 'Sim' : 'Não'}</td>
        <td class="${e.nfse ? 'sim' : 'nao'}"> ${e.nfse ? 'Sim' : 'Não'}</td>
        <td class="${e.nfts ? 'sim' : 'nao'}">${e.nfts ? 'Sim' : 'Não'}</td>
        <td class="${e.guia_iss ? 'sim' : 'nao'}">${e.guia_iss ? 'Sim' : 'Não'}</td>
        <td class="${e.encerra_dctfweb ? 'sim' : 'nao'}">${e.encerra_dctfweb ? 'Sim' : 'Não'}</td>
        
      </tr>`;

    editar.innerHTML += `
      <div class="empresa-card">
        <button onclick="editarEmpresa(${e.id})">Editar</button>
        <span>${e.cod_completo} - ${e.razao_social}</span>
      </div>`;

    listaExcluir.innerHTML += `
      <tr>
        <td>
          <input type="checkbox" class="checkExcluir" onchange="verificarSelecionados()" data-id="${e.id}" data-cod="${e.cod_completo}" data-nome="${e.razao_social}" >
        </td>
        <td>${e.razao_social}</td>
        <td>${e.cod_completo}</td>
        <td>${e.cod}</td>
        <td>${e.filial}</td>
        <td>${e.municipio}</td>
      </tr>`;
  });
}

async function editarEmpresa(id) {
  const res = await fetch(api + '/' + id, { headers: headersAuth });
  if (!res.ok) return notificar('Erro ao buscar empresa');

  const e = await res.json();

  razao.value = e.razao_social;
  cod_completo.value = e.cod_completo;
  cod.value = e.cod;
  filial.value = e.filial;
  municipio.value = e.municipio;
  cnpj.value = e.cnpj;
  ccm.value = e.ccm;
  regime.value = e.regime_tributario;
  dp1.value = e.dia_previa_1;
  dp2.value = e.dia_previa_2;
  data_guia.value = e.data_guia_iss;
  nota.checked = e.nota_do_milhao;
  nfse.checked = e.nfse;
  nfts.checked = e.nfts;
  guia.checked = e.guia_iss;
  dctf.checked = e.encerra_dctfweb;

  editandoEmpresa = id;
  mostrar('cadastro');
  alterarTitulo('EDITAR EMPRESA');
}

async function confirmarExclusaoEmpresas() {
  const checks = document.querySelectorAll('.checkExcluir:checked');
  if (!checks.length) return notificar('Selecione empresas.');

  const lista = [...checks]
    .map(c => `${c.dataset.cod} - ${c.dataset.nome}`)
    .join('\n');

  const ok = await confirmar(
    'Excluir Empressas',
    'Deseja realmente excluir as empresas selecionados?'
  );

  if (!ok) return;

  for (const c of checks) {
    await fetch(api + '/' + c.dataset.id, {
      method: 'DELETE',
      headers: headersAuth
    });
  }

  notificar('Empresas excluídas com sucesso', 'sucesso');
  document.getElementById('acoesSelecionadas').style.display = 'none';
  carregarEmpresas();
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
cnpj.addEventListener('input', () => {
  cnpj.value = cnpj.value.replace(/\D/g, '');
});


// Remove qualquer caractere que não seja número
ccm.addEventListener('input', () => {
  ccm.value = ccm.value.replace(/\D/g, '');
});


formCadastro.addEventListener('submit', async e => {
  e.preventDefault();
  
  const dados = {
    razao_social: razao.value,
    cod_completo: cod_completo.value,
    cod: cod.value,
    filial: filial.value,
    municipio: municipio.value,
    cnpj: cnpj.value,
    ccm: ccm.value,
    regime_tributario: regime.value,
    dia_previa_1: dp1.value,
    dia_previa_2: dp2.value,
    data_guia_iss: data_guia.value,
    nota_do_milhao: nota.checked,
    nfse: nfse.checked,
    nfts: nfts.checked,
    guia_iss: guia.checked,
    encerra_dctfweb: dctf.checked
  };

  const metodo = editandoEmpresa ? 'PUT' : 'POST';
  const url = editandoEmpresa ? api + '/' + editandoEmpresa : api;

  const res = await fetch(url, {
    method: metodo,
    headers: headersAuth,
    body: JSON.stringify(dados)
  });

  if (!res.ok) {
    const r = await res.json();
    return notificar(r.erro || 'Erro ao salvar');
  }

  notificar('Empresa salva com sucesso', 'sucesso');
  formCadastro.reset();
  editandoEmpresa = null;
  carregarEmpresas();
  mostrar('listaAba');
});

function voltar() {
  window.location.href = '../home/home.html';
}

const scrollFixo = document.getElementById('scrollHorizontalFixo');
const scrollFake = document.getElementById('scrollFake');

function ativarScrollFixo() {
  const tabela = document.querySelector('#listaAba .table-container');
  if (!tabela) return;

  scrollFixo.style.display = 'block';
  scrollFake.style.width = tabela.scrollWidth + 'px';

  scrollFixo.onscroll = () => {
    tabela.scrollLeft = scrollFixo.scrollLeft;
  };

  tabela.onscroll = () => {
    scrollFixo.scrollLeft = tabela.scrollLeft;
  };
}

function desativarScrollFixo() {
  scrollFixo.style.display = 'none';
}

// ======================================================
// INIT
// ======================================================

carregarEmpresas();
mostrar('cadastro');