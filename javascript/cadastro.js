toggleBtn = document.getElementById('toggleMenu');
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