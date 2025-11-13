// ============================================================================
// ARQUIVO PRINCIPAL - CARREGADO EM TODAS AS PÁGINAS DO SISTEMA
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // VERIFICAÇÃO DE AUTENTICAÇÃO E SEGURANÇA
    // ========================================================================
    const currentPage = window.location.pathname.split('/').pop();
    
    // Páginas que não precisam de autenticação
    const publicPages = ['index.html', 'login.html', ''];
    
    if (!publicPages.includes(currentPage)) {
        // Verifica se o usuário está logado
        const loggedUser = sessionStorage.getItem('loggedInUser');
        const cryptoKey = sessionStorage.getItem('cryptoKey');
        const sessionToken = sessionStorage.getItem('sessionToken');
        
        if (!loggedUser || !cryptoKey || !sessionToken) {
            // Redireciona para o login se não estiver autenticado
            alert('⚠️ Sessão expirada ou inválida. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
        // Exibe o nome do usuário logado
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = loggedUser;
        }
    }

    // ========================================================================
    // BOTÃO DE LOGOUT
    // ========================================================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Deseja realmente sair do sistema?')) {
                // Limpa todos os dados da sessão
                sessionStorage.clear();
                
                // Redireciona para o login
                window.location.href = 'login.html';
            }
        });
    }

    // ========================================================================
    // MENU LATERAL (SIDEBAR) - TOGGLE
    // ========================================================================
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-collapsed');
            document.querySelector('.main-content').classList.toggle('main-expanded');
        });
    }

    // ========================================================================
    // AUTO-LOGOUT POR INATIVIDADE (30 minutos)
    // ========================================================================
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milissegundos

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            alert('⏰ Sessão encerrada por inatividade.');
            sessionStorage.clear();
            window.location.href = 'login.html';
        }, INACTIVITY_TIMEOUT);
    }

    // Reseta o timer quando há atividade do usuário
    if (!publicPages.includes(currentPage)) {
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });
        resetInactivityTimer();
    }

    // ========================================================================
    // PROTEÇÃO CONTRA ABERTURA EM IFRAME (CLICKJACKING)
    // ========================================================================
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }

    // ========================================================================
    // DEFINE A DATA DE HOJE NOS CAMPOS DE DATA
    // ========================================================================
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });

    // ========================================================================
    // IMPEDE O SALVAMENTO DE SENHA PELO NAVEGADOR (SEGURANÇA EXTRA)
    // ========================================================================
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
        field.setAttribute('autocomplete', 'new-password');
    });
});