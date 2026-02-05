
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

let dadosFiltradosAtuais = []; // Armazena o que está filtrado no momento
/* ==========================================================================
   1. BASE DE DADOS (GLOBAL PARA ACESSO DE TODAS AS FUNÇÕES)
   ========================================================================== */
const dadosTabela = [
    { 
        data: '01/01 16:45', cliente: 'Roberto Carlos Medeiros', banco: 'Itaú', 
        conv: 'INSS', produto: 'Portabilidade', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 15400.50, saldo: 12000.00, liberado: 3400.50 
    },
    { 
        data: '03/01 14:20', cliente: 'Maria das Graças Silva', banco: 'Safra', 
        conv: 'FGTS', produto: 'Saque Aniv.', prom: 'MS Cred', func: 'Carla', 
        valor: 4200.00, saldo: 0, liberado: 4200.00 
    },
    { 
        data: '05/01 11:30', cliente: 'José Arnaldo Ferreira', banco: 'C6 Bank', 
        conv: 'SIAPE', produto: 'Portabilidade', prom: 'Valor Pro', func: 'João Vitor', 
        valor: 28900.00, saldo: 20500.00, liberado: 8400.00 
    },
    { 
        data: '10/01 17:10', cliente: 'Luciana Gimenez Souza', banco: 'Pan', 
        conv: 'FGTS', produto: 'Saque Aniv.', prom: 'MS Cred', func: 'Kauã', 
        valor: 1850.00, saldo: 0, liberado: 1850.00 
    },
    { 
        data: '15/01 15:00', cliente: 'Antônio Bento Vilela', banco: 'Facta', 
        conv: 'INSS', produto: 'Port + Refin', prom: 'Valor Pro', func: 'Sueli', 
        valor: 12300.00, saldo: 9100.00, liberado: 3200.00 
    },
    { 
        data: '20/01 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Djullian', 
        valor: 9700.00, saldo: 0, liberado: 9700.00 
    },
    { 
        data: '25/01 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', 
        conv: 'Pessoal', produto: 'Crédito Pessoal', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 5000.00, saldo: 0, liberado: 5000.00 
    },
    { 
        data: '01/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Carla', 
        valor: 21000.00, saldo: 0, liberado: 21000.00 
    },
    { 
        data: '02/02 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Djullian', 
        valor: 9700.00, saldo: 0, liberado: 9700.00 
    },
    { 
        data: '05/02 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', 
        conv: 'Pessoal', produto: 'Crédito Pessoal', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 5000.00, saldo: 0, liberado: 5000.00 
    },
    { 
        data: '09/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Carla', 
        valor: 21000.00, saldo: 0, liberado: 21000.00 
    },
    { 
        data: '25/02 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Djullian', 
        valor: 9700.00, saldo: 0, liberado: 9700.00 
    },
    { 
        data: '14/02 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', 
        conv: 'Pessoal', produto: 'Crédito Pessoal', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 5000.00, saldo: 0, liberado: 5000.00 
    },
    { 
        data: '10/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Carla', 
        valor: 21000.00, saldo: 0, liberado: 21000.00 
    },
    { 
        data: '23/02 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Djullian', 
        valor: 9700.00, saldo: 0, liberado: 9700.00 
    },
    { 
        data: '21/02 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', 
        conv: 'Pessoal', produto: 'Crédito Pessoal', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 5000.00, saldo: 0, liberado: 5000.00 
    },
    { 
        data: '29/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Carla', 
        valor: 21000.00, saldo: 0, liberado: 21000.00 
    },
    { 
        data: '05/02 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Djullian', 
        valor: 9700.00, saldo: 0, liberado: 9700.00 
    },
    { 
        data: '02/02 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', 
        conv: 'Pessoal', produto: 'Crédito Pessoal', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 5000.00, saldo: 0, liberado: 5000.00 
    },
    { 
        data: '25/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Carla', 
        valor: 21000.00, saldo: 0, liberado: 21000.00 
    },
    { 
        data: '20/02 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Djullian', 
        valor: 9700.00, saldo: 0, liberado: 9700.00 
    },
    { 
        data: '28/02 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', 
        conv: 'Pessoal', produto: 'Crédito Pessoal', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 5000.00, saldo: 0, liberado: 5000.00 
    },
    { 
        data: '14/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Carla', 
        valor: 21000.00, saldo: 0, liberado: 21000.00 
    },
    { 
        data: '12/02 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Djullian', 
        valor: 9700.00, saldo: 0, liberado: 9700.00 
    },
    { 
        data: '25/02 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', 
        conv: 'Pessoal', produto: 'Crédito Pessoal', prom: 'Valor Pro', func: 'Iraneide', 
        valor: 5000.00, saldo: 0, liberado: 5000.00 
    },
    { 
        data: '04/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', 
        conv: 'INSS', produto: 'Margem Livre', prom: 'MS Cred', func: 'Carla', 
        valor: 21000.00, saldo: 0, liberado: 21000.00 
    }
];

dadosFiltradosAtuais = [...dadosTabela]; // Armazena o que está filtrado no momento

/* ==========================================================================
   3. MOTOR DO GRÁFICO (CHART.JS)
   ========================================================================== */
let meuGrafico;
const ctx = document.getElementById('graficoProducao').getContext('2d');

function renderizarGrafico(labels, valores) {
    if (meuGrafico) {
        meuGrafico.destroy();
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
                    ticks: { callback: (value) => 'R$ ' + value.toLocaleString('pt-br') }
                }
            }
        }
    });
}


let meuGraficoPizza;

function renderizarGraficoPizza(dados) {
    const ctx = document.getElementById('graficoPizzaBancos').getContext('2d');
    
    // Agrupar por produto
    const resumo = {};
    dados.forEach(item => {
        resumo[item.produto] = (resumo[item.produto] || 0) + item.valor;
    });

    if (meuGraficoPizza) meuGraficoPizza.destroy();

    meuGraficoPizza = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(resumo),
            datasets: [{
                data: Object.values(resumo),
                backgroundColor: ['#FB8D20', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f'],
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

function filtrarPorUsuario(nomeUsuario, elemento) {
    // 1. Alterna a classe ativa nos botões
    const botoes = document.querySelectorAll('.btn-usuario');
    botoes.forEach(btn => btn.classList.remove('active'));
    if(elemento) elemento.classList.add('active');

    // 2. Filtra os dados e guarda na nossa variável global
    dadosFiltradosAtuais = (nomeUsuario === 'mscred')
        ? [...dadosTabela]
        : dadosTabela.filter(proposta => proposta.func === nomeUsuario);

    // 3. AGORA A MÁGICA: Chamamos a função que desenha tudo na tela
    // Ela vai usar aquele innerHTML que você já tem lá embaixo
    atualizarTabelaEInterface(dadosFiltradosAtuais);
    
    // 4. E chamamos a do gráfico para ele atualizar junto
    processarERenderizarGrafico(dadosFiltradosAtuais);
}

function filtrarProducao(){
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    if (!dataInicio || !dataFim){
        window.alert('Por favor, Selecione o período inicial ou final.');
        return;
    }

    const dInicio = new Date(dataInicio + 'T00:00:00')
    const dFim = new Date(dataFim + 'T23:59:59')

    dFim.setHours(23,59,59)

    const dadosFiltrados = dadosTabela.filter(item => {
        // 3. Corrija o split para separar por ESPAÇO
        const partes = item.data.split(' '); // Separa '03/02' de '16:45'
        const diaMes = partes[0];
        
        const [dia, mes] = diaMes.split('/');
        const anoAtual = new Date().getFullYear();
        
        // Criar a data do item para comparação
        const dataItem = new Date(anoAtual, mes - 1, dia);

        return dataItem >= dInicio && dataItem <= dFim;
    });

    if (dadosFiltrados.length === 0) {
        alert("Nenhuma proposta encontrada para este período.");
    }

    // 5. Atualiza a interface usando as funções que já criamos
    // Passamos os dados filtrados para a renderização
    atualizarTabelaEInterface(dadosFiltrados);

    dadosFiltradosAtuais = dadosFiltrados; // Adicione isso
    atualizarTabelaEInterface(dadosFiltrados);
}

function atualizarTabelaEInterface(dados) {
    const corpoTabela = document.getElementById('corpoTabelaRelatorio');
    
    // Limpa e reconstrói as linhas da tabela
    corpoTabela.innerHTML = dados.map(item => {
        const ePortabilidade = item.produto === 'Portabilidade';
        
        return `
            <tr>
                <td>${item.data}</td>
                <td><strong>${item.cliente}</strong></td>
                <td>${item.banco}</td>
                <td>${item.conv}</td>
                <td>${item.produto}</td>
                <td>${item.prom}</td>
                <td><span class="nome-funcionario">${item.func}</span></td>
                <td class="col-valor">
                    ${ePortabilidade ? `
                        <div class="celula-valor-hover">
                            ${item.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                            <div class="balao-detalhes">
                                <p class="balao-titulo">Detalhamento Port</p>
                                <div class="balao-linha"><span>Saldo Dev:</span><strong>${item.saldo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div class="balao-linha"><span>Líquido:</span><strong>${item.liberado.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div class="balao-seta"></div>
                            </div>
                        </div>
                    ` : `
                        <span class="valor-comum">
                            ${item.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                        </span>
                    `}
                </td>
            </tr>
        `;
    }).join('');

    // Atualiza os Cards de Resumo (Totalizador no topo)
    if (typeof atualizarCardsResumo === 'function') {
        const total = dados.reduce((acc, item) => acc + item.valor, 0);
        atualizarCardsResumo(total, dados.length);
    }

    // Atualiza o Gráfico (se você tiver a função de gráfico pronta)
    if (typeof renderizarGrafico === 'function' && dados.length > 0) {
        const labels = [...new Set(dados.map(i => i.data.split(' ')[0]))].reverse();
        const valores = labels.map(d => dados.filter(i => i.data.startsWith(d)).reduce((a, b) => a + b.valor, 0));
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