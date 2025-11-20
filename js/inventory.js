// Módulo de gestión de inventario
const Inventory = {
    theoretical: [],
    scanned: [],
    config: {},
    
    init: function() {
        this.loadFromStorage();
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        $('#inventory-setup-form').on('submit', (e) => this.handleSetup(e));
        $('#load-excel-btn').on('click', () => this.handleExcelLoad());
        $('#clear-scanned-btn').on('click', () => this.clearScannedItems());
    },
    
    handleSetup: function(e) {
        e.preventDefault();
        
        const date = $('#inventory-date-input').val();
        const store = $('#store-name').val();
        const responsible = $('#responsible-person').val();
        
        if (!date || !store || !responsible) {
            Utils.showNotification('Por favor, complete todos los campos', 'warning');
            return;
        }
        
        this.config = { date, store, responsible };
        this.saveToStorage();
        this.updateUI();
        
        Utils.showNotification('Configuración guardada correctamente', 'success');
    },
    
    handleExcelLoad: function() {
        const fileInput = document.getElementById('excel-file');
        if (fileInput.files.length === 0) {
            Utils.showNotification('Por favor, seleccione un archivo Excel', 'warning');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                this.theoretical = this.processExcelData(jsonData);
                this.saveToStorage();
                this.updateExcelPreview();
                
                Utils.showNotification(`Inventario teórico cargado: ${this.theoretical.length} productos`, 'success');
            } catch (error) {
                Utils.showNotification('Error al procesar el archivo Excel', 'error');
                console.error('Excel processing error:', error);
            }
        };
        
        reader.onerror = () => {
            Utils.showNotification('Error al leer el archivo', 'error');
        };
        
        reader.readAsArrayBuffer(file);
    },
    
    processExcelData: function(jsonData) {
        return jsonData.map(item => {
            const code = item.Código || item.codigo || item.CODIGO || item.ID || '';
            const name = item.Producto || item.producto || item.PRODUCTO || item.Nombre || item.nombre || '';
            const quantity = item.Cantidad || item.cantidad || item.CANTIDAD || item.Stock || item.stock || 0;
            
            return {
                id: Utils.generateId(),
                code: code.toString(),
                name: name.toString(),
                theoreticalQuantity: parseInt(quantity) || 0,
                scannedQuantity: 0
            };
        });
    },
    
    updateExcelPreview: function() {
        const previewBody = $('#excel-preview-body');
        previewBody.empty();
        
        const previewItems = this.theoretical.slice(0, 5);
        
        previewItems.forEach(item => {
            previewBody.append(`
                <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.theoreticalQuantity}</td>
                </tr>
            `);
        });
        
        if (this.theoretical.length > 5) {
            previewBody.append(`
                <tr>
                    <td colspan="3" class="text-center">... y ${this.theoretical.length - 5} productos más</td>
                </tr>
            `);
        }
        
        $('#excel-preview').show();
    },
    
    clearScannedItems: function() {
        if (confirm('¿Está seguro de que desea eliminar todos los productos escaneados?')) {
            this.scanned = [];
            this.theoretical.forEach(item => item.scannedQuantity = 0);
            this.saveToStorage();
            this.updateScannedTable();
            Utils.showNotification('Productos escaneados eliminados', 'info');
        }
    },
    
    updateUI: function() {
        if (this.config.date) {
            $('#inventory-date').text(this.config.date);
            $('#current-inventory-info').text(`Inventario: ${this.config.store} - ${this.config.date}`);
        }
        
        if (this.config.store) {
            $('#inventory-store').text(this.config.store);
        }
        
        if (this.config.responsible) {
            $('#inventory-responsible').text(this.config.responsible);
        }
    },
    
    saveToStorage: function() {
        localStorage.setItem('theoreticalInventory', JSON.stringify(this.theoretical));
        localStorage.setItem('scannedItems', JSON.stringify(this.scanned));
        localStorage.setItem('inventoryConfig', JSON.stringify(this.config));
    },
    
    loadFromStorage: function() {
        const savedTheoretical = localStorage.getItem('theoreticalInventory');
        const savedScanned = localStorage.getItem('scannedItems');
        const savedConfig = localStorage.getItem('inventoryConfig');
        
        if (savedTheoretical) this.theoretical = JSON.parse(savedTheoretical);
        if (savedScanned) this.scanned = JSON.parse(savedScanned);
        if (savedConfig) {
            this.config = JSON.parse(savedConfig);
            this.updateUI();
        }
    },
    
    // Getters
    getTheoretical: function() { return this.theoretical; },
    getScanned: function() { return this.scanned; },
    getConfig: function() { return this.config; },
    
    // Setters
    setScanned: function(scanned) { 
        this.scanned = scanned;
        this.saveToStorage();
    }
};