const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');

toggleBtn.addEventListener('click', function () {
  sidebar.classList.toggle('aberto');
});

const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

if (menuToggle) {
  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('aberto');
    menuToggle.classList.toggle('ativo');
    overlay.classList.toggle('ativo');
  });

  // Fecha ao clicar no overlay
  overlay.addEventListener('click', function () {
    sidebar.classList.remove('aberto');
    menuToggle.classList.remove('ativo');
    overlay.classList.remove('ativo');
  });
}

const graficoProducao = document.getElementById('graficoProducao').getContext('2d');

let meuGrafico = new Chart(graficoProducao, {
    type: 'line', // Tipo de gráfico: Linha (pode ser 'bar' se preferir barras)
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], // Eixo X (Meses)
        datasets: [{
            label: 'Produção Mensal (R$)',
            data: [12000, 19000, 15000, 25000, 22000, 30000], // Valores de teste
            borderColor: '#224CBA', // Cor da linha (azul da MS CRED)
            backgroundColor: 'rgba(34, 76, 186, 0.1)', // Cor de preenchimento abaixo da linha
            fill: true,
            tension: 0.2, // Curvatura da linha (0.4 fica bem elegante)
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#224CBA'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false // Esconde a legenda para ficar mais clean
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: '#f0f0f0'
                }
            },
            x: {
                grid: {
                    display: false // Esconde grades verticais para limpar o visual
                }
            }
        }
    }
});

function atualizarCardsResumo(total, quantidade){
    const ticketMedio = quantidade > 0? total/quantidade : 0;

    document.getElementById('resumoTotal').innerText = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    document.getElementById('resumoQtd').innerText = quantidade;
    document.getElementById('resumoTicket').innerText = ticketMedio.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

}

function carregarRelatorio(){

    // Valores de exemplo para você ver funcionando agora
    const totalExemplo = 450000.50;
    const qtdExemplo = 12;

    atualizarCardsResumo(totalExemplo, qtdExemplo);
}

// Inicializa ao carregar a página
window.onload = carregarRelatorio;