// Utilidades generales
const Utils = {
    // Formatear fecha
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('es-ES');
    },
    
    // Generar ID único
    generateId: () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },
    
    // Validar email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Descargar archivo
    downloadFile: (content, filename, contentType) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Mostrar notificación
    showNotification: (message, type = 'info') => {
        const alertClass = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        }[type];
        
        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('#notifications-container').append(notification);
        
        setTimeout(() => {
            notification.alert('close');
        }, 5000);
    },
    
    // Limpiar formulario
    clearForm: (formId) => {
        $(`#${formId}`)[0].reset();
    },
    
    // Capitalizar texto
    capitalize: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
};