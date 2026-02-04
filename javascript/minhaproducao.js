// === Sidebar Toggle ===
const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');
let currentEditingCard = null; // null significa que vamos adicionar novo
// Toggle do botão normal da sidebar (desktop)
if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('aberto');
    });
}

// Menu hambúrguer mobile
if (menuToggle) {
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('aberto');
        menuToggle.classList.toggle('ativo');
        if (overlay) overlay.classList.toggle('ativo');
    });
}

// Fecha ao clicar no overlay
if (overlay) {
    overlay.addEventListener('click', function () {
        sidebar.classList.remove('aberto');
        if (menuToggle) menuToggle.classList.remove('ativo');
        overlay.classList.remove('ativo');
    });
}

const modal = document.querySelector('.modal')

function abrirModal(){
    modal.style.display="flex";
    modal.classList.add('mostrar');
}

function fecharModal(){
    modal.style.display="none";
}

const nomeDoCliente = document.getElementById('iNome')
const cpfDoCliente = document.getElementById('iCPF')
const convenioDoCliente = document.getElementById('modalConvenio') 
const operacaoDoCliente = document.getElementById('modalOperacao')
const parcelaPortCliente = document.getElementById('valorParcelaPort')
const trocoPortCliente = document.getElementById('trocoEstimado')
const saldoPortCliente = document.getElementById('saldoDevedor')
const dataSaldoPortCliente = document.getElementById('dataRetorno')
const valorOperacaoCliente = document.getElementById('valorLiberado')
const valorParcelaCliente = document.getElementById('valorParcela')
const statusPropostaCliente = document.getElementById('statusProposta')
const detalheStatusProposta = document.getElementById('detalheStatus')
const bancoOperacao = document.getElementById('modalBanco')
const promotoraOperacao = document.getElementById('modalPromotora')

function pegarValoresDoFormulario(event) {
    if (event) event.preventDefault();

    // 1. Captura inicial
    const dados = {
        nome: nomeDoCliente.value,
        cpf: cpfDoCliente.value,
        convenio: convenioDoCliente.value,
        operacao: operacaoDoCliente.value,
        status: statusPropostaCliente.value,
        valorOperacao: valorOperacaoCliente.value,
        valorParcela: valorParcelaCliente.value, 
        banco: bancoOperacao.value,
        promotora: promotoraOperacao.value,
        detalhamento: detalheStatusProposta.value,
        retornoSaldo: dataSaldoPortCliente.value,
        saldoCliente: saldoPortCliente.value,
        troco: trocoPortCliente.value 
    };

    // 2. Lógica de Sobrescrita e Validação Específica para Portabilidade
    if (dados.operacao === 'portRefin') {
        dados.valorParcela = parcelaPortCliente.value; 
        
        // A validação PRECISA estar dentro do IF da portabilidade
        if (!dados.valorParcela || !dados.retornoSaldo || !dados.saldoCliente) {
            alert('Para Portabilidade, preencha Parcela, Saldo e Retorno.');
            return null;
        }
    }

    // 3. Validação dos campos básicos (para qualquer card)
    if (!dados.nome || !dados.cpf || !dados.status) {
        alert('Por favor, preencha Nome, CPF e Status.');
        return null;
    }

    // --- AÇÕES DE EXECUÇÃO ---
    gerarCardNoDashboard(dados);

    // 5. Limpeza e Fechamento
    const formulario = document.getElementById('formProposta');
    if (formulario) formulario.reset();

    document.getElementById('camposPortabilidade').style.display = 'none';
    fecharModal();

    console.log("✅ Sucesso!", dados);
}


function gerarCardNoDashboard(dados){
    
    const configStatus = {
        "Novo": { coluna: "linhaStatusNova", classe: "cardStatusNovo" },
        "Processando": { coluna: "linhaStatusAnalise", classe: "cardStatusAnalise" },
        "Finalizado": { coluna: "linhaStatusFinalizado", classe: "cardStatusFinalizado" }
    };

    const config = configStatus[dados.status];
    const colunaAlvo = document.getElementById(config.coluna);

    if (!colunaAlvo) {
        console.error("Coluna não encontrada:", config.coluna);
        return;
    }

    const card = document.createElement('div');
    card.className = config.classe;

    card.innerHTML = `
        <div class="card-header">
            <span class="proposta-id">ID: #${Math.floor(Math.random() * 10000)}</span>
            <button class="btn-menu" onclick="this.closest('.${config.classe}').remove()">⋮</button>
        </div>

        <h4 class="cliente-nome">${dados.nome}</h4>

        <div class="info-grupo">
            <label>Convênio / Operação</label>
            <span>${dados.convenio.toUpperCase()} - ${dados.operacao}</span>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <div class="info-grupo" style="flex: 1; margin-bottom: 0;">
                <label>Banco</label>
                <span style="font-size: 0.85rem;">${dados.banco || '---'}</span>
            </div>
            <div class="info-grupo" style="flex: 1; margin-bottom: 0;">
                <label>Promotora</label>
                <span style="font-size: 0.85rem;">${dados.promotora || '---'}</span>
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <div class="info-grupo" style="flex: 1; margin-bottom: 0;">
                <label>Valor Operação</label>
                <span class="valor-destaque" style="font-size: 1.1rem;">R$ ${dados.valorOperacao || '0,00'}</span>
            </div>
            <div class="info-grupo" style="flex: 1; margin-bottom: 0;">
                <label>Parcela</label>
                <span style="color: green; font-weight: 800; font-size: 1.1rem;">R$ ${dados.valorParcela || '0,00'}</span>
            </div>
        </div>

        ${dados.retornoSaldo || dados.saldoCliente ? `
            <div style="display: flex; gap: 10px; margin-top: 8px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                ${dados.retornoSaldo ? `
                    <div class="info-grupo" style="flex: 1; border-left: 3px solid #ff6a00; padding-left: 8px; margin-bottom: 0;">
                        <label style="color: #ff6a00; font-size: 0.65rem;">📅 RETORNO</label>
                        <span style="font-size: 0.85rem;">${dados.retornoSaldo.split('-').reverse().join('/')}</span>
                    </div>
                ` : ''}
                ${dados.saldoCliente ? `
                    <div class="info-grupo" style="flex: 1; border-left: 3px solid #224CBA; padding-left: 8px; margin-bottom: 0;">
                        <label style="color: #224CBA; font-size: 0.65rem;">💰 SALDO DEV.</label>
                        <span style="font-size: 0.85rem;">R$ ${dados.saldoCliente}</span>
                    </div>
                ` : ''}
            </div>
        ` : ''}

        ${dados.detalheStatus ? `
        <div class="info-grupo" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px;">
            <label>Detalhe Status</label>
            <div style="font-size: 0.82rem; font-weight: 500; color: #333; max-height: 80px; overflow-y: auto; word-break: break-word;">
                ${dados.detalheStatus}
            </div>
        </div>
        ` : ''}

        <div class="card-footer" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1);">
            <div class="status-badge">
                <span style="font-size: 0.75rem; color: #666;">CPF: ${dados.cpf}</span>
            </div>
        </div>
    `; 

    colunaAlvo.appendChild(card);

}

//JS escutando o select operação e atuando sobre a portabilidade
const divPortabilidade = document.getElementById('camposPortabilidade');

operacaoDoCliente.addEventListener('change', function() {

    if(this.value === 'portRefin'){
        divPortabilidade.style.display = "block";
    } else{
        divPortabilidade.style.display = "none";
    }
})