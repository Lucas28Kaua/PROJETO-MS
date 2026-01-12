const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');

toggleBtn.addEventListener('click', function () {
  sidebar.classList.toggle('aberto');
});

const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

if (menuToggle) {
  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('aberto');
    menuToggle.classList.toggle('ativo');
    overlay.classList.toggle('ativo');
  });

  // Fecha ao clicar no overlay
  overlay.addEventListener('click', function () {
    sidebar.classList.remove('aberto');
    menuToggle.classList.remove('ativo');
    overlay.classList.remove('ativo');
  });
}

const tipoBusca = window.document.getElementById('tipoBusca')
const campoSimples = window.document.getElementById('campoSimples')
const blocoEndereco = window.document.getElementById('blocoEndereco')
const botaoBuscar = window.document.getElementById('btnBuscar')
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
  }
  else if (tipoBusca.value === "cpf") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "CPF:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "000.000.000-00"
  }
  else if (tipoBusca.value === "dn") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "Data de nascimento:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "DD/MM/AAAA"
  }
  else {

    labelBusca.textContent = "Pesquisar"
  }
}



function buscar() {
  const telaRetornoConsulta = document.querySelector('.telaRetornoConsulta')
  const listaClientes = document.getElementById('listaClientes')
  const detalheCliente = document.getElementById('detalheCliente')
  telaRetornoConsulta.style.display = 'block';
  
  telaRetornoConsulta.style.display='block'
  
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