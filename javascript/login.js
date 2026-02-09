function mostrarFeedback(texto, tipo) {
    const box = document.getElementById('mensagem-feedback');
    box.innerText = texto;
    box.className = tipo; // 'sucesso' ou 'erro'
    box.style.display = 'block';
    box.style.opacity = '1';

    // Sumir depois de 3 segundos
    setTimeout(() => {
        box.style.opacity = '0';
        setTimeout(() => { box.style.display = 'none'; }, 500);
    }, 3000);
}

async function logar() {
    const email = window.document.getElementById('iuser').value;
    const senha = window.document.getElementById('isenha').value;
    const dominiosValidos = ['@gmail.com', '@hotmail.com', '@outlook.com', '@mscred.com'];
    const emailValido = dominiosValidos.some(dominio => email.toLowerCase().endsWith(dominio));

    // Substituímos os alerts por mostrarFeedback(texto, 'erro')
    if (!email || !senha) {
        mostrarFeedback('Preencha todos os campos!', 'erro');
        return;
    } 
    
    if (!emailValido) {
        mostrarFeedback('Digite um Email Válido!', 'erro');
        return;
    } 
    
    if (senha.length < 8) {
        mostrarFeedback('A senha deve ter pelo menos 8 dígitos!', 'erro');
        return;
    }

    const dados = {
        email: email,
        senha: senha
    };

    fetch("http://127.0.0.1:5000/login", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            // SALVANDO NO STORAGE
            localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
            localStorage.setItem('usuarioId', data.usuario.id);
            localStorage.setItem('usuarioNome', data.usuario.nome);

            // CORREÇÃO AQUI: Usamos 'data.usuario.nome' em vez de 'resultado'
            mostrarFeedback(`Bem-vindo, ${data.usuario.nome}! Redirecionando...`, 'sucesso');

            setTimeout(() => {
                window.location.href = "telahome.html";
            }, 1500);
        } else {
            // Mensagem que vem da sua API (ex: "Senha incorreta")
            mostrarFeedback(data.mensagem || "Usuário ou senha incorretos!", "erro");
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        mostrarFeedback('Servidor fora do ar ou erro na rede.', 'erro');
    });
}