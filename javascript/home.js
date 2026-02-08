async function carregarDashboardDoBanco() {
    const idDono = localStorage.getItem('usuarioId');

    const response = await fetch(`http://127.0.0.1:5000/propostas?usuario_id=${idDono}`);
    const propostas = await response.json();

    propostas.forEach(p => {
        // Converte os nomes das colunas do banco (snake_case) 
        // para os nomes que sua função 'gerarCardNoDashboard' espera
        const dadosParaCard = {
            nome: p.nome_cliente,
            cpf: p.cpf_cliente,
            convenio: p.convenio,
            operacao: p.operacao_feita,
            status: p.status_proposta,
            valorOperacao: p.valor_operacao,
            valorParcela: p.valor_parcela_geral,
            banco: p.banco,
            promotora: p.promotora,
            detalhamento: p.detalhe_status,
            dataCriacao: p.data_criacao,
            retornoSaldo: p.data_retorno_saldo,
            saldoCliente: p.saldo_devedor_estimado,
            troco: p.troco_estimado
        };
        
        gerarCardNoDashboard(dadosParaCard);
    });
}

// Chama a função ao carregar a página
window.addEventListener('DOMContentLoaded', carregarDashboardDoBanco);

const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('aberto');
});

const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('aberto');
        menuToggle.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
    });
    
    // Fecha ao clicar no overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('aberto');
        menuToggle.classList.remove('ativo');
        overlay.classList.remove('ativo');
    });
}

function atualizarProgressoMeta() {
    const producaoTexto = document.getElementById('prod-mes-anterior').innerText;
    const metaTexto = document.getElementById('meta-individual-home').innerText;

    const limparMoeda = (valor) => {
        return parseFloat(valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
    };

    const producao = limparMoeda(producaoTexto);
    const meta = limparMoeda(metaTexto);

    let porcentagem = 0;
    if (meta > 0) {
        porcentagem = (producao / meta) * 100;
    }

    // Arredonda para 1 casa decimal (ex: 70.5%)
    const porcentagemFormatada = porcentagem.toFixed(1);
    const porcentagemLimitada = Math.min(porcentagem, 100);

    // 1. Atualiza a largura da barra
    const barra = document.querySelector('.barra-progresso');
    if (barra) {
        barra.style.width = porcentagemLimitada + "%";
    }

    // 2. Atualiza o texto da porcentagem
    const labelPorcentagem = document.getElementById('porcentagem-valor');
    if (labelPorcentagem) {
        labelPorcentagem.innerText = porcentagemFormatada + "%";
        
        // Se bater a meta, muda a cor do texto pra dar um destaque
        if (porcentagem >= 100) {
            labelPorcentagem.style.background = "linear-gradient(90deg, #20613b, #114a29)"
            labelPorcentagem.innerText += " 🔥"; // Emoji de meta batida!
        }
    }
}

// Rodar quando a página carregar
document.addEventListener('DOMContentLoaded', atualizarProgressoMeta);
