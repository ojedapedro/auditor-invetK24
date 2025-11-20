// Módulo de historial
const History = {
    inventoryHistory: [],
    
    init: function() {
        this.loadFromStorage();
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        $('#finalize-inventory-btn').on('click', () => this.showFinalizeModal());
        $('#confirm-finalize-btn').on('click', () => this.finalizeInventory());
    },
    
    showFinalizeModal: function() {
        if (Inventory.getTheoretical().length === 0) {
            Utils.showNotification('No hay inventario para finalizar', 'warning');
            return;
        }
        
        $('#finalizeInventoryModal').modal('show');
    },
    
    finalizeInventory: function() {
        const generateReport = $('#generate-final-report').is(':checked');
        
        if (generateReport) {
            Reports.generatePDF();
        }
        
        this.saveCurrentInventory();
        this.clearCurrentInventory();
        $('#finalizeInventoryModal').modal('hide');
        
        Utils.showNotification('Inventario finalizado correctamente', 'success');
    },
    
    saveCurrentInventory: function() {
        const theoretical = Inventory.getTheoretical();
        const scanned = Inventory.getScanned();
        const config = Inventory.getConfig();
        
        if (theoretical.length === 0) return;
        
        const totalItems = theoretical.length;
        const discrepancies = scanned.filter(item => {
            const theoreticalItem = theoretical.find(t => t.code === item.code);
            return !theoreticalItem || theoreticalItem.theoreticalQuantity !== item.scannedQuantity;
        }).length;
        
        const inventoryRecord = {
            id: Utils.generateId(),
            date: config.date || new Date().toISOString().split('T')[0],
            store: config.store || 'Tienda no especificada',
            responsible: config.responsible || 'Responsable no especificado',
            totalItems: totalItems,
            discrepancies: discrepancies,
            timestamp: new Date().toISOString(),
            data: {
                theoretical: [...theoretical],
                scanned: [...scanned]
            }
        };
        
        this.inventoryHistory.push(inventoryRecord);
        
        // Mantener solo los últimos 5
        if (this.inventoryHistory.length > 5) {
            this.inventoryHistory = this.inventoryHistory.slice(-5);
        }
        
        this.saveToStorage();
        this.updateHistoryTable();
    },
    
    clearCurrentInventory: function() {
        Inventory.theoretical = [];
        Inventory.scanned = [];
        Inventory.config = {};
        
        // Resetear UI
        $('#excel-file').val('');
        $('#inventory-setup-form')[0].reset();
        Inventory.updateUI();
        Scanner.updateRecentScans();
        
        Inventory.saveToStorage();
    },
    
    updateHistoryTable: function() {
        const tableBody = $('#history-table-body');
        tableBody.empty();
        
        if (this.inventoryHistory.length === 0) {
            tableBody.append(`
                <tr>
                    <td colspan="6" class="text-center">No hay historial de inventarios</td>
                </tr>
            `);
            return;
        }
        
        const recentHistory = this.inventoryHistory.slice(-5).reverse();
        
        recentHistory.forEach(inventory => {
            tableBody.append(`
                <tr>
                    <td>${inventory.date}</td>
                    <td>${inventory.store}</td>
                    <td>${inventory.responsible}</td>
                    <td>${inventory.totalItems}</td>
                    <td>${inventory.discrepancies}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-history" data-id="${inventory.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
        
        // Event listeners para botones de vista
        $('.view-history').on('click', (e) => {
            const id = $(e.target).closest('button').data('id');
            this.viewHistory(id);
        });
    },
    
    viewHistory: function(id) {
        const inventory = this.inventoryHistory.find(i => i.id === id);
        if (inventory) {
            // En una aplicación real, esto cargaría los datos del inventario
            Utils.showNotification(`Vista del inventario del ${inventory.date} para ${inventory.store}`, 'info');
        }
    },
    
    saveToStorage: function() {
        localStorage.setItem('inventoryHistory', JSON.stringify(this.inventoryHistory));
    },
    
    loadFromStorage: function() {
        const savedHistory = localStorage.getItem('inventoryHistory');
        if (savedHistory) {
            this.inventoryHistory = JSON.parse(savedHistory);
            this.updateHistoryTable();
        }
    }
};