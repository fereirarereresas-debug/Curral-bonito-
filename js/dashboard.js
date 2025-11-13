document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICAÇÃO DE LOGIN E CHAVE DE CRIPTOGRAFIA
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const cryptoKey = sessionStorage.getItem('cryptoKey');

    if (!loggedInUser || !cryptoKey) {
        window.location.href = 'login.html';
        return;
    }

    // 2. ELEMENTOS DA PÁGINA E CONFIGS
    document.getElementById('username-display').textContent = loggedInUser;
    document.getElementById('logout-button').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
    
    // Fatores de conversão para Unidade Animal (UA)
    const UA_FACTORS = {
        vaca: 1.0,
        touro: 1.25,
        novilha: 0.75,
        garrote: 0.5,
        bezerro: 0.25
    };

    // 3. FUNÇÕES DE CRIPTOGRAFIA
    const encryptData = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), cryptoKey).toString();
    const decryptData = (encryptedData) => {
        if (!encryptedData) return [];
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, cryptoKey);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (e) {
            console.error("Erro ao descriptografar:", e); return [];
        }
    };

    // FUNÇÕES AUXILIARES DE FORMATAÇÃO
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatData = (data) => {
        if (!data) return 'N/D';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // =========================================================================
    // 4. LÓGICA FINANCEIRA
    // =========================================================================
    const financeiroForm = document.getElementById('financeiro-form');
    const financeiroTableBody = document.getElementById('financeiro-table-body');

    const getFinanceiroList = () => decryptData(localStorage.getItem('financeiroList_encrypted'));
    const saveFinanceiroList = (list) => localStorage.setItem('financeiroList_encrypted', encryptData(list));

    const renderFinanceiro = () => {
        financeiroTableBody.innerHTML = '';
        const list = getFinanceiroList();
        let totalReceitas = 0, totalDespesas = 0;

        if (list.length === 0) {
            financeiroTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum lançamento financeiro.</td></tr>`;
        } else {
            list.forEach(item => {
                const valor = parseFloat(item.valor);
                const isReceita = item.tipo === 'receita';
                if (isReceita) totalReceitas += valor; else totalDespesas += valor;

                financeiroTableBody.innerHTML += `<tr>
                    <td>${formatData(item.data)}</td>
                    <td>${item.desc}</td>
                    <td class="${isReceita ? 'text-receita' : 'text-despesa'}">${formatCurrency(valor)}</td>
                    <td><span class="badge bg-${isReceita ? 'success' : 'danger'}">${item.tipo.toUpperCase()}</span></td>
                    <td><button class="btn btn-danger btn-sm" onclick="removerFinanceiro('${item.uid}')"><i class="bi bi-trash"></i></button></td>
                </tr>`;
            });
        }
        
        // Atualiza os cards de resumo
        document.getElementById('total-receitas').textContent = formatCurrency(totalReceitas);
        document.getElementById('total-despesas').textContent = formatCurrency(totalDespesas);
        document.getElementById('saldo-total').textContent = formatCurrency(totalReceitas - totalDespesas);
    };

    financeiroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const list = getFinanceiroList();
        list.push({
            uid: Date.now().toString(), data: document.getElementById('fin-data').value,
            desc: document.getElementById('fin-desc').value, valor: document.getElementById('fin-valor').value,
            tipo: document.getElementById('fin-tipo').value
        });
        saveFinanceiroList(list);
        renderFinanceiro();
        financeiroForm.reset();
    });

    window.removerFinanceiro = (uid) => {
        if (confirm('Deseja excluir este lançamento financeiro?')) {
            let list = getFinanceiroList().filter(item => item.uid !== uid);
            saveFinanceiroList(list);
            renderFinanceiro();
        }
    };

    // =========================================================================
    // 5. LÓGICA DE GERENCIAMENTO DE GADO E UA
    // =========================================================================
    const gadoForm = document.getElementById('gado-form');
    const gadoTableBody = document.getElementById('gado-table-body');

    const getGadoList = () => decryptData(localStorage.getItem('gadoList_encrypted'));
    const saveGadoList = (list) => localStorage.setItem('gadoList_encrypted', encryptData(list));

    const renderGadoTable = () => {
        gadoTableBody.innerHTML = '';
        const gadoList = getGadoList();
        let totalUA = 0;

        if (gadoList.length === 0) {
            gadoTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum animal cadastrado.</td></tr>`;
        } else {
            gadoList.forEach(animal => {
                const idade = ((d) => { const a = new Date(d); const h = new Date(); return h.getFullYear() - a.getFullYear(); })(animal.nascimento);
                totalUA += UA_FACTORS[animal.categoria] || 0;
                
                gadoTableBody.innerHTML += `<tr>
                    <td>${animal.id}</td><td>${animal.categoria}</td><td>${animal.raca}</td><td>${formatData(animal.nascimento)}</td><td>${idade} anos</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removerAnimal('${animal.id}')"><i class="bi bi-trash"></i></button></td>
                </tr>`;
            });
        }
        document.getElementById('total-ua').textContent = `${totalUA.toFixed(2)} UA`;
        populateAnimalSelect();
    };

    gadoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gadoList = getGadoList();
        const newAnimal = {
            id: document.getElementById('id-animal').value, categoria: document.getElementById('categoria-animal').value,
            raca: document.getElementById('raca-animal').value, nascimento: document.getElementById('nascimento-animal').value
        };
        if (gadoList.some(animal => animal.id === newAnimal.id)) {
            alert('Erro: Já existe um animal com este Brinco/ID.'); return;
        }
        gadoList.push(newAnimal);
        saveGadoList(gadoList);
        renderGadoTable();
        gadoForm.reset();
    });

    window.removerAnimal = (id) => {
        if (confirm(`Deseja excluir o animal ID ${id}? Seu histórico sanitário também será removido.`)) {
            saveGadoList(getGadoList().filter(animal => animal.id !== id));
            saveSanitarioList(getSanitarioList().filter(evento => evento.animalId !== id));
            renderGadoTable();
            renderSanitarioTable();
        }
    };

    // =========================================================================
    // 6. LÓGICA DE CONTROLE SANITÁRIO
    // =========================================================================
    const sanitarioForm = document.getElementById('sanitario-form');
    const sanitarioTableBody = document.getElementById('sanitario-table-body');
    const animalSelect = document.getElementById('animal-select');

    const getSanitarioList = () => decryptData(localStorage.getItem('sanitarioList_encrypted'));
    const saveSanitarioList = (list) => localStorage.setItem('sanitarioList_encrypted', encryptData(list));

    const populateAnimalSelect = () => {
        const gadoList = getGadoList();
        animalSelect.innerHTML = '<option value="" disabled selected>Selecione</option>';
        gadoList.forEach(animal => {
            animalSelect.innerHTML += `<option value="${animal.id}">${animal.id} (${animal.categoria})</option>`;
        });
    };

    const renderSanitarioTable = () => {
        sanitarioTableBody.innerHTML = '';
        const list = getSanitarioList();
        if (list.length === 0) {
            sanitarioTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum manejo registrado.</td></tr>`;
        } else {
            list.forEach(evento => {
                sanitarioTableBody.innerHTML += `<tr><td>${evento.animalId}</td><td>${evento.produto}</td><td>${formatData(evento.data)}</td><td>${evento.obs || '-'}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removerEventoSanitario('${evento.uid}')"><i class="bi bi-trash"></i></button></td></tr>`;
            });
        }
    };

    sanitarioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const list = getSanitarioList();
        list.push({
            uid: Date.now().toString(), animalId: document.getElementById('animal-select').value,
            produto: document.getElementById('produto').value, data: document.getElementById('data-aplicacao').value,
            obs: document.getElementById('obs').value
        });
        saveSanitarioList(list);
        renderSanitarioTable();
        sanitarioForm.reset();
    });
    
    window.removerEventoSanitario = (uid) => {
        if (confirm('Deseja excluir este registro de manejo?')) {
            saveSanitarioList(getSanitarioList().filter(evento => evento.uid !== uid));
            renderSanitarioTable();
        }
    };
    
    // =========================================================================
    // 7. RENDERIZAÇÃO INICIAL
    // =========================================================================
    renderFinanceiro();
    renderGadoTable();
    renderSanitarioTable();
});