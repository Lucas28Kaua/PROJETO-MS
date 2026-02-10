
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

 // Armazena o que está filtrado no momento


dadosFiltradosAtuais = [...dadosTabela]; // Armazena o que está filtrado no momento

/* ==========================================================================
   3. MOTOR DO GRÁFICO (CHART.JS)
   ========================================================================== */

const ctx = document.getElementById('graficoProducao').getContext('2d');

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
    const ctx = document.getElementById('graficoPizzaBancos').getContext('2d');
    
    // Agrupar por produto
    const resumo = {};
    dados.forEach(item => {
        const produto = item.operacao_feita || "Outros";
        const valor = parseFloat(item.valor_operacao) || 0;
        resumo[produto] = (resumo[produto] || 0) + valor;
    });

    if (meuGraficoPizza) meuGraficoPizza.destroy();

    meuGraficoPizza = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(resumo),
            datasets: [{
                data: Object.values(resumo),
                backgroundColor: [
                    '#FB8D20', // 1. Laranja (Principal MS Cred)
                    '#2ecc71', // 2. Verde (Margem Livre)
                    '#3498db', // 3. Azul (FGTS)
                    '#9b59b6', // 4. Roxo (Cartão RMC/RCC)
                    '#f1c40f', // 5. Amarelo (Pessoal)
                    '#e74c3c', // 6. Vermelho (Portabilidade)
                    '#1abc9c', // 7. Turquesa (Siape)
                    '#34495e', // 8. Azul Marinho (Exército)
                    '#d35400', // 9. Abóbora (Refinanciamento)
                    '#27ae60', // 10. Verde Esmeralda (INSS Especial)
                    '#2980b9', // 11. Azul Royal (Consignado Privado)
                    '#8e44ad', // 12. Roxo Escuro (Loas)
                    '#7f8c8d', // 13. Cinza (Outros Convênios)
                    '#c0392b', // 14. Vinho (Seguros)
                    '#16a085'  // 15. Verde Água (Crédito na Conta)
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right', // Legenda lateral dentro do card da pizza
                    labels: { boxWidth: 12 }
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
    
    // Usa os dados que estão atualmente na tabela (filtrados ou não)
    // Se você tiver uma variável global 'dadosFiltradosAtuais', use-a aqui
    const dadosParaExibir = (typeof dadosFiltradosAtuais !== 'undefined') ? dadosFiltradosAtuais : dadosTabela;
    processarERenderizarGrafico(dadosFiltradosAtuais);
}

function processarERenderizarGrafico(dados) {
    const resumo = {};
    dados.forEach(item => {
        const [diaMes] = item.data.split(' ');
        const [dia, mes] = diaMes.split('/');
        // Pega o ano se houver (ex: 01/01/2025), se não, usa o atual
        const ano = item.data.includes('/20') ? item.data.split('/20')[1].substring(0,2) : new Date().getFullYear();

        let chave;
        if (visaoAtual === 'dias') chave = diaMes;
        else if (visaoAtual === 'meses') chave = obterNomeMes(mes);
        else chave = "20" + ano; // Visão por Ano

        resumo[chave] = (resumo[chave] || 0) + item.valor;
    });

    renderizarGrafico(Object.keys(resumo), Object.values(resumo));
}

function obterNomeMes(numMes) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[parseInt(numMes) - 1];
}

function atualizarCardsResumo(total, quantidade) {
    const ticketMedio = quantidade > 0 ? total / quantidade : 0;
    document.getElementById('resumoTotal').innerText = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById('resumoQtd').innerText = quantidade;
    document.getElementById('resumoTicket').innerText = ticketMedio.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

async function filtrarPorUsuario(idUsuario, elemento) {
    // 1. Alterna a classe ativa nos botões
    const botoes = document.querySelectorAll('.btn-usuario');
    botoes.forEach(btn => btn.classList.remove('active'));
    if(elemento) elemento.classList.add('active');

    // 2. Filtra os dados e guarda na nossa variável global
    const url = (idUsuario === 'mscred') 
        ? 'http://127.0.0.1:5000/api/relatorios/total' 
        : `http://127.0.0.1:5000/api/relatorios/${idUsuario}`;

    try {
        const response = await fetch(url);
        const resultado = await response.json();

        if (resultado.vazio) {
            // Limpa a interface se não houver dados
            atualizarTabelaEInterface([]); 
            return;
        }

        // 3. Alimenta a interface com os dados REAIS do banco
        dadosFiltradosAtuais = resultado.tabela; 
        atualizarTabelaEInterface(resultado.tabela);

    } catch (erro) {
        console.error("Erro ao buscar dados do banco:", erro);
    }
}

async function filtrarProducao() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    // 1. Validação básica (continua igual)
    if (!dataInicio || !dataFim) {
        alert('Selecione o período completo.');
        return;
    }

    try {
        
        const response = await fetch(`http://127.0.0.1:5000/api/relatorios/filtro-data?inicio=${dataInicio}&fim=${dataFim}`);
        const resultado = await response.json();

        if (resultado.tabela && resultado.tabela.length > 0) {
            // 3. Atualiza a variável global e a tela
            dadosFiltradosAtuais = resultado.tabela;
            atualizarTabelaEInterface(resultado.tabela);
        } else {
            alert("Nenhuma proposta encontrada para este período.");
            atualizarTabelaEInterface([]); // Limpa a tela se não achar nada
        }

    } catch (erro) {
        console.error("Erro ao filtrar por data:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

function atualizarTabelaEInterface(dados) {
    const corpoTabela = document.getElementById('corpoTabelaRelatorio');
    
    dadosFiltradosAtuais = dados || [];

    if (!dados || dados.length === 0) {
        if (corpoTabela) {
            corpoTabela.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:50px;">🔍 Nenhuma proposta encontrada.</td></tr>`;
        }
        // Chamamos os gráficos com vazio para eles "limparem" a tela (destroy)
        renderizarGrafico([], []);
        renderizarGraficoPizza([]);
        atualizarCardsResumo(0, 0);
        return; // Agora sim pode parar
    }
}
    // Limpa e reconstrói as linhas da tabela
    corpoTabela.innerHTML = dados.map(item => {
        const valor = parseFloat(item.valor_operacao) || 0;
        const produto = item.operacao_feita || "Não informado";
        const ePortabilidade = produto.includes('Portabilidade');
        
        const dataFormatada = item.data_finalizacao ? (() => {
            // 1. Limpa a data para formato ISO (troca espaço por T)
            const dataObj = new Date(item.data_finalizacao);

            // 2. Se a data for inválida, retorna o texto original
            if (isNaN(dataObj.getTime())) return "---";

            // 3. CORREÇÃO DO ERRO: '2-digit' em vez de '2d'
            return dataObj.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Garante formato 24h
            }).replace(',', ''); // Remove a vírgula chata que o JS coloca entre data e hora
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
                    <span class="valor-comum">${valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
                </td>
            </tr>
        `;
    }).join('');

    // Atualiza os Cards de Resumo (Totalizador no topo)
    if (typeof atualizarCardsResumo === 'function') {
        const total = dados.reduce((acc, item) => acc + (parseFloat(item.valor_operacao) || 0), 0);
        atualizarCardsResumo(total, dados.length);
    }

    // Atualiza o Gráfico (se você tiver a função de gráfico pronta)
    if (typeof renderizarGrafico === 'function' && dados.length > 0) {
        // CORREÇÃO: Usar '2-digit' e não '2d'
        const labels = [...new Set(dados.map(i => 
            new Date(i.data_finalizacao).toLocaleDateString('pt-br', {day:'2-digit', month:'2-digit'})
        ))].sort();

        const valores = labels.map(label => {
            return dados
                .filter(i => new Date(i.data_finalizacao).toLocaleDateString('pt-br', {day:'2-digit', month:'2-digit'}) === label)
                .reduce((a, b) => a + (parseFloat(b.valor_operacao) || 0), 0);
        });

        renderizarGrafico(labels, valores);
    }

    renderizarGraficoPizza(dados);
}

function carregarRelatorio() {
    // Labels e valores iniciais (Geral)
    const labelsProducao = ['20/01', '21/01', '22/01', '23/01', '24/01', '25/01', '26/01', '27/01', '28/01', '29/01', '30/01', '31/01', '01/02', '02/02', '03/02'];
    const valoresProducao = [12000, 18500, 15000, 28000, 9000, 5000, 32000, 25000, 42000, 38000, 15000, 8000, 19000, 45000, 31000];

    // Inicializa a tabela chamando o filtro 'mscred'
    const btnTodos = document.querySelector('.btn-usuario.active');
    filtrarPorUsuario('mscred', btnTodos);
    
    renderizarGrafico(labelsProducao, valoresProducao);
}

/* ==========================================================================
   5. INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    carregarRelatorio();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataFim').value = hoje;
    // Opcional: colocar o início do mês no dataInicio
    const primeiroDoMes = hoje.substring(0, 8) + '01';
    document.getElementById('dataInicio').value = primeiroDoMes;
});

function fazerLogout() {
    // 1. Limpa tudo que salvamos no login
    localStorage.removeItem('usuarioId');
    localStorage.setItem('usuarioNome', ''); // Opcional: limpa o nome também
    localStorage.clear(); // Se quiser garantir, limpa TUDO do storage

    // 2. Agora sim, manda para a tela de login
    window.location.replace("telalogin.html"); 
}