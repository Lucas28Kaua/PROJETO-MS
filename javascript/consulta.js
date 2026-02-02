toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

// Função para formatar CPF
function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // remove tudo que não é dígito
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // adiciona ponto após 3 dígitos
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // adiciona ponto   após mais 3
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // adiciona traço antes dos últimos 2
    return cpf;
}

// Função para formatar benefício
function formatarBeneficio(beneficio) {
    beneficio = beneficio.replace(/\D/g, ''); // remove não dígitos
    beneficio = beneficio.replace(/(\d{3})(\d)/, '$1.$2'); // XXX.
    beneficio = beneficio.replace(/(\d{3})(\d)/, '$1.$2'); // XXX.XXX.
    beneficio = beneficio.replace(/(\d{3})(\d{1})$/, '$1-$2'); // XXX.XXX.XXX-X
    return beneficio;
}

// Toggle do botão normal da sidebar (desktop)
if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('aberto');
    });
}

// Menu hambúrguer mobile
if (menuToggle) {
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('aberto');
        menuToggle.classList.toggle('ativo');
        if (overlay) overlay.classList.toggle('ativo');
    });
}

// Fecha ao clicar no overlay
if (overlay) {
    overlay.addEventListener('click', function () {
        sidebar.classList.remove('aberto');
        if (menuToggle) menuToggle.classList.remove('ativo');
        overlay.classList.remove('ativo');
    });
}

const tipoBusca = window.document.getElementById('tipoBusca')
const campoSimples = window.document.getElementById('campoSimples')
const blocoEndereco = window.document.getElementById('blocoEndereco')
const botaoBuscar = window.document.getElementById('btnBuscar')
const botaoLimpar = window.document.getElementById('btnLimpar')
const labelBusca = window.document.getElementById('labelBusca')
const buscaSimples = window.document.getElementById('buscaSimples')

function atualizarCampos() {

  campoSimples.style.display = "none";
  blocoEndereco.style.display = "none";
  botaoBuscar.style.display = "none";

  buscaSimples.value = ""
  buscaSimples.type = "text"
  buscaSimples.placeholder = ""
  buscaSimples.removeAttribute("inputmode")

  if (tipoBusca.value === "") {
    labelBusca.textContent = ""
    return;
  }


  if (tipoBusca.value === "endereco") {
    blocoEndereco.style.display = "grid";
    botaoBuscar.style.display = "block";
    labelBusca.textContent = "" // não usa label no endereço
    return
  }


  if (tipoBusca.value === "nome") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "Nome:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "Ex.: João da Silva"
  } else if (tipoBusca.value === "cpf") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "CPF:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "000.000.000-00"
    // Configurações específicas para CPF
    buscaSimples.setAttribute("inputmode", "numeric"); // Abre teclado numérico no celular
    buscaSimples.maxLength = 14; 

    // Aplica a sua função formatarCPF
    buscaSimples.oninput = function() {
      this.value = formatarCPF(this.value);
    };
  } else if (tipoBusca.value === "nbeneficio") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "N. Benefício:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "123.456.789-0"
    buscaSimples.setAttribute("inputmode", "numeric"); // Abre teclado numérico no celular
    buscaSimples.maxLength = 13; 

    // Aplica a sua função formatarCPF
    buscaSimples.oninput = function() {
      this.value = formatarBeneficio(this.value);
    };
  } else {

    labelBusca.textContent = "Pesquisar"
  }
}

const telaRetornoConsulta = document.querySelector('.telaRetornoConsulta')

function buscar() {
  
  const listaClientes = document.getElementById('listaClientes')
  const detalheCliente = document.getElementById('detalheCliente')
  telaRetornoConsulta.style.display = 'block';
  
  telaRetornoConsulta.style.display='block'
  botaoLimpar.style.display="block";
}

const telaDetalhesCliente = document.querySelector('.telaDetalhesCliente')

function limpar(){
  telaRetornoConsulta.style.display ="none"
  telaDetalhesCliente.style.display = "none"
  botaoLimpar.style.display="none"
  campoSimples.style.display="none"
  botaoBuscar.style.display="none"
  blocoEndereco.style.display="none"
}

const tbody=document.getElementById('tabelaClientes');

tbody.addEventListener('click', function (e) {
  const linha = e.target.closest('tr');
  if (!linha) return;
  console.log('linha Clicada');


  abrirDetalhesCliente();

});

function abrirDetalhesCliente() {
  document.querySelector('.telaRetornoConsulta').style.display = 'none';
  document.querySelector('.telaDetalhesCliente').style.display = 'block';
}


function abrefecha(botao, url = null){
  const bloco=botao.parentElement;
  const img=bloco.querySelector('.doc-imagem');

  if (url){
    img.src=url;
  }

  bloco.classList.toggle('ativo');
}