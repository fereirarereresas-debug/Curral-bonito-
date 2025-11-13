document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICAÇÃO DE LOGIN E CHAVE DE CRIPTOGRAFIA
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const cryptoKey = sessionStorage.getItem('cryptoKey');

    if (!loggedInUser || !cryptoKey) {
        window.location.href = 'login.html';
        return;
    }

    // 2. ELEMENTOS DA PÁGINA
    document.getElementById('username-display').textContent = loggedInUser;
    document.getElementById('logout-button').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // 3. FUNÇÕES DE CRIPTOGRAFIA
    const encryptData = (data) => {
        return CryptoJS.AES.encrypt(JSON.stringify(data), cryptoKey).toString();
    };

    const decryptData = (encryptedData) => {
        if (!encryptedData) return [];
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, cryptoKey);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (e) {
            console.error("Erro ao descriptografar dados:", e);
            // Se a chave estiver errada ou os dados corrompidos, retorna array vazio
            return [];
        }
    };

    // =========================================================================
    // 4. LÓGICA DE GERENCIAMENTO DE GADO
    // =========================================================================
    const gadoForm = document.getElementById('gado-form');
    const gadoTableBody = document.getElementById('gado-table-body');

    const getGadoList = () => decryptData(localStorage.getItem('gadoList_encrypted'));
    const saveGadoList = (list) => localStorage.setItem('gadoList_encrypted', encryptData(list));

    const renderGadoTable = () => {
        gadoTableBody.innerHTML = '';
        const gadoList = getGadoList();

        if (gadoList.length === 0) {
            gadoTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum animal cadastrado.</td></tr>`;
        } else {
            gadoList.forEach(animal => {
                const idade = calcularIdade(animal.nascimento);
                const row = `<tr><td>${animal.id}</td><td>${animal.nome || '-'}</td><td>${animal.raca}</td><td>${formatarData(animal.nascimento)}</td><td>${idade}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removerAnimal('${animal.id}')"><i class="bi bi-trash"></i></button></td></tr>`;
                gadoTableBody.innerHTML += row;
            });
        }
        populateAnimalSelect(); // Atualiza o select do controle sanitário
    };

    gadoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gadoList = getGadoList();
        const newAnimal = {
            id: document.getElementById('id-animal').value, nome: document.getElementById('nome-animal').value,
            raca: document.getElementById('raca-animal').value, nascimento: document.getElementById('nascimento-animal').value
        };
        if (gadoList.some(animal => animal.id === newAnimal.id)) {
            alert('Erro: Já existe um animal com este Brinco/ID.');
            return;
        }
        gadoList.push(newAnimal);
        saveGadoList(gadoList);
        renderGadoTable();
        gadoForm.reset();
    });

    window.removerAnimal = (id) => {
        if (confirm(`Tem certeza que deseja excluir o animal com ID ${id}? Isso também excluirá seu histórico sanitário.`)) {
            let gadoList = getGadoList();
            gadoList = gadoList.filter(animal => animal.id !== id);
            saveGadoList(gadoList);
            
            let sanitarioList = getSanitarioList();
            sanitarioList = sanitarioList.filter(evento => evento.animalId !== id);
            saveSanitarioList(sanitarioList);

            renderGadoTable();
            renderSanitarioTable();
        }
    };

    // =========================================================================
    // 5. LÓGICA DE CONTROLE SANITÁRIO
    // =========================================================================
    const sanitarioForm = document.getElementById('sanitario-form');
    const sanitarioTableBody = document.getElementById('sanitario-table-body');
    const animalSelect = document.getElementById('animal-select');

    const getSanitarioList = () => decryptData(localStorage.getItem('sanitarioList_encrypted'));
    const saveSanitarioList = (list) => localStorage.setItem('sanitarioList_encrypted', encryptData(list));

    const populateAnimalSelect = () => {
        const gadoList = getGadoList();
        const currentSelection = animalSelect.value;
        animalSelect.innerHTML = '<option value="" disabled selected>Selecione um animal</option>';
        gadoList.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.id} (${animal.nome || 'Sem nome'})`;
            animalSelect.appendChild(option);
        });
        animalSelect.value = currentSelection;
    };

    const renderSanitarioTable = () => {
        sanitarioTableBody.innerHTML = '';
        const sanitarioList = getSanitarioList();

        if (sanitarioList.length === 0) {
            sanitarioTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum manejo sanitário registrado.</td></tr>`;
        } else {
            sanitarioList.forEach(evento => {
                const row = `<tr><td>${evento.animalId}</td><td>${evento.produto}</td><td>${formatarData(evento.data)}</td><td>${evento.obs || '-'}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removerEventoSanitario('${evento.uid}')"><i class="bi bi-trash"></i></button></td></tr>`;
                sanitarioTableBody.innerHTML += row;
            });
        }
    };

    sanitarioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const sanitarioList = getSanitarioList();
        const newEvent = {
            uid: Date.now().toString(), // ID único para cada evento
            animalId: document.getElementById('animal-select').value,
            produto: document.getElementById('produto').value,
            data: document.getElementById('data-aplicacao').value,
            obs: document.getElementById('obs').value
        };
        sanitarioList.push(newEvent);
        saveSanitarioList(sanitarioList);
        renderSanitarioTable();
        sanitarioForm.reset();
    });
    
    window.removerEventoSanitario = (uid) => {
        if (confirm('Tem certeza que deseja excluir este registro de manejo?')) {
            let sanitarioList = getSanitarioList();
            sanitarioList = sanitarioList.filter(evento => evento.uid !== uid);
            saveSanitarioList(sanitarioList);
            renderSanitarioTable();
        }
    };
    
    // =========================================================================
    // 6. FUNÇÕES AUXILIARES E RENDERIZAÇÃO INICIAL
    // =========================================================================
    const calcularIdade = (dataNasc) => {
        if (!dataNasc) return 'N/D';
        const hoje = new Date(); const nasc = new Date(dataNasc);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return idade < 0 ? '0 anos' : `${idade} anos`;
    };
    
    const formatarData = (data) => {
        if (!data) return 'N/D';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // Renderiza tudo ao carregar a página
    renderGadoTable();
    renderSanitarioTable();
});