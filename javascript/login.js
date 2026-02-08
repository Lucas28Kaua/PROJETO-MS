async function logar(){
    const email = window.document.getElementById('iuser').value;
    const senha = window.document.getElementById('isenha').value;
    const dominiosValidos = ['@gmail.com', '@hotmail.com', '@outlook.com', '@mscred.com'];
    const emailValido = dominiosValidos.some(dominio => email.toLowerCase().endsWith(dominio));

    if (!email || !senha){
        alert('Preencha todos os campos!');
    } else if (!emailValido){
        alert('Digite um Email Válido!')
    } else if(senha.length<8){
        alert('Digite uma senha de 8 dígitos!')
    } else{
        const dados = {
            email:email,
            senha:senha
        }

        fetch("http://127.0.0.1:5000/login", {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(dados)
        })

        .then(response => response.json())
        .then(data => {
            if (data.sucesso){
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                localStorage.setItem('usuarioId', data.usuario.id);
                localStorage.setItem('usuarioNome', data.usuario.nome);
                alert(`Seja bem vindo, ${data.usuario.nome}!`)
                window.location.href = '../paginashtml/telahome.html';
            } else {
                alert (data.erro || "Erro ao Logar!")
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert('Servidor fora do ar ou erro na rede.');
        });
    }   
}