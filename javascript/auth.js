(function() {
    const usuarioId = localStorage.getItem('usuarioId');

    // Se não existir o ID no localStorage, manda de volta pro index (login)
    if (!usuarioId) {
        // O alert aqui é opcional, mas ajuda a entender por que foi chutado
        console.alert("Acesso negado. Redirecionando para o login...");
        window.location.href = "/telalogin.html"; 
    }
})();