// Aplicación principal
const App = {
    init: function() {
        this.initializeModules();
        this.setupNavigation();
        this.loadContentSections();
        this.checkAuthentication();
    },
    
    initializeModules: function() {
        Auth.init();
        Inventory.init();
        Scanner.init();
        Reports.init();
        History.init();
    },
    
    setupNavigation: function() {
        $('#sidebar-nav').on('click', '.nav-link', (e) => {
            e.preventDefault();
            const section = $(e.currentTarget).data('section');
            this.showSection(section);
        });
    },
    
    showSection: function(section) {
        // Actualizar navegación activa
        $('#sidebar-nav .nav-link').removeClass('active');
        $(`#sidebar-nav .nav-link[data-section="${section}"]`).addClass('active');
        
        // Cargar contenido de la sección
        this.loadSectionContent(section);
    },
    
    loadSectionContent: function(section) {
        // En una aplicación real, esto cargaría contenido dinámico
        // Por ahora, asumimos que el contenido está en el HTML inicial
        $('.content-section').addClass('d-none');
        $(`#${section}-section`).removeClass('d-none');
    },
    
    loadContentSections: function() {
        // Cargar secciones de contenido dinámicamente
        // Esto se puede expandir para cargar plantillas externas
    },
    
    checkAuthentication: function() {
        if (Auth.isAuthenticated()) {
            Auth.showMainApp();
        } else {
            Auth.showLoginScreen();
        }
    },
    
    // Métodos de utilidad para la aplicación
    refreshDashboard: function() {
        // Actualizar estadísticas del dashboard
        const theoretical = Inventory.getTheoretical();
        const scanned = Inventory.getScanned();
        
        const totalTheoretical = theoretical.reduce((sum, item) => sum + item.theoreticalQuantity, 0);
        const totalScanned = scanned.reduce((sum, item) => sum + item.scannedQuantity, 0);
        
        // Calcular discrepancias
        let discrepancies = 0;
        theoretical.forEach(item => {
            const scannedItem = scanned.find(s => s.code === item.code);
            const scannedQty = scannedItem ? scannedItem.scannedQuantity : 0;
            
            if (scannedQty !== item.theoreticalQuantity) {
                discrepancies++;
            }
        });
        
        // Calcular tasa de completitud
        const completionRate = theoretical.length > 0 ? 
            Math.round((scanned.filter(s => theoretical.find(t => t.code === s.code)).length / theoretical.length) * 100) : 0;
        
        // Actualizar UI
        $('#total-theoretical').text(totalTheoretical);
        $('#total-scanned').text(totalScanned);
        $('#total-discrepancies').text(discrepancies);
        $('#completion-rate').text(`${completionRate}%`);
        
        $('#scanned-count').text(totalScanned);
        $('#remaining-count').text(totalTheoretical - totalScanned);
        
        // Barra de progreso
        const progressPercentage = totalTheoretical > 0 ? (totalScanned / totalTheoretical) * 100 : 0;
        $('#progress-bar').css('width', `${progressPercentage}%`).text(`${Math.round(progressPercentage)}%`);
    }
};

// Inicializar aplicación cuando el DOM esté listo
$(document).ready(() => {
    App.init();
    
    // Actualizar dashboard periódicamente
    setInterval(() => {
        App.refreshDashboard();
    }, 2000);
});