const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('aberto');
});

let historico = []

function handleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensagem();
    }
}

function adicionarMensagem(texto, tipo) {
    const chat = document.getElementById('chat-mensagens');
    const div = docuemnt.createElement('div');
    div.className = `mensagem ${tipo}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
}

async function enviarMensagem() {
    const input = document.getElementById('chat-input');
    const pergunta = input.value.trim()
    if (!pergunta) return;

    input.value = '';
    input.style.height = 'auto';

    adicionarMensagem(pergunta, 'usuario');

    const digitando = adicionarMensagem('Digitando...', 'bot digitando')

    const btnEnviar = document.querySelector('.btn-enviar')
    btnEnviar.disabled = true;

    try {
        const form = new FormData();
        form.append('pergunta', pergunta);
        form.append('historico', JSON.stringify(historico.slice(-10)));

        const response = await fetch('https://sistemamscred.com.br/assistente', {
            method: 'POST',
            body: form
        })

        const data = await response.json();

        digitando.remove();

        if (data.erro) {
            adicionarMensagem("Erro:" + data.erro, 'bot')
        } else {
            adicionarMensagem(data.resposta, 'bot');
        }
    } catch (err) {
        digitando.remove();
        adicionarMensagem("Erro ao conectar com o assistente", 'bot');
        console.error(err);
    }
    btnEnviar.disabled = false;
    input.focus();
}

function fazerLogout() {
    localStorage.clear();
    window.location.replace("telalogin.html");
}

document.getElementById('chat-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
})