// ===================================================================
// CONFIGURAÇÃO DO PM2
// ===================================================================
//
// Este arquivo é utilizado pelo PM2.
//
// O PM2 é um gerenciador de processos para aplicações Node.js.
//
// Sua função é:
//
// • Iniciar a aplicação.
// • Reiniciar automaticamente em caso de erro.
// • Controlar memória.
// • Salvar logs.
// • Facilitar a execução em produção.
module.exports = {

  // ===============================================================
  // LISTA DE APLICAÇÕES
  // ===============================================================

  // O PM2 permite controlar várias aplicações
  // ao mesmo tempo.
  //
  // Neste projeto existe apenas uma aplicação.
  apps: [

    {

      // -----------------------------------------------------------
      // NOME DA APLICAÇÃO
      // -----------------------------------------------------------

      // Nome que aparecerá nos comandos do PM2.
      //
      // Exemplo:
      //
      // pm2 list
      //
      // exibirá:
      //
      // api-contabilidade
      name: 'api-contabilidade',


      // -----------------------------------------------------------
      // ARQUIVO PRINCIPAL DA APLICAÇÃO
      // -----------------------------------------------------------

      // Define qual arquivo será executado
      // quando o PM2 iniciar o sistema.
      //
      // Neste caso,
      // o servidor começa pelo arquivo:
      //
      // src/server.js
      script: 'src/server.js',


      // -----------------------------------------------------------
      // MODO DE EXECUÇÃO
      // -----------------------------------------------------------

      // "fork"
      //
      // Executa apenas um processo Node.js.
      //
      // É indicado para aplicações pequenas
      // ou ambientes de desenvolvimento.
      //
      // Outro modo existente é:
      //
      // cluster
      //
      // que cria vários processos utilizando
      // todos os núcleos do processador.
      exec_mode: 'fork',


      // -----------------------------------------------------------
      // QUANTIDADE DE INSTÂNCIAS
      // -----------------------------------------------------------

      // Define quantas cópias da aplicação
      // ficarão executando simultaneamente.
      //
      // Valor atual:
      //
      // 1
      //
      // No futuro esse valor pode ser aumentado
      // para melhorar o desempenho.
      instances: 1,


      // -----------------------------------------------------------
      // REINÍCIO AUTOMÁTICO
      // -----------------------------------------------------------

      // Caso a aplicação apresente algum erro
      // e seja encerrada inesperadamente,
      // o PM2 iniciará o servidor novamente.
      autorestart: true,


      // -----------------------------------------------------------
      // MONITORAMENTO DE ARQUIVOS
      // -----------------------------------------------------------

      // watch: false
      //
      // Significa que o PM2 NÃO ficará observando
      // alterações nos arquivos do projeto.
      //
      // Caso fosse "true",
      // qualquer alteração salvaria automaticamente
      // e reiniciaria o servidor.
      watch: false,


      // -----------------------------------------------------------
      // LIMITE DE MEMÓRIA
      // -----------------------------------------------------------

      // Se a aplicação consumir mais de 300 MB de RAM,
      // o PM2 reiniciará automaticamente o processo.
      //
      // Isso ajuda a evitar problemas causados
      // por vazamentos de memória (Memory Leak).
      max_memory_restart: '300M',


      // -----------------------------------------------------------
      // DESATIVA A COLETA DE MÉTRICAS
      // -----------------------------------------------------------

      // Impede que o PM2 utilize ferramentas de coleta
      // de métricas do sistema operacional.
      //
      // No Windows isso evita chamadas ao "wmic",
      // reduzindo mensagens de erro ou incompatibilidades.
      disable_metrics: true,


      // ===========================================================
      // VARIÁVEIS DE AMBIENTE (DESENVOLVIMENTO)
      // ===========================================================

      env: {

        // Informa que o sistema está rodando
        // em ambiente de desenvolvimento.
        NODE_ENV: 'development',

        // Porta utilizada pelo servidor.
        PORT: 3000

      },


      // ===========================================================
      // VARIÁVEIS DE AMBIENTE (PRODUÇÃO)
      // ===========================================================

      // Essas configurações serão utilizadas
      // quando a aplicação for iniciada em modo produção.
      env_production: {

        // Ambiente de produção.
        NODE_ENV: 'production',

        // Porta utilizada em produção.
        PORT: 3000

      },


      // ===========================================================
      // ARQUIVOS DE LOG
      // ===========================================================

      // Arquivo onde serão gravados
      // apenas os erros da aplicação.
      error_file: './logs/err.log',


      // Arquivo onde serão gravadas
      // as mensagens comuns da aplicação.
      out_file: './logs/out.log',


      // Arquivo contendo todos os logs,
      // reunindo mensagens normais e erros.
      log_file: './logs/combined.log',


      // ===========================================================
      // DATA E HORA NOS LOGS
      // ===========================================================

      // Quando definido como true,
      // o PM2 adiciona automaticamente
      // a data e a hora em cada registro do log.
      //
      // Isso facilita identificar exatamente
      // quando cada evento aconteceu.
      time: true

    }

  ]

};