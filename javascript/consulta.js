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

const tipoBusca = window.document.getElementById('tipoBusca')
const campoSimples = window.document.getElementById('campoSimples')
const blocoEndereco = window.document.getElementById('blocoEndereco')
const botaoBuscar = window.document.getElementById('btnBuscar')
const labelBusca = window.document.getElementById('labelBusca')
const buscaSimples = window.document.getElementById('buscaSimples')

function atualizarCampos() {

  campoSimples.style.display = "none";
  blocoEndereco.style.display = "none";
  botaoBuscar.style.display = "none";

  buscaSimples.value = ""
  buscaSimples.type = "text"
  buscaSimples.placeholder = ""
  buscaSimples.removeAttribute("inputmode")

  if (tipoBusca.value === "") {
    labelBusca.textContent = ""
    return;
  }


  if (tipoBusca.value === "endereco") {
    blocoEndereco.style.display = "grid";
    botaoBuscar.style.display = "block";
    labelBusca.textContent = "" // não usa label no endereço
    return
  }


  if (tipoBusca.value === "nome") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "Nome:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "Ex.: João da Silva"
  }
  else if (tipoBusca.value === "cpf") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "CPF:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "000.000.000-00"
  }
  else if (tipoBusca.value === "dn") {
    campoSimples.style.display = "block";
    labelBusca.textContent = "Data de nascimento:"
    botaoBuscar.style.display = "block"
    buscaSimples.placeholder = "DD/MM/AAAA"
  }
  else {

    labelBusca.textContent = "Pesquisar"
  }
}

const clientesMock = [
    { id: 1, nome: "Maria das Graças", cpf: "123.456.789-00", dn: "1980-05-15", estado: "RN", cidade: "Santa Cruz", bairro: "Centro", rua: "Joao Bianor Bezerra" },
    { id: 2, nome: "João Silva", cpf: "987.654.321-11", dn: "1992-10-20", estado: "SP", cidade: "São Paulo", bairro: "Jardins", rua: "Av. Paulista" },
    { id: 3, nome: "Maria Oliveira", cpf: "456.789.123-22", dn: "1975-03-12", estado: "RJ", cidade: "Rio de Janeiro", bairro: "Copacabana", rua: "Av. Atlântica" },
    { id: 4, nome: "Carlos Souza", cpf: "321.654.987-33", dn: "1988-07-08", estado: "RN", cidade: "Natal", bairro: "Ponta Negra", rua: "Rua do Sol" }
];


function buscar() {
  const telaRetornoConsulta = document.querySelector('.telaRetornoConsulta')
  const listaClientes = document.getElementById('listaClientes')
  const detalheCliente = document.getElementById('detalheCliente')
  telaRetornoConsulta.style.display = 'block';
  
  telaRetornoConsulta.style.display='block'
  listaClientes.style.display='block'
  detalheCliente.style.display = 'none';
  listaClientes.innerHTML = ''; // Limpa busca anterior

  let resultados=[]


  if (tipoBusca.value ==='nome'|| tipoBusca.value==='cpf'|| tipoBusca.value==='dn'){
    const termo = buscaSimples.value.toLowerCase();
    resultados = clientesMock.filter(c=>{
      if (tipoBusca.value==='nome') return c.nome.toLowerCase().includes(termo);
      if (tipoBusca.value === 'cpf') return c.cpf.includes(termo);
      if (tipoBusca.value === 'dn') return c.dn.includes(termo);
    });
  } else if (tipoBusca.value === 'endereco') {
      const estado = document.getElementById('estado').value.toLowerCase();
      const cidade = document.getElementById('cidade').value.toLowerCase();
      const bairro = document.getElementById('bairro').value.toLowerCase();
      const rua = document.getElementById('rua').value.toLowerCase();
      resultados = clientesMock.filter(c => 
        (estado === '' || c.estado.toLowerCase().includes(estado)) &&
        (cidade === '' || c.cidade.toLowerCase().includes(cidade)) &&
        (bairro === '' || c.bairro.toLowerCase().includes(bairro)) &&
        (rua === '' || c.rua.toLowerCase().includes(rua))
      )}     
}

