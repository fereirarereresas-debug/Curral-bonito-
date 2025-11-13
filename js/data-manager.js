// ============================================================================
// GERENCIADOR DE DADOS COM CRIPTOGRAFIA AES-256
// ============================================================================
// Todos os dados são criptografados antes de serem salvos no localStorage
// Isso impede que pessoas mal-intencionadas leiam os dados diretamente
// ============================================================================

const DataManager = {
    // ========================================================================
    // TABELA CORRETA DE UNIDADE ANIMAL (UA)
    // ========================================================================
    // 1 UA = Animal de 450kg
    // Fator de UA é baseado no PESO MÉDIO esperado para cada categoria
    UA_FACTORS: {
        'vaca': 1.0,          // Vaca adulta: ~450kg = 1.0 UA
        'touro': 1.4,         // Touro adulto: ~630kg = 1.4 UA
        'novilha': 0.75,      // Novilha 24-36m: ~337kg = 0.75 UA
        'garrote': 0.6,       // Garrote 12-24m: ~270kg = 0.6 UA
        'bezerro': 0.25,      // Bezerro 0-12m: ~112kg = 0.25 UA
        'bezerra': 0.25,      // Bezerra 0-12m: ~112kg = 0.25 UA
        'novilho': 0.85,      // Novilho 24-36m: ~383kg = 0.85 UA
        'boi': 1.2            // Boi gordo: ~540kg = 1.2 UA
    },

    // ========================================================================
    // CÁLCULO DE UA BASEADO NO PESO REAL (quando informado)
    // ========================================================================
    calcularUAPorPeso(pesoKg) {
        if (!pesoKg || pesoKg <= 0) return 0;
        // 1 UA = 450kg, então: UA = peso / 450
        return parseFloat((pesoKg / 450).toFixed(2));
    },

    // Obtém a chave de criptografia da sessão
    getCryptoKey() {
        const key = sessionStorage.getItem('cryptoKey');
        if (!key) {
            window.location.href = 'login.html';
            return null;
        }
        return key;
    },

    // Criptografa os dados antes de salvar
    encrypt(data) {
        const key = this.getCryptoKey();
        if (!key) return null;
        return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    },

    // Descriptografa os dados ao carregar
    decrypt(encryptedData) {
        if (!encryptedData) return [];
        const key = this.getCryptoKey();
        if (!key) return [];
        
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decrypted);
        } catch (e) {
            console.error('Erro ao descriptografar dados:', e);
            return [];
        }
    },

    // ========================================================================
    // ANIMAIS / REBANHO
    // ========================================================================
    getAnimais() {
        return this.decrypt(localStorage.getItem('animais_encrypted')) || [];
    },

    addAnimal(animal) {
        const animais = this.getAnimais();
        
        if (animais.some(a => a.id === animal.id)) {
            alert('Já existe um animal com este ID!');
            return false;
        }
        
        // Calcula UA baseado no peso real (se informado) ou categoria
        let ua = 0;
        if (animal.peso && animal.peso > 0) {
            ua = this.calcularUAPorPeso(animal.peso);
        } else {
            ua = this.UA_FACTORS[animal.categoria] || 0;
        }
        
        animais.push({
            ...animal,
            ua: ua,
            uid: Date.now().toString(),
            dataCadastro: new Date().toISOString()
        });
        localStorage.setItem('animais_encrypted', this.encrypt(animais));
        return true;
    },

    updateAnimal(id, updatedData) {
        const animais = this.getAnimais();
        const index = animais.findIndex(a => a.id === id);
        if (index !== -1) {
            // Recalcula UA se o peso foi atualizado
            if (updatedData.peso && updatedData.peso > 0) {
                updatedData.ua = this.calcularUAPorPeso(updatedData.peso);
            }
            animais[index] = { ...animais[index], ...updatedData };
            localStorage.setItem('animais_encrypted', this.encrypt(animais));
            return true;
        }
        return false;
    },

    removeAnimal(id) {
        const animais = this.getAnimais().filter(a => a.id !== id);
        localStorage.setItem('animais_encrypted', this.encrypt(animais));
    },

    // ========================================================================
    // PESAGENS
    // ========================================================================
    getPesagens() {
        return this.decrypt(localStorage.getItem('pesagens_encrypted')) || [];
    },

    addPesagem(pesagem) {
        const pesagens = this.getPesagens();
        pesagens.push(pesagem);
        localStorage.setItem('pesagens_encrypted', this.encrypt(pesagens));
        
        // Atualiza o peso do animal
        this.updateAnimal(pesagem.animalId, { peso: pesagem.peso });
    },

    removePesagem(uid) {
        const pesagens = this.getPesagens().filter(p => p.uid !== uid);
        localStorage.setItem('pesagens_encrypted', this.encrypt(pesagens));
    },

    // ========================================================================
    // PASTAGENS
    // ========================================================================
    getPastagens() {
        return this.decrypt(localStorage.getItem('pastagens_encrypted')) || [];
    },

    addPastagem(pastagem) {
        const pastagens = this.getPastagens();
        pastagens.push(pastagem);
        localStorage.setItem('pastagens_encrypted', this.encrypt(pastagens));
    },

    removePastagem(uid) {
        const pastagens = this.getPastagens().filter(p => p.uid !== uid);
        localStorage.setItem('pastagens_encrypted', this.encrypt(pastagens));
    },

    // ========================================================================
    // PRODUÇÃO DE LEITE
    // ========================================================================
    getProducaoLeite() {
        return this.decrypt(localStorage.getItem('leite_encrypted')) || [];
    },

    addProducaoLeite(producao) {
        const producoes = this.getProducaoLeite();
        producoes.push(producao);
        localStorage.setItem('leite_encrypted', this.encrypt(producoes));
    },

    removeProducaoLeite(uid) {
        const producoes = this.getProducaoLeite().filter(p => p.uid !== uid);
        localStorage.setItem('leite_encrypted', this.encrypt(producoes));
    },

    // ========================================================================
    // GENEALOGIA
    // ========================================================================
    getGenealogias() {
        return this.decrypt(localStorage.getItem('genealogias_encrypted')) || [];
    },

    addGenealogia(genealogia) {
        const genealogias = this.getGenealogias();
        genealogias.push(genealogia);
        localStorage.setItem('genealogias_encrypted', this.encrypt(genealogias));
    },

    removeGenealogia(uid) {
        const genealogias = this.getGenealogias().filter(g => g.uid !== uid);
        localStorage.setItem('genealogias_encrypted', this.encrypt(genealogias));
    },

    // ========================================================================
    // INSEMINAÇÃO
    // ========================================================================
    getInseminacoes() {
        return this.decrypt(localStorage.getItem('inseminacoes_encrypted')) || [];
    },

    addInseminacao(inseminacao) {
        const inseminacoes = this.getInseminacoes();
        inseminacoes.push(inseminacao);
        localStorage.setItem('inseminacoes_encrypted', this.encrypt(inseminacoes));
    },

    removeInseminacao(uid) {
        const inseminacoes = this.getInseminacoes().filter(i => i.uid !== uid);
        localStorage.setItem('inseminacoes_encrypted', this.encrypt(inseminacoes));
    },

    // ========================================================================
    // SANITÁRIO
    // ========================================================================
    getSanitarios() {
        return this.decrypt(localStorage.getItem('sanitarios_encrypted')) || [];
    },

    addSanitario(sanitario) {
        const sanitarios = this.getSanitarios();
        sanitarios.push(sanitario);
        localStorage.setItem('sanitarios_encrypted', this.encrypt(sanitarios));
    },

    removeSanitario(uid) {
        const sanitarios = this.getSanitarios().filter(s => s.uid !== uid);
        localStorage.setItem('sanitarios_encrypted', this.encrypt(sanitarios));
    },

    // ========================================================================
    // ALIMENTAÇÃO
    // ========================================================================
    getAlimentacoes() {
        return this.decrypt(localStorage.getItem('alimentacoes_encrypted')) || [];
    },

    addAlimentacao(alimentacao) {
        const alimentacoes = this.getAlimentacoes();
        alimentacoes.push(alimentacao);
        localStorage.setItem('alimentacoes_encrypted', this.encrypt(alimentacoes));
    },

    removeAlimentacao(uid) {
        const alimentacoes = this.getAlimentacoes().filter(a => a.uid !== uid);
        localStorage.setItem('alimentacoes_encrypted', this.encrypt(alimentacoes));
    },

    // ========================================================================
    // FINANCEIRO
    // ========================================================================
    getFinanceiros() {
        return this.decrypt(localStorage.getItem('financeiros_encrypted')) || [];
    },

    addFinanceiro(financeiro) {
        const financeiros = this.getFinanceiros();
        financeiros.push(financeiro);
        localStorage.setItem('financeiros_encrypted', this.encrypt(financeiros));
    },

    removeFinanceiro(uid) {
        const financeiros = this.getFinanceiros().filter(f => f.uid !== uid);
        localStorage.setItem('financeiros_encrypted', this.encrypt(financeiros));
    },

    // ========================================================================
    // FUNÇÕES AUXILIARES
    // ========================================================================
    calcularIdade(dataNascimento) {
        if (!dataNascimento) return 0;
        const hoje = new Date();
        const nasc = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
        }
        return idade < 0 ? 0 : idade;
    },

    formatarData(data) {
        if (!data) return '-';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    },

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },

    // ========================================================================
    // ESTATÍSTICAS PARA O DASHBOARD (CORRIGIDO)
    // ========================================================================
    getDashboardStats() {
        const animais = this.getAnimais();
        const inseminacoes = this.getInseminacoes();
        const financeiros = this.getFinanceiros();
        const producaoLeite = this.getProducaoLeite();
        
        // Calcula total de UA CORRETAMENTE
        let totalUA = 0;
        let pesoTotal = 0;
        
        animais.forEach(animal => {
            if (animal.status !== 'Ativo') return; // Conta apenas animais ativos
            
            // Usa UA já calculado no animal (baseado em peso real ou categoria)
            totalUA += animal.ua || 0;
            pesoTotal += parseFloat(animal.peso) || 0;
        });
        
        // Calcula saldo financeiro
        let totalReceitas = 0;
        let totalDespesas = 0;
        financeiros.forEach(f => {
            if (f.tipo === 'Receita') {
                totalReceitas += f.valor;
            } else {
                totalDespesas += f.valor;
            }
        });
        
        // Conta inseminações ativas
        const inseminacoesAtivas = inseminacoes.filter(
            i => i.status === 'Aguardando' || i.status === 'Confirmada'
        ).length;
        
        // Produção de leite do mês atual
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        const producaoMesAtual = producaoLeite
            .filter(p => {
                const data = new Date(p.data);
                return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
            })
            .reduce((total, p) => total + parseFloat(p.quantidade), 0);
        
        return {
            totalAnimais: animais.filter(a => a.status === 'Ativo').length,
            totalUA: parseFloat(totalUA.toFixed(2)),
            pesoMedioRebanho: animais.filter(a => a.status === 'Ativo').length > 0 ? (pesoTotal / animais.filter(a => a.status === 'Ativo').length).toFixed(0) : 0,
            saldoTotal: this.formatarMoeda(totalReceitas - totalDespesas),
            totalInseminacoes: inseminacoesAtivas,
            totalReceitas: totalReceitas,
            totalDespesas: totalDespesas,
            producaoLeiteMes: producaoMesAtual.toFixed(0)
        };
    },

    // ========================================================================
    // CÁLCULO DE LOTAÇÃO DE PASTAGEM
    // ========================================================================
    calcularLotacao(areaHectares, totalUA) {
        if (!areaHectares || areaHectares <= 0) return 0;
        // Retorna UA por hectare
        return (totalUA / areaHectares).toFixed(2);
    },

    // ========================================================================
    // GANHO DE PESO MÉDIO DIÁRIO (GPD)
    // ========================================================================
    calcularGPD(animalId) {
        const pesagens = this.getPesagens()
            .filter(p => p.animalId === animalId)
            .sort((a, b) => new Date(a.data) - new Date(b.data));
        
        if (pesagens.length < 2) return 0;
        
        const primeira = pesagens[0];
        const ultima = pesagens[pesagens.length - 1];
        
        const diferencaPeso = ultima.peso - primeira.peso;
        const diferencaDias = Math.floor(
            (new Date(ultima.data) - new Date(primeira.data)) / (1000 * 60 * 60 * 24)
        );
        
        if (diferencaDias === 0) return 0;
        
        return (diferencaPeso / diferencaDias).toFixed(3);
    }
};