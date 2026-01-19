const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

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

const conteudoClienteNovo=document.querySelector('.conteudoClienteNovo')
const conteudoClienteCarteira=document.querySelector('.conteudoClienteCarteira')

function abreFechaNovo(){
   console.log('clicado cliente novo!')
    conteudoClienteNovo.classList.toggle('aberto')
}

function abreFechaCarteira(){
   console.log('clicado cliente carteira!')
    conteudoClienteCarteira.classList.toggle('aberto')
}

const estados = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia",
  "Ceará", "Distrito Federal", "Espírito Santo", "Goiás",
  "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná",
  "Pernambuco", "Piauí", "Rio de Janeiro",
  "Rio Grande do Norte", "Rio Grande do Sul",
  "Rondônia", "Roraima", "Santa Catarina",
  "São Paulo", "Sergipe", "Tocantins"
]

const selectEstado = document.getElementById('estado')

if (selectEstado) {
  estados.forEach(estado => {
    const option = document.createElement('option')
    option.value = estado
    option.textContent = estado
    selectEstado.appendChild(option)
  })
}
