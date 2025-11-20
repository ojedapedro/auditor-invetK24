// Módulo de reportes
const Reports = {
    init: function() {
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        $('#generate-pdf-btn').on('click', () => this.generatePDF());
    },
    
    generatePDF: function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const config = Inventory.getConfig();
        const theoretical = Inventory.getTheoretical();
        const scanned = Inventory.getScanned();
        
        // Título
        doc.setFontSize(18);
        doc.text('INFORME DE INVENTARIO - TIENDAS K24', 105, 15, { align: 'center' });
        
        // Detalles del inventario
        doc.setFontSize(12);
        doc.text(`Fecha: ${config.date || 'No especificada'}`, 20, 25);
        doc.text(`Tienda: ${config.store || 'No especificada'}`, 20, 32);
        doc.text(`Responsable: ${config.responsible || 'No especificado'}`, 20, 39);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 46);
        
        // Resumen
        const summary = this.calculateSummary();
        doc.setFontSize(14);
        doc.text('RESUMEN', 20, 60);
        
        doc.setFontSize(10);
        doc.text(`Total de items: ${summary.totalItems}`, 30, 70);
        doc.text(`Items correctos: ${summary.correctItems}`, 30, 77);
        doc.text(`Items con discrepancia: ${summary.discrepancyItems}`, 30, 84);
        doc.text(`Items no escaneados: ${summary.missingItems}`, 30, 91);
        
        // Tabla
        doc.autoTable({
            startY: 100,
            head: [['Código', 'Producto', 'Cant. Teórica', 'Cant. Real', 'Diferencia', 'Estado']],
            body: this.getReportData(),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [44, 62, 80] },
            alternateRowStyles: { fillColor: [248, 249, 250] }
        });
        
        // Guardar PDF
        doc.save(`Inventario_K24_${config.store || 'Tienda'}_${config.date || 'Fecha'}.pdf`);
        Utils.showNotification('PDF generado correctamente', 'success');
    },
    
    calculateSummary: function() {
        const theoretical = Inventory.getTheoretical();
        const scanned = Inventory.getScanned();
        
        let totalItems = 0;
        let correctItems = 0;
        let discrepancyItems = 0;
        let missingItems = 0;
        
        theoretical.forEach(item => {
            totalItems++;
            const scannedItem = scanned.find(s => s.code === item.code);
            const scannedQty = scannedItem ? scannedItem.scannedQuantity : 0;
            
            if (scannedQty === 0) {
                missingItems++;
            } else if (scannedQty === item.theoreticalQuantity) {
                correctItems++;
            } else {
                discrepancyItems++;
            }
        });
        
        // Items escaneados que no están en el teórico
        scanned.forEach(item => {
            if (!theoretical.find(t => t.code === item.code)) {
                totalItems++;
                discrepancyItems++;
            }
        });
        
        return { totalItems, correctItems, discrepancyItems, missingItems };
    },
    
    getReportData: function() {
        const data = [];
        const theoretical = Inventory.getTheoretical();
        const scanned = Inventory.getScanned();
        
        theoretical.forEach(item => {
            const scannedItem = scanned.find(s => s.code === item.code);
            const scannedQty = scannedItem ? scannedItem.scannedQuantity : 0;
            const difference = scannedQty - item.theoreticalQuantity;
            
            let status;
            if (scannedQty === 0) {
                status = 'No escaneado';
            } else if (difference === 0) {
                status = 'Correcto';
            } else {
                status = difference > 0 ? 'Exceso' : 'Faltante';
            }
            
            data.push([
                item.code,
                item.name,
                item.theoreticalQuantity.toString(),
                scannedQty.toString(),
                difference.toString(),
                status
            ]);
        });
        
        // Items escaneados que no están en teórico
        scanned.forEach(item => {
            if (!theoretical.find(t => t.code === item.code)) {
                data.push([
                    item.code,
                    item.name,
                    '0',
                    item.scannedQuantity.toString(),
                    item.scannedQuantity.toString(),
                    'No en inventario'
                ]);
            }
        });
        
        return data;
    },
    
    updateReportTable: function() {
        // Implementar actualización de tabla de reportes
        const summary = this.calculateSummary();
        
        $('#total-items-count').text(summary.totalItems);
        $('#correct-items-count').text(summary.correctItems);
        $('#discrepancy-items-count').text(summary.discrepancyItems);
        $('#missing-items-count').text(summary.missingItems);
    }
};