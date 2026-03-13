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
let dadosAprovados = [];

function iniciarLote() {
    console.log('🟡 iniciarLote chamado');
    const fileInput = document.getElementById('fileInput');
    console.log('📁 arquivo:', fileInput.files[0]);
    if (!fileInput.files[0]) return;

    let aprovados = 0;
    dadosAprovados = [];

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
        console.log('✅ API respondeu, status:', response.status);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        function ler() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    console.log('🏁 stream encerrado');  // ← novo
                    return;
                }

                const texto = decoder.decode(value);
                console.log('📨 chunk bruto recebido:', texto);
                const linhas = texto.split('\n').filter(l => l.startsWith('data:'));

                linhas.forEach(linha => {
                    const dados = JSON.parse(linha.replace('data: ', ''));  
                    console.log('📦 evento:', dados.tipo, dados);
                    // ATUALIZA PROGRESSO
                    // ATUALIZA PROGRESSO
                    if (dados.index && dados.total) {
                        const pct = Math.round((dados.index / dados.total) * 100);
                        document.getElementById('barra-fill').style.width = pct + '%';
                        document.getElementById('progresso-pct').textContent = pct + '%';
                        document.getElementById('progresso-texto').textContent = `Processando cliente ${dados.index} de ${dados.total}`;
                        document.getElementById('status-nome').textContent = `Consultando: ${dados.nome || ''}...`;
                    }

                    // SE APROVADO, ADICIONA NA TABELA
                    if (dados.tipo === 'aprovado') {
                        aprovados++;
                        dadosAprovados.push(dados);
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

                        // SE REPROVADO
                    if (dados.tipo === 'reprovado') {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${dados.cpf}</td>
                            <td>${dados.nome}</td>
                            <td><span class="status-badge status-reprovado">✗ Reprovado</span></td>
                            <td colspan="4" style="color:#aaa;font-size:0.8rem;">${dados.motivo || ''}</td>
                        `;
                        document.getElementById('tabela-body').appendChild(tr);
                    }

                    // SE PULADO
                    if (dados.tipo === 'pulado') {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${dados.cpf}</td>
                            <td>${dados.nome || '-'}</td>
                            <td><span class="status-badge status-pulado">⚠ Pulado</span></td>
                            <td colspan="4" style="color:#aaa;font-size:0.8rem;">${dados.motivo || ''}</td>
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
                        if (dadosAprovados.length > 0){
                            document.getElementById('btn-exportar').style.display = 'inline-flex';
                        }
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

function exportarAprovados (){
    if (typeof XLSX === 'undefined') {
        alert('Biblioteca de exportação não carregada!');
        return;
    }

    const linhas = dadosAprovados.map(d => ({
        'CPF': String(d.cpf).padStart(11, '0'),
        'Nome': d.nome,
        'Nome da Mãe': d.nome_mae || '',
        'Data de Nascimento': d.data_nascimento || '',
        'Sexo': d.sexo || '',
        'Data de Admissão': d.data_admissao || '',
        'Telefone': d.telefone || '',
        'Email': d.email || '',
        'Margem': d.margem,
        'Valor Liberado': d.valor_simulado,
        'Parcela': d.parcela,
        'Prazo': d.prazo
    }));

    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aprovados');

    const data = new Date().toLocaleDateString('pt-br').replace(/\//g, '-');
    XLSX.writeFile(wb, `aprovados_${data}.xlsx`);
}