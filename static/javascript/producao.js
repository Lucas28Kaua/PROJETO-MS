function getPrimeiroDiaMesAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
}

function getHoje() {
    return new Date().toISOString().split('T')[0];
}

function getDataInicio() {
    return document.getElementById('dataInicio').value || getPrimeiroDiaMesAtual();
}

function getDataFim() {
    return document.getElementById('dataFim').value || getHoje();
}

let meuGrafico = null;
let meuGraficoPizza = null;
let dadosFiltradosAtuais = [];

/* ==========================================================================
   2. CONTROLE DO MENU (SIDEBAR)
   ========================================================================== */
const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('aberto');
    });
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('aberto');
        menuToggle.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('aberto');
        menuToggle.classList.remove('ativo');
        overlay.classList.remove('ativo');
    });
}

/* ==========================================================================
   3. MOTOR DO GRÁFICO (CHART.JS)
   ========================================================================== */

function renderizarGrafico(labels, valores) {
    const canvas = document.getElementById('graficoProducao');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (meuGrafico) {
        meuGrafico.destroy(); // Isso limpa o gráfico antigo para entrar o novo
    }

    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Produção Diária (R$)',
                data: valores,
                borderColor: '#FB8D20',
                backgroundColor: 'rgba(251, 141, 32, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#FB8D20'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true, 
                    ticks: { 
                        callback: (value) => 'R$ ' + value.toLocaleString('pt-br') 
                    }
                }
            }
        }
    });
}




function renderizarGraficoPizza(dados) {
    const canvas = document.getElementById('graficoPizzaBancos');
    if (!canvas) return; // Segurança: se o elemento não existir, para aqui.
    
    const ctx = canvas.getContext('2d');
    
    const resumo = {};
    dados.forEach(item => {
        const produto = item.operacao_feita || "Outros";
        const t = parseFloat(item.valor_operacao) || 0;
        const s = parseFloat(item.saldo_devedor_estimado) || 0;
        const isPort = produto.toLowerCase().includes('port');
        
        // Lógica de soma CORRETA:
        const valorReal = isPort ? (t + s) : t;

        resumo[produto] = (resumo[produto] || 0) + valorReal;
    });

    if (meuGraficoPizza) meuGraficoPizza.destroy();

    meuGraficoPizza = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(resumo),
            datasets: [{
                data: Object.values(resumo),
                backgroundColor: [
                    '#FB8D20', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', 
                    '#e74c3c', '#1abc9c', '#34495e', '#d35400', '#27ae60', 
                    '#2980b9', '#8e44ad', '#7f8c8d', '#c0392b', '#16a085'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { 
                        boxWidth: 12,
                        // DICA: Formata o valor na legenda se quiser
                        generateLabels: (chart) => {
                            const data = chart.data;
                            return data.labels.map((label, i) => ({
                                text: `${label}: ${data.datasets[0].data[i].toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                // Adicionei um tooltip para mostrar o valor bonito ao passar o mouse
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const valor = context.raw || 0;
                            return ` ${context.label}: ${valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                        }
                    }
                }
            }
        }
    });
}


/* ==========================================================================
   FUNÇÕES DO PAINEL DE CONTROLE (DIRETORIA)
   ========================================================================== */

function adicionarLinhaRegra(){
    const tbody = document.getElementById('corpoRegrasInput')
    const novaLinha = document.createElement('tr');

    novaLinha.innerHTML = `
        <td><input type="text" class="in-op"></td>
        <td><input type="text" class="in-ba"></td>
        <td><input type="text" class="in-re"></td>
    `;

    tbody.appendChild(novaLinha);
}


/* ==========================================================================
   4. LÓGICA DE FILTROS E RESUMO
   ========================================================================== */


let visaoAtual = 'dias'; // Controla se vemos dias, meses ou anos

function mudarVisaoGrafico(tipo, elemento) {
    // Ajuste visual dos botões
    document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
    elemento.classList.add('active');
    
    visaoAtual = tipo;
    
    const dadosParaExibir = (typeof dadosFiltradosAtuais !== 'undefined') ? dadosFiltradosAtuais : dadosTabela;
    processarERenderizarGrafico(dadosFiltradosAtuais);
}

function processarERenderizarGrafico(dados) {
    if (!dados || dados.length === 0) return;

    const resumo = {};

    dados.forEach(item => {
        // 1. Tratamento da Data (ajustado para data_finalizacao)
        if (!item.data_finalizacao) return;
        const dataObj = new Date(item.data_finalizacao);
        const dia = String(dataObj.getDate()).padStart(2, '0');
        const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
        const anoFull = dataObj.getFullYear();
        const diaMes = `${dia}/${mes}`;

        // 2. Cálculo do Valor Real (Lógica da Portabilidade)
        const t = parseFloat(item.valor_operacao) || 0;
        const s = parseFloat(item.saldo_devedor_estimado) || 0;
        const isPort = (item.operacao_feita || "").toLowerCase().includes('port');
        const valorReal = isPort ? (t + s) : t;

        // 3. Agrupamento por Visão
        let chave;
        if (visaoAtual === 'dias') chave = diaMes;
        else if (visaoAtual === 'meses') chave = obterNomeMes(mes);
        else chave = anoFull.toString();

        resumo[chave] = (resumo[chave] || 0) + valorReal;
    });

    // Ordenar as chaves para o gráfico não ficar bagunçado
    const labelsOrdenados = Object.keys(resumo).sort();
    const valoresOrdenados = labelsOrdenados.map(label => resumo[label]);

    renderizarGrafico(labelsOrdenados, valoresOrdenados);
}

function obterNomeMes(numMes) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[parseInt(numMes) - 1];
}

function atualizarCardsResumo(total, quantidade, totalAnterior, quantidadeAnterior) {
    const ticketMedio = quantidade > 0 ? total / quantidade : 0;
    const ticketAnterior = quantidadeAnterior > 0 ? totalAnterior / quantidadeAnterior : 0;

    document.getElementById('resumoTotal').innerText = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById('resumoQtd').innerText = quantidade;
    document.getElementById('resumoTicket').innerText = ticketMedio.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    renderizarSetinha('setinhaTotal', total, totalAnterior);
    renderizarSetinha('setinhaQtd', quantidade, quantidadeAnterior);
    renderizarSetinha('setinhaTicket', ticketMedio, ticketAnterior);
}

function renderizarSetinha(elementoId, atual, anterior) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    if (anterior === 0) { el.innerHTML = ''; return; }

    const diff = ((atual - anterior) / anterior) * 100;
    const subindo = diff >= 0;
    const cor = subindo ? '#2ecc71' : '#e74c3c';
    const seta = subindo ? '▲' : '▼';
    const pct = Math.abs(diff).toFixed(1);

    el.innerHTML = `<span style="color:${cor}; font-weight:600; font-size:1rem;">${seta} ${pct}%</span>`;
}

function calcularTotais(dados) {
    let total = 0;
    dados.forEach(item => {
        const t = parseFloat(item.valor_operacao) || 0;
        const s = parseFloat(item.saldo_devedor_estimado) || 0;
        const isPort = (item.operacao_feita || "").toLowerCase().includes('port');
        total += isPort ? (t + s) : t;
    });
    return { total, quantidade: dados.length };
}

function getPeriodoMesAnterior(inicioAtual) {
    const partes = inicioAtual.split('-');
    let ano = parseInt(partes[0]);
    let mes = parseInt(partes[1]) - 1; // mês anterior

    if (mes === 0) {
        mes = 12;
        ano -= 1;
    }

    const mesFormatado = String(mes).padStart(2, '0');
    const ultimoDia = new Date(ano, mes, 0).getDate();

    return {
        inicio: `${ano}-${mesFormatado}-01`,
        fim: `${ano}-${mesFormatado}-${ultimoDia}`
    };
}

async function buscarTotaisAnteriores(idUsuario, inicioAtual) {
    const periodo = getPeriodoMesAnterior(inicioAtual);
    
    const url = (idUsuario === 'mscred')
        ? `https://sistemamscred.com.br/api/relatorios/total?inicio=${periodo.inicio}&fim=${periodo.fim}`
        : `https://sistemamscred.com.br/api/relatorios/${idUsuario}?inicio=${periodo.inicio}&fim=${periodo.fim}`;
    
    try {
        const response = await fetch(url);
        const resultado = await response.json();
        if (resultado.vazio) return { total: 0, quantidade: 0 };
        return calcularTotais(resultado.tabela);
    } catch (erro) {
        console.error("Erro ao buscar mês anterior:", erro);
        return { total: 0, quantidade: 0 };
    }
}

let usuarioAtual = 'mscred';

async function filtrarPorUsuario(idUsuario, elemento) {
    console.log("🔵 filtrarPorUsuario chamado com:", idUsuario);
    // 1. Alterna a classe ativa nos botões
    const botoes = document.querySelectorAll('.btn-usuario');
    botoes.forEach(btn => btn.classList.remove('active'));
    if(elemento) elemento.classList.add('active');
    usuarioAtual = idUsuario;

    // 2. Filtra os dados e guarda na nossa variável global
    const url = (idUsuario === 'mscred') 
        ? `https://sistemamscred.com.br/api/relatorios/total?inicio=${getDataInicio()}&fim=${getDataFim()}` 
        : `https://sistemamscred.com.br/api/relatorios/${idUsuario}?inicio=${getDataInicio()}&fim=${getDataFim()}`;

    try {
        const response = await fetch(url);
        const resultado = await response.json();

        if (resultado.vazio) {
            // Limpa a interface se não houver dados
            atualizarTabelaEInterface([]);
            if (abaAtualPropostas === 'andamento') {
                carregarAndamento();
            } 
            return;
        }

        // 3. Alimenta a interface com os dados REAIS do banco
        dadosFiltradosAtuais = resultado.tabela;
        const anteriores = await buscarTotaisAnteriores(idUsuario, getDataInicio(), getDataFim());
        
        if (abaAtualPropostas === 'andamento') {
            atualizarTabelaEInterface(resultado.tabela, anteriores);
            carregarAndamento();
        } else {
            atualizarTabelaEInterface(resultado.tabela, anteriores);
        }

    } catch (erro) {
        console.error("Erro ao buscar dados do banco:", erro);
    }
}

async function filtrarProducao() {

    console.log("🟢 filtrarProducao chamado");
    console.log("Datas:", document.getElementById('dataInicio').value, "até", document.getElementById('dataFim').value);

    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    // 1. Validação básica (continua igual)
    if (!dataInicio || !dataFim) {
        alert('Selecione o período completo.');
        return;
    }

    try {
        
        const url = (usuarioAtual === 'mscred')
            ? `https://sistemamscred.com.br/api/relatorios/total?inicio=${dataInicio}&fim=${dataFim}`
            : `https://sistemamscred.com.br/api/relatorios/${usuarioAtual}?inicio=${dataInicio}&fim=${dataFim}`;
        const response = await fetch(url);
        const resultado = await response.json();

        if (resultado.tabela && resultado.tabela.length > 0) {
            // 3. Atualiza a variável global e a tela
            dadosFiltradosAtuais = resultado.tabela;
            const anteriores = await buscarTotaisAnteriores(usuarioAtual, dataInicio, dataFim);
            atualizarTabelaEInterface(resultado.tabela, anteriores);
        } else {
            alert("Nenhuma proposta encontrada para este período.");
            atualizarTabelaEInterface([]); // Limpa a tela se não achar nada
        }

    } catch (erro) {
        console.error("Erro ao filtrar por data:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

function atualizarTabelaEInterface(dados, anteriores = {total: 0, quantidade: 0}) {
    const corpoTabela = document.getElementById('corpoTabelaRelatorio');
    dadosFiltradosAtuais = dados || [];

    if (!dados || dados.length === 0) {
        if (corpoTabela) {
            corpoTabela.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:50px;">🔍 Nenhuma proposta encontrada.</td></tr>`;
        }
        renderizarGrafico([], []);
        renderizarGraficoPizza([]);
        atualizarCardsResumo(0, 0, 0, 0);
        return;
    }

    let totalGeralAcumulado = 0;

    // Limpa e reconstrói as linhas da tabela
    corpoTabela.innerHTML = dados.map(item => {
        const troco = parseFloat(item.valor_operacao) || 0;
        const saldo = parseFloat(item.saldo_devedor_estimado) || 0;
        const produto = item.operacao_feita || "Não informado";
        const ePortabilidade = produto.toLowerCase().includes('port');
        
        const producaoTotal = ePortabilidade ? (troco + saldo) : troco;
        totalGeralAcumulado += producaoTotal; // Soma o total para os cards aqui

        const classePort = ePortabilidade ? 'celula-valor-hover' : ''; 
        const valorFormatado = producaoTotal.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

        const dataFormatada = item.data_finalizacao ? (() => {
            const dataObj = new Date(item.data_finalizacao);
            if (isNaN(dataObj.getTime())) return "---";
            return dataObj.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(',', '');
        })() : "---";

        return `
            <tr>
                <td>${dataFormatada}</td>
                <td><strong>${item.nome_cliente || '---'}</strong></td>
                <td>${item.banco || '---'}</td>
                <td>${item.convenio || '---'}</td>
                <td>${produto}</td>
                <td>${item.promotora || '---'}</td>
                <td><span class="nome-funcionario">${item.nome_consultor || 'Não atribuído'}</span></td> 
                <td class="col-valor">
                    <div class="${classePort}">
                        ${valorFormatado}
                        ${ePortabilidade ? `
                            <div class="balao-detalhes">
                                <span class="balao-titulo">Portabilidade</span>
                                <div class="balao-linha"><span>Liberado:</span> <strong>${troco.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div class="balao-linha"><span>Saldo:</span> <strong>${saldo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div class="balao-seta"></div>
                            </div>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const totaisAtuais = calcularTotais(dados);
    atualizarCardsResumo(totaisAtuais.total, totaisAtuais.quantidade, anteriores.total, anteriores.quantidade);

    // Atualiza os Gráficos
    if (typeof renderizarGrafico === 'function' && dados.length > 0) {
        
        processarERenderizarGrafico(dados);
        renderizarGraficoPizza(dados);
    }
}

let abaAtualPropostas = 'finalizadas';

function trocarAbaPropostas(aba, elemento){
    abaAtualPropostas = aba;

    document.querySelectorAll('.aba-proposta').forEach(b => b.classList.remove('active'));
    elemento.classList.add('active');

    const banner = document.getElementById('banner-andamento');
    const cardAndamento = document.getElementById('card-andamento-resumo');

    if (aba === 'andamento') {
        banner.style.display = 'block';
        cardAndamento.style.display = 'flex';
        carregarAndamento();
    } else {
        banner.style.display = 'none';
        cardAndamento.style.display = 'none'
        atualizarTabelaEInterface(dadosFiltradosAtuais);
    }
}

async function carregarAndamento() {

    const url = (usuarioAtual === 'mscred')
        ? `https://sistemamscred.com.br/api/relatorios/andamento`
        : `https://sistemamscred.com.br/api/relatorios/andamento/${usuarioAtual}`;
    
        try {
            const response = await fetch(url)
            const resultado = await response.json();
            const corpoTabela = document.getElementById('corpoTabelaRelatorio')

            if (resultado.vazio) {
                corpoTabela.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#aaa;">Nenhuma proposta em andamento.</td></tr>`;
                document.getElementById('total-andamento').textContent = 'R$ 0,00';
                document.getElementById('qtd-andamento').textContent = '0';
                return;
            }

            document.getElementById('total-andamento').textContent = resultado.cards.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            document.getElementById('qtd-andamento').textContent = resultado.cards.quantidade;
            renderizarLinhasTabela(resultado.tabela, corpoTabela);

        } catch (erro) {
            console.error('Erro ao buscar andamento:', erro)
        }
}

function atualizarCardsAndamento(total, quantidade) {
    const ticketMedio = quantidade > 0 ? total / quantidade : 0;
    document.getElementById('resumoTotal').innerText = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById('resumoQtd').innerText = quantidade;
    document.getElementById('resumoTicket').innerText = ticketMedio.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function renderizarLinhasTabela(dados, corpoTabela) {
    corpoTabela.innerHTML = dados.map(item => {
        const troco = parseFloat(item.valor_operacao) || 0;
        const saldo = parseFloat(item.saldo_devedor_estimado) || 0;
        const produto = item.operacao_feita || "Não informado";
        const ePortabilidade = produto.toLowerCase().includes('port');
        const producaoTotal = ePortabilidade ? (troco + saldo) : troco;
        const valorFormatado = producaoTotal.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

        const dataFormatada = (item.data_finalizacao || item.data_criacao) ? (() => {
            const dataObj = new Date(item.data_finalizacao || item.data_criacao);
            if (isNaN(dataObj.getTime())) return "---";
            return dataObj.toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false
            }).replace(',', '');
        })() : "---";

        const badgeStatus = item.status_proposta 
            ? `<span class="badge-status badge-${item.status_proposta.toLowerCase()}">${item.status_proposta}</span>` 
            : '';

        const classePort = ePortabilidade ? 'celula-valor-hover' : '';

        return `
            <tr>
                <td>${dataFormatada} ${badgeStatus}</td>
                <td><strong>${item.nome_cliente || '---'}</strong></td>
                <td>${item.banco || '---'}</td>
                <td>${item.convenio || '---'}</td>
                <td>${produto}</td>
                <td>${item.promotora || '---'}</td>
                <td><span class="nome-funcionario">${item.nome_consultor || 'Não atribuído'}</span></td>
                <td class="col-valor">
                    <div class="${classePort}">
                        ${valorFormatado}
                        ${ePortabilidade ? `
                            <div class="balao-detalhes">
                                <span class="balao-titulo">Portabilidade</span>
                                <div class="balao-linha"><span>Liberado:</span> <strong>${troco.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div class="balao-linha"><span>Saldo:</span> <strong>${saldo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div class="balao-seta"></div>
                            </div>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function publicarConfiguracoes() {
    const metaGeral = document.querySelector('input[placeholder="Ex: 1000000"]').value;
    const metaIndividual = document.querySelector('input[placeholder="Ex: 150000"]').value;

    // Captura as regras da tabela dinâmica
    const regras = [];
    const linhas = document.querySelectorAll('#corpoRegrasInput tr');
    
    linhas.forEach(linha => {
        const op = linha.querySelector('.in-op').value;
        const ba = linha.querySelector('.in-ba').value;
        const re = linha.querySelector('.in-re').value;
        
        if(op || ba || re) { // Só salva se pelo menos um campo estiver preenchido
            regras.push({ operacao: op, banco: ba, promotora: re });
        }
    });

    const payload = {
        meta_geral: metaGeral,
        meta_individual: metaIndividual,
        regras: regras
    };

    try {
        const response = await fetch('https://sistemamscred.com.br/api/configuracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (res.sucesso) {
            alert("🚀 Publicado com sucesso na Home!");
        } else {
            alert("Erro ao publicar: " + res.erro);
        }
    } catch (error) {
        console.error("Erro na request:", error);
    }
}
/* ==========================================================================
   5. INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    console.log("⚪ Página carregou");
    
    document.getElementById('dataFim').value = getHoje();
    document.getElementById('dataInicio').value = getPrimeiroDiaMesAtual();

    const btnTodos = document.querySelector('.btn-usuario');
    if(btnTodos) btnTodos.classList.add('active');
    console.log("🟡 Vou chamar filtrarProducao");
    filtrarPorUsuario('mscred', document.querySelector('.btn-usuario'));
});

function fazerLogout() {
    // 1. Limpa tudo que salvamos no login
    localStorage.removeItem('usuarioId');
    localStorage.setItem('usuarioNome', ''); // Opcional: limpa o nome também
    localStorage.clear(); // Se quiser garantir, limpa TUDO do storage

    // 2. Agora sim, manda para a tela de login
    window.location.replace("telalogin.html"); 
}