// Módulo de autenticación
const Auth = {
    currentUser: null,
    
    init: function() {
        this.loadUser();
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        $('#login-form').on('submit', (e) => this.handleLogin(e));
        $('#logout-btn').on('click', () => this.handleLogout());
    },
    
    handleLogin: function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const password = $('#password').val();
        
        if (!email || !password) {
            Utils.showNotification('Por favor, complete todos los campos', 'warning');
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Utils.showNotification('Por favor, ingrese un email válido', 'warning');
            return;
        }
        
        // Simulación de login (en producción esto sería una petición al backend)
        this.currentUser = {
            id: Utils.generateId(),
            email: email,
            name: email.split('@')[0],
            loginTime: new Date().toISOString()
        };
        
        this.saveUser();
        this.showMainApp();
        
        Utils.showNotification('¡Bienvenido! Sesión iniciada correctamente', 'success');
    },
    
    handleLogout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLoginScreen();
        
        Utils.showNotification('Sesión cerrada correctamente', 'info');
    },
    
    saveUser: function() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    },
    
    loadUser: function() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    },
    
    showMainApp: function() {
        $('#login-screen').addClass('d-none');
        $('#main-app').removeClass('d-none');
        $('#user-name').text(this.currentUser.name);
    },
    
    showLoginScreen: function() {
        $('#main-app').addClass('d-none');
        $('#login-screen').removeClass('d-none');
        Utils.clearForm('login-form');
    },
    
    isAuthenticated: function() {
        return this.currentUser !== null;
    },
    
    getUser: function() {
        return this.currentUser;
    }
};