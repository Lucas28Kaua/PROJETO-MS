/* ==========================================================================
   1. CONTROLE DO MENU (SIDEBAR)
   ========================================================================== */
const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

// Função para Sidebar Desktop
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('aberto');
    });
}

// Função para Menu Mobile (Hamburguer)
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('aberto');
        menuToggle.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
    });

    // Fecha ao clicar no fundo escuro (overlay)
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('aberto');
        menuToggle.classList.remove('ativo');
        overlay.classList.remove('ativo');
    });
}

/* ==========================================================================
   2. MOTOR DO GRÁFICO (CHART.JS)
   ========================================================================== */
let meuGrafico;
const ctx = document.getElementById('graficoProducao').getContext('2d');

function renderizarGrafico(labels, valores) {
    // Destrói o gráfico anterior para evitar sobreposição ao filtrar
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
                borderColor: '#FB8D20', // Cor MS CRED
                backgroundColor: 'rgba(251, 141, 32, 0.15)', // Sombra laranja suave
                fill: true,
                tension: 0.4, // Curva suave na linha
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#FB8D20'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Limpa o visual
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: '#f0f0f0' },
                    ticks: { callback: (value) => 'R$ ' + value.toLocaleString('pt-br') }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

/* ==========================================================================
   3. LÓGICA DE DADOS (APRESENTAÇÃO / DASHBOARD)
   ========================================================================== */

function atualizarCardsResumo(total, quantidade) {
    const ticketMedio = quantidade > 0 ? total / quantidade : 0;

    document.getElementById('resumoTotal').innerText = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById('resumoQtd').innerText = quantidade;
    document.getElementById('resumoTicket').innerText = ticketMedio.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function carregarRelatorio() {
    // Labels para 15 dias de produção
    const labelsProducao = ['20/01', '21/01', '22/01', '23/01', '24/01', '25/01', '26/01', '27/01', '28/01', '29/01', '30/01', '31/01', '01/02', '02/02', '03/02'];
    
    // Valores de produção oscilando para o gráfico ficar bonito
    const valoresProducao = [12000, 18500, 15000, 28000, 9000, 5000, 32000, 25000, 42000, 38000, 15000, 8000, 19000, 45000, 31000];

    // Dados detalhados para a Tabela (Conforme solicitado: 7 colunas)
    const dadosTabela = [
        { data: '03/02 16:45', cliente: 'Roberto Carlos Medeiros', banco: 'Itaú', conv: 'INSS', prom: 'Valor Pro', func: 'Carlos André', valor: 15400.50 },
        { data: '03/02 14:20', cliente: 'Maria das Graças Silva', banco: 'Safra', conv: 'FGTS', prom: 'MS Cred', func: 'Ana Paula', valor: 4200.00 },
        { data: '03/02 11:30', cliente: 'José Arnaldo Ferreira', banco: 'C6 Bank', conv: 'SIAPE', prom: 'Valor Pro', func: 'Carlos André', valor: 28900.00 },
        { data: '02/02 17:10', cliente: 'Luciana Gimenez Souza', banco: 'Pan', conv: 'FGTS', prom: 'MS Cred', func: 'Beatriz Lima', valor: 1850.00 },
        { data: '02/02 15:00', cliente: 'Antônio Bento Vilela', banco: 'Facta', conv: 'INSS', prom: 'Valor Pro', func: 'Carlos André', valor: 12300.00 },
        { data: '02/02 09:40', cliente: 'Francisca Chagas de Lima', banco: 'Daycoval', conv: 'INSS', prom: 'MS Cred', func: 'Ana Paula', valor: 9700.00 },
        { data: '01/02 16:30', cliente: 'Ricardo Pereira Fontes', banco: 'Mercantil', conv: 'Pessoal', prom: 'Valor Pro', func: 'Beatriz Lima', valor: 5000.00 },
        { data: '01/02 10:00', cliente: 'Sandra Helena Ramos', banco: 'Itaú', conv: 'INSS', prom: 'MS Cred', func: 'Carlos André', valor: 21000.00 },
        { data: '31/01 14:00', cliente: 'Claudio Duarte', banco: 'Banrisul', conv: 'INSS', prom: 'Valor Pro', func: 'Ana Paula', valor: 8000.00 },
        { data: '30/01 11:20', cliente: 'Marcos de Oliveira', banco: 'Bradesco', conv: 'Consignado', prom: 'MS Cred', func: 'Beatriz Lima', valor: 15000.00 }
    ];

    // 1. Preencher a Tabela HTML
    const corpoTabela = document.getElementById('corpoTabelaRelatorio');
    corpoTabela.innerHTML = dadosTabela.map(item => `
        <tr>
            <td>${item.data}</td>
            <td><strong>${item.cliente}</strong></td>
            <td>${item.banco}</td>
            <td>${item.conv}</td>
            <td>${item.prom}</td>
            <td><span class="nome-funcionario">${item.func}</span></td>
            <td>${item.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</td>
        </tr>
    `).join('');

    // 2. Atualizar Cards de Resumo
    const totalProduzido = valoresProducao.reduce((a, b) => a + b, 0);
    const totalContratos = 142; // Número fictício de volume total
    atualizarCardsResumo(totalProduzido, totalContratos);

    // 3. Renderizar Gráfico
    renderizarGrafico(labelsProducao, valoresProducao);
}

/* ==========================================================================
   4. FUNÇÃO DE FILTRO (AÇÃO DO BOTÃO FILTRAR)
   ========================================================================== */
function filtrarProducao() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    if (!dataInicio || !dataFim) {
        alert("Por favor, selecione o período completo.");
        return;
    }

    // Simulação de efeito visual: Gráfico mudando para o período filtrado
    renderizarGrafico(['10/02', '11/02', '12/02'], [15000, 42000, 22000]);
    atualizarCardsResumo(79000, 15);
}

/* ==========================================================================
   5. INICIALIZAÇÃO AO CARREGAR
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    carregarRelatorio();
    
    // Define a data final do input como a data de hoje
    const hoje = new Date().toISOString().split('T')[0];
    const inputFim = document.getElementById('dataFim');
    if (inputFim) {
        inputFim.value = hoje;
    }
});