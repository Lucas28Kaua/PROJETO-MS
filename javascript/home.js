// --- CONFIGURAÇÕES INICIAIS ---
const idDono = localStorage.getItem('usuarioId');

async function inicializarHome() {
    await carregarConfiguracoes(); // Primeiro carrega as metas
    await carregarDashboardDoBanco(); // Depois carrega a produção e cards
}

// 1. BUSCA METAS E ATUALIZA OS DISPLAYS
async function carregarConfiguracoes() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/configuracoes');
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
        const response = await fetch(`http://127.0.0.1:5000/propostas?usuario_id=${idDono}`);
        const propostas = await response.json();

        let somaTotalUsuario = 0;
        const container = document.getElementById('containerCardsHome'); // Certifique-se que esse ID existe no HTML
        if(container) container.innerHTML = ""; 

        propostas.forEach(p => {
            // Cálculo do Valor Real (Lógica que arrumamos antes)
            const t = parseFloat(p.valor_operacao) || 0;
            const s = parseFloat(p.saldo_devedor_estimado) || 0;
            const isPort = (p.operacao_feita || "").toLowerCase().includes('port');
            const valorReal = isPort ? (t + s) : t;

            // Se a proposta estiver finalizada, soma na produção do mês
            if(p.status_proposta === 'Finalizado') {
                somaTotalUsuario += valorReal;
            }

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

// 3. FUNÇÃO QUE DESENHA O CARD (A que estava faltando!)
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

// --- EVENTOS DE INTERFACE ---
document.addEventListener('DOMContentLoaded', inicializarHome);

document.getElementById('toggleMenu').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('aberto');
});

function fazerLogout() {
    localStorage.clear();
    window.location.replace("telalogin.html");
}