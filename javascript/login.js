function logar(){
    const email = window.document.getElementById('iuser').value;
    const senha = window.document.getElementById('isenha').value;
    const dominiosValidos = ['@gmail.com', '@hotmail.com', '@outlook.com'];
    const emailValido = dominiosValidos.some(dominio => email.toLowerCase().endsWith(dominio));

    if (!email || !senha){
        alert('Preencha todos os campos!');
    } else if (!emailValido){
        alert('Digite um Email Válido!')
    } else if(senha.length<8){
        alert('Digite uma senha de 8 dígitos!')
    } else{
        window.location.href='../paginashtml/telahome.html'
    }
}