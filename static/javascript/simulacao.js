const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('overlay');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('aberto');
    toggleBtn.classList.toggle('ativo');
    overlay.classList.toggle('ativo');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('aberto');
    toggleBtn.classList.remove('ativo');
    overlay.classList.remove('ativo');
});