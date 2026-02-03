// === Sidebar Toggle ===
const toggleBtn = document.getElementById('toggleMenu');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');
let currentEditingCard = null; // null significa que vamos adicionar novo
// Toggle do botão normal da sidebar (desktop)
if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('aberto');
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

// === Modal Adicionar Cliente ===
const modalOverlay = document.getElementById('modalOverlay');
const cancelBtn = document.getElementById('cancelBtn');
const clientForm = document.getElementById('clientForm');
const addClientBtn = document.getElementById('addClientBtn');

// Abrir modal
addClientBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'flex'; // mostra imediatamente
    setTimeout(() => {
        modalOverlay.classList.add('active'); // ativa animação
    }, 10);
});

// Cancelar modal
cancelBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active'); // inicia animação de fechamento
    setTimeout(() => {
        modalOverlay.style.display = 'none'; // esconde no final
        clientForm.reset();
    }, 300); // tempo da transição
});

// Salvar cliente pelo formulário do modal

// Abrir modal
addClientBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'flex';
    setTimeout(() => modalOverlay.classList.add('active'), 10);
});

// Cancelar modal
cancelBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
        modalOverlay.style.display = 'none';
        clientForm.reset();
        currentEditingCard = null; // reseta edição
    }, 300);
});

// Salvar cliente pelo formulário do modal
clientForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newClient = {
        id: Math.floor(Math.random() * 1000000000),
        name: document.getElementById('clientName').value,
        product: document.getElementById('clientProduct').value,
        agreement: document.getElementById('clientAgreement').value,
        value: document.getElementById('clientValue').value,
        statusClass: document.getElementById('clientStatus').value,
        statusText: document.getElementById('clientStatus').selectedOptions[0].text,
        lastUpdate: 'Agora',
        createdAt: new Date().toLocaleDateString('pt-BR')
    };

    // Seleciona a coluna correta pelo status
    let targetColumn;
    switch(newClient.statusClass) {
        case 'status-nova':
            targetColumn = document.querySelectorAll('.kanban-column')[0].querySelector('.kanban-cards');
            break;
        case 'status-analise':
            targetColumn = document.querySelectorAll('.kanban-column')[1].querySelector('.kanban-cards');
            break;
        case 'status-aprovacao':
            targetColumn = document.querySelectorAll('.kanban-column')[2].querySelector('.kanban-cards');
            break;
        case 'status-finalizado':
            targetColumn = document.querySelectorAll('.kanban-column')[3].querySelector('.kanban-cards');
            break;
    }

    if (currentEditingCard) {
        // Atualiza card existente
        currentEditingCard.querySelector('.client-name').textContent = newClient.name;
        const fields = currentEditingCard.querySelectorAll('.card-field .field-value');
        fields[0].textContent = newClient.product;
        fields[1].textContent = newClient.agreement;
        fields[2].textContent = newClient.value;
        currentEditingCard.querySelector('.status-dot').className = `status-dot ${newClient.statusClass}`;
        currentEditingCard.querySelector('.status-text').textContent = newClient.statusText;
        currentEditingCard.querySelector('.date-value:first-child').textContent = newClient.lastUpdate;

        // Move para a coluna correta se mudou de status
        targetColumn.appendChild(currentEditingCard);

        currentEditingCard = null; // reseta edição
    } else {
        // Cria card novo
        targetColumn.appendChild(createClientCard(newClient, newClient.statusClass));
    }

    // Fecha modal
    modalOverlay.classList.remove('active');
    setTimeout(() => {
        modalOverlay.style.display = 'none';
        clientForm.reset();
    }, 300);
});

// === Função para criar cards dinamicamente ===
function createClientCard(clientData, columnClass = 'status-nova') {
    const card = document.createElement('div');
    card.classList.add('proposal-card', columnClass);

    card.innerHTML = `
        <div class="card-header">
            <span class="proposal-id">📋 #${clientData.id}</span>
            <button class="btn-menu">⋯</button>
        </div>
        <h3 class="client-name">${clientData.name}</h3>
        <div class="card-field">
            <span class="field-label">Produto</span>
            <span class="field-value">${clientData.product}</span>
        </div>
        <div class="card-field">
            <span class="field-label">Convênio:</span>
            <span class="field-value bold">${clientData.agreement}</span>
        </div>
        <div class="card-field">
            <span class="field-label">Valor da Operação</span>
            <span class="field-value bold">${clientData.value}</span>
        </div>
        <div class="card-status">
            <span class="status-dot ${columnClass}"></span>
            <span class="status-text">${clientData.statusText}</span>
        </div>
        <div class="card-dates">
            <div class="date-item">
                <span class="date-label">Última atualização</span>
                <span class="date-value">${clientData.lastUpdate}</span>
            </div>
            <div class="date-item">
                <span class="date-label">Criado em</span>
                <span class="date-value">${clientData.createdAt}</span>
            </div>
        </div>
    `;

    // Botão menu (três pontinhos)
    const btnMenu = card.querySelector('.btn-menu');
    btnMenu.addEventListener('click', () => {
        // Remove menu antigo
        const existingMenu = card.querySelector('.card-menu');
        if (existingMenu) existingMenu.remove();

        // Cria menu
        const actionMenu = document.createElement('div');
        actionMenu.classList.add('card-menu');
        actionMenu.innerHTML = `
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Excluir</button>
        `;
        card.appendChild(actionMenu);

        // Excluir card
        actionMenu.querySelector('.delete-btn').addEventListener('click', () => {
            card.remove();
        });

        // Editar card
        actionMenu.querySelector('.edit-btn').addEventListener('click', () => {
            currentEditingCard = card; // marca card para edição

            // Preenche modal
            document.getElementById('clientName').value = card.querySelector('.client-name').textContent;
            const fields = card.querySelectorAll('.card-field .field-value');
            document.getElementById('clientProduct').value = fields[0].textContent;
            document.getElementById('clientAgreement').value = fields[1].textContent;
            document.getElementById('clientValue').value = fields[2].textContent;

            const statusClass = card.querySelector('.status-dot').classList[1];
            document.getElementById('clientStatus').value = statusClass;

            // Abre modal
            modalOverlay.style.display = 'flex';
            setTimeout(() => modalOverlay.classList.add('active'), 10);

            // Fecha o menu
            actionMenu.remove();
        });
    });

    return card;
}


mainActionBtn.addEventListener('click', () => {
  const isActive = actionOptions.classList.toggle('active');

  // Aplica delay em cascata toda vez que abrir
  actionBtns.forEach((btn, i) => {
    if (isActive) {
      btn.style.transitionDelay = `${i * 0.05}s`;
    } else {
      btn.style.transitionDelay = '0s';
    }
  });
});