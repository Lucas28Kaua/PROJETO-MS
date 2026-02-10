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
    v = (parseInt(v) / 100).toFixed(2).replace(".", ",");
    
    // Adiciona os pontos de milhar
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    
    input.value = v;
}

function calcularTempoDecorrido(dataIso) {
    // 1. Se não vier data, não deixa dar NaN, retorna um aviso
    if (!dataIso || dataIso === "undefined") return "Agora";

    let dataFormatada = dataIso.replace(' ', 'T');

    const criacao = new Date(dataFormatada);
    const agora = new Date();
    // 2. Verifica se o JS conseguiu transformar o texto em uma data real
    if (isNaN(criacao.getTime())) return "Agora";

    let diferencaEmSegundos = Math.floor((agora - criacao) / 1000);

    if (diferencaEmSegundos < 30) return "Agora mesmo";
    if (diferencaEmSegundos < 60) return `Há ${diferencaEmSegundos} seg`;
    
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

    // FUNÇÃO AUXILIAR PARA LIMPAR MOEDA
    const limpar = (valor) => {
        if (valor === null || valor === undefined || valor === "") return 0;
        if (typeof valor === 'number') return valor;

        // 1. Remove "R$" e espaços
        let str = String(valor).replace(/R\$\s?| /g, '');

        // 2. O segredo: Remove todos os PONTOS que servem de milhar
        // (aqueles que têm 3 números depois deles ou que aparecem antes da vírgula)
        str = str.replace(/\.(?=\d{3,}(\,|$))/g, ''); 
        // Se a estratégia acima for complexa, use esta mais agressiva:
        str = str.split('.').join(''); // Remove todos os pontos

        // 3. Agora troca a vírgula decimal por ponto
        str = str.replace(',', '.');

        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    };

    const usuarioId = localStorage.getItem('usuarioId');

    let idProposta = null;
    if (currentEditingCard) {
        const dadosAntigos = JSON.parse(currentEditingCard.getAttribute('data-dados'));
        idProposta = dadosAntigos.id;
    }
    
    // 1. Captura inicial
    const dados = {
    usuario_id: usuarioId,
    nome: nomeDoCliente.value,
    cpf: cpfDoCliente.value,
    convenio: convenioDoCliente.value,
    operacao: operacaoDoCliente.value,
    status: statusPropostaCliente.value,
    banco: bancoOperacao.value,
    promotora: promotoraOperacao.value,
    detalhamento: detalheStatusProposta.value,
    retornoSaldo: dataSaldoPortCliente.value || null,
    
    // Limpamos os valores aqui para o Python não receber "R$"
    valorOperacao: limpar(valorOperacaoCliente.value),
    valorParcela: limpar(valorParcelaCliente.value),
    saldoCliente: limpar(saldoPortCliente.value),
    troco: limpar(trocoPortCliente.value),
    // AQUI O PULO DO GATO: Capturar a parcela de portabilidade
    valorParcelaPort: limpar(parcelaPortCliente.value), 
    
    dataCriacao: currentEditingCard ? JSON.parse(currentEditingCard.getAttribute('data-dados')).dataCriacao : new Date().toISOString()
    };

    // 2. Lógica de Sobrescrita e Validação Específica para Portabilidade
    if (dados.operacao === 'portRefin') {
    // CORREÇÃO 1: Use o valor LIMPO (dados.valorParcelaPort) em vez do valor com máscara
    dados.valorParcela = dados.valorParcelaPort; 
    
        // CORREÇÃO 2: Verifique o nome correto das chaves que estão DENTRO do objeto 'dados'
        if (!dados.valorParcelaPort || !dados.retornoSaldo || !dados.saldoCliente) {
            alert('Para Portabilidade, preencha Parcela, Saldo e Retorno.');
            return;
        }
    }

    // 3. Validação dos campos básicos (para qualquer card)
    if (!dados.nome || !dados.cpf || !dados.status) {
        alert('Por favor, preencha Nome, CPF e Status.');
        return null;
    }

    const url = currentEditingCard 
        ? `http://129.121.38.104:5000/propostas/editar/${idProposta}` 
        : "http://129.121.38.104:5000/propostas/criar";
    
    const metodo = currentEditingCard ? 'PUT' : 'POST';

    const idEditarProposta = currentEditingCard ? JSON.parse(currentEditingCard.getAttribute('data-dados')).id : null;

    if (currentEditingCard && !idProposta) {
        console.error("Erro: Tentando editar um card sem ID!");
        return;
    }
    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        if (response.ok) {
            if (currentEditingCard) {
                currentEditingCard.remove();
            }
            window.location.reload();

            // IMPORTANTE: Use o 'resultado' que vem do Python! 
            // Se o seu Python retorna o objeto atualizado, use: gerarCardNoDashboard(resultado);
            // Se o seu Python só retorna mensagem, use o objeto 'dados' mas garanta que o ID esteja nele:
            dados.id = idProposta || resultado.id;
            
            gerarCardNoDashboard(dados); 
            
            fecharModal();
            alert(metodo === 'PUT' ? "Editado com sucesso!" : "Criado com sucesso!");
            currentEditingCard = null;
            atualizarIndicadores(); // Recalcula o topo verde
        } else {
            alert("Erro ao salvar: " + (resultado.mensagem || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
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
        const response = await fetch(`http://129.121.38.104:5000/propostas?usuario_id=${usuarioId}`);
        
        if (!response.ok) throw new Error("Erro ao buscar dados do servidor");

        const propostas = await response.json();

        // 2. Limpa as colunas antes de renderizar (para não duplicar no F5)
        document.getElementById('linhaStatusNova').innerHTML = '';
        document.getElementById('linhaStatusAnalise').innerHTML = '';
        document.getElementById('linhaStatusFinalizado').innerHTML = '';

        // 3. Itera sobre cada proposta vinda do MySQL
        // 3. Itera sobre cada proposta vinda do MySQL
        propostas.forEach(p => {
            const dadosParaCard = {
                id: p.id, // NÃO ESQUEÇA DO ID AQUI!
                nome: p.nome_cliente,
                cpf: p.cpf_cliente,
                convenio: p.convenio,
                operacao: p.operacao_feita,
                status: p.status_proposta,
                banco: p.banco,
                promotora: p.promotora,
                detalhamento: p.detalhe_status,
                
                // MANTER COMO NÚMERO (Remova o toLocaleString daqui)
                valorOperacao: p.valor_operacao || 0,
                valorParcela: p.valor_parcela_geral || 0,
                valorParcelaPort: p.valor_parcela_port || 0,
                
                dataCriacao: p.data_criacao.includes('Z') || p.data_criacao.includes    ('GMT') 
                    ? p.data_criacao 
                    : p.data_criacao.replace(' ', 'T'), 
                // Dentro do seu propostas.forEach, altere APENAS a linha do retornoSaldo:
                retornoSaldo: p.data_retorno_saldo ? new Date(p.data_retorno_saldo).toISOString().split('T')[0] : null,
                saldoCliente: p.saldo_devedor_estimado || 0,
                troco: p.troco_estimado || 0
            };

            gerarCardNoDashboard(dadosParaCard);
        });

        // 5. Atualiza os números do topo (Total, Nova, etc)
        atualizarIndicadores();

    } catch (error) {
        console.error("❌ Erro ao carregar dashboard:", error);
    }
}

function formatarDataRetorno(dataString) {
    if (!dataString || dataString === "undefined" || dataString === null) return "---";
    
    // 1. Extrai apenas os números (Ano, Mês, Dia) ignorando o resto (GMT, Horas, etc)
    const partes = dataString.match(/(\d{4})-(\d{2})-(\d{2})/);
    
    if (!partes) {
        // Se não vier no formato YYYY-MM-DD, tenta limpar strings tipo "Mon, 09 Feb..."
        const dataGenérica = new Date(dataString);
        if (isNaN(dataGenérica.getTime())) return dataString;
        
        // Se a data genérica funcionar, pegamos os componentes locais dela
        var ano = dataGenérica.getFullYear();
        var mes = dataGenérica.getMonth();
        var dia = dataGenérica.getDate();
    } else {
        var ano = parseInt(partes[1]);
        var mes = parseInt(partes[2]) - 1; // Meses no JS começam em 0
        var dia = parseInt(partes[3]);
    }

    // 2. Cria a data usando os componentes LOCAIS (isso trava o dia)
    const data = new Date(ano, mes, dia, 0, 0, 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);

    const dataFormatada = data.toLocaleDateString('pt-BR');

    // 3. Comparação exata para o foguinho
    if (data.getTime() === hoje.getTime()) {
        return `<span class="urgente-hoje">🔥 HOJE (${dataFormatada})</span>`;
    }

    return dataFormatada;
}
// EXECUÇÃO AUTOMÁTICA: Roda assim que a página abre
document.addEventListener('DOMContentLoaded', carregarPropostasDoBanco);

function gerarCardNoDashboard(dados) {
    if (!validarExibicaoPorMes(dados.dataCriacao, dados.status)) {
        console.warn(`Card de ${dados.nome} ocultado por pertencer a um fechamento de mês anterior`);
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

    // --- AQUI ESTAVA O ERRO: Primeiro criamos o elemento ---
    const card = document.createElement('div');
    card.className = config.classe;
    
    // Agora salvamos os dados (incluindo o ID real do banco) no atributo do card
    card.setAttribute('data-dados', JSON.stringify(dados));

        const formatar = (v) => {
            // 1. Tratamento de nulos/undefined
            if (v === null || v === undefined || v === "") return "0,00";

            let n;

            // 2. Se já for um número (que vem do banco de dados)
            if (typeof v === 'number') {
                n = v;
            } 
            // 3. Se for uma string (que vem do formulário ou campo formatado)
            else {
                let limpo = String(v).replace(/R\$\s?| /g, ''); // Remove R$ e espaços
                
                // Se tem vírgula, removemos os pontos de milhar e trocamos a vírgula por ponto
                if (limpo.includes(',')) {
                    n = parseFloat(limpo.split('.').join('').replace(',', '.'));
                } else {
                    // Se não tem vírgula, tratamos como número puro
                    n = parseFloat(limpo);
                }
            }

            // 4. Retorno final formatado para o padrão brasileiro
            return (n || 0).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
        };

    card.innerHTML = `
        <div class="card-header" style="position: relative;">
            <span class="proposta-id">ID: #${dados.id || '---'}</span>
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
                <span class="valor-destaque" style="font-size: 1.1rem;">R$ ${formatar(dados.valorOperacao)}</span>
            </div>
            <div class="info-grupo" style="flex: 1; margin-bottom: 0;">
                <label>Parcela</label>
                <span style="color: green; font-weight: 800; font-size: 1.1rem;">R$ ${formatar(dados.valorParcela)}</span>
            </div>
        </div>

        ${dados.retornoSaldo || dados.saldoCliente ? `
            <div style="display: flex; gap: 10px; margin-top: 8px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                ${dados.retornoSaldo ? `
                    <div class="info-grupo" style="flex: 1; border-left: 3px solid #ff6200; padding-left: 8px; margin-bottom: 0;">
                        <label style="color: #ff6200; font-size: 0.65rem;">📅 RETORNO</label>
                        <span style="font-size: 0.85rem;">${formatarDataRetorno(dados.retornoSaldo)}</span>
                    </div>
                ` : ''}
                ${dados.saldoCliente ? `
                    <div class="info-grupo" style="flex: 1; border-left: 3px solid #224CBA; padding-left: 8px; margin-bottom: 0;">
                        <label style="color: #224CBA; font-size: 0.65rem;">💰 SALDO DEV.</label>
                        <span style="font-size: 0.85rem;">R$ ${formatar(dados.saldoCliente)}</span>
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
        </div>
    `; 

    colunaAlvo.appendChild(card);
    atualizarIndicadores();
}

const totalProducao = document.getElementById('valorTotalProd')

function atualizarIndicadores() {
    const colunas = [
        { linha: 'linhaStatusNova', count: 'countNova', sum: 'sumNova' },
        { linha: 'linhaStatusAnalise', count: 'countAnalise', sum: 'sumAnalise' },
        { linha: 'linhaStatusFinalizado', count: 'countFinalizado', sum: 'sumFinalizado', saldo: 'saldoFinalizado' }
    ];

    let totalGeralFinalizado = 0;

    // Função interna para garantir que qualquer coisa vire número real
    

    colunas.forEach(col => {
        const elementoLinha = document.getElementById(col.linha);
        if (!elementoLinha) return;

        const cards = elementoLinha.querySelectorAll('[data-dados]');
        let somaOperacaoColuna = 0;
        let somaSaldoColuna = 0;

        cards.forEach(card => {
            const dadosDoCard = JSON.parse(card.getAttribute('data-dados'));
            
            // Usando a nossa função de limpeza segura
            const valorOp = parseFloat(dadosDoCard.valorOperacao) || 0;
            const valorSaldo = parseFloat(dadosDoCard.saldoCliente) || 0;

            somaOperacaoColuna += valorOp;
            somaSaldoColuna += valorSaldo;

            // Alimenta o total do topo se estiver na coluna Finalizado
            if (col.linha === 'linhaStatusFinalizado') {
                totalGeralFinalizado += (valorOp + valorSaldo); // Se quiser somar o saldo no topo também, use: (valorOp + valorSaldo)
            }
        });

        // Atualiza os indicadores da coluna específica
        if (document.getElementById(col.count)) document.getElementById(col.count).innerText = cards.length;
        
        if (document.getElementById(col.sum)) {
            document.getElementById(col.sum).innerText = somaOperacaoColuna.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }

        if (col.saldo && document.getElementById(col.saldo)) {
            document.getElementById(col.saldo).innerText = "Saldo: " + somaSaldoColuna.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    });

    // Atualiza o "Minha Produção" (Topo Verde)
    const valorTotalProdElement = document.getElementById('valorTotalProd');
    if (valorTotalProdElement) {
        // O segredo do F5: Aqui ele sempre zera e coloca o valor novo totalizado dos cards presentes
        valorTotalProdElement.innerText = totalGeralFinalizado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
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

async function excluirCard(button) {
    const card = button.closest('.cardStatusNovo, .cardStatusAnalise, .cardStatusFinalizado');
    const dados = JSON.parse(card.getAttribute('data-dados'));
    const idProposta = dados.id;

    if (confirm(`Tem certeza que deseja excluir a proposta de ${dados.nome}?`)) {
        try {
            const response = await fetch(`http://129.121.38.104:5000/propostas/excluir/${idProposta}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                card.style.transition = "0.3s";
                card.style.opacity = "0";
                setTimeout(() => {
                    card.remove();
                    atualizarIndicadores();
                }, 300);
            }
        } catch (error) {
            alert("Erro ao excluir no servidor.");
        }
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
    parcelaPortCliente.value = dados.valorParcelaPort

    mascaraMoeda(valorOperacaoCliente);
    mascaraMoeda(valorParcelaCliente);
    mascaraMoeda(saldoPortCliente);
    mascaraMoeda(trocoPortCliente);
    mascaraMoeda(parcelaPortCliente);
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

function fazerLogout() {
    // 1. Limpa tudo que salvamos no login
    localStorage.removeItem('usuarioId');
    localStorage.setItem('usuarioNome', ''); // Opcional: limpa o nome também
    localStorage.clear(); // Se quiser garantir, limpa TUDO do storage

    // 2. Agora sim, manda para a tela de login
    window.location.replace("telalogin.html"); 
}