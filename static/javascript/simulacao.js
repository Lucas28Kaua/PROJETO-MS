const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
let resultadoSimulacaoAtual = {};
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('aberto');
    toggleBtn.classList.toggle('ativo');
});

function trocarSubAba(tipo, elemento) {
    document.querySelectorAll('.sub-aba-btn').forEach(btn=>{
        btn.classList.remove('ativo');
    })

    // Remove a classe 'ativo' de todos os sub-painéis
    document.querySelectorAll('.sub-painel').forEach(painel => {
        painel.classList.remove('ativo');
    });
    
    // Adiciona a classe 'ativo' no botão clicado
    elemento.classList.add('ativo');
    
    // Mostra o painel correspondente
    document.getElementById(`sub-painel-${tipo}`).classList.add('ativo');
}

let dadosClienteIndividual = {};
let dadosConsultaHave = null;
let dadosSimulacaoV8 = null;
let margemOriginalHave = null;
let margemOriginalV8 = null;

const ufPorDDD = {
    11: 'SP', 12: 'SP', 13: 'SP', 14: 'SP', 15: 'SP', 16: 'SP', 17: 'SP', 18: 'SP', 19: 'SP',
    21: 'RJ', 22: 'RJ', 24: 'RJ',
    27: 'ES', 28: 'ES',
    31: 'MG', 32: 'MG', 33: 'MG', 34: 'MG', 35: 'MG', 37: 'MG', 38: 'MG',
    41: 'PR', 42: 'PR', 43: 'PR', 44: 'PR', 45: 'PR', 46: 'PR',
    47: 'SC', 48: 'SC', 49: 'SC',
    51: 'RS', 53: 'RS', 54: 'RS', 55: 'RS',
    61: 'DF',
    62: 'GO', 64: 'GO',
    63: 'TO',
    65: 'MT', 66: 'MT',
    67: 'MS',
    68: 'AC',
    69: 'RO',
    71: 'BA', 73: 'BA', 74: 'BA', 75: 'BA', 77: 'BA',
    79: 'SE',
    81: 'PE', 87: 'PE',
    82: 'AL',
    83: 'PB',
    84: 'RN',
    85: 'CE', 88: 'CE',
    86: 'PI', 89: 'PI',
    91: 'PA', 93: 'PA', 94: 'PA',
    92: 'AM',
    95: 'RR',
    96: 'AP',
    97: 'AM',
    98: 'MA', 99: 'MA'
};

// Dados completos do worker (para enviar na digitação)
let dadosWorkerAtual = {
    workerId: null,
    matricula: null,
    nomeEmpregador: null,
    valorBase: null,
    margemDisponivel: null
};

// Dados da simulação atual (com valores que podem ter sido re-simulados)
let dadosSimulacaoAtual = {
    num_periods: null,           // prazo
    payment_amount: null,        // valor da parcela
    disbursement_amount: null,   // valor desembolsado (liberado)
    financed_amount: null,       // valor financiado (bruto)
    first_payment_date: null,
    last_payment_date: null,
    disbursement_date: null,
    interest_rate: null,
    iof_amount: null
};

function mascaraCPFIndividual(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
    if (v.replace(/\D/g, '').length === 11) verificarCPFIndividual(); 
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
let dadosConsulta = null;

async function iniciarAutorizacao() {
    const cpfRaw = document.getElementById('cpf-individual').value.replace(/\D/g, '');
    const tel    = document.getElementById('tel-individual').value.replace(/\D/g, '');

    if (cpfRaw.length !== 11) { 
        mostrarToast('CPF inválido!', 'error');
        return; 
    }
    if (tel.length < 10) { 
        mostrarToast('Telefone inválido!', 'error');
        return; 
    }

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
            mostrarToast(data.erro, 'error');
            console.error('❌ Erro retornado: ', data.erro);
        } else if (data.status === 'erro') {
            mostrarToast(data.msg || 'Erro desconhecido', 'error');
            console.error('❌ Erro retornado: ', data);
        } else {
            document.getElementById('aviso-aguardando').style.display = 'block';
            mostrarToast('Link enviado com sucesso!');
            document.getElementById('btn-consultar-dados').disabled = false;
            document.getElementById('btn-consultar-dados').classList.add('ativo');
        }
    } catch(e) {
        mostrarToast('Erro ao enviar autorização!', 'error');
        console.error(e);
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">send</span> Enviar Autorização';
}

async function verificarCPFIndividual() {
    const cpf = document.getElementById('cpf-individual').value.replace(/\D/g, '');
    if (cpf.length !== 11) return;
    
    console.log('🔍 disparou, CPF:', cpf);
    cpfAtual = cpf;

    try {
        const resp = await fetch('https://api.sistemamscred.com.br/consultar-dados-have', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CPF: cpf })
        })
        const data = await resp.json();
        console.log('📦 resposta:', data);
        if (data.nome) {
            // Já tem dados — pula autorização
            mostrarToast('Cliente já autorizado!', 'success');
            document.getElementById('campo-telefone').style.display = 'none';
            document.getElementById('btn-autorizar').style.display = 'none';
            document.getElementById('btn-consultar-dados').style.display = 'inline-flex';
            document.getElementById('btn-consultar-dados').disabled = false;
            document.getElementById('btn-consultar-dados').classList.add('ativo');
        } else {
            mostrarToast('Cliente não autorizado, envie o link de autorização!', 'warning');
            document.getElementById('campo-telefone').style.display = 'flex';
            document.getElementById('btn-autorizar').style.display = 'inline-flex';
            document.getElementById('btn-consultar-dados').style.display = 'inline-flex';
        }
    } catch(e) {
        console.error('Erro ao verificar CPF:', e);
        document.getElementById('btn-autorizar').style.display = 'inline-flex';
    }
}

async function consultarDados() {

    if (!cpfAtual) {
        return;
    }

    const CPF = cpfAtual

    const btn = document.getElementById('btn-consultar-dados');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Consultando...';

    let dadosEncontrados = false;

    for (let tentativa = 1; tentativa <= 10; tentativa++){
    
        try {
            const resp = await fetch ('https://api.sistemamscred.com.br/consultar-dados-have',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ CPF: CPF})
            })
            const data = await resp.json();

            if (data.aguardando) {
                console.log(`⏳ Tentativa ${tentativa}/10 - ainda sem dados, aguardando...`);
                if (tentativa < 10) await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            if (data.erro) {
                console.error(`❌ Erro real:`, data.erro);
                break;
            }

            if (data.nome && data.nome !== '') {

                margemOriginalHave = parseFloat(data.margem_cliente) || 0;
                margemOriginalV8 = parseFloat(data.margem_cliente) || 0;

                dadosConsulta = {
                    nome: data.nome || '',
                    dataNascimento: data.data_nascimento || '',
                    sexo: data.sexo || '',
                    dataAdmissao: data.data_admissao ||'',
                    nome_empresa: data.nome_empresa || '',
                    cargo_cliente: data.cargo_cliente || '',
                    salario_cliente: data.salario_bruto || '',
                    nome_mae: data.nome_mae || '',
                    margem: data.margem_cliente || ''
                }

                const resultadoDiv = document.getElementById('resultado-individual');
                resultadoDiv.style.display = 'block';

                exibirDadosCliente({
                    EmpregadoNome: data.nome,
                    DataNascimento: data.data_nascimento,
                    GeneroDescricao: data.sexo,
                    DataAdmissao: data.data_admissao,
                    EmpregadorNome: data.nome_empresa,
                    CargoDescricao: data.cargo_cliente,
                    ValorMargemBase: data.salario_bruto,
                    NomeMae: data.nome_mae,
                    ProdutoSaldoDisponivel: data.margem_cliente
                })

                dadosWorkerAtual = {
                    workerId: data.worker_id || null,            
                    matricula: data.matricula || '',             
                    nomeEmpregador: data.nome_empresa || '',     
                    valorBase: data.salario_bruto || 0, 
                    margemDisponivel: data.margem_cliente || 0  
                };

                console.log('✅ exibirDadosCliente chamado');

                document.getElementById('btn-simular').disabled = false;
                document.getElementById('btn-simular').classList.add('ativo')
                document.getElementById('btn-simular').style.display = 'flex';
                // Esconde o aviso de aguardando
                document.getElementById('aviso-aguardando').style.display = 'none';
                
                mostrarToast('Dados consultados com sucesso!');
                const cardHave = document.getElementById('card-have');
                    const estavaEmErro = cardHave && cardHave.innerHTML.includes('AUTORIZAÇÃO EXPIRADA');
                    
                    if (estavaEmErro) {
                        console.log('🔄 Card estava em erro, re-simulando automaticamente...');
                        setTimeout(() => {
                            consultarESimular();
                        }, 500);
                    }
                    
                    dadosEncontrados = true;
                    break;
            }
        } catch(e) {
            console.error(`Erro na tentativa ${tentativa}:`, e);
        }

        // Se não foi a última tentativa, espera 3 segundos
        if (tentativa < 10 && !dadosEncontrados) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">search</span> Consultar Dados';

}

async function consultarESimular() {
    if (!dadosConsulta) {
        mostrarToast('Primeiro consulte os dados do cliente!', 'warning');
        return;
    }
    
    document.getElementById('resultado-individual').style.display = 'block';

    document.getElementById('bancos-grid').innerHTML= `
        ${cardSkeleton('have', 'Banco Have')}
        ${cardSkeleton('v8', 'Banco V8')}
    `;
    
    simularHave(cpfAtual).then(resHave => {

        if (resHave?.tipo === 'erro_data_prev') {
            renderizarCardHaveDataPrevExpirado();
            return;
        }

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
            const motivo = resHave?.motivo || resHave?.Message || 'Simulação não aprovada';

            renderizarCardReprovado('have', 'Banco Have', motivo);
        }
    });

    simularV8(cpfAtual).then(resV8 => {
    if (resV8?.tipo === 'aprovado') {
        dadosSimulacaoV8 = resV8;
        renderizarCardBanco('v8', 'Banco V8', {
            margem: resV8.margem,
            parcela: resV8.parcela,
            prazo: resV8.prazo,
            valor_simulado: resV8.valor_simulado,
            parcelas_disponiveis: resV8.parcelas_disponiveis
        });
    } else {
        renderizarCardReprovado('v8', 'Banco V8', resV8?.motivo || 'Simulação não aprovada');
    }
    });
}

function renderizarCardHaveDataPrevExpirado() {
    const html = `
        <div class="banco-card" id="card-have">
            <div class="banco-header">
                <div class="banco-logo">
                    <img src="/static/imagens/logo-havecred.jpeg" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
                <div class="banco-nome">Banco Have</div>
                <div class="banco-badge status-reprovado" style="background:#fef3c7;color:#92400e;margin-left:auto;">⚠️ AUTORIZAÇÃO EXPIRADA</div>
            </div>
            
            <div class="banco-conteudo" style="padding: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; background: #fffbeb; border-radius: 12px; padding: 16px; border-left: 4px solid #f59e0b;">
                    <span style="font-size: 28px;">⏰</span>
                    <div style="flex: 1;">
                        <div style="font-size: 14px; font-weight: 600; color: #92400e;">Consulta Data Prev expirada</div>
                        <div style="font-size: 13px; color: #78350f; margin-top: 4px;">A autorização tem mais de 3,5 dias e precisa ser renovada</div>
                    </div>
                    <button onclick="enviarLinkReautorizacaoHave()" style="
                        background: #f59e0b; 
                        color: white; 
                        border: none; 
                        padding: 8px 16px; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-size: 13px; 
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    ">
                        <span>🔄</span> Reautorizar
                    </button>
                </div>
                <div style="margin-top: 12px; padding: 8px; background: #fef9e6; border-radius: 8px;">
                    <small style="color: #92400e;">📌 Após o cliente autorizar, clique em "Consultar Dados" e depois em "Simular" novamente</small>
                </div>
            </div>
            
            <div class="banco-acoes" style="justify-content: flex-end; padding: 12px 20px;">
                <!-- Botão grande removido -->
            </div>
        </div>
    `;
    
    document.getElementById(`card-have`).outerHTML = html;
}

async function enviarLinkReautorizacaoHave() {
    if (!cpfAtual || !telAtual) {
        mostrarToast('CPF ou telefone não encontrados!', 'error');
        return;
    }
    
    // Pega o botão que disparou o evento
    const btn = event?.target?.closest('button') || event?.currentTarget;
    const textoOriginal = btn?.innerHTML;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> Enviando...';
    }
    
    try {
        const resp = await fetch('https://api.sistemamscred.com.br/have/autorizar-zap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CPF: cpfAtual, phone: telAtual })
        });
        const data = await resp.json();
        
        if (data.erro || data.status === 'erro') {

            mostrarToast(data.erro || data.msg || 'Erro ao enviar autorização!', 'error');

        } else {

            mostrarToast('Link enviado! Aguarda autorização novamente...', 'success', 3000);

            const resultadoDiv = document.getElementById('resultado-individual')
            resultadoDiv.style.display = 'none';

            // Habilita botão de consultar dados novamente
            const btnConsultar = document.getElementById('btn-consultar-dados')
            btnConsultar.disabled = false;
            btnConsultar.classList.add('ativo');

            dadosConsulta = null;
            margemOriginalHave = null;
            margemOriginalV8 = null;

            const bancosGrid = document.getElementById('bancos-grid')
            if (bancosGrid) {
                bancosGrid.innerHTML = '';
            }

            const dadosClienteSection = document.querySelector('.dados-cliente-section')
            if (dadosClienteSection) {
                dadosClienteSection.remove();
            }

            const btnSimular = document.getElementById('btn-simular');
            btnSimular.disabled = true;
            btnSimular.classList.remove('ativo');
            btnSimular.style.display = 'none';
            
            // 6. Mostra aviso de aguardando
            const aviso = document.getElementById('aviso-aguardando');
            aviso.style.display = 'block';
            
            aviso.scrollIntoView({ behavior: 'smooth', block: 'center' });

        }
    } catch(e) {
        console.error(e);
        mostrarToast('Erro ao enviar autorização!', 'error');
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🔄</span> Reautorizar';
    }
}

function cardSkeleton(banco, nomeBanco) {
    return `
    <div class="banco-card" id="card-${banco}">
        <div class="banco-logo">
            ${banco === 'v8' 
                ? '<img src="/static/imagens/fotobancov8.png" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">' 
                : banco === 'have'
                    ? '<img src="/static/imagens/logo-havecred.jpeg" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">'
                    : nomeBanco.split(' ')[1]}
        </div>
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

let modoV8 = null; // 'parcela' ou 'liberado'
let modoHave = null;

function onModoV8(campo) {
    if (modoV8 === campo) return;
    modoV8 = campo
    const parcelaInput = document.getElementById('v8-parcela-input')
    const liberadoInput = document.getElementById('v8-liberado-input')

    if (campo === 'parcela') {
        liberadoInput.value = '';
        liberadoInput.disabled = true;
        liberadoInput.style.opacity = '0.4';
        parcelaInput.disabled = false;
        parcelaInput.style.opacity = '1';
    } else {
        parcelaInput.value = '';
        parcelaInput.disabled = true;
        parcelaInput.style.opacity = '0.4';
        liberadoInput.disabled = false;
        liberadoInput.style.opacity = '1';
    }
}

function onModoHave(campo) {
    if (modoHave === campo) return;
    modoHave = campo;

    const parcelaInput = document.getElementById('have-parcela-input')
    const liberadoInput = document.getElementById('have-liberado-input')

    if (campo==='parcela') {
        liberadoInput.value = '';
        liberadoInput.disabled = true;
        liberadoInput.style.opacity = '0.4';
        parcelaInput.disabled = false;
        parcelaInput.style.opacity = '1';
    } else {
        parcelaInput.value = '';
        parcelaInput.disabled = true;
        parcelaInput.style.opacity = '0.4';
        liberadoInput.disabled = false;
        liberadoInput.style.opacity = '1';
    }
}

function onEditarSimulacao(banco) {
    const acoes = document.getElementById(`${banco}-acoes`)
    const nomeBanco = banco === 'v8' ? 'Banco V8' : 'Banco Have';


    if (banco === 'have') {
        const prazoInput = document.getElementById(`${banco}-prazo-input`)
        const novoPrazo = parseInt(prazoInput.value);

        if (dadosSimulacaoAtual) {
            dadosSimulacaoAtual.num_periods = novoPrazo
            console.log(`📝 Prazo alterado para ${novoPrazo} meses`)
        }
    }

    acoes.innerHTML = `
        <button class="btn-digitar" style="background:#64748b;" onclick="cancelarResimulacao('${banco}', '${nomeBanco}')">
            ✖ Cancelar
        </button>
        <button class="btn-digitar" onclick="resimular('${banco}')">
            🔄 Re-simular
        </button>
    `;
}

function cancelarResimulacao(banco, nomeBanco) {
    const dados = banco === 'v8' ? dadosSimulacaoV8 : dadosConsultaHave;
    
    if (banco === 'v8') {
        modoV8 = null;
    } else {
        modoHave = null;  // ← ADICIONA
    }
    
    renderizarCardBanco(banco, nomeBanco, dados);
}

async function resimular(banco) {
    const acoes = document.getElementById(`${banco}-acoes`);
    acoes.innerHTML = `<span style="color:#888;font-size:0.85rem;">🔄 Simulando...</span>`;

    const prazoInput = document.getElementById(`${banco}-prazo-input`);
    const parcelaInput = document.getElementById(`${banco}-parcela-input`);
    const liberadoInput = document.getElementById(`${banco}-liberado-input`);

    const prazo = parseInt(prazoInput.value);
    const parcela = parcelaInput.disabled ? null : parseFloat(parcelaInput.value) || null;
    const valorLiberado = liberadoInput.disabled ? null : parseFloat(liberadoInput.value) || null;

    try {
        if (banco === 'v8') {
            const resp = await fetch('https://api.sistemamscred.com.br/resimular-v8', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    cpf: cpfAtual,
                    prazo: prazo,
                    valor_parcela: parcela,
                    valor_liberado: valorLiberado
                })
            });
            const data = await resp.json();

            if (data.tipo === 'aprovado') {
                dadosSimulacaoAtual = {
                    num_periods: data.prazo,
                    payment_amount: data.parcela,
                    disbursement_amount: data.valor_simulado,
                    financed_amount: data.valor_simulado,
                    first_payment_date: null,
                    last_payment_date: null,
                    disbursement_date: null,
                    interest_rate: null,
                    iof_amount: null
                };
                dadosSimulacaoV8 = data;
                modoV8 = null;
                data.margem = dadosConsulta?.margem || data.margem;

                renderizarCardBanco('v8', 'Banco V8', data);
                mostrarToast('Re-simulação V8 concluída!');
            } else {
                mostrarToast('Re-simulação não aprovada.', 'error');
                cancelarResimulacao('v8', 'Banco V8');
            }

        } else if (banco === 'have') {
            console.log('🔄 RE-SIMULAÇÃO HAVE - Iniciando');

            let parcelaParaEnviar = null
            let liberadoParaEnviar = null;

            const editandoParcela = !parcelaInput.disabled && parcelaInput.value;
            const editandoLiberado = !liberadoInput.disabled && liberadoInput.value;
            

            if (editandoParcela) {
                parcelaParaEnviar = parseFloat(parcelaInput.value);
                liberadoParaEnviar = null;  // 🔥 ZERA o liberado
                console.log(`📝 Editando PARCELA: R$ ${parcelaParaEnviar}`);
            }

            else if (editandoLiberado) {
                parcelaParaEnviar = null; //zera parcela
                liberadoParaEnviar = parseFloat(liberadoInput.value);
                console.log(`📝 Editando VALOR LIBERADO: R$ ${liberadoParaEnviar}`);
            }

            else {
                parcelaParaEnviar = parseFloat(parcelaInput.value);
                liberadoParaEnviar = null;  // 🔥 ZERA o liberado
                console.log(`📝 Alterou PRAZO para ${prazo}, mantendo parcela: R$ ${parcelaParaEnviar}`);
            }

            console.log('📤 Enviando payload:', {
                cpf: cpfAtual,
                prazo: prazo,
                valor_parcela: parcelaParaEnviar,
                valor_liberado: liberadoParaEnviar
            });

            const resp = await fetch('https://api.sistemamscred.com.br/resimular-have', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    cpf: cpfAtual,
                    prazo: prazo,
                    valor_parcela: parcelaParaEnviar,
                    valor_liberado: liberadoParaEnviar
                })
            });
            const data = await resp.json();

            if (data.tipo === 'aprovado') {

                dadosSimulacaoAtual = {
                    num_periods: data.prazo,
                    payment_amount: data.valor_parcela,
                    disbursement_amount: data.valor_solicitado,
                    financed_amount: data.valor_solicitado,
                    first_payment_date: data.simulacao?.Data?.Simulation?.first_payment_date || null,
                    last_payment_date: data.simulacao?.Data?.Simulation?.last_payment_date || null,
                    disbursement_date: data.simulacao?.Data?.Simulation?.disbursement_date || null,
                    interest_rate: data.simulacao?.Data?.Simulation?.interest_rate || null,
                    iof_amount: data.simulacao?.Data?.Simulation?.iof_amount || null
                };

                dadosConsultaHave = data.simulacao?.Data?.Simulation || dadosConsultaHave;
                modoHave = null;
                renderizarCardBanco('have', 'Banco Have', {
                    parcela: data.valor_parcela,
                    valor_simulado: data.valor_solicitado,
                    prazo: data.prazo,
                    
                });
                mostrarToast('Re-simulação Have concluída!');
            } else {
                mostrarToast('Re-simulação não aprovada.', 'error');
                cancelarResimulacao('have', 'Banco Have');
            }
        }
    } catch(e) {
        console.error('Erro re-simulação:', e);
        mostrarToast('Erro ao re-simular.', 3000);
        cancelarResimulacao(banco, banco === 'v8' ? 'Banco V8' : 'Banco Have');
    }
}

function renderizarCardBanco(banco, nomeBanco, dados) {
    
    const logoTexto = nomeBanco.split(' ')[1] || nomeBanco.substring(0,2);
    const parcela = parseFloat(dados.parcela);
    const valorLiberado = parseFloat(dados.valor_simulado);
    const margem = banco === 'have' ? margemOriginalHave : margemOriginalV8;
    const prazo = dados.prazo

    // Parcelas disponíveis
    const parcelasV8 = dados.parcelas_disponiveis || [];

    // Prazo: select para V8 (com parcelas do banco), select fixo para Have
    let prazoHtml;
    if (banco === 'v8' && parcelasV8.length > 0) {
        prazoHtml = `<select id="${banco}-prazo-input" class="resim-input resim-select" onchange="onEditarSimulacao('${banco}')">
            ${parcelasV8.map(p => `<option value="${p}" ${parseInt(p) === parseInt(prazo) ? 'selected' : ''}>${p} meses</option>`).join('')}
        </select>`;
    } else if (banco === 'have') {
        // Have: prazos padrão disponíveis (6 a 84 meses em incrementos comuns)
        const prazosHave = [24, 18, 15, 12, 9, 6].sort((a, b) => b - a);
        prazoHtml = `<select id="${banco}-prazo-input" class="resim-input resim-select" onchange="onEditarSimulacao('${banco}')">
            ${prazosHave.map(p => `<option value="${p}" ${p === parseInt(prazo) ? 'selected' : ''}>${p} meses</option>`).join('')}
        </select>`;

        var htmlHave = `<div class="banco-card" id="card-${banco}">
            <div class="banco-header">
                <div class="banco-logo">
                    <img src="/static/imagens/logo-havecred.jpeg" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
                <div class="banco-nome">${nomeBanco}</div>
                <div class="banco-badge status-aprovado" style="background:#dcfce7;color:#15803d;margin-left:auto;">✅ APROVADO</div>
            </div>

            <div class="banco-conteudo">
                <div class="banco-valor-item">
                    <span class="banco-valor-label">💰 Margem Disponível</span>
                    <span class="banco-valor-num">${margem.toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}</span>
                </div>

                <div class="banco-valor-item">
                    <span class="banco-valor-label">📅 Valor da Parcela</span>
                    <span class="banco-valor-num parcela">
                        <input type="number" id="${banco}-parcela-input" class="resim-input resim-parcela"
                            value="${parcela.toFixed(2)}"
                            oninput="onModoHave('parcela'); onEditarSimulacao('${banco}')">
                    </span>
                </div>

                <div class="banco-valor-item">
                    <span class="banco-valor-label">⏱️ Prazo</span>
                    <span class="banco-valor-num">${prazoHtml}</span>
                </div>
            
                <div class="banco-valor-item">
                    <span class="banco-valor-label">🎉 Valor Liberado</span>
                    <span class="banco-valor-num liberado">
                        <input type="number" id="${banco}-liberado-input" class="resim-input resim-liberado"
                            value="${valorLiberado.toFixed(2)}"
                            oninput="onModoHave('liberado'); onEditarSimulacao('${banco}')">
                    </span>
                </div>
            </div>

            <div class="banco-acoes" id="${banco}-acoes">
                <button class="btn-digitar" onclick="irParaDigitacao('${banco}', '${nomeBanco}')">
                    ✏️ Digitar Proposta
                </button>
            </div>
        </div>
    `;

    document.getElementById(`card-${banco}`).outerHTML = htmlHave;
    return;
    } else {
        prazoHtml = `<input type="number" id="${banco}-prazo-input" class="resim-input" value="${prazo}" min="1" oninput="onEditarSimulacao('${banco}')">`;
    }

    const html = `
        <div class="banco-card" id="card-${banco}">
            <div class="banco-header">
                <div class="banco-logo">
                    ${banco === 'v8'
                        ? '<img src="/static/imagens/fotobancov8.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.parentElement.innerHTML=\'V8\'">'
                        : '<img src="/static/imagens/logo-havecred.jpeg" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.parentElement.innerHTML=\'Have\'">'}
                </div>
                <div class="banco-nome">${nomeBanco}</div>
                <div class="banco-badge status-aprovado" style="background:#dcfce7;color:#15803d;margin-left:auto;">✅ APROVADO</div>
            </div>

            <div class="banco-conteudo">
                <div class="banco-valor-item">
                    <span class="banco-valor-label">💰 Margem Disponível</span>
                    <span class="banco-valor-num">${margem.toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}</span>
                </div>

                <div class="banco-valor-item">
                    <span class="banco-valor-label">📅 Valor da Parcela</span>
                    <span class="banco-valor-num parcela">
                        <input type="number" id="${banco}-parcela-input" class="resim-input resim-parcela"
                            value="${parcela.toFixed(2)}"
                            ${banco === 'v8' ? `oninput="onModoV8('parcela'); onEditarSimulacao('${banco}')"` : `oninput="onEditarSimulacao('${banco}')"`}>
                    </span>
                </div>

                <div class="banco-valor-item">
                    <span class="banco-valor-label">⏱️ Prazo</span>
                    <span class="banco-valor-num">${prazoHtml}</span>
                </div>
            
                <div class="banco-valor-item">
                    <span class="banco-valor-label">🎉 Valor Liberado</span>
                    <span class="banco-valor-num liberado">
                        <input type="number" id="${banco}-liberado-input" class="resim-input resim-liberado"
                            value="${valorLiberado.toFixed(2)}"
                            ${banco === 'v8' ? `oninput="onModoV8('liberado'); onEditarSimulacao('${banco}')"` : `oninput="onEditarSimulacao('${banco}')"`}>
                    </span>
                </div>
            </div>

            <div class="banco-acoes" id="${banco}-acoes">
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
        <div class="banco-card" id="card-${banco}">
            <div class="banco-header">
                <div class="banco-logo">
                    ${banco === 'v8' 
                        ? '<img src="/static/imagens/fotobancov8.png" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">' 
                        : banco === 'have'
                            ? '<img src="/static/imagens/logo-havecred.jpeg" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">'
                            : logoTexto}
                </div>
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
    try {
        const resp = await fetch('https://api.sistemamscred.com.br/simularhave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CPF: cpf})
        })
        const resultado = await resp.json()
        
        // Se veio como reprovado com motivo
        if (resultado.tipo === 'reprovado') {
            return {
                tipo: 'reprovado',
                motivo: resultado.motivo || resultado.Message || 'Simulação não aprovada'
            }
        }

        // 🔥 VERIFICAÇÃO MAIS ROBUSTA
        const isCode409 = resultado.Code === 409 || resultado.Code === '409';
        const hasDataPrev = resultado.Message?.includes('Data Prev') || resultado.Message?.includes('data prev');

        console.log('isCode409:', isCode409);
        console.log('hasDataPrev:', hasDataPrev);

        if (isCode409 && hasDataPrev) {
            console.log('⚠️⚠️⚠️ ERRO DATA PREV DETECTADO! ⚠️⚠️⚠️')
            return {
                tipo: 'erro_data_prev',
                message: resultado.Message,
                Code: resultado.Code
            }
        }

        // Para HAVE
        if (resultado.tipo === 'aprovado') {
            dadosSimulacaoAtual = {
                num_periods: resultado.prazo,
                payment_amount: resultado.valor_parcela,
                disbursement_amount: resultado.valor_solicitado,
                financed_amount: resultado.valor_solicitado,  // ou outro campo se tiver
                first_payment_date: resultado.simulacao?.Data?.Simulation?.first_payment_date || null,
                last_payment_date: resultado.simulacao?.Data?.Simulation?.last_payment_date || null,
                disbursement_date: resultado.simulacao?.Data?.Simulation?.disbursement_date || null,
                interest_rate: resultado.simulacao?.Data?.Simulation?.interest_rate || null,
                iof_amount: resultado.simulacao?.Data?.Simulation?.iof_amount || null
            };
        }

        return resultado;
    } catch(e) {
        console.error('Erro na simulação Have:', e)
        return {
            tipo: 'erro',
            message: 'Erro na comunicação com o servidor'
        };
    }
}

async function simularV8(cpf) {
    // 📌 LOG 4: Ver o que tem antes de enviar
    console.log('🔍 dadosAutorizacao antes de enviar pro V8:', dadosAutorizacao);
    console.log('🔍 cpf:', cpf);
    console.log('🔍 telAtual:', telAtual);

    const payload = {
        cpf: cpf,
        nome: dadosConsulta?.nome || '',
        data_nascimento: dadosConsulta?.dataNascimento || '',
        sexo: dadosConsulta?.sexo || '',
        telefone: telAtual
    };
    
    console.log('📦 Payload enviado pro V8:', payload);

    const resp = await fetch('https://api.sistemamscred.com.br/simularindividual', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    
    const resultado = await resp.json()
    if (resultado.tipo === 'aprovado') {
        dadosSimulacaoAtual = {
            num_periods: resultado.prazo,
            payment_amount: resultado.parcela,
            disbursement_amount: resultado.valor_simulado,
            financed_amount: resultado.valor_simulado,
            first_payment_date: null,  // se não vier, deixa null
            last_payment_date: null,
            disbursement_date: null,
            interest_rate: null,
            iof_amount: null
        };
    }

    console.log('📥 Resposta do V8:', resultado)

    return resultado;
}

function mostrarToast(mensagem, tipo = 'success', duracao = 1500) {
    const toast = document.createElement('div');
    
    let icone = 'check_circle';
    let cor = '#16a34a';
    let sombra = 'rgba(22,163,74,0.35)';
    
    if (tipo === 'success') {
        icone = 'check_circle';
        cor = '#16a34a';
        sombra = 'rgba(22,163,74,0.35)';
    } else if (tipo === 'error') {
        icone = 'error';
        cor = '#dc2626';
        sombra = 'rgba(220,38,38,0.35)';
    } else if (tipo === 'warning') {
        icone = 'warning';
        cor = '#ea580c';
        sombra = 'rgba(234,88,12,0.35)';
    }
    
    toast.innerHTML = `<span class="material-symbols-outlined">${icone}</span> ${mensagem}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${cor};
        color: white;
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.78rem;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 14px ${sombra};
        z-index: 99999;
        animation: slideInToast 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duracao);
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

async function carregarBancos() {
    try {
        const response = await fetch('https://api.sistemamscred.com.br/get-bancos');
        const data = await response.json();
        
        if (data.sucesso && data.bancos) {
            const selectBanco = document.getElementById('dig-banco');
            selectBanco.innerHTML = '<option value="">Selecione um banco</option>';
            
            data.bancos.forEach(banco => {
                const option = document.createElement('option');
                option.value = banco.Id;
                option.setAttribute('data-bankcode', banco.BankCode);
                option.textContent = `${banco.BankCode} - ${banco.Description}`;
                selectBanco.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar bancos:', error);
        const selectBanco = document.getElementById('dig-banco');
        selectBanco.innerHTML = '<option value="">Erro ao carregar bancos</option>';
    }
}

async function irParaDigitacao(banco, nomeBanco){
    //pega os dados corretos dependendo do banco
    let dadosCliente;
    let simulacao;

    if(banco=='v8') {
        dadosCliente = dadosConsulta;
        simulacao = dadosSimulacaoV8;
    } else if (banco === 'have') {
        dadosCliente = dadosConsulta;
        simulacao = dadosConsultaHave;
    }

    if (!dadosCliente || !simulacao) {
        mostrarToast('Aguardando dados da simulação...', 'warning', 2000);
        return;
    }

    console.log('📝 PRAZO NA DIGITAÇÃO (simulacao.prazo):', simulacao?.prazo);
    console.log('📝 dadosSimulacaoAtual.num_periods:', dadosSimulacaoAtual?.num_periods);
    console.log('📝 dadosConsultaHave:', dadosConsultaHave);

    resultadoSimulacaoAtual = {
        nome: dadosCliente.nome,
        cpf: cpfAtual,
        telefone: telAtual,
        nome_mae: dadosCliente.nome_mae,
        banco: banco,
        valor_liberado: simulacao.valor_simulado,
        parcela:simulacao.parcela,
        prazo: simulacao.prazo
    }

    document.getElementById('modal-digitacao').style.display = 'flex';

    // Mostra/esconde seção de documentos conforme o banco
    const secaoDoc = document.getElementById('secao-documentos');
    secaoDoc.style.display = banco === 'have' ? 'block' : 'none';

    const divBanco = document.getElementById('div-banco');
    divBanco.style.display = banco === 'have' ? 'block' : 'none';

    // Reseta os inputs de arquivo ao abrir
    if (banco === 'have') {
        await carregarBancos();

        const formaPagamento = document.getElementById('forma-pagamento')
        const divPix = document.getElementById('div-pix')
        const divConta = document.getElementById('div-conta-bancaria')

        formaPagamento.removeEventListener('change', formaPagamentoHandler)

        function formaPagamentoHandler() {
            if (this.value === 'pix') {
                divPix.style.display = 'block';
                divConta.style.display = 'none';
            } else {
                divPix.style.display = 'none';
                divConta.style.display = 'block';
            }
        }

        formaPagamento.addEventListener('change', formaPagamentoHandler)

        formaPagamento.value='pix'
        divPix.style.display='block'
        divConta.style.display='none'
        
        document.getElementById('dig-doc-frente-nome').textContent = '';
        document.getElementById('dig-doc-verso-nome').textContent = '';
        document.getElementById('dig-doc-frente-preview').style.display = 'none';
        document.getElementById('dig-doc-verso-preview').style.display = 'none';

        function configurarPreview(inputId, nomeId, previewId, imgId) {
            const input = document.getElementById(inputId);
            input.addEventListener('change', function() {
                const file = this.files[0];
                if (!file) return;

                document.getElementById(nomeId).textContent = file.name;

                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById(imgId).src = e.target.result;
                        document.getElementById(previewId).style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    document.getElementById(previewId).style.display = 'none';
                    document.getElementById(nomeId).textContent = `📄 ${file.name}`;
                }
            });
        }

        configurarPreview('dig-doc-frente', 'dig-doc-frente-nome', 'dig-doc-frente-preview', 'dig-doc-frente-img');
        configurarPreview('dig-doc-verso', 'dig-doc-verso-nome', 'dig-doc-verso-preview', 'dig-doc-verso-img');

        document.getElementById('dig-doc-frente').value = '';
        document.getElementById('dig-doc-verso').value = '';
        document.getElementById('dig-doc-frente-nome').textContent = '';
        document.getElementById('dig-doc-verso-nome').textContent = '';

        document.getElementById('dig-doc-frente').addEventListener('change', function() {
            document.getElementById('dig-doc-frente-nome').textContent = this.files[0]?.name || '';
        });
        document.getElementById('dig-doc-verso').addEventListener('change', function() {
            document.getElementById('dig-doc-verso-nome').textContent = this.files[0]?.name || '';
        });
    }
    const formatarDataBR = (isoDate) => {
        if (!isoDate) return '';
        const data = new Date(isoDate)
        if (isNaN(data.getTime())) return '';
        return data.toLocaleDateString('pt-BR')
    }

    document.getElementById('dig-nome').value = dadosCliente.nome || '';
    document.getElementById('dig-cpf').value = cpfAtual || '';
    document.getElementById('dig-doc-numero').value = cpfAtual?.replace(/\D/g, '') || '';
    document.getElementById('dig-doc-orgao').value = 'SSP';
    document.getElementById('dig-nacionalidade').value = 'Brasileiro';
    document.getElementById('dig-nascimento').value = formatarDataBR(dadosCliente.dataNascimento);
    document.getElementById('dig-nome-mae').value = dadosCliente.nome_mae || '';

    const estadoCivilSelect = document.getElementById('dig-estado-civil');
    estadoCivilSelect.value = 'single';

    const tipoDocSelect = document.getElementById('dig-doc-tipo');
    tipoDocSelect.value = 'rg';

    //telefone
    const tel = telAtual || '';
    document.getElementById('dig-ddd').value = tel.slice(0, 2);
    document.getElementById('dig-telefone-modal').value = tel.slice(2)

    // Define a UF baseada no DDD (para usar no payload)
    const dddCliente = document.getElementById('dig-ddd').value.trim();
    const ufExpedicaoCalculada = ufPorDDD[parseInt(dddCliente)] || 'RN';

    // Salva a UF em um data attribute ou variável para usar no payload depois
    document.getElementById('dig-doc-orgao').setAttribute('data-uf', ufExpedicaoCalculada);

    // Sexo
    const generoSelect = document.getElementById('dig-genero');
    generoSelect.value = dadosCliente.sexo?.toLowerCase().includes('fem') ? 'female' : 'male';

    //pix
    const pixTipoSelect = document.getElementById('dig-pix-tipo')
    const pixChaveInput = document.getElementById('dig-pix-chave')

    pixTipoSelect.value = 'cpf';
    pixChaveInput.value = cpfAtual || '';

    // Remove event listener anterior para não duplicar
    pixTipoSelect.removeEventListener('change', pixChangeHandler);
    pixTipoSelect.addEventListener('change', pixChangeHandler);

    function pixChangeHandler() {
        if (this.value === 'cpf') {
            pixChaveInput.value = cpfAtual || '';
        } else {
            pixChaveInput.value = '';
        }
    }

    // Configura o CEP (já existe, mas mantém)
    const cepInput = document.getElementById('dig-cep');
    cepInput.removeEventListener('input', cepHandler);
    cepInput.addEventListener('input', cepHandler);

    async function cepHandler() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const end = await r.json();
                if (!end.erro) {
                    document.getElementById('dig-rua').value = end.logradouro || '';
                    document.getElementById('dig-bairro').value = end.bairro || '';
                    document.getElementById('dig-cidade').value = end.localidade || '';
                    document.getElementById('dig-estado').value = end.uf || '';
                }
            } catch(e) {
                console.error('Erro ViaCEP:', e);
            }
        }
    }

    // Configura a data do documento
    const docDataInput = document.getElementById('dig-doc-data');
    docDataInput.removeEventListener('input', docDataHandler);
    docDataInput.addEventListener('input', docDataHandler);


    function docDataHandler() {
        let v = this.value.replace(/\D/g, '').slice(0, 8);
        v = v.replace(/(\d{2})(\d)/, '$1/$2');
        v = v.replace(/(\d{2})(\d)/, '$1/$2');
        this.value = v;
    }

    // Botão de envio
    const enviarBtn = document.getElementById('btn-enviar-digitacao');
    const novoEnviarBtn = enviarBtn.cloneNode(true);
    enviarBtn.parentNode.replaceChild(novoEnviarBtn, enviarBtn);

    novoEnviarBtn.onclick = async function() {
        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Enviando...';

        // Função para converter arquivo para base64
        const fileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                if (!file) {
                    resolve('');
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = error => reject(error);
            });
        };

        const ddd = document.getElementById('dig-ddd').value.trim();
        const telNum = document.getElementById('dig-telefone-modal').value.replace(/\D/g, '');

        const converterData = (data) => {
            if (!data || !data.includes('/')) return data;
            const [d, m, a] = data.split('/');
            return `${a}-${m}-${d}`;
        };

        // PRIMEIRO IF: Força o prazo no dadosSimulacaoAtual
        if (banco === 'have') {
            const prazoSelect = document.getElementById('have-prazo-input');
            if (prazoSelect && prazoSelect.value) {
                dadosSimulacaoAtual.num_periods = parseInt(prazoSelect.value);
                console.log('🔥 FORÇANDO PRAZO NA DIGITAÇÃO:', dadosSimulacaoAtual.num_periods);
            }
        }


        if (banco === 'have') {
            dadosSimulacaoAtual = {
                num_periods: dadosConsultaHave?.prazo,
                payment_amount: dadosConsultaHave?.valor_parcela,
                disbursement_amount: dadosConsultaHave?.valor_solicitado,
                financed_amount: dadosConsultaHave?.simulacao?.Data?.Simulation?.financed_amount || dadosConsultaHave?.valor_solicitado,
                first_payment_date: dadosConsultaHave?.simulacao?.Data?.Simulation?.first_payment_date || null,
                last_payment_date: dadosConsultaHave?.simulacao?.Data?.Simulation?.last_payment_date || null,
                disbursement_date: dadosConsultaHave?.simulacao?.Data?.Simulation?.disbursement_date || null,
                interest_rate: dadosConsultaHave?.simulacao?.Data?.Simulation?.interest_rate || null,
                iof_amount: dadosConsultaHave?.simulacao?.Data?.Simulation?.iof_amount || null
            };
            console.log('📝 dadosSimulacaoAtual montado pro Have:', dadosSimulacaoAtual);
        }
        
        const payload = {
            nome: document.getElementById('dig-nome').value.trim(),
            email: document.getElementById('dig-email').value.trim(),
            cpf: document.getElementById('dig-cpf').value.replace(/\D/g, ''),
            data_nascimento: converterData(document.getElementById('dig-nascimento').value),
            nome_mae: document.getElementById('dig-nome-mae').value.trim(),
            genero: document.getElementById('dig-genero').value,
            orgao_emissor: document.getElementById('dig-doc-orgao').value.trim(),
            tipo_documento: document.getElementById('dig-doc-tipo').value,
            numero_documento: document.getElementById('dig-doc-numero').value.trim(),
            data_emissao_documento: converterData(document.getElementById('dig-doc-data').value),
            ddd: ddd,
            numero_telefone: telNum,
            cep: document.getElementById('dig-cep').value.replace(/\D/g, ''),
            rua: document.getElementById('dig-rua').value.trim(),
            numero_endereco: document.getElementById('dig-numero-end').value.trim(),
            complemento: document.getElementById('dig-complemento').value.trim(),
            bairro: document.getElementById('dig-bairro').value.trim(),
            cidade: document.getElementById('dig-cidade').value.trim(),
            estado: document.getElementById('dig-estado').value.trim(),

            // Dados de pagamento
            forma_pagamento: document.getElementById('forma-pagamento').value,
            chave_pix: document.getElementById('dig-pix-chave').value.trim(),
            tipo_chave_pix: document.getElementById('dig-pix-tipo').value,

            // Dados de conta bancária (se for transferência)
            banco_id: document.getElementById('dig-banco').value,
            banco_code: document.getElementById('dig-banco').options[document.getElementById('dig-banco').selectedIndex]?.getAttribute('data-bankcode'),
            agencia: document.getElementById('dig-agencia').value.trim(),
            agencia_digito: document.getElementById('dig-agencia-dig').value.trim(),
            conta: document.getElementById('dig-conta').value.trim(),
            conta_digito: document.getElementById('dig-conta-dig').value.trim(),
            tipo_conta: document.getElementById('dig-tipo-conta').value,

            banco: banco,

            // NOVOS CAMPOS ADICIONADOS
            estado_civil: 'single',
            uf_emissao: ufExpedicaoCalculada,

            worker: dadosWorkerAtual,
            simulacao: dadosSimulacaoAtual
        };

        // SEGUNDO IF: Adiciona os documentos base64
        if (banco === 'have') {
            const docFrente = document.getElementById('dig-doc-frente').files[0];
            const docVerso = document.getElementById('dig-doc-verso').files[0];

            if (docFrente) {
                payload.doc_frente_base64 = await fileToBase64(docFrente);
                payload.doc_frente_nome = docFrente.name;
            }
            if (docVerso) {
                payload.doc_verso_base64 = await fileToBase64(docVerso);
                payload.doc_verso_nome = docVerso.name;
            }

        }

        if (!payload.cep || !payload.rua || !payload.numero_endereco) {
            mostrarToast('Preencha o endereço completo antes de enviar.', 'warning', 3000);
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">send</span> Enviar Proposta';
            return;
        }

        try {

            const url = banco === 'v8' 
                ? 'https://api.sistemamscred.com.br/digitarindividual'
                : 'https://api.sistemamscred.com.br/digitarhave';

            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const resultado = await response.json();

            if (resultado.sucesso) {
                document.getElementById('modal-digitacao').style.display = 'none';
                mostrarToast('Proposta digitada com sucesso!');
                const linkFormalizacao = resultado.dados?.formalization_url || '';
                
                document.getElementById('resultado-individual-body').innerHTML = `
                    <div style="padding:20px;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:18px;">
                            <span class="status-badge status-aprovado">✓ Proposta Digitada</span>
                            <span style="font-size:0.78rem; color:#888;">${resultadoSimulacaoAtual.nome || ''}</span>
                        </div>
                        <div class="cliente-field full-width" style="margin-bottom:0;">
                            <label class="cliente-field-label">🔗 Link de Formalização</label>
                            <div style="display:flex; gap:8px; align-items:center;">
                                <input type="text" class="cliente-field-input" value="${linkFormalizacao}" id="link-formalizacao" readonly style="background:#f5f5f5; cursor:default; flex:1;">
                                <button id="btn-copiar-link" onclick="copiarLink()" style="display:flex; align-items:center; justify-content:center; width:42px; height:42px; flex-shrink:0; background:#eb6505; border:none; border-radius:8px; color:white; cursor:pointer; transition:background 0.2s;">
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
            alert('Erro ao enviar a proposta!');
            console.error(err);
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