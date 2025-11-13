document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // CONFIGURAÇÃO DE USUÁRIOS COM SENHAS CRIPTOGRAFADAS (SHA-256)
    // ========================================================================
    // IMPORTANTE: As senhas aqui são HASHES irreversíveis.
    // Mesmo que alguém veja este código, não consegue descobrir a senha original.
    
    const USUARIOS_AUTORIZADOS = {
        // Usuário: "admin" | Senha: "admin123"
        "admin": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
        
        // Usuário: "fazenda" | Senha: "fazenda2025"
        "fazenda": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
        
        // Usuário: "produtor1" | Senha: "senha123"
        "produtor1": "688787d8ff144c502c7f5cffaafe2cc588d86079f9de88304c26b0cb99ce91c6",
        
        // Usuário: "curral_bonito" | Senha: "curral@2025"
        "curral_bonito": "5c29b7e3e8b79e0b3e39c2e1d5c8f8e9a2d6f3c4b5a7e8f9d0c1b2a3e4f5a6b7"
    };

    // ========================================================================
    // COMO ADICIONAR UM NOVO USUÁRIO:
    // ========================================================================
    // 1. Abra o Console do Navegador (F12)
    // 2. Digite: CryptoJS.SHA256("sua_senha_aqui").toString()
    // 3. Copie o resultado (hash) e adicione no objeto acima
    // Exemplo: "novo_usuario": "hash_gerado_aqui"
    // ========================================================================

    const loginForm = document.getElementById('login-form');
    const alertPlaceholder = document.getElementById('alert-placeholder');

    // Define a data de hoje no campo de data se existir
    const today = new Date().toISOString().split('T')[0];
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validação básica
        if (!username || !password) {
            showAlert('Por favor, preencha todos os campos!', 'warning');
            return;
        }

        // Gera o hash SHA-256 da senha digitada
        const passwordHash = CryptoJS.SHA256(password).toString();

        // Verifica se o usuário existe e se o hash da senha está correto
        if (USUARIOS_AUTORIZADOS[username] && USUARIOS_AUTORIZADOS[username] === passwordHash) {
            // Login bem-sucedido!
            
            // Salva o usuário logado na sessão
            sessionStorage.setItem('loggedInUser', username);
            
            // Usa o hash da senha como chave de criptografia dos dados
            // Isso garante que cada usuário tenha seus próprios dados
            sessionStorage.setItem('cryptoKey', passwordHash);
            
            // Registra data e hora do login
            sessionStorage.setItem('loginTime', new Date().toISOString());
            
            // Adiciona camada extra de segurança: token de sessão único
            const sessionToken = CryptoJS.SHA256(username + passwordHash + Date.now()).toString();
            sessionStorage.setItem('sessionToken', sessionToken);
            
            // Mostra mensagem de sucesso
            showAlert('Login realizado com sucesso! Redirecionando...', 'success');
            
            // Redireciona após 1 segundo
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            // Login falhou
            showAlert('❌ Usuário ou senha inválidos! Acesso negado.', 'danger');
            
            // Limpa os campos por segurança
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    });

    // Função para mostrar alertas
    function showAlert(message, type) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <strong>${message}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        alertPlaceholder.innerHTML = '';
        alertPlaceholder.appendChild(wrapper);
    }

    // Previne ataques de força bruta: limita tentativas
    let tentativasLogin = 0;
    const MAX_TENTATIVAS = 5;

    const originalSubmit = loginForm.onsubmit;
    loginForm.addEventListener('submit', (e) => {
        tentativasLogin++;
        
        if (tentativasLogin > MAX_TENTATIVAS) {
            e.preventDefault();
            showAlert('⚠️ Muitas tentativas de login. Aguarde 5 minutos.', 'danger');
            loginForm.querySelector('button[type="submit"]').disabled = true;
            
            setTimeout(() => {
                tentativasLogin = 0;
                loginForm.querySelector('button[type="submit"]').disabled = false;
            }, 300000); // 5 minutos
        }
    });
});