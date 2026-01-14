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


function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function limparMoeda(valor) {
    if (!valor) return 0;
    return Number(
        valor
            .toString()
            .replace(/\s/g, '')
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
    ) || 0;
}

// Calcula o total de um funcionário AUTOMATICAMENTE
function calcularTotalFuncionario(funcionario) {
    // Pega TODAS as linhas que NÃO são de total
    const linhas = document.querySelectorAll('.contagemProd tbody tr:not(.totalFuncionario)');
    let total = 0;
    
    // Para cada linha de produto
    linhas.forEach(linha => {
        const input = linha.querySelector(`input[data-funcionario="${funcionario}"]`);
        if (input && input.value) {
            // Limpa a moeda antes de somar
            const valor = limparMoeda(input.value);
            total += valor;
        }
    });
    
    // Encontra a célula de total
    const thFuncionario = document.querySelector(`.contagemProd thead th[data-funcionario="${funcionario}"]`);
    const colunaIndex = Array.from(thFuncionario.parentElement.children).indexOf(thFuncionario);
    
    // Atualiza o total formatado
    const linhaTotalFunc = document.querySelector('.contagemProd tbody tr.totalFuncionario');
    const celulaTotalFunc = linhaTotalFunc.children[colunaIndex];
    celulaTotalFunc.textContent = formatarMoeda(total);
    celulaTotalFunc.style.fontWeight = 'bold';
    
    // CHAMA O TOTAL GERAL AUTOMATICAMENTE
    calcularTotalGeral();
}

// Calcula o TOTAL GERAL (soma de todos os funcionários)
function calcularTotalGeral() {
    const celulasTotal = document.querySelectorAll('.contagemProd tbody tr.totalFuncionario td:not(.produto)');
    let totalGeral = 0;
    
    celulasTotal.forEach(celula => {
        const valor = limparMoeda(celula.textContent);
        totalGeral += valor;
    });
    
    // Atualiza na linha "TOTAL"
    const linhaTotalGeral = document.querySelector('.contagemProd tbody tr.ultimo');
    const celulaTotalGeral = linhaTotalGeral.querySelector('td:nth-child(2)'); // Segunda célula
    
    celulaTotalGeral.textContent = formatarMoeda(totalGeral);
    celulaTotalGeral.style.fontWeight = 'bold';
    celulaTotalGeral.style.color = 'white';
    celulaTotalGeral.setAttribute('colspan', '6'); // Ocupa todas as colunas
    celulaTotalGeral.style.textAlign = 'center';
    
    // Remove as outras células da linha de total
    const celulasExtras = linhaTotalGeral.querySelectorAll('td:nth-child(n+3)');
    celulasExtras.forEach(celula => celula.style.display = 'none');
}

// Aplica formatação e cálculo automático
document.querySelectorAll('.contagemProd input[type="text"]').forEach(input => {

    // ao focar → mostra número "cru"
    input.addEventListener('focus', () => {
        const numero = limparMoeda(input.value);
        input.value = numero ? numero.toString().replace('.', ',') : '';
    });

    // ao sair → formata como moeda E CALCULA TOTAL
    input.addEventListener('blur', () => {
        if (input.value === '') return;

        const numero = limparMoeda(input.value);
        input.value = formatarMoeda(numero);
        
        // CALCULA O TOTAL AUTOMATICAMENTE
        const funcionario = input.getAttribute('data-funcionario');
        calcularTotalFuncionario(funcionario);
    });

    // TAMBÉM calcula enquanto digita
    input.addEventListener('input', () => {
        const funcionario = input.getAttribute('data-funcionario');
        calcularTotalFuncionario(funcionario);
    });
});

// Função do botão registrar
const tableData = document.querySelectorAll('td:not(.produto)');

function registrarProd(){
    tableData.forEach(td => {
        td.innerHTML = '';
    })
    
    return console.log('Botão clicado!')
}