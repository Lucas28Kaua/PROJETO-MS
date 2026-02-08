// === Sidebar Toggle ===
const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');
let currentEditingCard = null; // null significa que vamos adicionar novo
// Toggle do botão normal da sidebar (desktop)

function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, ""); // Remove tudo que não é número
    if (v.length > 11) v = v.slice(0, 11);  // Limita a 11 dígitos
    
    v = v.replace(/(\d{3})(\d)/, "$1.$2");       // Ponto após o terceiro dígito
    v = v.replace(/(\d{3})(\d)/, "$1.$2");       // Ponto após o sexto dígito
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Traço após o nono dígito
    
    input.value = v;
}

// MÁSCARA DE DINHEIRO (1.250,00)
function mascaraMoeda(input) {
    let v = input.value.replace(/\D/g, ""); // Remove tudo que não é número
    
    // Transforma em decimal
    v = (v / 100).toFixed(2).replace(".", ",");
    
    // Adiciona os pontos de milhar
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    
    input.value = v;
}

function calcularTempoDecorrido(dataIso) {
    // 1. Se não vier data, não deixa dar NaN, retorna um aviso
    if (!dataIso || dataIso === "undefined") return "Agora";

    const criacao = new Date(dataIso);
    
    // 2. Verifica se o JS conseguiu transformar o texto em uma data real
    if (isNaN(criacao.getTime())) return "Agora";

    const agora = new Date();
    const diferencaEmSegundos = Math.floor((agora - criacao) / 1000);

    if (diferencaEmSegundos < 60) return "Agora mesmo";
    
    const minutos = Math.floor(diferencaEmSegundos / 60);
    if (minutos < 60) return `Há ${minutos} min`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Há ${horas}h`;
    
    const dias = Math.floor(horas / 24);
    return `Há ${dias} dias`;
}

setInterval(() => {
    const logs = document.querySelectorAll('.tempo-log');
    logs.forEach(log => {
        const dataCriacao = log.getAttribute('data-criacao');
        if(dataCriacao) {
            log.innerText = `🕒 ${calcularTempoDecorrido(dataCriacao)}`;
        }
    });
}, 60000); // Atualiza a cada 1 minuto

if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('aberto');
    });
}

function validarExibicaoPorMes(dataIso, status){
    const dataCriacao = new Date(dataIso)
    const agora = new Date()

    // REGRA 1: Se o card NÃO estiver finalizado, ele SEMPRE aparece (não importa a idade)
    if (status !== "Finalizado"){
        return true;
    }

    // REGRA 2: Se estiver finalizado, verificamos se é do mês e ano atual
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const mesCard = dataCriacao.getMonth();
    const anoCard = dataCriacao.getFullYear();

    return(mesCard === mesAtual && anoCard === anoAtual);

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

function prepararNovoCard() {
    currentEditingCard = null; // Libera a memória: agora o JS sabe que é um NOVO card
    
    const formulario = document.getElementById('formProposta');
    if (formulario) formulario.reset(); // Limpa os campos
    
    // Esconde a div de portabilidade por padrão
    if (divPortabilidade) divPortabilidade.style.display = 'none';
    
    abrirModal();
}

function fecharModal() {
    modal.style.display = "none";
    currentEditingCard = null; // Reset por segurança ao sair
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

async function pegarValoresDoFormulario(event) {
    if (event) event.preventDefault();

    const usuarioId = localStorage.getItem('usuarioId');

    // 1. Captura inicial
    const dados = {
        usuario_id: usuarioId,
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
        troco: trocoPortCliente.value,
        dataCriacao: currentEditingCard ? JSON.parse(currentEditingCard.getAttribute('data-dados')).dataCriacao : new Date().toISOString()
    };

    // 2. Lógica de Sobrescrita e Validação Específica para Portabilidade
    if (dados.operacao === 'portRefin') {
        dados.valorParcela = parcelaPortCliente.value; 
        
        // A validação PRECISA estar dentro do IF da portabilidade
        if (!dados.valorParcela || !dados.retornoSaldo || !dados.saldoCliente) {
            alert('Para Portabilidade, preencha Parcela, Saldo e Retorno.');
            return;
        }
    }

    // 3. Validação dos campos básicos (para qualquer card)
    if (!dados.nome || !dados.cpf || !dados.status) {
        alert('Por favor, preencha Nome, CPF e Status.');
        return null;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/propostas/criar", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            // Se salvou no banco, aí sim a gente faz o que você já fazia no front
            if (currentEditingCard) {
                currentEditingCard.remove();
                currentEditingCard = null;
            }

            gerarCardNoDashboard(dados);
            atualizarIndicadores();
            
            const formulario = document.getElementById('formProposta');
            if (formulario) formulario.reset();
            document.getElementById('camposPortabilidade').style.display = 'none';
            fecharModal();
            
            alert("Proposta criada com sucesso!");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor!");
    }
}

async function carregarPropostasDoBanco() {
    const usuarioId = localStorage.getItem('usuarioId');
    
    if (!usuarioId) {
        console.error("Usuário não identificado. Redirecionando...");
        return;
    }

    try {
        // 1. Chama a sua rota GET que acabamos de ajustar
        const response = await fetch(`http://127.0.0.1:5000/propostas?usuario_id=${usuarioId}`);
        
        if (!response.ok) throw new Error("Erro ao buscar dados do servidor");

        const propostas = await response.json();

        // 2. Limpa as colunas antes de renderizar (para não duplicar no F5)
        document.getElementById('linhaStatusNova').innerHTML = '';
        document.getElementById('linhaStatusAnalise').innerHTML = '';
        document.getElementById('linhaStatusFinalizado').innerHTML = '';

        // 3. Itera sobre cada proposta vinda do MySQL
        propostas.forEach(p => {
            // Transformamos os nomes das colunas do banco nos nomes que o seu Card espera
            const dadosParaCard = {
                nome: p.nome_cliente,
                cpf: p.cpf_cliente,
                convenio: p.convenio,
                operacao: p.operacao_feita,
                status: p.status_proposta,
                banco: p.banco,
                promotora: p.promotora,
                detalhamento: p.detalhe_status,
                // O banco manda números, o JS formata para R$
                valorOperacao: p.valor_operacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                valorParcela: p.valor_parcela_geral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                valorParcelaPort: p.valor_parcela_port ? p.valor_parcela_port.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
                // A DATA que o MySQL criou automaticamente:
                dataCriacao: p.data_criacao, 
                retornoSaldo: p.data_retorno_saldo,
                saldoCliente: p.saldo_devedor_estimado,
                troco: p.troco_estimado
            };

            // 4. Chama a sua função que já existe para desenhar na tela
            gerarCardNoDashboard(dadosParaCard);
        });

        // 5. Atualiza os números do topo (Total, Nova, etc)
        atualizarIndicadores();

    } catch (error) {
        console.error("❌ Erro ao carregar dashboard:", error);
    }
}

// EXECUÇÃO AUTOMÁTICA: Roda assim que a página abre
document.addEventListener('DOMContentLoaded', carregarPropostasDoBanco);

function gerarCardNoDashboard(dados){
    
    if (!validarExibicaoPorMes(dados.dataCriacao, dados.status)){
        console.warn(`Card de ${dados.nome} ocultado por pertencer a um fechamento de mês anterior`)
        return;
    }

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
    card.setAttribute('data-dados', JSON.stringify(dados));

    card.innerHTML = `

        <div class="card-header" style="position: relative;">
            <span class="proposta-id">ID: #${Math.floor(Math.random() * 10000)}</span>
    
            <div class="menu-container">
                <button class="btn-menu-dots" onclick="toggleMais(this)">⋮</button>
                <div class="menu-dropdown" style="display: none;">
                    <button onclick="editarCard('${dados.cpf}', this)">✏️ Editar</button>
                    <button onclick="excluirCard(this)" class="btn-delete">🗑️ Excluir</button>
                </div>
            </div>
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

        ${dados.detalhamento ? `
        <div class="info-grupo" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px;">
            <label>Detalhe Status</label>
            <div style="font-size: 0.82rem; font-weight: 500; color: #333; max-height: 80px; overflow-y: auto; word-break: break-word;">
                ${dados.detalhamento}
            </div>
        </div>
        ` : ''}

        <div class="card-footer" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
            <div class="status-badge">
                <span style="font-size: 0.75rem; color: #666;">CPF: ${dados.cpf}</span>
            </div>
            
            <span class="tempo-log" data-criacao="${dados.dataCriacao}" style="font-size: 0.7rem; color: #888; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-weight: 500;">
                🕒 ${calcularTempoDecorrido(dados.dataCriacao)}
            </span>
        </div>
    `; 

    
    colunaAlvo.appendChild(card);
    atualizarIndicadores();
}

const totalProducao = document.getElementById('valorTotalProd')

function atualizarIndicadores() {
    // 1. MAPEAMENTO: Adicionamos a propriedade 'saldo' apenas na coluna finalizada
    const colunas = [
        { linha: 'linhaStatusNova', count: 'countNova', sum: 'sumNova' },
        { linha: 'linhaStatusAnalise', count: 'countAnalise', sum: 'sumAnalise' },
        { linha: 'linhaStatusFinalizado', count: 'countFinalizado', sum: 'sumFinalizado', saldo: 'saldoFinalizado' }
    ];

    // Variável para a "Produção Real" (Operação + Saldo dos finalizados)
    let totalParaOPopup = 0;

    colunas.forEach(col => {
        const elementoLinha = document.getElementById(col.linha);
        if (!elementoLinha) return; // Evita erro se a coluna não existir na tela

        const cards = elementoLinha.querySelectorAll('[data-dados]');
        
        let somaTotalColuna = 0;
        let somaSaldoColuna = 0;

        cards.forEach(card => {
            const dados = JSON.parse(card.getAttribute('data-dados'));
            
            // Valor da Operação (Produção Bruta)
            let valorOp = 0;
            if (dados.valorOperacao) {
                let valorLimpo = dados.valorOperacao.replace(/[^\d,]/g, '').replace(',', '.');
                valorOp = parseFloat(valorLimpo) || 0;
                somaTotalColuna += valorOp;
            }

            // Valor do Saldo (Portabilidade)
            let valorSl = 0;
            if (dados.saldoCliente) {
                let saldoLimpo = String(dados.saldoCliente).replace(/[^\d,]/g, '').replace(',', '.')
                valorSl = parseFloat(saldoLimpo) || 0;
                somaSaldoColuna += valorSl;
            }

            // MÁGICA: Se estiver na coluna Finalizado, acumula os dois para o popup
            if (col.linha === 'linhaStatusFinalizado') {
                totalParaOPopup += (valorOp + valorSl);
            }
        });

        // Atualiza a bolinha (Quantidade)
        document.getElementById(col.count).innerText = cards.length;

        // Atualiza a soma da Operação na coluna
        document.getElementById(col.sum).innerText = somaTotalColuna.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });

        // Se for a coluna que tem o campo saldo, atualiza o texto do saldo nela
        if (col.saldo) {
            const campoSaldo = document.getElementById(col.saldo);
            if (campoSaldo) {
                campoSaldo.innerText = "Saldo: " + somaSaldoColuna.toLocaleString('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                });
            }
        }
    });

    // ATUALIZAÇÃO DO POPUP VERDE (Soma de tudo que foi finalizado)
    const valorTotalProdElement = document.getElementById('valorTotalProd');
    if (valorTotalProdElement) {
        valorTotalProdElement.innerText = totalParaOPopup.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });
    }
}

function toggleMais(button) {
    // Pega o dropdown que está logo após o botão
    const menu = button.nextElementSibling;
    
    // Fecha qualquer outro "toggleMais" que esteja aberto na tela (evita poluição visual)
    document.querySelectorAll('.menu-dropdown').forEach(m => {
        if (m !== menu) m.style.display = 'none';
    });

    // Alterna o atual
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';

    // Fecha se clicar em qualquer outro lugar da tela
    const fecharAoClicarFora = (e) => {
        if (!button.contains(e.target) && !menu.contains(e.target)) {
            menu.style.display = 'none';
            document.removeEventListener('click', fecharAoClicarFora);
        }
    };
    document.addEventListener('click', fecharAoClicarFora);
}

function excluirCard(button){
    // 1. Localiza o card pai usando as classes que você criou no configStatus
    const card = button.closest('.cardStatusNovo, .cardStatusAnalise, .cardStatusFinalizado');
    
    // 2. Puxa o nome do cliente de dentro desse card específico
    const nome = card.querySelector('.cliente-nome').innerText;

    // 3. Confirmação para evitar exclusão acidental
    if (confirm(`Tem certeza que deseja excluir a proposta de ${nome}?`)) {
        
        // Efeito visual de saída 
        card.style.transition = "0.3s";
        card.style.opacity = "0";
        card.style.transform = "scale(0.8)";
        
        setTimeout(() => {
            card.remove();
            atualizarIndicadores();
            console.log(`Proposta de ${nome} removida.`);
        }, 300);
    }
}

function editarCard(cpf, button) {
    // 1. Acha o card e puxa os dados que guardamos nele
    const card = button.closest('.cardStatusNovo, .cardStatusAnalise, .cardStatusFinalizado');
    const dados = JSON.parse(card.getAttribute('data-dados'));

    // 2. Avisa ao sistema qual card estamos editando
    currentEditingCard = card;

    // 3. Preenche o formulário com os IDs que você já criou
    nomeDoCliente.value = dados.nome;
    cpfDoCliente.value = dados.cpf;
    convenioDoCliente.value = dados.convenio;
    operacaoDoCliente.value = dados.operacao;
    statusPropostaCliente.value = dados.status;
    valorOperacaoCliente.value = dados.valorOperacao;
    valorParcelaCliente.value = dados.valorParcela;
    bancoOperacao.value = dados.banco;
    promotoraOperacao.value = dados.promotora;
    detalheStatusProposta.value = dados.detalhamento;
    dataSaldoPortCliente.value = dados.retornoSaldo;
    saldoPortCliente.value = dados.saldoCliente;
    trocoPortCliente.value = dados.troco;

    // Dispara o evento de mudança para mostrar campos de portabilidade se necessário
    operacaoDoCliente.dispatchEvent(new Event('change'));

    // 4. Abre o modal
    abrirModal();
}

function filtrarCards() {
    // 1. Pega o que foi digitado
    const termoBusca = document.getElementById('inputBusca').value.toLowerCase().trim();
    
    // 2. Pega todos os cards
    const todosCards = document.querySelectorAll('[data-dados]');

    todosCards.forEach(card => {
        const dados = JSON.parse(card.getAttribute('data-dados'));
        const nome = (dados.nome || "").toLowerCase();
        const cpf = (dados.cpf || "").toLowerCase();

        // 3. Se o nome ou CPF baterem, ele fica visível, senão, some.
        // O display "" garante que ele volte para o layout original (flex/grid)
        if (nome.includes(termoBusca) || cpf.includes(termoBusca)) {
            card.style.display = ""; 
        } else {
            card.style.display = "none";
        }
    });
    
    // AQUI NÃO CHAMAMOS A ATUALIZAÇÃO DE INDICADORES.
    // Assim, os valores lá em cima continuam fixos no total geral.
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