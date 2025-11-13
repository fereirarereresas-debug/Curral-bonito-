// ============================================================================
// GERENCIADOR DE DADOS COM CRIPTOGRAFIA AES-256
// ============================================================================
// Todos os dados são criptografados antes de serem salvos no localStorage
// Isso impede que pessoas mal-intencionadas leiam os dados diretamente
// ============================================================================

const DataManager = {
    // Fator de conversão para Unidade Animal
    UA_FACTORS: {
        vaca: 1.0,
        touro: 1.25,
        novilha: 0.75,
        garrote: 0.5,
        bezerro: 0.25
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
        
        // Verifica se já existe animal com este ID
        if (animais.some(a => a.id === animal.id)) {
            alert('Já existe um animal com este ID!');
            return false;
        }
        
        animais.push({
            ...animal,
            uid: Date.now().toString(),
            dataCadastro: new Date().toISOString()
        });
        localStorage.setItem('animais_encrypted', this.encrypt(animais));
        return true;
    },

    removeAnimal(id) {
        const animais = this.getAnimais().filter(a => a.id !== id);
        localStorage.setItem('animais_encrypted', this.encrypt(animais));
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
    // ESTATÍSTICAS PARA O DASHBOARD
    // ========================================================================
    getDashboardStats() {
        const animais = this.getAnimais();
        const inseminacoes = this.getInseminacoes();
        const financeiros = this.getFinanceiros();
        
        // Calcula total de UA
        let totalUA = 0;
        animais.forEach(animal => {
            const fator = this.UA_FACTORS[animal.categoria] || 0;
            totalUA += fator;
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
        
        // Conta inseminações ativas (aguardando ou confirmadas)
        const inseminacoesAtivas = inseminacoes.filter(
            i => i.status === 'Aguardando' || i.status === 'Confirmada'
        ).length;
        
        return {
            totalAnimais: animais.length,
            totalUA: totalUA,
            saldoTotal: this.formatarMoeda(totalReceitas - totalDespesas),
            totalInseminacoes: inseminacoesAtivas,
            totalReceitas: totalReceitas,
            totalDespesas: totalDespesas
        };
    }
};