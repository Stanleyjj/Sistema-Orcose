// ======================================================
// RECUPERA DADOS DA SESSÃO
// ======================================================

// Obtém o tipo do usuário logado (ADMIN ou USUARIO).
// O normalize() remove acentos para evitar problemas de comparação
// e o toUpperCase() converte tudo para letras maiúsculas.
const tipoLogado = sessionStorage.getItem('tipo')?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

// Obtém o nome do usuário que fez login.
const usuario = sessionStorage.getItem('usuario');

// ======================================================
// CONFIGURAÇÕES DE TEMA E MENU
// ======================================================

// Busca no navegador o tema salvo para este usuário.
const tema = localStorage.getItem('tema_' + usuario);

// Localiza no HTML o item "Usuários" do menu lateral.
const menuUsuarios = document.getElementById('menuUsuarios');

// Se existir o menu "Usuários" e o usuário NÃO for administrador,
// o sistema esconde essa opção do menu.
if (menuUsuarios && tipoLogado !== 'ADMIN') {
  menuUsuarios.style.display = 'none';
}

// Caso o usuário tenha escolhido o tema escuro anteriormente,
// adiciona a classe "dark" ao body para aplicar as cores escuras.
if (tema === 'dark') {
  document.body.classList.add('dark');
}

// ======================================================
// VERIFICAÇÃO DE LOGIN
// ======================================================

// Verifica se existe um usuário salvo na sessão.
// Caso não exista, significa que o usuário não está logado,
// então ele é redirecionado para a tela de login.
if (!sessionStorage.getItem("usuario")) {
  window.location.href = "login.html";
}

// ======================================================
// FUNÇÃO DE NOTIFICAÇÕES
// ======================================================

// Exibe mensagens de sucesso, erro ou informação na tela.
function notificar(msg, tipo = 'info') {

  // Localiza a caixa de notificação.
  const n = document.getElementById('notificacao');

  // Define o texto que será exibido.
  n.textContent = msg;

  // Define o estilo da notificação conforme o tipo recebido.
  n.className = `notificacao show ${tipo}`;

  // Após 3 segundos remove a notificação automaticamente.
  setTimeout(() => {
    n.classList.remove('show');
  }, 3000);
}

// ======================================================
// EXIBE O USUÁRIO LOGADO NO TOPO DA PÁGINA
// ======================================================

// Mostra no cabeçalho o nome do usuário autenticado.
document.getElementById('usuarioTopo').textContent =
  `Usuário: ${sessionStorage.getItem("usuario")}`;

// ======================================================
// ENDEREÇOS DA API
// ======================================================

// Endpoint responsável pelas Empresas.
const apiEmpresas = 'http://localhost:3000/empresas';

// Endpoint responsável pelas Pessoas Físicas.
const apiFisica = 'http://localhost:3000/fisica';

// ======================================================
// CABEÇALHO DE AUTENTICAÇÃO DAS REQUISIÇÕES
// ======================================================

// Essas informações acompanham todas as requisições ao servidor,
// permitindo identificar qual usuário está realizando a operação.
const headersAuth = {
  'Content-Type': 'application/json',
  'x-user': sessionStorage.getItem('usuario'),
  'x-tipo': sessionStorage.getItem('tipo')
};

// ======================================================
// CARREGAR RESUMO DA HOME
// ======================================================

// Função responsável por carregar os dados exibidos
// na tela inicial do sistema.
async function carregarResumo() {

  try {

    // Faz duas requisições ao mesmo tempo:
    // uma para Empresas e outra para Pessoas Físicas.
    const [resEmpresas, resFisica] = await Promise.all([
      fetch(apiEmpresas, { headers: headersAuth }),
      fetch(apiFisica, { headers: headersAuth })
    ]);

    // Converte as respostas da API para objetos JavaScript.
    const empresas = await resEmpresas.json();
    const fisicas = await resFisica.json();

    // ==================================================
    // TOTAL DE REGISTROS
    // ==================================================

    // Exibe a quantidade total de empresas cadastradas.
    document.getElementById('totalEmpresas').textContent = empresas.length;

    // Exibe a quantidade total de pessoas físicas cadastradas.
    document.getElementById('totalFisica').textContent = fisicas.length;

    // ==================================================
    // ÚLTIMOS CADASTROS
    // ==================================================

    // Pega os 5 últimos registros de empresas cadastradas.
    // reverse() inverte a ordem para mostrar o mais recente primeiro.
    const ultEmpresas = empresas.slice(-5).reverse();

    // Pega os 5 últimos registros de pessoas físicas.
    const ultFisicas = fisicas.slice(-5).reverse();

    // Obtém as listas do HTML onde os dados serão exibidos.
    const listaEmpresas = document.getElementById('ultimasEmpresas');
    const listaFisicas = document.getElementById('ultimasFisicas');

    // Limpa as listas antes de inserir novos registros.
    listaEmpresas.innerHTML = '';
    listaFisicas.innerHTML = '';

    // Percorre todas as últimas empresas e cria um item na lista.
    ultEmpresas.forEach(e => {
      listaEmpresas.innerHTML += `
        <li>${e.cod_completo} - ${e.razao_social}</li>
      `;
    });

    // Percorre todas as últimas pessoas físicas
    // e adiciona cada uma na lista correspondente.
    ultFisicas.forEach(f => {
      listaFisicas.innerHTML += `
        <li>${f.cod_completo} - ${f.nome}</li>
      `;
    });

  } catch (erro) {

    // Caso aconteça algum erro durante a comunicação
    // com o servidor, ele será exibido no console.
    console.error(erro);

    // Também mostra uma mensagem amigável para o usuário.
    notificar('Erro ao carregar resumo', 'erro');
  }
}

// ======================================================
// INICIALIZAÇÃO DA PÁGINA
// ======================================================

// Assim que a página é carregada,
// executa a função responsável por preencher
// os dados da tela inicial.
carregarResumo();