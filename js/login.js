document.addEventListener('DOMContentLoaded', () => {
    // ---- CONFIGURAÇÃO DE USUÁRIOS ----
    // As senhas aqui são "hashes" (versões criptografadas).
    // Para adicionar um novo usuário, gere um hash para a senha desejada.
    const users = {
        "produtor1": "688787d8ff144c502c7f5cffaafe2cc588d86079f9de88304c26b0cb99ce91c6", // senha original: senha123
        "fazenda_sol": "229402b52865175a4c62045610899534a69a4497330752140e64c56847a989d2", // senha original: curralforte
        "admin": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"  // senha original: admin
    };
    // Para gerar um novo hash para uma nova senha, abra o console do navegador (F12) e digite:
    // CryptoJS.SHA256("novasenha").toString()
    // Copie o resultado e cole aqui.
    // ---------------------------------

    const loginForm = document.getElementById('login-form');
    const alertPlaceholder = document.getElementById('alert-placeholder');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Gera o hash da senha que o usuário digitou
        const passwordHash = CryptoJS.SHA256(password).toString();

        // Compara o hash gerado com o hash armazenado
        if (users[username] && users[username] === passwordHash) {
            // Salva o nome de usuário para usar no dashboard
            sessionStorage.setItem('loggedInUser', username);
            // Salva a senha (hash) para usar como chave de criptografia dos dados
            sessionStorage.setItem('cryptoKey', passwordHash);
            // Redireciona para o dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Mostra uma mensagem de erro
            showAlert('Usuário ou senha inválidos!', 'danger');
        }
    });

    function showAlert(message, type) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.innerHTML = ''; // Limpa alertas anteriores
        alertPlaceholder.append(wrapper);
    }
});