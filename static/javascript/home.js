// --- CONFIGURAÇÕES INICIAIS ---
const idDono = localStorage.getItem('usuarioId');

async function inicializarHome() {
    await carregarConfiguracoes(); // Primeiro carrega as metas
    await carregarDashboardDoBanco(); // Depois carrega a produção e cards
}

// 1. BUSCA METAS E ATUALIZA OS DISPLAYS
async function carregarConfiguracoes() {
    try {
        const response = await fetch('https://sistemamscred.com.br/api/configuracoes');
        if (!response.ok) return;

        const config = await response.json();

        // Atualiza o display da Meta Geral
        const displayMetaGeral = document.getElementById('meta-geral-home');
        if(displayMetaGeral) {
            displayMetaGeral.innerText = parseFloat(config.meta_geral).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }

        // Atualiza o display da Meta Individual (que a barra usa)
        const displayMetaInd = document.getElementById('meta-individual-home');
        if(displayMetaInd) {
            displayMetaInd.innerText = parseFloat(config.meta_individual).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }

        const containerRegras = document.getElementById('lista-regras-home');
        
        if (containerRegras && config.regras_json) {
            containerRegras.innerHTML = ""; // Limpa as regras antigas estáticas

            config.regras_json.forEach(regra => {
                const linha = document.createElement('div');
                linha.className = 'regra-linha';
                
                linha.innerHTML = `
                    <span>${regra.operacao || '-'}</span>
                    <span>${regra.banco || '-'}</span>
                    <span>${regra.promotora || '-'}</span>
                `;
                
                containerRegras.appendChild(linha);
            });
        }
        
    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
    }
}

// 2. BUSCA PRODUÇÃO E GERA OS CARDS
async function carregarDashboardDoBanco() {
    try {
        // Buscamos as propostas do usuário logado
        const response = await fetch(`https://sistemamscred.com.br/propostas?usuario_id=${idDono}`);
        const propostas = await response.json();

        let somaTotalUsuario = 0;
        const agora = new Date();
        const mesAtual = agora.getMonth();
        const anoAtual = agora.getFullYear();

        const container = document.getElementById('containerCardsHome');
        if(container) container.innerHTML = ""; 

        propostas.forEach(p => {
            const dataFinalizacao = new Date(p.data_finalizacao);
            const mesProposta = dataFinalizacao.getMonth();
            const anoProposta = dataFinalizacao.getFullYear();
            const t = parseFloat(p.valor_operacao) || 0;
            const s = parseFloat(p.saldo_devedor_estimado) || 0;
            const isPort = (p.operacao_feita || "").toLowerCase().includes('port');
            const valorReal = isPort ? (t + s) : t;

            if(p.status_proposta === 'Finalizado' &&
                mesProposta === mesAtual &&
                anoProposta === anoAtual
            ){

                somaTotalUsuario += valorReal;                
                
            }
            

            // Se a proposta estiver finalizada, soma na produção do mês
            

            gerarCardNoDashboard(p, valorReal);
        });

        // Atualiza o texto da produção na tela
        const elProd = document.getElementById('prod-mes-anterior');
        if(elProd) {
            elProd.innerText = somaTotalUsuario.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }

        // AGORA SIM, com os valores na tela, atualiza a barra!
        atualizarProgressoMeta();

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
}

function gerarCardNoDashboard(p, valorReal) {
    const container = document.getElementById('containerCardsHome');
    if(!container) return;

    const div = document.createElement('div');
    div.className = 'card-item'; // Use a classe do seu CSS
    div.innerHTML = `
        <div class="info">
            <strong>${p.nome_cliente}</strong>
            <span>${p.banco} - ${p.operacao_feita}</span>
        </div>
        <div class="valor-status">
            <span class="v">${valorReal.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</span>
            <span class="s status-${p.status_proposta.toLowerCase()}">${p.status_proposta}</span>
        </div>
    `;
    container.appendChild(div);
}

// 4. LÓGICA DA BARRA DE PROGRESSO
function atualizarProgressoMeta() {
    const producaoTexto = document.getElementById('prod-mes-anterior').innerText;
    const metaTexto = document.getElementById('meta-individual-home').innerText;

    const limparMoeda = (valor) => {
        return parseFloat(valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
    };

    const producao = limparMoeda(producaoTexto);
    const meta = limparMoeda(metaTexto);

    let porcentagem = meta > 0 ? (producao / meta) * 100 : 0;
    
    const barra = document.querySelector('.barra-progresso');
    const labelPorcentagem = document.getElementById('porcentagem-valor');

    if (barra) barra.style.width = Math.min(porcentagem, 100) + "%";
    if (labelPorcentagem) {
        labelPorcentagem.innerText = porcentagem.toFixed(1) + "%";
        if (porcentagem >= 100) labelPorcentagem.innerText += " 🔥";
    }
}


async function carregarOportunidades() {
    try {
        const container = document.getElementById('oportunidadesContainer');
        if (!container) return;

        container.innerHTML = '<div class="loading-spinner">Carregando oportunidades...</div>';

        const response = await fetch(`https://sistemamscred.com.br/api/oportunidades`)
        const oportunidades = await response.json();

        if (!oportunidades || oportunidades.length === 0) {
            container.innerHTML = '<div class="loading-spinner">Nenhuma oportunidade encontrada no momento.</div>';
            return;
        }

        let stats = {
            margem: {count: 0, total: 0},
            rmc: {count: 0, total: 0},
            rcc: {count: 0, total: 0},
            portabilidade: {count: 0, total: 0},
            cartao: {count: 0}
        }

        container.innerHTML = ''; 

        oportunidades.forEach(op => {
            const tipos = op.tipo.split('+');

            if (tipos.includes('margem')) {
                stats.margem.count++;
                stats.margem.total += parseFloat(op.margem_disponivel) || 0;
            }
            if (tipos.includes('margem_rmc')) {
                stats.rmc.count++;
                stats.rmc.total += parseFloat(op.margem_rmc) || 0;
            }
            if (tipos.includes('margem_rcc')) {
                stats.rcc.count++;
                stats.rcc.total += parseFloat(op.margem_rcc) || 0;
            }
            if (tipos.includes('portabilidade')) {
                stats.portabilidade.count++;
                // Soma o valor das parcelas dos contratos
                if (op.contratos_portaveis) {
                    op.contratos_portaveis.forEach(ct => {
                        stats.portabilidade.total += ct.parcela || 0;
                    });
                }
            }
            if (tipos.includes('cartao')) {
                stats.cartao.count++;
            }

            const card = document.createElement('div');
            card.className = 'oportunidade-card';

            let tiposHTML = '';
            if (tipos.includes('margem')) {
                tiposHTML += `<span class="tipo-badge tipo-margem" title="Margem Consignável">💰 R$ ${parseFloat(op.margem_disponivel).toFixed(2)}</span>`;
            }

            if (tipos.includes('margem_rmc')) {
                tiposHTML += `<span class="tipo-badge tipo-rmc" title="Margem RMC">💳 RMC R$ ${parseFloat(op.margem_rmc || 0).toFixed(2)}</span>`;
            }

            if (tipos.includes('margem_rcc')) {
                tiposHTML += `<span class="tipo-badge tipo-rcc" title="Margem RCC">💳 RCC R$ ${parseFloat(op.margem_rcc || 0).toFixed(2)}</span>`;
            }

            if (tipos.includes('portabilidade')) {
                const qtd = op.contratos_portaveis?.length || 0;
                tiposHTML += `<span class="tipo-badge tipo-portabilidade" title="Portabilidade">📦 ${qtd} contrato${qtd > 1 ? 's' : ''}</span>`;
            }

            if (tipos.includes('cartao')) {
                const qtd = op.cartoes?.length || 0;
                tiposHTML += `<span class="tipo-badge tipo-cartao" title="Saque Cartão BMG">🏧 ${qtd} cartão${qtd > 1 ? 'ões' : ''}</span>`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <h3>${op.nome}</h3>
                    <span class="idade-badge">${op.idade || '?'} anos</span>
                </div>
                <div class="card-tipos">
                    ${tiposHTML}
                </div>
                <div class="card-footer">
                    <span class="data-consulta">📅 ${op.data_consulta || ''}</span>
                    <button class="btn-oportunidade" onclick="verCliente('${op.cpf}')">
                        Ver cliente
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar oportunidades:', error);
        const container = document.getElementById('oportunidades-container');
        if (container) {
            container.innerHTML = '<div class="loading-spinner">Erro ao carregar oportunidades.</div>';
        }
    }
}

function verCliente(cpf) {
    window.location.href = `/telaconsulta.html?cpf=${cpf}`;
}

document.addEventListener('DOMContentLoaded', () => {
    carregarOportunidades();
})

// --- EVENTOS DE INTERFACE ---
document.addEventListener('DOMContentLoaded', inicializarHome);

document.getElementById('toggleMenu').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('aberto');
});

function fazerLogout() {
    localStorage.clear();
    window.location.replace("telalogin.html");
}