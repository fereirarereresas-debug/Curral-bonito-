document.addEventListener('DOMContentLoaded', () => {
    // ---- CONFIGURAÇÃO DE USUÁRIOS ----
    // As senhas aqui são "hashes" (versões criptografadas).
    const users = {
        "produtor1": "688787d8ff144c502c7f5cffaafe2cc588d86079f9de88304c26b0cb99ce91c6", // senha original: senha123
        "fazenda_sol": "229402b52865175a4c62045610899534a69a4497330752140e64c56847a989d2", // senha original: curralforte
        "admin": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"  // senha original: admin
    };
    // Para gerar um novo hash, abra o console do navegador (F12) e digite:
    // CryptoJS.SHA256("sua_nova_senha").toString()
    // ---------------------------------

    const loginForm = document.getElementById('login-form');
    const alertPlaceholder = document.getElementById('alert-placeholder');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const passwordHash = CryptoJS.SHA256(password).toString();

        if (users[username] && users[username] === passwordHash) {
            sessionStorage.setItem('loggedInUser', username);
            sessionStorage.setItem('cryptoKey', passwordHash);
            window.location.href = 'dashboard.html';
        } else {
            showAlert('Usuário ou senha inválidos!', 'danger');
        }
    });

    function showAlert(message, type) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.innerHTML = ''; 
        alertPlaceholder.append(wrapper);
    }
});