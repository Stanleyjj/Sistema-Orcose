// ======================================================
// RECUPERAÇÃO DOS DADOS DA SESSÃO
// ======================================================

// Obtém o nome do usuário armazenado durante o login.
const usuario = sessionStorage.getItem('usuario');

// Obtém o tipo de usuário (ADMIN ou USUARIO).
// O operador ?. evita erro caso o valor seja nulo.
// toUpperCase() garante que a comparação seja sempre em letras maiúsculas.
const tipo = sessionStorage.getItem('tipo')?.toUpperCase();


// ======================================================
// VERIFICAÇÃO DE LOGIN
// ======================================================

// Caso não exista um usuário armazenado na sessão,
// significa que ninguém está autenticado.
//
// Nesse caso o sistema redireciona automaticamente
// para a tela de login.
if (!usuario) {
  window.location.href = '../login.html';
}


// ======================================================
// EXIBIÇÃO DAS INFORMAÇÕES DO USUÁRIO
// ======================================================

// Mostra o nome do usuário no cabeçalho da página.
document.getElementById('usuarioTopo').textContent =
  `Usuário: ${usuario}`;

// Mostra o usuário dentro do card "Perfil".
document.getElementById('cfgUsuario').textContent = usuario;

// Mostra o tipo de usuário (ADMIN ou USUARIO).
document.getElementById('cfgTipo').textContent = tipo;


// ======================================================
// LIBERAÇÃO DAS OPÇÕES DE ADMINISTRADOR
// ======================================================

// Apenas usuários administradores possuem acesso
// às funções administrativas.
//
// Caso o usuário seja ADMIN,
// o card oculto passa a ficar visível.
if (tipo === 'ADMIN') {
  document.querySelector('.admin-only').style.display = 'block';
}


// ======================================================
// ALTERAÇÃO DE SENHA
// ======================================================

// Aguarda o envio do formulário.
formSenha.addEventListener('submit', async e => {

  // Impede o recarregamento da página.
  e.preventDefault();

  // Envia a solicitação ao backend.
  const res = await fetch('http://localhost:3000/config/senha', {

    method: 'PUT',

    headers: {

      // Informa que os dados serão enviados em JSON.
      'Content-Type': 'application/json',

      // Identifica o usuário autenticado.
      'x-user': usuario,

      // Informa o perfil do usuário.
      'x-tipo': tipo

    },

    // Envia a senha atual e a nova senha.
    body: JSON.stringify({

      atual: senhaAtual.value,

      nova: novaSenha.value

    })

  });

  // Caso ocorra algum erro,
  // exibe uma notificação.
  if (!res.ok)
    return notificar('Erro ao alterar senha');

  // Caso a alteração seja concluída,
  // informa ao usuário.
  notificar('Senha alterada com sucesso', 'sucesso');

  // Limpa os campos do formulário.
  formSenha.reset();

});


// ======================================================
// CONTROLE DO TEMA ESCURO
// ======================================================

// Obtém o checkbox do tema.
const temaEscuro = document.getElementById('temaEscuro');

// Cria uma chave personalizada para cada usuário.
//
// Dessa forma cada usuário possui
// sua própria preferência de tema.
const chaveTema = 'tema_' + usuario;


// ======================================================
// APLICAÇÃO DO TEMA SALVO
// ======================================================

// Recupera o tema salvo anteriormente.
const temaSalvo = localStorage.getItem(chaveTema);

// Caso seja "dark",
// aplica automaticamente o tema escuro.
if (temaSalvo === 'dark') {

  document.body.classList.add('dark');

  temaEscuro.checked = true;

}


// ======================================================
// ALTERAÇÃO DO TEMA
// ======================================================

// Executado sempre que o usuário
// marca ou desmarca o checkbox.
temaEscuro.onchange = () => {

  // Caso esteja marcado,
  // ativa o modo escuro.
  if (temaEscuro.checked) {

    document.body.classList.add('dark');

    // Salva a preferência no navegador.
    localStorage.setItem(chaveTema, 'dark');

  }

  // Caso contrário,
  // retorna para o tema claro.
  else {

    document.body.classList.remove('dark');

    localStorage.setItem(chaveTema, 'light');

  }

};


// ======================================================
// SISTEMA DE NOTIFICAÇÕES
// ======================================================

// Exibe mensagens de sucesso,
// erro ou informação na parte superior da tela.
function notificar(msg, tipo = 'info') {

  // Localiza a caixa de notificação.
  const n = document.getElementById('notificacao');

  // Define o texto da mensagem.
  n.textContent = msg;

  // Define o estilo da notificação
  // conforme o tipo recebido.
  n.className = `notificacao show ${tipo}`;

  // Após três segundos,
  // a notificação desaparece automaticamente.
  setTimeout(() => {

    n.classList.remove('show');

  }, 3000);

}


// ======================================================
// BACKUP DO SISTEMA
// ======================================================

// Função chamada ao clicar no botão Backup.
async function backup() {

  // Neste momento apenas informa
  // que o processo foi iniciado.
  notificar('Backup iniciado...');

}


// ======================================================
// RESET DO SISTEMA
// ======================================================

// Remove todos os cadastros do sistema.
async function resetar() {

  // Exibe uma janela solicitando confirmação.
  const ok = await confirmar(

    'Reset do sistema',

    'Todas as empresas serão apagadas. Deseja realmente continuar?'

  );

  // Caso o usuário cancele,
  // nenhuma ação será realizada.
  if (!ok) return;

  try {

    // Envia uma solicitação ao backend
    // para executar o reset.
    const res = await fetch(

      'http://localhost:3000/admin/reset',

      {
        method: 'POST'
      }

    );

    // Converte a resposta em JSON.
    const json = await res.json();

    // Caso ocorra erro,
    // interrompe a execução.
    if (!res.ok)
      throw new Error(json.erro || 'Erro ao resetar');

    // Informa sucesso ao usuário.
    notificar('Sistema resetado com sucesso');

    // Atualiza automaticamente
    // as listas exibidas na tela.
    carregarEmpresas();

    carregarFisica();

  }

  catch (err) {

    console.error(err);

    notificar(

      'Erro ao resetar sistema',

      'erro'

    );

  }

}