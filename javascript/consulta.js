const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('aberto');
});

const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('aberto');
        menuToggle.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
    });
    
    // Fecha ao clicar no overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('aberto');
        menuToggle.classList.remove('ativo');
        overlay.classList.remove('ativo');
    });
}

const tipoBusca=window.document.getElementById('tipoBusca')
const campoSimples=window.document.getElementById('campoSimples')
const blocoEndereco=window.document.getElementById('blocoEndereco')
const botaoBuscar=window.document.getElementById('btnBuscar')
const labelBusca=window.document.getElementById('labelBusca')

function atualizarCampos(){

    campoSimples.style.display = "none";
    blocoEndereco.style.display = "none";
    botaoBuscar.style.display = "none";

    if (tipoBusca.value === "") {
        labelBusca.textContent=""
    return;
  }


  if (tipoBusca.value === "endereco") {
    blocoEndereco.style.display = "block";
    botaoBuscar.style.display = "block";
    labelBusca.textContent = "" // não usa label no endereço
    return
  } 
  

  if (tipoBusca.value === "nome") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "Nome"
    botaoBuscar.style.display = "block"
  } 
  else if (tipoBusca.value === "cpf") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "CPF"
    botaoBuscar.style.display = "block"
  } 
  else if (tipoBusca.value === "dn") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "Data de nascimento"
    botaoBuscar.style.display = "block"
  } 
  else {
    
    labelBusca.textContent = "Pesquisar"
  }
}