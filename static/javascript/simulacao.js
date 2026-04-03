const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
let resultadoSimulacaoAtual = {};
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('aberto');
    toggleBtn.classList.toggle('ativo');
});

let dadosClienteIndividual = {};

function mascaraCPFIndividual(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

function exibirDadosCliente(margemData) {
    if (!margemData) {
        console.warn('Sem dados de margem para exibir')
        return
    }

    const formatarData = (isoDate) => {
        if (!isoDate) return '---';
        const data = new Date(isoDate)
        if (isNaN(data.getTime())) return '---';
        return data.toLocaleDateString('pt-BR');
    }

    const formatarMoeda = (valor) => {
        if (!valor && valor !== 0) return '---';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        }).format(valor)
    }

    //calcular idade
    const calcularIdade = (dataNasc) => {
        if (!dataNasc) return '';
        const nasc = new Date(dataNasc)
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const mesDiff = hoje.getMonth() - nasc.getMonth();
        if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
        }
        return ` (${idade} anos)`;
    }

    const calcularTempoEmpresa = (dataAdmissao) => {
        if (!dataAdmissao) return '';

        const admissao = new Date(dataAdmissao)
        const hoje = new Date();

        let totalMeses = (hoje.getFullYear() - admissao.getFullYear()) * 12;
        totalMeses += hoje.getMonth() - admissao.getMonth();

        // Ajuste para dias (se o dia do mês atual for menor que o dia da admissão)
        if (hoje.getDate() < admissao.getDate()) {
            totalMeses--;
        }

        if(totalMeses <0) return '';

        //converte para anos e meses
        const anos = Math.floor(totalMeses /12);
        const meses = totalMeses % 12;

        let resultado = '';

        if (anos > 0) {
            resultado += `${anos} ano${anos !== 1 ? 's' : ''}`;
        }

        if (meses>0) {
            if (resultado) resultado += ' e ';
            resultado += `${meses} mes${meses !== 1 ? 'es' : ''}`;
        }

        return resultado ? ` (${resultado})` : ''
    }

    const html = `
        <div class="dados-cliente-section" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 2px 2px 9px rgba(0,0,0,0.330);">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1e293b;">📋 Dados do Cliente</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">👤 NOME COMPLETO</div>
                    <div style="font-weight: 600; color: #0f172a;">${margemData.EmpregadoNome || '---'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">🎂 DATA NASCIMENTO</div>
                    <div style="font-weight: 600; color: #0f172a;">${formatarData(margemData.DataNascimento)}${calcularIdade(margemData.DataNascimento)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">⚥ GÊNERO</div>
                    <div style="font-weight: 600; color: #0f172a;">${margemData.GeneroDescricao || '---'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">📅 DATA ADMISSÃO</div>
                    <div style="font-weight: 600; color: #0f172a;">${formatarData(margemData.DataAdmissao)}${calcularTempoEmpresa(margemData.DataAdmissao)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">🏢 EMPRESA</div>
                    <div style="font-weight: 600; color: #0f172a;">${margemData.EmpregadorNome || '---'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">💼 CARGO</div>
                    <div style="font-weight: 600; color: #0f172a;">${margemData.CargoDescricao || '---'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">💰 SALÁRIO BRUTO</div>
                    <div style="font-weight: 600; color: #0f172a;">${formatarMoeda(margemData.ValorMargemBase)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">👩 NOME DA MÃE</div>
                    <div style="font-weight: 600; color: #0f172a;">${margemData.NomeMae || '---'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">💵 MARGEM DISPONÍVEL</div>
                    <div style="font-weight: 700; color: #10b981; font-size: 18px;">${formatarMoeda(margemData.ProdutoSaldoDisponivel)}</div>
                </div>
            </div>
        </div>
    `;

    // Insere antes da grid de bancos
    const resultadoDiv = document.getElementById('resultado-individual');
    const bancosGrid = document.getElementById('bancos-grid');
    
    // Remove se já existir uma seção de dados do cliente
    const existingSection = document.querySelector('.dados-cliente-section');
    if (existingSection) {
        existingSection.remove();
    }

    // Insere no início do resultado
    resultadoDiv.insertAdjacentHTML('afterbegin', html);
}

let cpfAtual =  null;
let telAtual = null;
let dadosAutorizacao = null;
async function iniciarAutorizacao() {
    const cpfRaw = document.getElementById('cpf-individual').value.replace(/\D/g, '');
    const tel    = document.getElementById('tel-individual').value.replace(/\D/g, '');

    if (cpfRaw.length !== 11) { alert('CPF inválido!'); return; }
    if (tel.length < 10) { alert('Telefone inválido!'); return}

    cpfAtual = cpfRaw;
    telAtual = tel;

    const btn = document.getElementById('btn-autorizar');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Enviando...';

    try {
        const resp = await fetch('https://api.sistemamscred.com.br/have/autorizar-zap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CPF: cpfRaw, phone: tel})
        })
        const data = await resp.json();

        if (data.erro) {
            alert('Erro: ' + data.erro);
            console.error('❌ Erro retornado: ', data.erro)
        } else {

            dadosAutorizacao = {
                nome: data.nome || '',
                data_nascimento: data.data_nascimento || '',
                sexo: data.sexo || ''
            }

            if (data.dados_margem) {
                exibirDadosCliente(data.dados_margem)
            }

            document.getElementById('aviso-aguardando').style.display='block';
            mostrarToast('Link enviado com sucesso!');
        }
    } catch(e) {
        alert ('Erro ao enviar autorização!');
        console.error(e);
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">send</span> Enviar Autorização';
}

async function consultarESimular() {
    document.getElementById('aviso-aguardando').style.display = 'none';
    document.getElementById('resultado-individual').style.display = 'block';

    document.getElementById('bancos-grid').innerHTML= `
        ${cardSkeleton('have', 'Banco Have')}
        ${cardSkeleton('v8', 'Banco V8')}
    `;
    
    simularHave(cpfAtual).then(resHave => {
    if (resHave?.tipo === 'aprovado') {
        dadosConsultaHave = resHave;
        const m = resHave.margem;
        renderizarCardBanco('have', 'Banco Have', {
            margem: m.ProdutoSaldoDisponivel,
            parcela: resHave.valor_parcela,
            prazo: resHave.prazo,
            valor_simulado: resHave.valor_solicitado
        });
    } else {
        renderizarCardReprovado('have', 'Banco Have', 'Simulação não aprovada');
    }
    });

    simularV8(cpfAtual).then(resV8 => {
    if (resV8?.tipo === 'aprovado') {
        dadosSimulacaoV8 = resV8;
        renderizarCardBanco('v8', 'Banco V8', {
            margem: resV8.margem,
            parcela: resV8.parcela,
            prazo: resV8.prazo,
            valor_simulado: resV8.valor_simulado
        });
    } else {
        renderizarCardReprovado('v8', 'Banco V8', resV8?.motivo || 'Simulação não aprovada');
    }
    });
}

function cardSkeleton(banco, nomeBanco) {
    return `
    <div class="banco-card" id="card-${banco}">
        <div class="banco-logo">${nomeBanco.split(' ')[1]}</div>
        <div class="banco-card-info">
            <div><div class="banco-valor-label">Margem</div><div class="skeleton"></div></div>
            <div><div class="banco-valor-label">Parcela</div><div class="skeleton"></div></div>
            <div><div class="banco-valor-label">Prazo</div><div class="skeleton"></div></div>
            <div><div class="banco-valor-label">Valor Liberado</div><div class="skeleton lg"></div></div>
        </div>
        <div class="banco-card-actions">
            <span class="status-badge status-simulando">⏳ Simulando...</span>
        </div>
    </div>`
}

function renderizarCardBanco(banco, nomeBanco, dados) {

    const logoTexto = nomeBanco.split(' ')[1] || nomeBanco.substring(0,2);
    const parcela = parseFloat(dados.parcela);
    const valorLiberado = parseFloat(dados.valor_simulado);
    const margem = parseFloat(dados.margem);

    const html = `
        <div class="banco-card" id="card-${banco}">
            <div class="banco-header">
                <div class="banco-logo">${logoTexto}</div>
                <div class="banco-nome">${nomeBanco}</div>
                <div class="banco-badge status-aprovado" style="background: #dcfce7; color: #15803d; margin-left: auto;">✅ APROVADO</div>
            </div>
            
            <div class="banco-conteudo">
                <div class="banco-valor-item">
                    <span class="banco-valor-label">💰 Margem Disponível</span>
                    <span class="banco-valor-num">${margem.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                </div>
                <div class="banco-valor-item">
                    <span class="banco-valor-label">📅 Valor da Parcela</span>
                    <span class="banco-valor-num parcela">${parcela.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                </div>
                <div class="banco-valor-item">
                    <span class="banco-valor-label">⏱️ Prazo</span>
                    <span class="banco-valor-num">${dados.prazo} meses</span>
                </div>
                <div class="banco-valor-item">
                    <span class="banco-valor-label">🎉 Valor Liberado</span>
                    <span class="banco-valor-num liberado">${valorLiberado.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                </div>
            </div>
            
            <div class="banco-acoes">
                <button class="btn-digitar" onclick="irParaDigitacao('${banco}', '${nomeBanco}')">
                    ✏️ Digitar Proposta
                </button>
            </div>
        </div>
    `;

    document.getElementById(`card-${banco}`).outerHTML = html;
}

function renderizarCardReprovado(banco, nomeBanco, motivo) {
    const logoTexto = nomeBanco.split(' ')[1] || nomeBanco.substring(0,2);

    const html = `
        <div class="banco-card" id="card-${banco}" style="opacity:0.85;">
            <div class="banco-header">
                <div class="banco-logo">${logoTexto}</div>
                <div class="banco-nome">${nomeBanco}</div>
                <div class="banco-badge status-reprovado" style="background: #fee2e2; color: #b91c1c; margin-left: auto;">❌ REPROVADO</div>
            </div>
            
            <div class="banco-conteudo" style="padding: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; background: #fef2f2; border-radius: 12px; padding: 16px; border-left: 4px solid #dc2626;">
                    <span style="font-size: 24px;">📋</span>
                    <div>
                        <div style="font-size: 14px; font-weight: 600; color: #991b1b;">Crédito não disponível</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${motivo || 'Simulação não aprovada para esta instituição'}</div>
                    </div>
                </div>
            </div>
            
            <div class="banco-acoes" style="justify-content: flex-end;">
            </div>
        </div>
    `;
    
    document.getElementById(`card-${banco}`).outerHTML = html;
}

async function simularHave(cpf) {
    const resp = await fetch('https://api.sistemamscred.com.br/simularhave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CPF: cpf})
    })
    return await resp.json();
}

async function simularV8(cpf) {
    // 📌 LOG 4: Ver o que tem antes de enviar
    console.log('🔍 dadosAutorizacao antes de enviar pro V8:', dadosAutorizacao);
    console.log('🔍 cpf:', cpf);
    console.log('🔍 telAtual:', telAtual);

    const payload = {
        cpf: cpf,
        nome: dadosAutorizacao?.nome || '',
        data_nascimento: dadosAutorizacao?.data_nascimento || '',
        sexo: dadosAutorizacao?.sexo || '',
        telefone: telAtual
    };
    
    console.log('📦 Payload enviado pro V8:', payload);

    const resp = await fetch('https://api.sistemamscred.com.br/simularindividual', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    
    const resultado = await resp.json()
    console.log('📥 Resposta do V8:', resultado)

    return resultado;
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

    document.getElementById('dig-doc-data').addEventListener('input', function() {
        let v = this.value.replace(/\D/g, '').slice(0, 8);
        v = v.replace(/(\d{2})(\d)/, '$1/$2');
        v = v.replace(/(\d{2})(\d)/, '$1/$2');
        this.value = v;
    });
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