const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');
let vaiAtualizarDado = true;

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
        document.getElementById('stepClienteCarteiraRetornado').style.display="block";
        document.getElementById('stepConfirmarAtualizacao').style.display = "block";

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
            document.querySelector('.docEVideosClienteCarteira').style.display='block';

            // popula estados
            const selectEstado = document.getElementById('enderecoEstado');
            selectEstado.innerHTML = '<option value="">Selecione</option>';
            estados.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                selectEstado.appendChild(option);
            });

            return;

        } else {
            const label=document.getElementById("labelNovoDado");
            document.getElementById('stepOperacao').style.display="block";
            document.querySelector('.docEVideosClienteCarteira').style.display='block';
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
            } else if (tipoSelecionado ==='nome'){
                input.placeholder='João da Silva';
                input.oninput = null;
                input.style.width='55%'
            } else if (tipoSelecionado ==='dataNascimento'){
                input.type='date'
                input.oninput = null;
                input.style.width='29%'
            } else if(tipoSelecionado === 'cpf'){
                input.placeholder = '000.000.000-00';
                input.oninput = () => { input.value = formatarCPF(input.value); };
                input.style.width = '40%'; // tamanho menor pro telefone
                input.minLength = 11; // com máscara
                input.maxLength = 14;
            } else if(tipoSelecionado === "endereco"){
                input.oninput=null;
                input.style.width ='40%'
            } else {
                input.placeholder = '';
                input.oninput = null;
                input.style.width = '100%'; // tamanho normal pros outros
            }

            document.getElementById('stepDado').style.display = 'none';
            document.getElementById('stepAtualizar').style.display = 'block';
        }
    } else if (passoAtual === 3) {

    const estado = document.getElementById('enderecoEstado').value;
    const cidade = document.getElementById('enderecoCidade').value;
    const bairro = document.getElementById('enderecoBairro').value;
    const rua = document.getElementById('enderecoRua').value;
    const numero = document.getElementById('enderecoNumero').value;

    if (!estado || !cidade || !bairro || !rua || !numero) {
        alert('Preencha todo o endereço!');
        return;
    }

    // aqui tu já tem o endereço completo
    enderecoAtualizado = { estado, cidade, bairro, rua, numero };

    document.getElementById('stepEndereco').style.display = 'none';
    document.getElementById('stepAtualizar').style.display = 'block';
    }
}

function confirmarAtualizacao(resposta) {

    document.getElementById('stepConfirmarAtualizacao').style.display = 'none';

    if (resposta === true) {
        vaiAtualizarDado = true;
        // SIM → escolher dado
        document.getElementById('stepDado').style.display = 'block';
        document.getElementById('stepOperacao').style.display = 'none';
        document.querySelector('.docEVideosClienteCarteira').style.display = 'none';
    } 
    else {
        vaiAtualizarDado = false;
        // NÃO → vai direto pra operações + docs
        document.getElementById('stepDado').style.display = 'none';
        document.getElementById('stepAtualizar').style.display = 'none';

        document.getElementById('stepOperacao').style.display = 'block';
        document.querySelector('.docEVideosClienteCarteira').style.display = 'block';
    }
}

// Função para atualizar o dado (simula a atualização)
function atualizarDado() {

    // 👉 NÃO vai atualizar dado
    if (vaiAtualizarDado === false) {
        finalizarFluxo();
        return;
    }

    // 👉 VALIDAÇÃO
    if (tipoSelecionado === 'endereco') {

        const estado  = document.getElementById('enderecoEstado').value;
        const cidade  = document.getElementById('enderecoCidade').value;
        const bairro  = document.getElementById('enderecoBairro').value;
        const rua     = document.getElementById('enderecoRua').value;
        const numero  = document.getElementById('enderecoNumero').value;

        if (!estado || !cidade || !bairro || !rua || !numero) {
            alert('Preencha todos os campos do endereço!');
            return;
        }

    } else {

        let novoValor = parteEndereco === 'estado'
            ? document.getElementById('selectEstado').value
            : document.getElementById('novoValor').value;

        if (!novoValor || !novoValor.trim()) {
            alert('Digite o novo valor!');
            return;
        }
    }

    // 👉 DAQUI PRA BAIXO: SEMPRE EXECUTA
    console.log('Atualização válida, resetando fluxo');

    finalizarFluxo();
}

function finalizarFluxo() {

    const mensagem = document.getElementById('mensagemAtualizacao');
    void mensagem.offsetWidth;

    mensagem.textContent = "✅ Operação concluída com sucesso!";
    mensagem.classList.remove('sumir');
    mensagem.classList.add('ativo');

    setTimeout(() => {
        mensagem.classList.remove('ativo');
        mensagem.classList.add('sumir');
    }, 4000);

    document.getElementById('stepCPF').style.display = 'block';
    document.getElementById('icliente').value = '';
    document.getElementById('stepAtualizar').style.display = 'none';
    document.getElementById('stepEndereco').style.display = 'none';
    document.getElementById('stepOperacao').style.display = 'none';
    document.querySelector('.docEVideosClienteCarteira').style.display = 'none';
    document.getElementById('stepClienteCarteiraRetornado').style.display = 'none';
    document.getElementById('tipoAtualizacaoDadoCliente').value='';
    document.getElementById('novoValor').value=''

    tipoSelecionado = null;
    parteEndereco = null;
    vaiAtualizarDado = null;
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

function previewArquivo(input, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = "";

    const file = input.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const label = input.closest(".inputDocCliente");
    const conteudo = label.querySelector(".conteudoUpload");

    label.classList.add("com-preview");
    preview.style.display = "flex";

    // NOME DO ARQUIVO
    const nome = document.createElement("p");
    nome.classList.add("nomeArquivo");
    nome.textContent = file.name;

    // IMAGEM
    if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = url;
        preview.appendChild(img);
    }

    // PDF
    else if (file.type === "application/pdf") {
        const embed = document.createElement("embed");
        embed.src = url;
        embed.type = "application/pdf";
        preview.appendChild(embed);
    }

    // VÍDEO
    else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        preview.appendChild(video);
    }

    preview.appendChild(nome);
}