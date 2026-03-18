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

        let totais = {
            margem: { valor: 0, clientes: 0 },
            portabilidade: { contratos: 0, clientes: 0 },
            cartao: { cartoes: 0, clientes: 0 }
        }

        oportunidades.forEach(op => {
            const tipos = op.tipo.split('+');
            
            if (tipos.includes('margem')) {
                totais.margem.valor += parseFloat(op.margem_disponivel) || 0;
                totais.margem.clientes++;
            }
            if (tipos.includes('portabilidade')) {
                totais.portabilidade.contratos += op.contratos_portaveis?.length || 0;
                totais.portabilidade.clientes++;
            }
            if (tipos.includes('cartao')) {
                totais.cartao.cartoes += op.cartoes?.length || 0;
                totais.cartao.clientes++;
            }
        });

        document.getElementById('resumo-margem').innerText = `R$ ${totais.margem.valor.toFixed(2).replace('.', ',')}`;
        document.getElementById('resumo-qtd-margem').innerText = `${totais.margem.clientes} cliente${totais.margem.clientes !== 1 ? 's' : ''}`;

        document.getElementById('resumo-portabilidade').innerText = totais.portabilidade.contratos;
        document.getElementById('resumo-qtd-port').innerText = `${totais.portabilidade.clientes} cliente${totais.portabilidade.clientes !== 1 ? 's' : ''}`;

        document.getElementById('resumo-cartoes').innerText = totais.cartao.cartoes;
        document.getElementById('resumo-qtd-cartao').innerText = `${totais.cartao.clientes} cliente${totais.cartao.clientes !== 1 ? 's' : ''}`;

        container.innerHTML = '';

        oportunidades.forEach(op => {
            const tipos = op.tipo.split('+');
            const card = document.createElement('div');
            card.className = 'oportunidade-card';

            let icones = '';
            if (tipos.includes('margem')) {
                icones += `<span class="tipo-badge tipo-margem">💰 R$ ${parseFloat(op.margem_disponivel).toFixed(2).replace('.', ',')}</span>`;
            }
            if (tipos.includes('portabilidade')) {
                icones += `<span class="tipo-badge tipo-portabilidade">📦 ${op.contratos_portaveis?.length || 0} contratos</span>`;
            }
            if (tipos.includes('cartao')) {
                const qtd = op.cartoes?.length || 0;
                const textoCartao = qtd > 1 ? 'cartões BMG' : 'cartão BMG';
                icones += `<span class="tipo-badge tipo-cartao">💳 ${qtd} ${textoCartao}</span>`;
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong>${op.nome}</strong>
                        <div style="font-size: 11px; color: #999; margin-top: 2px;">
                            CPF: ${op.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </div>
                    </div>
                    <span style="color: #666; font-size: 12px; background: #f0f0f0; padding: 2px 8px; border-radius: 12px;">
                        ${op.idade || '?'} anos
                    </span>
                </div>
                <div style="margin: 10px 0; display: flex; gap: 8px; flex-wrap: wrap;">
                    ${icones}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <span style="font-size: 11px; color: #999;">📅 ${op.data_consulta}</span>
                    <button class="btn-oportunidade" onclick="verCliente('${op.cpf}')">Ver</button>
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