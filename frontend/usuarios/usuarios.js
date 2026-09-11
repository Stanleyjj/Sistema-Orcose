// ======================================================
// ENDEREÇO DA API
// ======================================================

// Endereço da API responsável pelo gerenciamento dos usuários.
const apiUsuarios = 'http://localhost:3000/usuarios';

// ======================================================
// AUTENTICAÇÃO
// ======================================================

// Obtém o nome do usuário que está logado no sistema.
const usuarioLogado = sessionStorage.getItem('usuario');

// Obtém o tipo do usuário (ADMIN ou USUARIO).
// O normalize() remove acentos e o toUpperCase()
// converte o texto para letras maiúsculas.
const tipoLogado = sessionStorage.getItem('tipo')
  ?.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase();

// Recupera o horário de expiração da sessão.
const expira = sessionStorage.getItem('expira');

// Obtém o elemento do título da tela de cadastro.
const tituloUsuario = document.getElementById('tituloUsuario');

// ======================================================
// APLICAR TEMA SALVO
// ======================================================

// Função executada automaticamente assim que o arquivo é carregado.
(function aplicarTema() {

  // Obtém o usuário logado.
  const user = sessionStorage.getItem('usuario');

  // Caso não exista usuário, encerra a função.
  if (!user) return;

  // Recupera o tema salvo para esse usuário.
  const tema = localStorage.getItem('tema_' + user);

  // Se o tema salvo for escuro, adiciona a classe "dark"
  // para alterar toda a aparência da página.
  if (tema === 'dark') {
    document.body.classList.add('dark');
  }

})();

// ======================================================
// CONTROLE DE PERMISSÃO DO MENU
// ======================================================

// Obtém o item "Usuários" do menu lateral.
const menuUsuarios = document.getElementById('menuUsuarios');

// Caso o usuário não seja administrador,
// oculta o menu de gerenciamento de usuários.
if (menuUsuarios && tipoLogado !== 'ADMIN') {
  menuUsuarios.style.display = 'none';
}

// ======================================================
// VERIFICAÇÃO DA SESSÃO
// ======================================================

// Verifica se existe usuário, tipo e tempo de sessão válidos.
// Caso algum dado esteja ausente ou a sessão tenha expirado,
// limpa a sessão e redireciona para a tela de login.
if (!usuarioLogado || !tipoLogado || !expira || Date.now() > expira) {
  sessionStorage.clear();
  window.location.href = '../login.html';
}

// ======================================================
// FUNÇÃO DE NOTIFICAÇÃO
// ======================================================

// Exibe mensagens de sucesso, erro ou informação na tela.
function notificar(msg, tipo = 'info') {

  // Localiza a caixa de notificação.
  const n = document.getElementById('notificacao');

  // Define o texto que será mostrado.
  n.textContent = msg;

  // Define a aparência conforme o tipo recebido.
  n.className = `notificacao show ${tipo}`;

  // Remove automaticamente a mensagem após 3 segundos.
  setTimeout(() => {
    n.classList.remove('show');
  }, 3000);
}

// ======================================================
// EXIBE O USUÁRIO LOGADO
// ======================================================

// Mostra no cabeçalho o nome do usuário autenticado.
document.getElementById('usuarioTopo').textContent =
  `Usuário: ${usuarioLogado}`;

// ======================================================
// CABEÇALHO DAS REQUISIÇÕES
// ======================================================

// Cabeçalhos enviados para todas as requisições,
// permitindo que o servidor saiba quem está realizando a operação.
const headersAuth = {
  'Content-Type': 'application/json',
  'x-user': usuarioLogado,
  'x-tipo': tipoLogado
};

// ======================================================
// ELEMENTOS DA PÁGINA
// ======================================================

// Formulário de cadastro e edição de usuários.
const formUsuario = document.getElementById('formUsuario');

// Campo do nome de usuário.
const u_usuario = document.getElementById('u_usuario');

// Campo da senha.
const u_senha = document.getElementById('u_senha');

// Campo do tipo de usuário.
const u_tipo = document.getElementById('u_tipo');

// Corpo da tabela de edição.
const listaEditar = document.getElementById('listaEditar');

// Corpo da tabela de exclusão.
const listaExcluir = document.getElementById('listaExcluir');

// Variável responsável por armazenar o ID do usuário
// que está sendo editado.
// Quando estiver nula, significa que será realizado um cadastro.
let editandoId = null;

// ======================================================
// LISTAR USUÁRIOS
// ======================================================

// Busca todos os usuários cadastrados no servidor.
async function carregarUsuarios() {

  // Faz uma requisição para obter os usuários.
  const res = await fetch(apiUsuarios, {
    headers: headersAuth
  });

  // Caso ocorra algum erro, exibe uma notificação.
  if (!res.ok)
    return notificar('Erro ao carregar usuários');

  // Converte a resposta da API para objeto JavaScript.
  const dados = await res.json();

  // Limpa as tabelas antes de preencher novamente.
  listaEditar.innerHTML = '';
  listaExcluir.innerHTML = '';

  // Percorre todos os usuários retornados pela API.
  dados.forEach(u => {

    // ==================================================
    // TABELA DE EDIÇÃO
    // ==================================================

    // Cria uma linha contendo o botão Editar
    // e as informações do usuário.
    listaEditar.innerHTML += `
      <tr>
        <td class="acoes">
          <button onclick="editarUsuario(${u.id}, '${u.usuario}', '${u.tipo}')">
            Editar
          </button>
        </td>
        <td class="usuario">${u.usuario}</td>
        <td class="tipo">${u.tipo}</td>
      </tr>
    `;

    // ==================================================
    // TABELA DE EXCLUSÃO
    // ==================================================

    // Cria uma linha contendo um checkbox para seleção
    // e as informações do usuário.
    listaExcluir.innerHTML += `
      <tr>
        <td class="acoes">
          <input
            type="checkbox"
            class="checkExcluir"
            onchange="verificarSelecionados()"
            data-id="${u.id}">
        </td>
        <td class="usuario">${u.usuario}</td>
        <td class="tipo">${u.tipo}</td>
      </tr>
    `;
  });
}

// ======================================================
// EDITAR USUÁRIO
// ======================================================

// Preenche automaticamente o formulário com os dados
// do usuário selecionado.
function editarUsuario(id, usuario, tipo) {

  // Preenche o nome do usuário.
  u_usuario.value = usuario;

  // Limpa o campo da senha por segurança.
  u_senha.value = '';

  // Define o tipo do usuário.
  u_tipo.value = tipo;

  // Guarda o ID do usuário em edição.
  editandoId = id;

  // Altera o título da tela.
  tituloUsuario.textContent = 'Editar Usuário';

  // Exibe a aba de cadastro já preenchida.
  mostrar('cadastro', true);
}

// ======================================================
// EXCLUIR USUÁRIOS
// ======================================================

// Remove os usuários selecionados.
async function confirmarExclusaoUsuarios() {

  // Obtém todos os checkboxes marcados.
  const checks = document.querySelectorAll('.checkExcluir:checked');

  // Caso nenhum usuário tenha sido selecionado,
  // exibe uma mensagem.
  if (!checks.length)
    return notificar('Selecione usuários.');

  // Solicita confirmação antes da exclusão.
  const ok = await confirmar(
    'Excluir usuários',
    'Deseja realmente excluir os usuários selecionados?'
  );

  // Caso o usuário cancele, interrompe a função.
  if (!ok) return;

  // Percorre todos os usuários selecionados
  // e envia uma requisição DELETE para cada um.
  for (const c of checks) {

    await fetch(apiUsuarios + '/' + c.dataset.id, {
      method: 'DELETE',
      headers: headersAuth
    });

  }

  // Exibe mensagem de sucesso.
  notificar('Usuários excluídos', 'sucesso');

  // Esconde o botão de exclusão.
  document.getElementById('acoesSelecionadas').style.display = 'none';

  // Atualiza a lista.
  carregarUsuarios();
}

// ======================================================
// CONTROLE DOS CHECKBOXES
// ======================================================

// Controla quantos usuários foram selecionados
// para exclusão.
function verificarSelecionados() {

  // Obtém todos os checkboxes marcados.
  const checks = document.querySelectorAll('.checkExcluir:checked');

  // Obtém a área onde aparece o botão "Excluir Selecionadas".
  const acoes = document.getElementById('acoesSelecionadas');

  // Obtém o contador de usuários selecionados.
  const contador = document.getElementById('contadorSelecionados');

  // Conta quantos checkboxes estão marcados.
  const total = checks.length;

  // Atualiza o número exibido ao usuário.
  contador.textContent = total;

  // Caso exista pelo menos um usuário selecionado,
  // mostra o botão de exclusão.
  if (total > 0) {
    acoes.style.display = 'block';
  } else {

    // Caso contrário, esconde o botão.
    acoes.style.display = 'none';
  }
}
// ======================================================
// SALVAR USUÁRIO (CADASTRAR OU EDITAR)
// ======================================================

// Adiciona um evento ao formulário para ser executado
// quando o usuário clicar no botão "Salvar".
formUsuario.addEventListener('submit', async e => {

  // Impede que a página seja recarregada após o envio do formulário.
  e.preventDefault();

  // ==================================================
  // MONTA O OBJETO COM OS DADOS
  // ==================================================

  // Cria um objeto contendo as informações básicas
  // que serão enviadas ao servidor.
  const dados = {
    usuario: u_usuario.value,
    tipo: u_tipo.value
  };

  // A senha somente será enviada caso o usuário
  // tenha digitado algum valor.
  // Isso evita alterar a senha durante uma edição
  // quando o campo permanecer vazio.
  if (u_senha.value.trim() !== '') {
    dados.senha = u_senha.value;
  }

  // ==================================================
  // DEFINE SE SERÁ CADASTRO OU EDIÇÃO
  // ==================================================

  // Caso exista um ID armazenado em editandoId,
  // significa que estamos editando um usuário.
  // Caso contrário, será realizado um novo cadastro.
  const metodo = editandoId ? 'PUT' : 'POST';

  // Define qual endereço será utilizado.
  // Para edição é enviado o ID do usuário.
  // Para cadastro utiliza apenas a rota principal.
  const url = editandoId
    ? apiUsuarios + '/' + editandoId
    : apiUsuarios;

  // ==================================================
  // ENVIA OS DADOS PARA O SERVIDOR
  // ==================================================

  const res = await fetch(url, {
    method: metodo,
    headers: headersAuth,
    body: JSON.stringify(dados)
  });

  // Caso ocorra algum erro durante o salvamento,
  // exibe uma mensagem para o usuário.
  if (!res.ok)
    return notificar('Erro ao salvar usuário', 'erro');

  // ==================================================
  // CASO O PRÓPRIO USUÁRIO TENHA ALTERADO SUA CONTA
  // ==================================================

  // Se o usuário editou o próprio cadastro,
  // será necessário realizar um novo login.
  if (u_usuario.value === usuarioLogado && editandoId) {

    // Exibe uma mensagem informando o motivo.
    notificar('Seu perfil foi alterado. Faça login novamente.');

    // Remove todos os dados da sessão.
    sessionStorage.clear();

    // Redireciona para a tela de login.
    window.location.href = '../login.html';

    return;
  }

  // ==================================================
  // FINALIZAÇÃO
  // ==================================================

  // Exibe mensagem de sucesso.
  notificar('Usuário salvo com sucesso', 'sucesso');

  // Limpa todos os campos do formulário.
  formUsuario.reset();

  // Remove o modo de edição.
  editandoId = null;

  // Altera o título da tela para cadastro.
  tituloUsuario.textContent = 'Cadastrar Usuário';

  // Abre automaticamente a aba de edição,
  // onde o usuário poderá visualizar a lista atualizada.
  mostrar('editar');
});

// ======================================================
// CONTROLE DAS ABAS
// ======================================================

// Responsável por mostrar apenas a aba selecionada.
function mostrar(id, vindoDoEditar = false) {

  // Esconde todas as abas da página.
  document.querySelectorAll('.aba').forEach(a =>
    a.style.display = 'none'
  );

  // Exibe somente a aba escolhida.
  document.getElementById(id).style.display = 'block';

  // Obtém o painel das ações de exclusão.
  const acoes = document.getElementById('acoesSelecionadas');

  // Sempre que trocar de aba,
  // esconde o botão de exclusão em massa.
  if (acoes) {
    acoes.style.display = 'none';
  }

  // Se a aba aberta for "Cadastro"
  // e ela não tiver sido aberta através do botão Editar,
  // o sistema prepara um novo cadastro.
  if (id === 'cadastro' && !vindoDoEditar) {

    // Remove qualquer ID de edição.
    editandoId = null;

    // Altera o título da tela.
    tituloUsuario.textContent = 'Cadastrar Usuário';

    // Limpa o formulário.
    formUsuario.reset();
  }

  // Sempre que abrir qualquer aba diferente do cadastro,
  // atualiza automaticamente a lista de usuários.
  if (id !== 'cadastro') {
    carregarUsuarios();
  }
}

// ======================================================
// VOLTAR PARA A HOME
// ======================================================

// Retorna para a página inicial do sistema.
function voltar() {
  window.location.href = '../home/home.html';
}

// ======================================================
// INICIALIZAÇÃO DA PÁGINA
// ======================================================

// Assim que a página é carregada,
// abre automaticamente a aba de cadastro.
mostrar('cadastro');