(function() {
    const user = localStorage.getItem('usuarioId');
    if (!user) {
        window.location.href = 'telalogin.html';
    }
})();