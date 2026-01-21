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

    let totalGeral = 0; // total final do funcionário

    // pega todas as linhas
    const linhas = document.querySelectorAll('.contagemProd tbody tr');
    
    // Para cada linha de produto
    linhas.forEach(linha => {
        // ignora linhas de total
        if(linha.classList.contains('totalFuncionario') || linha.classList.contains('ultimo')) return;

        // Se for subtabela
        if(linha.classList.contains('subtable-row')) {
            const inputsSub = linha.querySelectorAll(`input[data-funcionario="${funcionario}"]`);
            let totalSub = 0; // total só dessa subtabela

            inputsSub.forEach(input => {
                const valor = input.value ? limparMoeda(input.value) : 0;
                totalSub += valor;
            });

            // atualiza a linha pai do convênio correspondente
            const convenio = linha.getAttribute('data-convenio');
            const linhaPai = document.querySelector(`.linha-convenio[data-convenio="${convenio}"]`);
            const inputPai = linhaPai.querySelector(`input[data-funcionario="${funcionario}"]`);
            inputPai.value = totalSub ? formatarMoeda(totalSub) : '';

            
        } 
        // Linhas normais (não subtabela, nem convênio pai)
        else if(!linha.classList.contains('linha-convenio')) {
            const input = linha.querySelector(`input[data-funcionario="${funcionario}"]`);
            if(input && input.value) {
                totalGeral += limparMoeda(input.value);
            }
        }
    });
    
     // Atualiza a célula de total por funcionário
    const thFuncionario = document.querySelector(`.contagemProd thead th[data-funcionario="${funcionario}"]`);
    const colunaIndex = Array.from(thFuncionario.parentElement.children).indexOf(thFuncionario);
    const linhaTotalFunc = document.querySelector('.contagemProd tbody tr.totalFuncionario');
    const celulaTotalFunc = linhaTotalFunc.children[colunaIndex];
    celulaTotalFunc.textContent = formatarMoeda(totalGeral);
    celulaTotalFunc.style.fontWeight = 'bold';

    // Atualiza total geral
    calcularTotalGeral();
}

document.querySelectorAll('.toggle-subtable').forEach(botao => {
    botao.addEventListener('click', () => {
        const trPai = botao.closest('tr');
        const convenio = trPai.getAttribute('data-convenio');
        const subtabela = document.querySelector(`.subtable-row[data-convenio="${convenio}"]`);
        
        // Alterna classe open
        subtabela.classList.toggle('open');
        botao.classList.toggle('open');
    });
});

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

document.querySelectorAll('.toggle-subtable').forEach(btn => {
    btn.addEventListener('click', () => {
        const tr = btn.closest('tr');
        const convenio = tr.dataset.convenio;
        const subtable = document.querySelector(`.subtable-row[data-convenio="${convenio}"]`);
        if (subtable.style.display === 'none') {
            subtable.style.display = 'table-row';
            btn.textContent = '▲';
        } else {
            subtable.style.display = 'none';
            btn.textContent = '▼';
        }
    });
});