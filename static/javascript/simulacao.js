const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('overlay');
let resultadoSimulacaoAtual = {};
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

    document.getElementById('resultado-individual').style.display = 'none';
    document.getElementById('resultado-individual-body').innerHTML = '';
    
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
            resultadoSimulacaoAtual = { ...resultado, ...dadosClienteIndividual };

            document.getElementById('resultado-individual-body').innerHTML = `
                <div style="padding:20px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:18px;">
                        <span class="status-badge status-aprovado">✓ Aprovado</span>
                        <span style="font-size:0.78rem; color:#888;">${resultado.nome || ''}</span>
                    </div>
                    <div class="cliente-fields-grid">
                        <div class="cliente-field">
                            <label class="cliente-field-label">📊 Margem Disponível</label>
                            <div class="cliente-field-input" style="background:#f5f5f5; cursor:default;">
                                R$ ${parseFloat(resultado.margem).toLocaleString('pt-BR', {minimumFractionDigits:2})}
                            </div>
                        </div>
                        <div class="cliente-field">
                            <label class="cliente-field-label">💳 Valor da Parcela</label>
                            <div class="cliente-field-input" style="background:#f5f5f5; cursor:default;">
                                R$ ${parseFloat(resultado.parcela).toLocaleString('pt-BR', {minimumFractionDigits:2})}
                            </div>
                        </div>
                        <div class="cliente-field">
                            <label class="cliente-field-label">⏱️ Prazo</label>
                            <div class="cliente-field-input" style="background:#f5f5f5; cursor:default;">
                                ${resultado.prazo} meses
                            </div>
                        </div>
                        <div class="cliente-field">
                            <label class="cliente-field-label">💰 Valor Liberado</label>
                            <div class="cliente-field-input" style="background:#f0fdf4; border-color:#86efac; color:#16a34a; font-weight:800; font-size:1.1rem; cursor:default;">
                                R$ ${parseFloat(resultado.valor_simulado).toLocaleString('pt-BR', {minimumFractionDigits:2})}
                            </div>
                        </div>
                    </div>
                </div>
                <button class="btn-processar ativo" style="margin-top:16px;" onclick="irParaDigitacao()">
                    DIGITAR PROPOSTA →
                </button>
            `;
        } else {
            document.getElementById('resultado-individual-body').innerHTML = `
                <div style="padding:20px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                        <span class="status-badge status-reprovado">✗ Reprovado</span>
                    </div>
                    <div class="cliente-field-input" style="background:#fff5f5; border-color:#fca5a5; color:#dc2626; cursor:default;">
                        ${resultado.motivo || 'Não foi possível aprovar a simulação.'}
                    </div>
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

function mostrarToast(mensagem) {
    const toast = document.createElement('div');
    toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> ${mensagem}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.78rem;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 14px rgba(22,163,74,0.35);
        z-index: 99999;
        animation: slideInToast 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

function copiarLink() {
    const link = document.getElementById('link-formalizacao').value;
    navigator.clipboard.writeText(link).then(() => {
        const btn = document.getElementById('btn-copiar-link');
        btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        btn.style.background = '#16a34a';
        setTimeout(() => {
            btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
            btn.style.background = '#eb6505';
        }, 2000);
    });
}

async function irParaDigitacao(){
    const nome       = document.getElementById('ind-nome').value;
    const nascimento = document.getElementById('ind-nascimento').value;
    const sexo       = document.getElementById('ind-sexo').value;
    const tel        = (resultadoSimulacaoAtual.telefone || document.getElementById('ind-telefone').value).replace(/\D/g, '');

    // Abre o modal e preenche os automáticos
    document.getElementById('modal-digitacao').style.display = 'flex';
    document.getElementById('dig-cep').addEventListener('input', async function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
                const end = await r.json();
                if (!end.erro) {
                    document.getElementById('dig-rua').value    = end.logradouro || '';
                    document.getElementById('dig-bairro').value = end.bairro     || '';
                    document.getElementById('dig-cidade').value = end.localidade  || '';
                    document.getElementById('dig-estado').value = end.uf          || '';
                }
            } catch(e) {
                console.error('Erro ViaCEP:', e)
            }
        }
    })

    document.getElementById('dig-nome').value        = nome;
    document.getElementById('dig-cpf').value         = dadosClienteIndividual.cpf || '';
    document.getElementById('dig-doc-numero').value  = dadosClienteIndividual.cpf?.replace(/\D/g, '') || ''; // RG = CPF
    document.getElementById('dig-doc-orgao').value   = 'SSP';
    document.getElementById('dig-nacionalidade').value = 'Brasileiro';
    document.getElementById('dig-nascimento').value  = nascimento;
    document.getElementById('dig-nome-mae').value    = resultadoSimulacaoAtual.nome_mae || '';
    document.getElementById('dig-ddd').value         = tel.slice(0, 2);
    document.getElementById('dig-telefone-modal').value = tel.slice(2);

    // Sexo
    const generoSelect = document.getElementById('dig-genero');
    generoSelect.value = sexo.toLowerCase().includes('fem') ? 'female' : 'male';

    const pixTipoSelect = document.getElementById('dig-pix-tipo')
    const pixChaveInput = document.getElementById('dig-pix-chave')

    pixTipoSelect.value = 'cpf';
    pixChaveInput.value = dadosClienteIndividual.cpf || '';

    pixTipoSelect.addEventListener('change', function() {
        if (this.value === 'cpf') {
            pixChaveInput.value = dadosClienteIndividual.cpf || '';
        } else {
            pixChaveInput.value = '';
        }
    });

    // Botão de envio
    document.getElementById('btn-enviar-digitacao').onclick = async function() {
        const btn = this;
        btn.disabled = true
        btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Enviando...';

        const ddd = document.getElementById('dig-ddd').value.trim();
        const telNum = document.getElementById('dig-telefone-modal').value.replace(/\D/g, '');

        const converterData = (data) => {
            if (!data || !data.includes('/')) return data;
            const [d, m, a] = data.split('/');
            return `${a}-${m}-${d}`;
        }
        const payload = {
            nome:                   document.getElementById('dig-nome').value.trim(),
            email:                  document.getElementById('dig-email').value.trim(),
            cpf:                    document.getElementById('dig-cpf').value.replace(/\D/g, ''),
            data_nascimento:        converterData(document.getElementById('dig-nascimento').value),
            nome_mae:               document.getElementById('dig-nome-mae').value.trim(),
            genero:                 document.getElementById('dig-genero').value,
            orgao_emissor:          document.getElementById('dig-doc-orgao').value.trim(),
            tipo_documento:         document.getElementById('dig-doc-tipo').value,
            numero_documento:       document.getElementById('dig-doc-numero').value.trim(),
            data_emissao_documento: converterData(document.getElementById('dig-doc-data').value),
            ddd:                    ddd,
            numero_telefone:        telNum,
            cep:                    document.getElementById('dig-cep').value.replace(/\D/g, ''),
            rua:                    document.getElementById('dig-rua').value.trim(),
            numero_endereco:        document.getElementById('dig-numero-end').value.trim(),
            complemento:            document.getElementById('dig-complemento').value.trim(),
            bairro:                 document.getElementById('dig-bairro').value.trim(),
            cidade:                 document.getElementById('dig-cidade').value.trim(),
            estado:                 document.getElementById('dig-estado').value.trim(),
            chave_pix:              document.getElementById('dig-pix-chave').value.trim(),
            tipo_chave_pix:         document.getElementById('dig-pix-tipo').value,
        };

        try {
            const response = await fetch('https://api.sistemamscred.com.br/digitarindividual', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const resultado = await response.json();

            if (resultado.sucesso) {
                document.getElementById('modal-digitacao').style.display = 'none';
                mostrarToast('Proposta digitada com sucesso!');
                const linkFormalizacao = resultado.dados?.formalization_url || '';

                const btnDigitar = document.querySelector('#resultado-individual-body .btn-processar');
                if (btnDigitar) btnDigitar.style.display = 'none';

                document.getElementById('resultado-individual-body').innerHTML = `
                    <div style="padding:20px;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:18px;">
                            <span class="status-badge status-aprovado">✓ Proposta Digitada</span>
                            <span style="font-size:0.78rem; color:#888;">${resultadoSimulacaoAtual.nome || ''}</span>
                        </div>

                        <div class="cliente-field full-width" style="margin-bottom:0;">
                            <label class="cliente-field-label">🔗 Link de Formalização</label>
                            <div style="display:flex; gap:8px; align-items:center;">
                                <input 
                                    type="text" 
                                    class="cliente-field-input" 
                                    value="${linkFormalizacao}" 
                                    id="link-formalizacao"
                                    readonly 
                                    style="background:#f5f5f5; cursor:default; flex:1;"
                                >
                                <button id="btn-copiar-link" onclick="copiarLink()" style="
                                    display:flex; align-items:center; justify-content:center;
                                    width:42px; height:42px; flex-shrink:0;
                                    background:#eb6505; border:none; border-radius:8px;
                                    color:white; cursor:pointer; transition:background 0.2s;
                                ">
                                    <span class="material-symbols-outlined">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

            } else {
                alert('Erro: ' + (resultado.mensagem || 'Tente novamente.'));
            }
        } catch(err) {
            alert('Erro ao enviar a proposta!')
            console.error(err)
        }

        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">send</span> Enviar Proposta';
    }
}

function fecharModalDigitacao() {
    document.getElementById('modal-digitacao').style.display = 'none';
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