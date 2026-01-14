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


function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function limparMoeda(valor) {
    return Number(
        valor
            .replace(/\s/g, '')
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
    ) || 0;
}


document.querySelectorAll('.contagemProd input[type="text"]').forEach(input => {

    // ao focar → mostra número "cru"
    input.addEventListener('focus', () => {
        const numero = limparMoeda(input.value);
        input.value = numero ? numero.toString().replace('.', ',') : '';
    });

    // ao sair → formata como moeda
    input.addEventListener('blur', () => {
        if (input.value === '') return;

        const numero = limparMoeda(input.value);
        input.value = formatarMoeda(numero);
    });

});

function registrarProd(){
    return console.log('Botão clicado!')
}