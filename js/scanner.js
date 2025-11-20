// Módulo de escaneo
const Scanner = {
    isScanning: false,
    
    init: function() {
        this.setupEventListeners();
        this.updateRecentScans();
    },
    
    setupEventListeners: function() {
        $('#toggle-scan').on('click', () => this.toggleScan());
        $('#barcode-input').on('keypress', (e) => this.handleBarcodeInput(e));
        $('#manual-add-btn').on('click', () => this.handleManualAdd());
    },
    
    toggleScan: function() {
        this.isScanning = !this.isScanning;
        
        if (this.isScanning) {
            $('#toggle-scan').text('Detener Escaneo').removeClass('btn-outline-secondary').addClass('btn-danger');
            $('#scanner-area').addClass('scanning-active');
            $('#scan-status').removeClass('d-none');
            $('#barcode-input').prop('disabled', false).focus();
        } else {
            $('#toggle-scan').text('Iniciar Escaneo').removeClass('btn-danger').addClass('btn-outline-secondary');
            $('#scanner-area').removeClass('scanning-active');
            $('#scan-status').addClass('d-none');
            $('#barcode-input').prop('disabled', true).val('');
        }
    },
    
    handleBarcodeInput: function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.addScannedItem($('#barcode-input').val());
            $('#barcode-input').val('').focus();
        }
    },
    
    handleManualAdd: function() {
        const barcode = $('#barcode-input').val();
        if (barcode) {
            this.addScannedItem(barcode);
            $('#barcode-input').val('').focus();
        }
    },
    
    addScannedItem: function(barcode) {
        if (!barcode.trim()) return;
        
        const theoretical = Inventory.getTheoretical();
        const scanned = Inventory.getScanned();
        let item = theoretical.find(i => i.code === barcode);
        
        if (item) {
            const existingIndex = scanned.findIndex(i => i.code === barcode);
            
            if (existingIndex !== -1) {
                // Incrementar cantidad
                scanned[existingIndex].scannedQuantity += 1;
                theoretical.find(i => i.code === barcode).scannedQuantity += 1;
            } else {
                // Agregar nuevo item
                const newItem = {
                    id: Utils.generateId(),
                    code: item.code,
                    name: item.name,
                    theoreticalQuantity: item.theoreticalQuantity,
                    scannedQuantity: 1
                };
                
                scanned.push(newItem);
                theoretical.find(i => i.code === barcode).scannedQuantity = 1;
            }
            
            Utils.showNotification(`Producto escaneado: ${item.name}`, 'success');
        } else {
            // Producto no encontrado en inventario teórico
            const newItem = {
                id: Utils.generateId(),
                code: barcode,
                name: 'Producto no identificado',
                theoreticalQuantity: 0,
                scannedQuantity: 1
            };
            
            scanned.push(newItem);
            Utils.showNotification('Producto no encontrado en inventario teórico', 'warning');
        }
        
        Inventory.setScanned(scanned);
        this.updateRecentScans();
    },
    
    updateRecentScans: function() {
        const recentScans = $('#recent-scans');
        recentScans.empty();
        
        const scanned = Inventory.getScanned();
        const recentItems = scanned.slice(-5).reverse();
        
        if (recentItems.length === 0) {
            recentScans.append('<p class="text-muted text-center">No hay escaneos recientes</p>');
            return;
        }
        
        recentItems.forEach(item => {
            recentScans.append(`
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${item.name}</h6>
                        <small>${item.scannedQuantity}x</small>
                    </div>
                    <p class="mb-1 small text-muted">Código: ${item.code}</p>
                </div>
            `);
        });
    },
    
    // Para uso externo
    getScanningStatus: function() {
        return this.isScanning;
    }
};