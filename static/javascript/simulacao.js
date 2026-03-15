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

let dadosClienteIndividual = {};

function mascaraCPFIndividual(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

async function consultarIndividual(){
    const cpfRaw = document.getElementById('cpf-individual').value.replace(/\D/g, '');
    if (cpfRaw.length !== 11) {
        alert('CPF inválido!');
        return;
    }

    const btn = document.querySelector('#painel-individual .btn-processar')
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Consultando...';

    try{
        const response = await fetch(`https://sistemamscred.com.br/consulta-fullconsig/${cpfRaw}`);
        const dados = await response.json();

        if (dados.erro) {
            alert('CPF não encontrado: ' + dados.erro);
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">search</span> Consultar';
                return;
        }

        dadosClienteIndividual = { ...dados, cpf:cpfRaw}

        document.getElementById('ind-nome').value = dados.nome || '---';
        document.getElementById('ind-nascimento').value = dados.data_nascimento || '---';

        const sexoSelect = document.getElementById('ind-sexo');
        const sexoValor = (dados.sexo || '').toLowerCase();
        sexoSelect.value = sexoValor.includes('fem') ? 'Feminino' : 'Masculino';

        document.getElementById('ind-convenio').textContent = dados.convenio || '---';

        if (dados.telefone) {
            document.getElementById('ind-telefone').value = dados.telefone;
            document.getElementById('aviso-telefone').style.display = 'none';
        } else {
            document.getElementById('ind-telefone').value = '';
            document.getElementById('aviso-telefone').style.display = 'block';
        }

        document.getElementById('dados-individual').style.display = 'block';
    } catch (err) {
        alert('Erro ao consultar!');
        console.error(err);
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">search</span> Consultar';
}

async function simularIndividual(){
    const nome       = document.getElementById('ind-nome').value;
    const nascimento = document.getElementById('ind-nascimento').value;
    const sexo       = document.getElementById('ind-sexo').value;
    const telefone   = document.getElementById('ind-telefone').value.replace(/\D/g, '');

    if (!telefone) {
        alert('Preencha o telefone!');
        return;
    }

    const btn = document.querySelector('#dados-individual .btn-processar');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Simulando...';

    document.getElementById('resultado-individual').style.display = 'block';
    document.getElementById('resultado-individual-body').innerHTML = '<p style="padding:20px;color:#aaa;">⏳ Processando simulação...</p>';

    try {
        const response = await fetch('https://api.sistemamscred.com.br/simularindividual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cpf: dadosClienteIndividual.cpf,
                nome: nome,
                data_nascimento: nascimento,
                sexo: sexo,
                telefone: telefone
            })
        });
        const resultado = await response.json();

        if (resultado.tipo === 'aprovado') {

            document.getElementById('resultado-individual-body').innerHTML = `
                <div style="padding:20px;">
                    <div class="dados-grid">
                        <div class="dado-item">
                            <label>Status</label>
                            <span class="status-badge status-aprovado">✓ Aprovado</span>
                        </div>
                        <div class="dado-item">
                            <label>Margem</label>
                            <span>R$ ${parseFloat(resultado.margem).toFixed(2)}</span>
                        </div>
                        <div class="dado-item">
                            <label>Valor Liberado</label>
                            <span style="color:#2ecc71; font-weight:800; font-size:1.2rem;">R$ ${parseFloat(resultado.valor_simulado).toFixed(2)}</span>
                        </div>
                        <div class="dado-item">
                            <label>Parcela</label>
                            <span>R$ ${parseFloat(resultado.parcela).toFixed(2)}</span>
                        </div>
                        <div class="dado-item">
                            <label>Prazo</label>
                            <span>${resultado.prazo}x</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            document.getElementById('resultado-individual-body').innerHTML = `
                <div style="padding:20px;">
                    <span class="status-badge status-reprovado">✗ ${resultado.tipo === 'reprovado' ? 'Reprovado' : 'Não aprovado'}</span>
                    <p style="margin-top:10px; color:#aaa;">${resultado.motivo || ''}</p>
                </div>
            `;
        }
    } catch (err) {
        document.getElementById('resultado-individual-body').innerHTML = '<p style="padding:20px;color:red;">Erro ao simular!</p>';
        console.error(err);
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">play_circle</span> Simular';
}
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

                            fetch('https://sistemamscred.com.br/lotes/salvar', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                usuario_id: localStorage.getItem('usuarioId'),
                                total: dados.total,
                                aprovados: dados.aprovados,
                                resultados: dadosAprovados
                                })
                            })
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

function carregarHistorico(){
    fetch('https://sistemamscred.com.br/lotes/historico')
    .then(r => r.json())
    .then(lotes => {
        const tbody = document.getElementById('historico-body')
        tbody.innerHTML = '';
        if (!lotes.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#aaa;">Nenhum lote encontrado</td></tr>';
            return;
        }
        lotes.forEach(lote => {
            const data = new Date(lote.data_processamento).toLocaleString('pt-br');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data}</td>
                <td>${lote.total_clientes}</td>
                <td><span class="badge-aprovados">${lote.total_aprovados} aprovados</span></td>
                <td><button class="btn-ver-lote" onclick="verDetalheLote(${lote.id}, this)">
                    <span class="material-symbols-outlined">visibility</span> Ver
                </button></td>
            `;
            tbody.appendChild(tr);
        });
    })
}

let dadosHistoricoAtual = [];

function verDetalheLote(loteId, btn){
    const trDetalhe = document.getElementById(`detalhe-tr-${loteId}`)

    if (trDetalhe){
        const aberto = trDetalhe.style.display !== 'none';
        if (aberto) {
            trDetalhe.querySelector('.accordion-detalhe').style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => { trDetalhe.style.display = 'none'; }, 280);
        } else {
            trDetalhe.style.display = 'table-row';
            trDetalhe.querySelector('.accordion-detalhe').style.animation = 'slideDown 0.3s ease';
        }
        btn.innerHTML = aberto 
            ? '<span class="material-symbols-outlined">visibility</span> Ver'
            : '<span class="material-symbols-outlined">visibility_off</span> Fechar';
        return;
    }


    fetch(`https://sistemamscred.com.br/lotes/detalhe/${loteId}`)
        .then(r => r.json())
        .then(resultados => {
            dadosHistoricoAtual = resultados;

            const tbody = document.getElementById('historico-body');
            const trPai = btn.closest('tr');

            const tr = document.createElement('tr');
            tr.id = `detalhe-tr-${loteId}`;
            tr.innerHTML = `
                <td colspan="4" style="padding:0">
                    <div class="accordion-detalhe">
                        <div class="accordion-acoes">
                            <button class="btn-exportar" onclick="exportarHistoricoAtual()">
                                <span class="material-symbols-outlined">download</span> Exportar
                            </button>
                        </div>
                        <table class="tabela-interna">
                            <thead>
                                <tr>
                                    <th>CPF</th>
                                    <th>Nome</th>
                                    <th>Margem</th>
                                    <th>Valor Liberado</th>
                                    <th>Parcela</th>
                                    <th>Prazo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${resultados.map(r => `
                                    <tr>
                                        <td>${String(r.cpf).padStart(11, '0')}</td>
                                        <td>${r.nome}</td>
                                        <td>R$ ${parseFloat(r.margem).toFixed(2)}</td>
                                        <td>R$ ${parseFloat(r.valor_liberado).toFixed(2)}</td>
                                        <td>R$ ${parseFloat(r.parcela).toFixed(2)}</td>
                                        <td>${r.prazo}x</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </td>
            `;
            trPai.after(tr);
            btn.innerHTML = '<span class="material-symbols-outlined">visibility_off</span> Fechar';
        });
}

function exportarHistoricoAtual() {
    exportarHistorico();
}

function exportarHistorico(){
    if (!dadosHistoricoAtual.length) return;
    const linhas = dadosHistoricoAtual.map(r => ({
        'CPF': String(r.cpf).padStart(11, '0'),
        'Nome': r.nome,
        'Nome da Mãe': r.nome_mae || '',
        'Data de Nascimento': r.data_nascimento || '',
        'Sexo': r.sexo || '',
        'Data de Admissão': r.data_admissao || '',
        'Telefone': r.telefone || '',
        'Email': r.email || '',
        'Margem': r.margem,
        'Valor Liberado': r.valor_liberado,
        'Parcela': r.parcela,
        'Prazo': r.prazo
    }));

    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aprovados');
    const data = new Date().toLocaleDateString('pt-br').replace(/\//g, '-');
    XLSX.writeFile(wb, `lote_${data}.xlsx`);
}

function fazerLogout() {
    // 1. Limpa tudo que salvamos no login
    localStorage.removeItem('usuarioId');
    localStorage.setItem('usuarioNome', ''); // Opcional: limpa o nome também
    localStorage.clear(); // Se quiser garantir, limpa TUDO do storage

    // 2. Agora sim, manda para a tela de login
    window.location.replace("telalogin.html"); 
}