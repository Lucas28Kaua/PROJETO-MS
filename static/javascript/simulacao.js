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

function trocarAba(aba, btn){
    document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'));
    document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativo'));
    document.getElementById('painel-' + aba).classList.add('ativo');
    btn.classList.add('ativo');
}

// Arquivo selecionado
function arquivoSelecionado(input) {
    if (input.files && input.files[0]) {
        document.getElementById('arquivo-nome').textContent = input.files[0].name;
        document.getElementById('arquivo-info').classList.add('visivel');
        document.getElementById('btn-processar').classList.add('ativo');
        document.getElementById('btn-processar').disabled = false;
    }
}

// Drag and drop visual
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', e => { 
    e.preventDefault(); 
    dropZone.classList.add('dragover'); 
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) {
        document.getElementById('arquivo-nome').textContent = e.dataTransfer.files[0].name;
        document.getElementById('arquivo-info').classList.add('visivel');
        document.getElementById('btn-processar').classList.add('ativo');
    }
}); 

//FAZENDO REQUESTS PARA A API PRA SIMULAR

function iniciarLote() {
    console.log('🟡 iniciarLote chamado');
    const fileInput = document.getElementById('fileInput');
    console.log('📁 arquivo:', fileInput.files[0]);
    if (!fileInput.files[0]) return;

    // Reseta tabela e progresso
    document.getElementById('tabela-body').innerHTML = '';
    document.getElementById('badge-aprovados').textContent = '✓ 0 aprovados';
    document.getElementById('progresso-wrapper').style.display = 'block';
    document.getElementById('tabela-resultados').style.display = 'block';

    const formData = new FormData();
    formData.append('planilha', fileInput.files[0]);

    // Desativa botão durante processamento
    const btn = document.getElementById('btn-processar');
    btn.classList.remove('ativo');
    btn.disabled = true;

    fetch('https://api.sistemamscred.com.br/simularlote', {
        method: 'POST',
        body: formData
    }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let aprovados = 0;

        function ler() {
            reader.read().then(({ done, value }) => {
                if (done) return;

                const texto = decoder.decode(value);
                const linhas = texto.split('\n').filter(l => l.startsWith('data:'));

                linhas.forEach(linha => {
                    const dados = JSON.parse(linha.replace('data: ', ''));

                    // ATUALIZA PROGRESSO
                    const pct = Math.round((dados.index / dados.total) * 100);
                    document.getElementById('barra-fill').style.width = pct + '%';
                    document.getElementById('progresso-pct').textContent = pct + '%';
                    document.getElementById('progresso-texto').textContent = `Processando cliente ${dados.index} de ${dados.total}`;
                    document.getElementById('status-nome').textContent = `Consultando: ${dados.nome || ''}...`;

                    // SE APROVADO, ADICIONA NA TABELA
                    if (dados.tipo === 'aprovado') {
                        aprovados++;
                        document.getElementById('badge-aprovados').textContent = `✓ ${aprovados} aprovados`;

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${dados.cpf}</td>
                            <td>${dados.nome}</td>
                            <td><span class="status-badge status-aprovado">✓ Aprovado</span></td>
                            <td>R$ ${parseFloat(dados.margem).toFixed(2)}</td>
                            <td>R$ ${parseFloat(dados.valor_simulado).toFixed(2)}</td>
                            <td>R$ ${parseFloat(dados.parcela).toFixed(2)}</td>
                            <td>${dados.prazo}x</td>
                        `;
                        document.getElementById('tabela-body').appendChild(tr);
                    }

                    // FINALIZADO
                    if (dados.tipo === 'finalizado') {
                        document.getElementById('status-nome').textContent = `✅ Processamento concluído! ${dados.aprovados} aprovados de ${dados.total}`;
                        document.getElementById('barra-fill').style.width = '100%';
                        document.getElementById('progresso-pct').textContent = '100%';
                        btn.classList.add('ativo');
                        btn.disabled = false;
                    }
                });

                ler();
            });
        }

        ler();
    }).catch(err => {
        console.error('Erro:', err);
        btn.classList.add('ativo');
        btn.disabled = false;
    });
}