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

    async function cadClienteNovo(event) {
        event.preventDefault(); 
        
        const form = document.getElementById('formClienteNovo');
        const formData = new FormData(form); // Isso captura os textos E os arquivos (rg_frente, etc)

        // Pegamos o botão para fazer a animação de sucesso depois
        const botaoClicado = document.getElementById('botaoClicado');

        try {
            const response = await fetch("http://127.0.0.1:5000/clientes", {
                method: "POST",
                body: formData // Não precisa de headers aqui, o navegador resolve!
            });

            const resultado = await response.json();

            if (response.ok) {
                console.log("Sucesso:", resultado.mensagem);
                form.reset();
                // Reseta os previews de imagem também
                document.querySelectorAll('.previewArquivo').forEach(p => p.innerHTML = "");

                // Sua animação de sucesso
                botaoClicado.textContent = "✅ Cliente cadastrado com sucesso!";
                botaoClicado.classList.remove('sumir');
                botaoClicado.classList.add('ativo');
                setTimeout(() => {
                    botaoClicado.classList.remove('ativo');
                    botaoClicado.classList.add('sumir');
                }, 4000);
            } else {
                alert("Erro ao cadastrar: " + resultado.erro);
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Servidor desligado ou erro de rede.");
        }
    }

    function adicionarLinhaOperacao() {
    // 1. Pega o container e a linha modelo
    const container = document.getElementById('containerOperacoes');
    const linhas = container.querySelectorAll('.linha-operacao-item');
    const modelo = linhas[0]; // Pega a primeira como molde

    // 2. Clona a linha
    const novaLinha = modelo.cloneNode(true);

    // 3. Limpa os valores dos inputs da nova linha
    novaLinha.querySelectorAll('input').forEach(input => {
        input.value = '';
    });

    // 4. Insere a nova linha antes do botão de "Adicionar"
    const botao = container.querySelector('button');
    container.insertBefore(novaLinha, botao);
    }

    async function proximoPasso(passoAtual){
        if (passoAtual === 1) {
            const cpfRaw = document.getElementById('icliente').value;
            const cpfNumeros = cpfRaw.replace(/\D/g, '');
            
            if (cpfNumeros.length !== 11) {
                alert('Digite um CPF válido!');
                return;
            }

            try {
                // Chamada ao seu Python para buscar dados do cliente
                const response = await fetch(`http://127.0.0.1:5000/clientes/dados_edicao/${cpfNumeros}`);
                const cliente = await response.json();

                if (cliente.documentos && cliente.documentos.length >0) {
                    cliente.documentos.forEach(doc => {
                        if (doc.tipo_documento === 'RG_FRENTE') {
                            document.getElementById('statusFrente').innerHTML = "📄 Doc já enviado";
                            document.getElementById('linkFrente').href = `http://127.0.0.1:5000/${doc.url_documento}`;
                        }
                        if (doc.tipo_documento === 'RG_VERSO') {
                            document.getElementById('statusVerso').innerHTML = "📄 Doc já enviado";
                            document.getElementById('linkVerso').href = `http://127.0.0.1:5000/${doc.url_documento}`;
                        }
                        if (doc.tipo_documento === 'VIDEO') {
                            document.getElementById('statusVideo').innerHTML = "📄 Doc já enviado";
                            document.getElementById('linkVideo').href = `http://127.0.0.1:5000/${doc.url_documento}`;
                        }
                    })
                }
                if (response.ok) {
                    // Preenche os <p> do seu HTML com os dados do Banco
                    document.querySelector('.dadoRetornadoNome p').textContent = cliente.nome;
                    document.querySelector('.dadoRetornadoCPF p').textContent = formatarCPF(cliente.cpf);
                    document.querySelector('.dadoRetornadoDN p').textContent = cliente.data_nascimento;

                    document.getElementById('stepCPF').style.display = "none";
                    document.getElementById('stepClienteCarteiraRetornado').style.display = "block";
                    document.getElementById('stepConfirmarAtualizacao').style.display = "block";
                } else {
                    alert("Cliente não encontrado na base!");
                }
            } catch (error) {
                alert("Erro ao conectar com o servidor.");
            }
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
    async function atualizarDado() {
        const cpfOriginal = document.getElementById('icliente').value.replace(/\D/g, '');
        const formData = new FormData();
        
        formData.append('cpf_original', cpfOriginal);
        formData.append('vai_atualizar_dado', vaiAtualizarDado);

        // Se o usuário escolheu atualizar algum dado (Sim)
        if (vaiAtualizarDado) {
            formData.append('tipo_campo', tipoSelecionado);
            
            if (tipoSelecionado === 'endereco') {
                formData.append('estado', document.getElementById('enderecoEstado').value);
                formData.append('cidade', document.getElementById('enderecoCidade').value);
                formData.append('bairro', document.getElementById('enderecoBairro').value);
                formData.append('rua', document.getElementById('enderecoRua').value);
                formData.append('numero', document.getElementById('enderecoNumero').value);
            } else {
                formData.append('novo_valor', document.getElementById('novoValor').value);
            }
        }

        // Captura a Operação (Primeira linha da tabela)
        const linhasTabela = document.querySelectorAll('.tabelaOp tbody tr');
        const listaOperacoes = [];

        linhasTabela.forEach(linha=>{
            const operacao = linha.querySelector('input[name="operacao"]').value;
            const data = linha.querySelector('input[name="data"]').value;
            const banco = linha.querySelector('input[name="banco"]').value;

            if (operacao.trim() !=="") {
                listaOperacoes.push({
                    operacao:operacao,
                    data:data,
                    banco: banco
                });
            };
        })

        formData.append('operacoes', JSON.stringify(listaOperacoes));
        // Captura Arquivos
        const fFrente = document.getElementById('iDocFrenteClienteCarteira').files[0];
        const fVerso = document.getElementById('iDocVersoClienteCarteira').files[0];
        const fVideo = document.getElementById('iVideoClienteCarteira').files[0];

        if (fFrente) formData.append('docFrente', fFrente);
        if (fVerso) formData.append('docVerso', fVerso);
        if (fVideo) formData.append('videoCliente', fVideo);

        try {
            const response = await fetch("http://127.0.0.1:5000/clientes/atualizar", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                finalizarFluxo(); // Chama sua animação de sucesso
            } else {
                alert("Erro: " + result.erro);
            }
        } catch (error) {
            alert("Erro na rede ao tentar atualizar.");
        }
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