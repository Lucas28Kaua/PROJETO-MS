const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');

// Função para formatar CPF
function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // remove tudo que não é dígito
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // adiciona ponto após 3 dígitos
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // adiciona ponto após mais 3
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // adiciona traço antes dos últimos 2
    return cpf;
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, ''); // remove não dígitos
    telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2'); // (XX) 
    telefone = telefone.replace(/(\d{5})(\d{4})$/, '$1-$2'); // XXXXX-XXXX
    return telefone;
}

// Função para formatar benefício
function formatarBeneficio(beneficio) {
    beneficio = beneficio.replace(/\D/g, ''); // remove não dígitos
    beneficio = beneficio.replace(/(\d{3})(\d)/, '$1.$2'); // XXX.
    beneficio = beneficio.replace(/(\d{3})(\d)/, '$1.$2'); // XXX.XXX.
    beneficio = beneficio.replace(/(\d{3})(\d{1})$/, '$1-$2'); // XXX.XXX.XXX-X
    return beneficio;
}

// Toggle do botão normal da sidebar (desktop)
if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('aberto');
        // Para mobile, ativa overlay
        if (window.innerWidth <= 768 && overlay) {
            overlay.classList.toggle('ativo');
        }
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

const conteudoClienteNovo=document.querySelector('.conteudoClienteNovo')
const conteudoClienteCarteira=document.querySelector('.conteudoClienteCarteira')

let tipoSelecionado; // variável para armazenar o tipo de dado selecionado
let parteEndereco; // variável para armazenar a parte do endereço

function abreFechaNovo(){
   console.log('clicado cliente novo!')
    conteudoClienteNovo.classList.toggle('aberto')
    // Para mobile, ativa overlay se sidebar aberta, mas aqui é pra divs
    // Talvez não, pois overlay é pra sidebar
}

function abreFechaCarteira(){
   console.log('clicado cliente carteira!')
    conteudoClienteCarteira.classList.toggle('aberto')
}

const estados = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia",
  "Ceará", "Distrito Federal", "Espírito Santo", "Goiás",
  "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná",
  "Pernambuco", "Piauí", "Rio de Janeiro",
  "Rio Grande do Norte", "Rio Grande do Sul",
  "Rondônia", "Roraima", "Santa Catarina",
  "São Paulo", "Sergipe", "Tocantins"
]

const selectEstado = document.getElementById('estado')

if (selectEstado) {
  estados.forEach(estado => {
    const option = document.createElement('option')
    option.value = estado
    option.textContent = estado
    selectEstado.appendChild(option)
  })
}

const formClienteNovo=document.getElementById('formClienteNovo')
const botaoClicado=document.getElementById('botaoClicado')

function cadClienteNovo(event) {
    event.preventDefault(); // impede reload
    console.log("Formulário validado, enviando...");
    formClienteNovo.reset()

    // força reset da animação
    
    void botaoClicado.offsetWidth;

    botaoClicado.textContent = "✅ Cliente cadastrado com sucesso!";
    botaoClicado.classList.remove('sumir');
    botaoClicado.classList.add('ativo');

    // some após o tempo da barra
    setTimeout(() => {
        botaoClicado.classList.remove('ativo');
        botaoClicado.classList.add('sumir');
        
    }, 4000);
}

function proximoPasso(passoAtual){
    if (passoAtual===1){
        const cpf = document.getElementById('icliente').value;
        const cpfNumeros = cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11){
            alert('Digite um CPF válido com 11 dígitos!');
            return;
        }
        document.getElementById('stepCPF').style.display="none";
        document.getElementById('stepDado').style.display="block";
    } else if (passoAtual===2){
        const dadoSelecionado = document.getElementById('tipoAtualizacaoDadoCliente').value;
        if (!dadoSelecionado){
            window.alert('Selecione um dado para atualizar!')
            return;
        }
        tipoSelecionado = dadoSelecionado; // armazena o tipo
        if (tipoSelecionado === 'endereco') {
            document.getElementById('stepDado').style.display = 'none';
            document.getElementById('stepEndereco').style.display = 'block';
            document.getElementById('stepOperacao').style.display="block";
        } else {
            const label=document.getElementById("labelNovoDado");
            document.getElementById('stepOperacao').style.display="block";
            if (tipoSelecionado === 'senhaINSS') {
                label.textContent = 'Nova Senha INSS:';
            } else if( tipoSelecionado ==='nome'){
                label.textContent = 'Novo Nome:'
            } else if( tipoSelecionado ==='cpf'){
                label.textContent = 'Novo CPF'
            } else if( tipoSelecionado==='dataNascimento'){
                label.textContent= 'Nova Data Nascimento'
            } else if( tipoSelecionado ==='telefone'){
                label.textContent='Novo Telefone'
            } else {
                label.textContent = `Novo ${dadoSelecionado.charAt(0).toUpperCase() + dadoSelecionado.slice(1)}:`;
            }

            // Configura o input para formatação e tamanho se necessário
            const input = document.getElementById('novoValor');
            if (tipoSelecionado === 'telefone') {
                input.placeholder = '(00) 00000-0000';
                input.oninput = () => { input.value = formatarTelefone(input.value); };
                input.style.width = '40%'; // tamanho menor pro telefone
            } else if (tipoSelecionado === 'senhaINSS') {
                input.placeholder = 'Joao@123';
                input.oninput = null;
                input.style.width = '40%'; // tamanho menor pra senha
            } else {
                input.placeholder = '';
                input.oninput = null;
                input.style.width = '100%'; // tamanho normal pros outros
            }

            document.getElementById('stepDado').style.display = 'none';
            document.getElementById('stepAtualizar').style.display = 'block';
        }
    } else if (passoAtual===3){
        const parteSelecionada = document.getElementById('parteEndereco').value;
        if (!parteSelecionada){
            alert('Selecione uma parte do endereço!');
            return;
        }
        parteEndereco = parteSelecionada;
        const label=document.getElementById("labelNovoDado");
        label.textContent = `Novo ${parteSelecionada.charAt(0).toUpperCase() + parteSelecionada.slice(1)}:`;

        const input = document.getElementById('novoValor');
        const selectEstado = document.getElementById('selectEstado');

        if (parteSelecionada === 'estado') {
            // Popula o select com estados
            selectEstado.innerHTML = '<option value="">Selecione</option>';
            estados.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                selectEstado.appendChild(option);
            });
            input.style.display = 'none';
            selectEstado.style.display = 'block';
            selectEstado.style.width = '60%';
        } else {
            input.style.display = 'block';
            selectEstado.style.display = 'none';
            if (parteSelecionada === 'numero') {
                input.placeholder = '123';
                input.style.width = '30%';
            } else if (parteSelecionada === 'cidade') {
                input.placeholder = 'Ex: São Paulo';
                input.style.width = '60%';
            } else if (parteSelecionada === 'bairro') {
                input.placeholder = 'Ex: Centro';
                input.style.width = '60%';
            } else if (parteSelecionada === 'rua') {
                input.placeholder = 'Ex: Rua das Flores';
                input.style.width = '70%';
            } else {
                input.placeholder = '';
                input.style.width = '100%';
            }
            input.oninput = null;
        }

        document.getElementById('stepEndereco').style.display = 'none';
        document.getElementById('stepAtualizar').style.display = 'block';
    }
}

// Função para atualizar o dado (simula a atualização)
function atualizarDado() {
    let novoValor;
    if (parteEndereco === 'estado') {
        novoValor = document.getElementById('selectEstado').value;
    } else {
        novoValor = document.getElementById('novoValor').value;
    }
    if (!novoValor.trim()) {
        alert('Digite o novo valor!');
        return;
    }
    const mensagem = document.getElementById('mensagemAtualizacao');
    // força reset da animação
    void mensagem.offsetWidth;

    mensagem.textContent = "✅ Dado atualizado com sucesso!";
    mensagem.classList.remove('sumir');
    mensagem.classList.add('ativo');

    // some após o tempo da barra
    setTimeout(() => {
        mensagem.classList.remove('ativo');
        mensagem.classList.add('sumir');
        
    }, 4000);

    // Reseta o fluxo
    document.getElementById('stepAtualizar').style.display = 'none';
    document.getElementById('stepEndereco').style.display = 'none'; // esconde o step endereco
    document.getElementById('stepCPF').style.display = 'block';
    document.getElementById('icliente').value = '';
    document.getElementById('tipoAtualizacaoDadoCliente').value = '';
    document.getElementById('parteEndereco').value = ''; // reseta select endereco
    document.getElementById('novoValor').value = '';
    document.getElementById('selectEstado').value = ''; // reseta select estado
    document.getElementById('novoValor').style.display = 'block'; // mostra input
    document.getElementById('selectEstado').style.display = 'none'; // esconde select
    document.getElementById('novoValor').style.width = '100%'; // reseta tamanho
    const inputsTabela = document.querySelectorAll('.tabelaOp tbody input');
        inputsTabela.forEach(input => {
        input.value = '';
    });
    document.querySelector('#stepOperacao').style.display='none';
    tipoSelecionado = null; // reseta
    parteEndereco = null; // reseta
}

const tbody = document.querySelector(".tabelaOp tbody");
const btnAdd = document.getElementById("addLinha");

btnAdd.addEventListener("click", () => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><input type="text" name="operacao" placeholder="Ex.: Portabilidade"></td>
        <td><input type="date" name="data"></td>
        <td><input type="text" name="banco" placeholder="Banco... promotora..."></td>
    `;

    tbody.appendChild(tr);

    // foco automático no primeiro input
    tr.querySelector("input").focus();
});