/* =====================================================
CONFIGURAÇÃO DO USUÁRIO
===================================================== */

// Obtém o nome do usuário que está logado no sistema.
const usuario = sessionStorage.getItem('usuario')

// Recupera o tema salvo para esse usuário no navegador.
const tema = localStorage.getItem('tema_' + usuario)

// Caso o tema salvo seja escuro,
// adiciona a classe "dark" ao body da página.
if (tema === 'dark') {
  document.body.classList.add('dark')
}

// Verifica se existe um usuário logado.
// Caso contrário, redireciona para a tela de login.
if (!sessionStorage.getItem("usuario")) {
  window.location.href = "login.html"
}

/* =====================================================
VARIÁVEIS GLOBAIS
===================================================== */

// Quantidade de arquivos XML processados.
let arquivosProcessados = 0

// Soma total dos valores encontrados nos XMLs.
let totalValor = 0

// Armazena todos os dados extraídos dos arquivos.
let dadosProcessados = []

// Guarda o HTML gerado para exibição e impressão.
let htmlResultado = ""

/* =====================================================
NOTIFICAÇÕES
===================================================== */

// Exibe mensagens de sucesso, erro ou informação.
function notificar(msg, tipo = 'info'){

  // Localiza o elemento responsável pelas notificações.
  const n = document.getElementById('notificacao')

  // Caso ele não exista, encerra a função.
  if(!n) return

  // Define a mensagem exibida.
  n.textContent = msg

  // Define o estilo da notificação.
  n.className = `notificacao show ${tipo}`

  // Remove automaticamente após 3 segundos.
  setTimeout(()=> n.classList.remove('show'),3000)
}

/* =====================================================
EXIBE O USUÁRIO NO TOPO DA PÁGINA
===================================================== */

// Localiza o elemento do cabeçalho.
const topo = document.getElementById('usuarioTopo')

// Caso exista, mostra o nome do usuário logado.
if(topo){
  topo.textContent = `Usuário: ${usuario}`
}

/* =====================================================
FUNÇÕES AUXILIARES (HELPERS)
===================================================== */

// Converte um valor de texto para número.
// Exemplo:
// "1.500,30" -> 1500.30
function parseValor(v){

  // Caso o valor esteja vazio, retorna zero.
  if(!v) return 0

  // Remove separador de milhar e converte
  // a vírgula decimal para ponto.
  const num = parseFloat(
    String(v)
      .replace(/\./g,"")
      .replace(",", ".")
  )

  // Caso a conversão seja inválida,
  // retorna zero.
  return isNaN(num) ? 0 : num
}

// Converte um número para o formato monetário brasileiro.
// Exemplo:
// 1500 -> R$ 1.500,00
function formatarMoeda(v){

  // Caso o valor seja inválido,
  // retorna R$ 0,00.
  if(v === null || v === undefined || isNaN(v))
    return "R$ 0,00"

  // Formata o número como moeda brasileira.
  return Number(v).toLocaleString(
    "pt-BR",
    {
      style:"currency",
      currency:"BRL"
    }
  )
}

// Procura e retorna o primeiro elemento XML
// correspondente à tag informada.
function getNode(xml, tag){
  return xml.getElementsByTagName(tag)?.[0] || null
}

// Retorna todos os elementos encontrados
// para uma determinada tag.
function getNodes(xml, tag){
  return Array.from(xml.getElementsByTagName(tag) || [])
}

// Obtém o valor de um atributo de um nó XML.
// Caso o nó não exista, retorna zero.
function safeAttr(node, attr){

  if(!node) return 0

  return parseValor(node.getAttribute(attr))
}

// Procura uma tag utilizando o localName.
// Essa função é útil quando o XML possui namespaces.
function getByTag(xml, tag){

  return Array.from(xml.getElementsByTagName("*"))
    .filter(n => n.localName === tag)
}

/* =====================================================
LEITURA PRINCIPAL DOS XMLS
===================================================== */

// Responsável por iniciar a leitura
// dos arquivos XML selecionados.
function lerXML(){

  // Obtém o campo de seleção de arquivos.
  const input = document.getElementById("xmlFile")

  // Caso nenhum arquivo tenha sido escolhido,
  // exibe uma mensagem e encerra a função.
  if(!input.files.length){
    notificar("Selecione um XML","erro")
    return
  }

  // Limpa todos os dados anteriores.
  resetar()

  // Percorre todos os arquivos selecionados.
  Array.from(input.files).forEach(file=>{

    // Cria um leitor para o arquivo.
    const reader = new FileReader()

    // Executa quando o arquivo terminar de ser lido.
    reader.onload = e => {

      // Converte o conteúdo em um documento XML.
      const xml = new DOMParser().parseFromString(
        e.target.result,
        "text/xml"
      )

      // Extrai todas as informações do XML.
      const dados = extrairIRPF(xml, file.name)

      // Armazena os dados extraídos.
      dadosProcessados.push(dados)

      // Exibe o resultado na tela.
      renderCompleto(dados)

      // Soma o valor total encontrado.
      totalValor += dados.total

      // Atualiza os totais exibidos na página.
      finalizar()
    }

    // Inicia a leitura do arquivo como texto.
    reader.readAsText(file)
  })
}

/* =====================================================
FORMATAÇÃO DE DATA
===================================================== */

// Converte datas do formato 01012026
// para 01/01/2026.
function formatarData(data){

  // Caso a data esteja vazia,
  // retorna apenas um hífen.
  if(!data || data === "-") return "-"

  // Caso já esteja formatada,
  // retorna a própria data.
  if(data.includes("/")) return data

  // Caso possua oito caracteres,
  // monta a data no padrão brasileiro.
  if(data.length === 8){

    return `${data.substring(0,2)}/${data.substring(2,4)}/${data.substring(4,8)}`
  }

  // Caso não corresponda aos formatos esperados,
  // retorna o valor original.
  return data
}

/* =====================================================
SOMA DOS ITENS DO XML
===================================================== */

// Soma automaticamente os valores
// dos campos informados.
function somarItens(pai, campos){

  // Obtém todos os elementos <item>
  // existentes dentro do nó informado.
  const itens = Array.from(pai.children)
    .filter(c => c.tagName === "item")

  // Caso não existam itens,
  // utiliza os atributos diretamente do elemento pai.
  if(itens.length === 0){

    return Object.fromEntries(

      campos.map(c => [
        c,
        safeAttr(pai, c)
      ])

    )
  }

  // Caso existam vários itens,
  // soma cada campo individualmente.
  return itens.reduce((acc, item) => {

    campos.forEach(c => acc[c] += safeAttr(item, c))

    return acc

  }, Object.fromEntries(
      campos.map(c => [c, 0])
  ))
}
/* =====================================================
EXTRAÇÃO PRINCIPAL
===================================================== */

/*
  Função responsável por reunir todas as informações da declaração.

  Ela chama várias funções menores, cada uma especializada em
  extrair uma parte específica do XML (identificação, rendimentos,
  bens, dívidas, etc.).

  Depois de coletar tudo, calcula o valor total dos rendimentos
  e devolve um único objeto contendo todos os dados processados.
*/
function extrairIRPF(xml, nomeArquivo){

  // Extrai os dados de identificação do contribuinte.
  const identificacao = extrairIdentificacao(xml)

  // Extrai os rendimentos recebidos de Pessoas Jurídicas.
  const rendPJ = extrairRendPJ(xml)

  // Extrai os rendimentos recebidos de Pessoas Físicas.
  const rendPF = extrairRendPF(xml)

  // Extrai os rendimentos isentos ou não tributáveis.
  const rendIsentos = extrairRendIsentos(xml)

  // Extrai os rendimentos sujeitos à tributação exclusiva.
  const rendTribExclusiva = extrairRendTribExclusiva(xml)

  // Extrai informações sobre imposto pago.
  const impostoPago = extrairImpostoPago(xml)

  // Extrai pagamentos realizados pelo contribuinte.
  const pagamentos = extrairPagamentos(xml)

  // Extrai informações de doações.
  const doacoes = extrairDoacoes(xml)

  // Extrai a relação de bens declarados.
  const bens = extrairBens(xml)

  // Extrai a relação de dívidas declaradas.
  const dividas = extrairDividas(xml)

  // Extrai informações de doações eleitorais.
  const doacoesEleitorais = extrairDoacoesEleitorais(xml)

  // Extrai informações da atividade rural.
  const atividadeRural = extrairAtividadeRural(xml)

  // Extrai rendimentos recebidos acumuladamente.
  const rendAcm = extrairRendAcm(xml)

  // Extrai informações sobre exigibilidade suspensa.
  const exigibilidade = extrairExigibilidade(xml)

  /*
    Calcula o total geral dos rendimentos da declaração.

    O cálculo soma:
      - Rendimentos de Pessoa Jurídica (titular e dependentes)
      - Rendimentos de Pessoa Física (titular e dependentes)
      - Rendimentos Isentos
      - Rendimentos com Tributação Exclusiva
  */
  const total =
    rendPJ.titular.rendRecebidoPJ +
    rendPJ.dependente.rendRecebidoPJ +
    rendPF.titular.totalPessoaFisica +
    rendPF.dependente.totalPessoaFisica +
    rendIsentos.total +
    rendTribExclusiva.total

  /*
    Retorna um único objeto contendo todas as informações
    extraídas do XML.
  */
  return {
    arquivo: nomeArquivo,
    identificacao,
    rendPJ,
    rendPF,
    rendIsentos,
    rendTribExclusiva,
    impostoPago,
    pagamentos,
    doacoes,
    bens,
    dividas,
    doacoesEleitorais,
    atividadeRural,
    rendAcm,
    exigibilidade,
    total
  }
}

/* =====================================================
IDENTIFICAÇÃO
===================================================== */

/*
  Extrai os dados básicos do contribuinte.

  Essas informações normalmente aparecem no início do XML,
  contendo identificação da declaração e dados pessoais.
*/
function extrairIdentificacao(xml){

  // Localiza a tag de identificação da declaração.
  const identificador = xml.getElementsByTagName("identificadorDeclaracao")[0]

  // Localiza a tag que contém os dados do contribuinte.
  const contribuinte = xml.getElementsByTagName("contribuinte")[0]

  /*
    Retorna um objeto com:

    - Nome
    - CPF
    - UF
    - Data de nascimento

    Caso algum dado não exista no XML,
    retorna "-" para evitar erros.
  */
  return {
    nome: identificador?.getAttribute("nome") || "-",
    cpf: identificador?.getAttribute("cpf") || "-",
    uf: contribuinte?.getAttribute("uf") || "-",
    dataNascimento: contribuinte?.getAttribute("dataNascimento") || "-"
  }
}

/* =====================================================
REND PJ
===================================================== */

/*
  Extrai os rendimentos provenientes de Pessoas Jurídicas.

  Os dados são separados entre:
    - Titular
    - Dependentes
*/
function extrairRendPJ(xml){

  /*
    Função auxiliar que recebe um nó do XML e
    converte todos os atributos em números.
  */
  const ler = node => ({

    // Total recebido da Pessoa Jurídica.
    rendRecebidoPJ: parseValor(node?.getAttribute("totaisRendRecebidoPJ")),

    // Contribuição previdenciária oficial.
    contribuicaoPrev: parseValor(node?.getAttribute("totaisContribuicaoPrevOficial")),

    // Imposto retido na fonte.
    impostoRetido: parseValor(node?.getAttribute("totaisImpostoRetidoFonte")),

    // Valor recebido de 13º salário.
    decimoTerceiro: parseValor(node?.getAttribute("totaisDecimoTerceiro")),

    // IRRF descontado sobre o 13º.
    irrfDecimoTerceiro: parseValor(node?.getAttribute("totaisIRRFDecimoTerceiro"))
  })

  /*
    Lê separadamente os rendimentos do titular
    e dos dependentes.
  */
  return {
    titular: ler(xml.getElementsByTagName("colecaoRendPJTitular")[0]),
    dependente: ler(xml.getElementsByTagName("colecaoRendPJDependente")[0])
  }
}

/* =====================================================
REND PF
===================================================== */

/*
  Extrai os rendimentos provenientes de Pessoas Físicas.

  Assim como na função anterior,
  os dados são separados entre titular e dependentes.
*/
function extrairRendPF(xml){

  /*
    Lê todos os atributos da tag recebida
    e converte para números.
  */
  const ler = node => ({

    // Total geral recebido de Pessoa Física.
    totalPessoaFisica: parseValor(node?.getAttribute("totalPessoaFisica")),

    // Total recebido com aluguel.
    totalAlugueis: parseValor(node?.getAttribute("totalAlugueis")),

    // Outros rendimentos.
    totalOutros: parseValor(node?.getAttribute("totalOutros")),

    // Rendimentos recebidos do exterior.
    totalExterior: parseValor(node?.getAttribute("totalExterior")),

    // Previdência oficial.
    totalPrevidencia: parseValor(node?.getAttribute("totalPrevidencia")),

    // Número de dependentes.
    totalNumDependentes: parseValor(node?.getAttribute("totalNumDependentes")),

    // Valor de pensão alimentícia.
    totalPensao: parseValor(node?.getAttribute("totalPensao")),

    // Livro Caixa.
    totalLivroCaixa: parseValor(node?.getAttribute("totalLivroCaixa")),

    // DARF pago.
    totalDarfPago: parseValor(node?.getAttribute("totalDarfPago"))
  })

  return {
    titular: ler(xml.getElementsByTagName("rendPFTitular")[0]),
    dependente: ler(xml.getElementsByTagName("rendPFDependente")[0])
  }
}

/* =====================================================
EXIGIBILIDADE SUSPENSA
===================================================== */

/*
  Extrai informações relacionadas a rendimentos
  cuja exigibilidade está suspensa judicialmente.
*/
function extrairExigibilidade(xml){

  /*
    Lê os valores da tag recebida.
  */
  const ler = node => ({

    // Rendimentos com exigibilidade suspensa.
    rendimentoTribExigibilidade:
      parseValor(node?.getAttribute("totaisRendPJExigSuspensa")),

    // Valor de depósito judicial.
    depositoJudici:
      parseValor(node?.getAttribute("totaisDepositoJudicial"))
  })

  return {
    titular: ler(xml.getElementsByTagName("colecaoRendPJComExigibilidadeTitular")[0]),
    dependente: ler(xml.getElementsByTagName("colecaoRendPJComExigibilidadeDependente")[0])
  }
}

/* =====================================================
RENDIMENTOS ISENTOS
===================================================== */

/*
  Extrai os rendimentos isentos ou não tributáveis.
*/
function extrairRendIsentos(xml){

  // Localiza a tag correspondente.
  const node = xml.getElementsByTagName("rendIsentos")[0]

  // Retorna os valores encontrados.
  return {

    // Lucros recebidos.
    lucroRecebido:
      parseValor(node?.getAttribute("lucroRecebido")),

    // Total geral dos rendimentos isentos.
    total:
      parseValor(node?.getAttribute("total"))
  }
}

/* =====================================================
TRIBUTAÇÃO EXCLUSIVA
===================================================== */

/*
  Extrai o total dos rendimentos sujeitos
  à tributação exclusiva ou definitiva.
*/
function extrairRendTribExclusiva(xml){

  // Localiza a tag correspondente.
  const node = xml.getElementsByTagName("rendTributacaoExclusiva")[0]

  // Retorna apenas o valor total.
  return {
    total: parseValor(node?.getAttribute("total"))
  }
}
/* =====================================================
IMPOSTO
===================================================== */

/*
  Extrai todas as informações relacionadas aos impostos pagos.

  A declaração pode possuir uma ou mais tags "impostoPago",
  e cada uma delas pode conter vários itens internos.

  Esta função percorre todas essas informações e soma
  todos os valores encontrados para gerar um total geral.
*/
function extrairImpostoPago(xml){

  // Localiza todas as tags "impostoPago" existentes no XML.
  const nodes = xml.getElementsByTagName("impostoPago")

  // Variável responsável por acumular o valor total.
  let total = 0

  // Percorre cada bloco de imposto encontrado.
  for(let i = 0; i < nodes.length; i++){

    const node = nodes[i]

    // Soma os valores que estão diretamente na tag.
    total += safeAttr(node,"impostoComplementar")
    total += safeAttr(node,"impostoPagoExterior")
    total += safeAttr(node,"impostoDevidoComRendExterior")
    total += safeAttr(node,"impostoDevidoSemRendExterior")
    total += safeAttr(node,"limiteImpPagoExterior")
    total += safeAttr(node,"impostoRetidoFonte")
    total += safeAttr(node,"impostoRetidoFonteTitular")
    total += safeAttr(node,"impostoRetidoFonteDependentes")
    total += safeAttr(node,"carneLeaoTitular")
    total += safeAttr(node,"carneLeaoDependentes")

    // Procura itens internos dentro da tag.
    const itens = node.getElementsByTagName("item")

    // Percorre todos os itens encontrados.
    for(let j = 0; j < itens.length; j++){

      // Soma também os valores existentes dentro de cada item.
      total += safeAttr(itens[j],"impostoComplementar")
      total += safeAttr(itens[j],"impostoPagoExterior")
      total += safeAttr(itens[j],"impostoDevidoComRendExterior")
      total += safeAttr(itens[j],"impostoDevidoSemRendExterior")
      total += safeAttr(itens[j],"limiteImpPagoExterior")
      total += safeAttr(itens[j],"impostoRetidoFonte")
      total += safeAttr(itens[j],"impostoRetidoFonteTitular")
      total += safeAttr(itens[j],"impostoRetidoFonteDependentes")
      total += safeAttr(itens[j],"carneLeaoTitular")
      total += safeAttr(itens[j],"carneLeaoDependentes")
    }
  }

  // Retorna o valor total dos impostos encontrados.
  return {
    Total: total
  }
}

/* =====================================================
RENDIMENTOS ACUMULADOS
===================================================== */

/*
  Extrai os Rendimentos Recebidos Acumuladamente (RRA).

  Esses rendimentos são separados entre titular
  e dependentes.
*/
function extrairRendAcm(xml){

  /*
    Função auxiliar responsável por ler uma tag
    específica e somar todos os seus valores.
  */
  function extrair(tag){

    // Localiza todas as ocorrências da tag informada.
    const nodes = xml.getElementsByTagName(tag)

    /*
      Objeto que armazenará os totais encontrados.
    */
    let total = {
      rendTribAcm: 0,
      contribuicaoPrevAcm: 0,
      pensaoAlimen: 0,
      impostoRetido: 0
    }

    // Percorre cada ocorrência da tag.
    for(let i = 0; i < nodes.length; i++){

      const node = nodes[i]

      // Soma os atributos existentes diretamente na tag.
      total.rendTribAcm += safeAttr(node,"totaisRendRecebidos")
      total.contribuicaoPrevAcm += safeAttr(node,"totaisContribuicaoPrevOficial")
      total.pensaoAlimen += safeAttr(node,"totaisPensaoAlimenticia")
      total.impostoRetido += safeAttr(node,"totaisImpostoRetidoFonte")

      // Procura itens internos.
      const itens = node.getElementsByTagName("item")

      // Soma os valores de todos os itens encontrados.
      for(let j = 0; j < itens.length; j++){
        total.rendTribAcm += safeAttr(itens[j],"totaisRendRecebidos")
        total.contribuicaoPrevAcm += safeAttr(itens[j],"totaisContribuicaoPrevOficial")
        total.pensaoAlimen += safeAttr(itens[j],"totaisPensaoAlimenticia")
        total.impostoRetido += safeAttr(itens[j],"totaisImpostoRetidoFonte")
      }
    }

    // Retorna os totais encontrados.
    return total
  }

  /*
    Retorna separadamente os rendimentos
    do titular e dos dependentes.
  */
  return {
    titular: extrair("colecaoRendAcmTitular"),
    dependente: extrair("colecaoRendAcmDependente")
  }
}

/* =====================================================
PAGAMENTOS
===================================================== */

/*
  Extrai todos os pagamentos realizados pelo contribuinte.

  Também calcula:
    - Total pago
    - Parte não dedutível
    - Parte dedutível
*/
function extrairPagamentos(xml){

  // Localiza a lista de pagamentos.
  const lista = getNode(xml,"pagamentos")

  // Obtém todos os itens existentes na lista.
  const itens = lista ? Array.from(lista.getElementsByTagName("item")) : []

  // Variáveis acumuladoras.
  let totalValorPago = 0
  let totalParcelaNaoDedutivel = 0

  // Percorre todos os pagamentos.
  itens.forEach(n => {

    // Soma o valor pago.
    totalValorPago += safeAttr(n,"valorPago")

    // Soma a parcela que não pode ser deduzida.
    totalParcelaNaoDedutivel += safeAttr(
      n,
      "parcelaNaoDedutivel"
    )
  })

  /*
    Retorna os totais calculados.
  */
  return {
    totalValorPago,
    totalParcelaNaoDedutivel,

    // Valor dedutível = Valor pago - Parcela não dedutível.
    totalDedutivel:
      totalValorPago - totalParcelaNaoDedutivel
  }
}

/* =====================================================
DOAÇÕES
===================================================== */

/*
  Extrai todas as doações declaradas.

  O funcionamento é praticamente igual ao da função
  de pagamentos.
*/
function extrairDoacoes(xml){

  // Localiza a lista de doações.
  const lista = getNode(xml,"doacoes")

  // Obtém todos os itens existentes.
  const itens = lista ? Array.from(lista.getElementsByTagName("item")) : []

  // Variáveis acumuladoras.
  let totalValorPago = 0
  let totalParcelaNaoDedutivel = 0

  // Percorre cada doação.
  itens.forEach(n => {

    // Soma o valor da doação.
    totalValorPago += safeAttr(n,"valorPago")

    // Soma a parcela não dedutível.
    totalParcelaNaoDedutivel += safeAttr(
      n,
      "parcelaNaoDedutivel"
    )
  })

  /*
    Retorna os totais das doações.
  */
  return {
    totalValorPago,
    totalParcelaNaoDedutivel,

    // Calcula quanto pode ser deduzido.
    totalDedutivel:
      totalValorPago - totalParcelaNaoDedutivel
  }
}
/* =====================================================
DEMAIS INFORMAÇÕES
===================================================== */

/*
  Extrai os valores referentes aos bens declarados.

  A declaração informa o patrimônio do contribuinte
  no exercício anterior e no exercício atual.
*/
function extrairBens(xml){

  // Localiza a tag "bens" dentro do XML.
  const node = xml.getElementsByTagName("bens")[0]

  // Retorna os valores encontrados.
  return {

    // Total de bens no exercício anterior.
    totalExercicioAnterior:
      parseValor(node?.getAttribute("totalExercicioAnterior")),

    // Total de bens no exercício atual.
    totalExercicioAtual:
      parseValor(node?.getAttribute("totalExercicioAtual"))
  }
}

/*
  Extrai todas as informações referentes às dívidas
  declaradas pelo contribuinte.
*/
function extrairDividas(xml){

  // Localiza a tag "dividas".
  const node = xml.getElementsByTagName("dividas")[0]

  // Retorna os valores encontrados.
  return {

    // Total das dívidas no exercício anterior.
    totalExercicioAnterior:
      parseValor(node?.getAttribute("totalExercicioAnterior")),

    // Total das dívidas no exercício atual.
    totalExercicioAtual:
      parseValor(node?.getAttribute("totalExercicioAtual")),

    // Total pago durante o ano.
    totalPgtoAnual:
      parseValor(node?.getAttribute("totalPgtoAnual"))
  }
}

/*
  Extrai o valor das doações eleitorais
  declaradas pelo contribuinte.
*/
function extrairDoacoesEleitorais(xml){

  // Localiza a tag correspondente.
  const node = xml.getElementsByTagName("doacoesEleitorais")[0]

  // Retorna o total das doações.
  return {
    totalDoacoes:
      parseValor(node?.getAttribute("totalDoacoes"))
  }
}

/*
  Extrai os dados da atividade rural.

  Também calcula automaticamente:
    - Resultado das receitas.
    - Resultado das dívidas.
*/
function extrairAtividadeRural(xml){

  // Localiza a tag principal da atividade rural.
  const node = getNode(xml,"atividadeRural")

  /*
    Caso a declaração não possua atividade rural,
    retorna valores zerados.
  */
  if(!node){
    return {
      resultadoReceita: 0,
      resultadoDividas: 0
    }
  }

  // Localiza os blocos de receitas/despesas.
  const receitas = node.getElementsByTagName("receitasDespesas")[0]

  // Localiza o bloco de dívidas.
  const dividas = node.getElementsByTagName("dividas")[0]

  // Obtém o total das receitas.
  const totalReceita = safeAttr(receitas,"totalReceita")

  // Obtém o total das despesas.
  const totalDespesas = safeAttr(receitas,"totalDespesas")

  // Obtém o total das dívidas do exercício anterior.
  const totalAnterior = safeAttr(dividas,"totalAnterior")

  // Obtém o total das dívidas do exercício atual.
  const totalAtual = safeAttr(dividas,"totalAtual")

  /*
    Calcula os resultados finais.

    Receita líquida = Receita - Despesas

    Resultado das dívidas = Atual - Anterior
  */
  return {
    resultadoReceita: totalReceita - totalDespesas,
    resultadoDividas: totalAtual - totalAnterior
  }
}

/* =====================================================
RENDERIZAÇÃO FINAL
===================================================== */

/*
  Responsável por montar todo o relatório HTML
  exibido na tela após a leitura do XML.

  Recebe um objeto contendo todas as informações
  extraídas da declaração e cria dinamicamente
  cada seção do relatório.
*/
function renderCompleto(d){

  /*
    Adiciona um novo relatório ao HTML já existente.

    Cada XML processado gera um cartão completo
    contendo todas as informações da declaração.
  */
  htmlResultado += `
  
  <div class="relatorio-card tela">

    <div class="topo-relatorio">

      <!-- Área da logomarca -->
      <div class="topo-esquerda">
        <img src="../logo orcose.png" class="logo-relatorio">
      </div>

      <!-- Informações do contribuinte -->
      <div class="topo-direita">
        <h2>${d.identificacao.nome}</h2>

        <div class="info-relatorio">
          <span><b>CPF:</b> ${d.identificacao.cpf}</span>
          <span><b>UF:</b> ${d.identificacao.uf}</span>
          <span><b>Nascimento:</b> ${formatarData(d.identificacao.dataNascimento)}</span>
        </div>
      </div>

    </div>

    <!-- Cada linha abaixo gera automaticamente
         uma tabela contendo os dados daquela seção -->

    ${gerarTabelaTela("Rendimentos PJ - Titular", d.rendPJ.titular)}

    ${gerarTabelaTela("Rendimentos PJ - Dependente", d.rendPJ.dependente)}

    ${gerarTabelaTela("Rendimentos PF - Titular", d.rendPF.titular)}

    ${gerarTabelaTela("Rendimentos PF - Dependente", d.rendPF.dependente)}

    ${gerarTabelaTela("Isentos", d.rendIsentos)}

    ${gerarTabelaTela("Tributação Exclusiva", d.rendTribExclusiva)}

    ${gerarTabelaTela("Imposto Pago", d.impostoPago)}

    ${gerarTabelaTela("Pagamentos", d.pagamentos)}

    ${gerarTabelaTela("Doações", d.doacoes)}

    ${gerarTabelaTela("Bens", d.bens)}

    ${gerarTabelaTela("Dívidas", d.dividas)}

    ${gerarTabelaTela("Atividade Rural", d.atividadeRural)}

    ${gerarTabelaTela("Doações Eleitorais", d.doacoesEleitorais)}

    ${gerarTabelaTela("Exigibilidade Suspensa - Titular", d.exigibilidade.titular)}

    ${gerarTabelaTela("Exigibilidade Suspensa - Dependente", d.exigibilidade.dependente)}

    ${gerarTabelaTela("Rendimentos Acumulados - Titular", d.rendAcm.titular)}

    ${gerarTabelaTela("Rendimentos Acumulados - Dependente", d.rendAcm.dependente)}

  </div>
  `

  /*
    Atualiza o conteúdo da página exibindo
    todos os relatórios processados.
  */
  document.getElementById("resultadoXML").innerHTML = htmlResultado
}


/* =====================================================
CONTROLE
===================================================== */

/*
  Reinicia todas as variáveis utilizadas
  durante o processamento dos XMLs.

  Essa função é chamada antes de iniciar
  uma nova leitura.
*/
function resetar(){

  // Zera a quantidade de arquivos processados.
  arquivosProcessados = 0

  // Zera o valor total acumulado.
  totalValor = 0

  // Limpa o vetor de dados processados.
  dadosProcessados = []

  // Limpa todo o HTML gerado anteriormente.
  htmlResultado = ""
}

/*
  Finaliza o processamento de um XML.

  Atualiza os indicadores da tela,
  mostrando a quantidade de arquivos lidos
  e o valor total acumulado.
*/
function finalizar(){

  // Soma mais um arquivo processado.
  arquivosProcessados++

  // Atualiza o contador na tela.
  document.getElementById("totalNotas").textContent = arquivosProcessados

  // Atualiza o valor total formatado em Real.
  document.getElementById("valorTotal").textContent =
    formatarMoeda(totalValor)
}

/* =====================================================
EXPORTAR CSV
===================================================== */

/* =====================================================
EXPORTAR CSV / EXCEL
===================================================== */

/*
Esta função é responsável por gerar uma planilha (.CSV) com
as informações extraídas dos arquivos XML processados.

O arquivo CSV pode ser aberto normalmente pelo Microsoft Excel,
Google Planilhas ou qualquer outro programa de planilhas.

São exportados os principais dados do contribuinte e os
rendimentos provenientes de Pessoa Jurídica.
*/
function exportarExcel(){

  /*
  Antes de gerar a planilha, verifica se existe pelo menos um
  XML processado.

  Caso a lista esteja vazia, significa que o usuário ainda
  não selecionou nenhum arquivo ou não realizou a leitura dos
  XMLs. Nesse caso é exibida uma notificação e a função é encerrada.
  */
  if(dadosProcessados.length === 0){
    notificar("Nenhum XML processado","erro")
    return
  }

  /*
  Cria a primeira linha do arquivo CSV.

  Esta linha representa o cabeçalho da planilha, ou seja,
  o nome de cada coluna que será exibida quando o arquivo
  for aberto no Excel.
  */
  let csv = "Arquivo,Nome,CPF,UF,RendTitular,INSS_Titular,IRRF_Titular,13_Titular,IRRF13_Titular,RendDep,INSS_Dep,IRRF_Dep,13_Dep,IRRF13_Dep\n"

  /*
  Percorre todos os XMLs processados.

  Para cada declaração lida anteriormente, uma nova linha
  será adicionada ao arquivo CSV contendo suas informações.
  */
  dadosProcessados.forEach(d=>{

    /*
    Cria uma linha da planilha utilizando os dados da
    declaração atual.

    O método join(",") junta todas as informações separando
    cada uma por vírgula, formando corretamente uma linha
    do arquivo CSV.
    */
    csv += [
      d.arquivo,
      d.identificacao.nome,
      d.identificacao.cpf,
      d.identificacao.uf,

      d.rendPJ.titular.rendRecebidoPJ,
      d.rendPJ.titular.contribuicaoPrev,
      d.rendPJ.titular.impostoRetido,
      d.rendPJ.titular.decimoTerceiro,
      d.rendPJ.titular.irrfDecimoTerceiro,

      d.rendPJ.dependente.rendRecebidoPJ,
      d.rendPJ.dependente.contribuicaoPrev,
      d.rendPJ.dependente.impostoRetido,
      d.rendPJ.dependente.decimoTerceiro,
      d.rendPJ.dependente.irrfDecimoTerceiro

    // Finaliza a linha atual adicionando uma quebra de linha.
    ].join(",") + "\n"
  })

  /*
  Converte todo o conteúdo de texto do CSV em um Blob.

  Blob é um objeto utilizado pelo navegador para representar
  arquivos em memória antes que eles sejam baixados pelo usuário.
  */
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"})

  /*
  Cria um endereço temporário (URL) apontando para o arquivo
  que acabou de ser criado na memória do navegador.
  */
  const url = URL.createObjectURL(blob)

  /*
  Cria dinamicamente um elemento <a> (link).

  Esse link será utilizado apenas para iniciar automaticamente
  o download da planilha, sem necessidade de interação extra
  do usuário.
  */
  const a = document.createElement("a")

  // Define o endereço do arquivo que será baixado.
  a.href = url

  // Define o nome do arquivo que aparecerá para o usuário.
  a.download = "irpf_pj.csv"

  /*
  Simula um clique no link criado anteriormente.

  Esse clique faz o navegador iniciar imediatamente
  o download da planilha gerada.
  */
  a.click()

  // Informa ao usuário que a exportação foi concluída.
  notificar("Planilha exportada com sucesso","sucesso")
}

/* =====================================================
UPLOAD UI
===================================================== */

/*
Esta função é responsável por atualizar a interface
informando quais arquivos XML foram selecionados pelo usuário.

Ela não realiza nenhuma leitura dos arquivos.

Sua única finalidade é melhorar a experiência do usuário,
mostrando o nome do arquivo escolhido ou a quantidade de
arquivos selecionados.
*/
function mostrarArquivos(){

  /*
  Obtém o componente de seleção de arquivos (input type="file")
  existente na página.
  */
  const input = document.getElementById("xmlFile")

  /*
  Obtém o elemento responsável por exibir o nome dos arquivos
  selecionados ao usuário.
  */
  const label = document.getElementById("nomeArquivos")

  /*
  Caso apenas um arquivo tenha sido selecionado,
  exibe seu nome completo.
  */
  if(input.files.length === 1){

    label.textContent = input.files[0].name

  }else{

    /*
    Quando houver mais de um arquivo, ao invés de listar todos,
    é exibida apenas a quantidade de arquivos escolhidos.
    */
    label.textContent = input.files.length + " arquivos selecionados"
  }
}
/* =====================================================
IMPRIMIR RELATÓRIO
===================================================== */

/*
Esta função é responsável por gerar um relatório completo
em formato HTML contendo todas as informações dos XMLs
processados.

Após montar o relatório, ela abre uma nova janela do navegador
e envia automaticamente esse conteúdo para impressão.

O usuário poderá imprimir o documento ou salvá-lo em PDF,
dependendo das opções disponíveis no navegador.
*/
function imprimirRelatorio(){

  /*
  Antes de gerar o relatório, verifica se existe pelo menos
  um XML processado.

  Caso não exista nenhum arquivo carregado, uma mensagem é
  exibida ao usuário e a função é encerrada.
  */
  if(dadosProcessados.length === 0){
    notificar("Nenhum XML processado","erro")
    return
  }

  /*
  Cria uma variável que armazenará todo o código HTML
  da página que será impressa.

  Todo o relatório será montado dinamicamente dentro
  dessa variável.
  */
  let conteudo = `
  <html>
  <head>

    <!-- Define o título da página de impressão -->
    <title>Relatório IRPF</title>

    <style>

      /*
      A partir daqui são definidos todos os estilos
      (CSS) utilizados pelo relatório impresso.
      */

      /* Configuração geral da página */
      body{
        font-family: Arial, sans-serif;
        padding: 30px;
        color:#111;
        background:#fff;
      }

      /* Título principal */
      h1{
        text-align:center;
        margin-bottom:40px;
        color:#1e3a8a;
      }

      /*
      Cada declaração será exibida dentro de um cartão,
      facilitando a organização das informações.
      */
      .relatorio-card{
        border:1px solid #d1d5db;
        border-radius:10px;
        padding:20px;
        margin-bottom:30px;

        /*
        Evita que um cartão seja dividido entre duas páginas
        durante a impressão.
        */
        page-break-inside: avoid;
      }

      /* Cabeçalho de cada declaração */
      .topo{
        border-bottom:2px solid #2563eb;
        margin-bottom:15px;
        padding-bottom:10px;
      }

      .topo h2{
        margin:0;
        color:#1e3a8a;
      }

      /* Informações do contribuinte */
      .info{
        margin-top:8px;
        font-size:14px;
      }

      /* Títulos das seções */
      h3{
        margin-top:25px;
        background:#2563eb;
        color:#fff;
        padding:8px;
        border-radius:6px;
        font-size:15px;
      }

      /* Configuração das tabelas */
      table{
        width:100%;
        border-collapse:collapse;
        margin-top:10px;
        margin-bottom:15px;
      }

      /* Cabeçalho da tabela */
      th{
        background:#f3f4f6;
      }

      /* Células das tabelas */
      td,th{
        border:1px solid #d1d5db;
        padding:8px;
        font-size:13px;
      }

      /* Colunas de valores monetários */
      .valor{
        text-align:right;
        font-weight:bold;
      }

      /*
      Área onde será apresentado o valor total de todos
      os XMLs processados.
      */
      .total-geral{
        margin-top:40px;
        padding:20px;
        border:2px solid #2563eb;
        border-radius:10px;
        text-align:center;
      }

      .total-geral h2{
        margin:0;
      }

      /* Destaque do valor total */
      .valor-total{
        font-size:30px;
        color:#16a34a;
        font-weight:bold;
        margin-top:10px;
      }

      /*
      Estilos aplicados apenas durante a impressão.
      */
      @media print{

        /* Esconde botões caso existam na página */
        button{
          display:none;
        }

        /* Remove margens extras */
        body{
          padding:0;
        }
      }

    </style>
  </head>

  <body>
  `

  /*
  Percorre todos os XMLs processados.

  Para cada declaração é criado um cartão contendo
  todas as informações extraídas do arquivo.
  */
  dadosProcessados.forEach(d => {

    conteudo += `

    <div class="relatorio-card">

      <!-- Cabeçalho da declaração -->
      <div class="topo">

      <!-- Logo da empresa -->
      <img src="../logo orcose.png">

        <!-- Nome do contribuinte -->
        <h2>${d.identificacao.nome}</h2>

        <!-- Dados principais do contribuinte -->
        <div class="info">

          <b>CPF:</b> ${d.identificacao.cpf}

          <br>

          <b>UF:</b> ${d.identificacao.uf}

          <br>

          <b>Data Nascimento:</b> ${formatarData(d.identificacao.dataNascimento)}

        </div>
      </div>

      <!-- Cada chamada gera automaticamente uma tabela com os dados da seção correspondente -->

      ${gerarTabelaRelatorio("Rendimentos PJ - Titular", d.rendPJ.titular)}

      ${gerarTabelaRelatorio("Rendimentos PJ - Dependente", d.rendPJ.dependente)}

      ${gerarTabelaRelatorio("Rendimentos PF - Titular", d.rendPF.titular)}

      ${gerarTabelaRelatorio("Rendimentos PF - Dependente", d.rendPF.dependente)}

      ${gerarTabelaRelatorio("Isentos", d.rendIsentos)}

      ${gerarTabelaRelatorio("Tributação Exclusiva", d.rendTribExclusiva)}

      ${gerarTabelaRelatorio("Imposto Pago", d.impostoPago)}

      ${gerarTabelaRelatorio("Pagamentos", d.pagamentos)}

      ${gerarTabelaRelatorio("Doações", d.doacoes)}

      ${gerarTabelaRelatorio("Bens", d.bens)}

      ${gerarTabelaRelatorio("Dívidas", d.dividas)}

      ${gerarTabelaRelatorio("Atividade Rural", d.atividadeRural)}

      ${gerarTabelaRelatorio("Doações Eleitorais", d.doacoesEleitorais)}

      ${gerarTabelaRelatorio("Exigibilidade Suspensa - Titular", d.exigibilidade.titular)}

      ${gerarTabelaRelatorio("Exigibilidade Suspensa - Dependente", d.exigibilidade.dependente)}

      ${gerarTabelaRelatorio("Rendimentos Acumulados - Titular", d.rendAcm.titular)}

      ${gerarTabelaRelatorio("Rendimentos Acumulados - Dependente", d.rendAcm.dependente)}

    </div>
    `
  })

  /*
  Após listar todas as declarações, adiciona uma seção
  mostrando o valor total processado pelo sistema.
  */
  conteudo += `

    <div class="total-geral">

      <h2>TOTAL GERAL PROCESSADO</h2>

      <div class="valor-total">

        ${formatarMoeda(totalValor)}

      </div>

    </div>

  </body>
  </html>
  `

  /*
  Abre uma nova janela do navegador.

  Essa janela será utilizada exclusivamente para exibir
  o relatório antes da impressão.
  */
  const janela = window.open("", "_blank")

  /*
  Escreve todo o HTML montado anteriormente dentro
  da nova janela.
  */
  janela.document.write(conteudo)

  /*
  Finaliza o carregamento do documento HTML.
  */
  janela.document.close()

  /*
  Coloca o foco na nova janela para que ela fique
  ativa na tela.
  */
  janela.focus()

  /*
  Aguarda aproximadamente meio segundo para garantir
  que todo o conteúdo foi carregado e, em seguida,
  abre automaticamente a caixa de impressão.
  */
  setTimeout(() => {
    janela.print()
  }, 500)
}
/* =====================================================
GERAR TABELA RELATÓRIO
===================================================== */

/*
Esta função é responsável por criar automaticamente uma tabela
HTML que será utilizada no relatório de impressão.

Ela recebe dois parâmetros:

- titulo: nome da seção que será exibida (ex.: Rendimentos PJ).
- obj: objeto contendo os campos e seus respectivos valores.

Em vez de escrever manualmente cada linha da tabela,
a função percorre todas as propriedades do objeto e
gera a tabela dinamicamente.
*/
function gerarTabelaRelatorio(titulo, obj){

  /*
  Caso o objeto não exista (null ou undefined),
  retorna uma string vazia para evitar erros e
  impedir que uma tabela vazia seja exibida.
  */
  if(!obj) return ""

  /*
  Retorna um bloco HTML contendo:

  - O título da seção;
  - Uma tabela;
  - Uma linha para cada propriedade encontrada
    dentro do objeto recebido.
  */
  return `

    <!-- Título da seção -->
    <h3>${titulo}</h3>

    <table>

      <!-- Estrutura da tabela -->
      <tr>
      </tr>

      <!--
      Object.entries(obj) transforma o objeto em uma lista
      contendo pares (campo, valor).

      Exemplo:

      {
        imposto: 500,
        inss: 300
      }

      torna-se:

      [
        ["imposto",500],
        ["inss",300]
      ]

      Em seguida, o map percorre cada item criando
      automaticamente uma linha da tabela.
      -->
      ${Object.entries(obj).map(([k,v]) => `

        <tr>

          <!-- Nome do campo -->
          <td>${k}</td>

          <!-- Valor formatado em moeda -->
          <td class="valor">
            ${formatarMoeda(v)}
          </td>

        </tr>

      `).join("")}

    </table>
  `
}

/* =====================================================
GERAR TABELA PARA EXIBIÇÃO NA TELA
===================================================== */

/*
Esta função possui praticamente o mesmo objetivo da anterior.

A diferença é que ela gera uma tabela para ser exibida
na própria página do sistema, utilizando classes CSS
específicas da interface.

Ela também recebe:

- titulo: nome da seção.
- obj: objeto contendo os dados que serão exibidos.
*/
function gerarTabelaTela(titulo, obj){

  /*
  Caso não exista nenhum objeto recebido,
  não gera nenhuma tabela.
  */
  if(!obj) return ""

  /*
  Monta dinamicamente o bloco HTML que será
  exibido na tela do usuário.
  */
  return `

    <!-- Bloco completo da seção -->
    <div class="bloco-relatorio">

      <!-- Título -->
      <h3>${titulo}</h3>

      <!-- Tabela estilizada -->
      <table class="tabela-relatorio">

        <tbody>

          <!--
          Percorre todas as propriedades do objeto,
          criando uma linha para cada informação encontrada.
          -->
          ${Object.entries(obj).map(([k,v]) => `

            <tr>

              <!-- Nome do campo formatado -->
              <td class="campo-relatorio">

                ${formatarCampo(k)}

              </td>

              <!-- Valor convertido para moeda -->
              <td class="valor-relatorio">

                ${formatarMoeda(v)}

              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    </div>
  `
}
function voltar() {
  window.location.href = '../home/home.html';
}

/* =====================================================
FORMATAR NOME DOS CAMPOS
===================================================== */

/*
Esta função melhora a aparência dos nomes dos campos.

Os nomes vindos do JavaScript normalmente seguem o padrão
camelCase, que não é muito amigável para o usuário.

Exemplo:

rendRecebidoPJ

Após passar por esta função, será exibido como:

Rend Recebido P J

A função faz duas transformações:

1. Insere um espaço antes de cada letra maiúscula.
2. Deixa a primeira letra do texto em maiúsculo.
*/
function formatarCampo(texto){

  return texto

    /*
    Sempre que encontrar uma letra maiúscula,
    adiciona um espaço antes dela.
    */
    .replace(/([A-Z])/g, ' $1')

    /*
    Coloca a primeira letra da frase em maiúscula.
    */
    .replace(/^./, s => s.toUpperCase())
}