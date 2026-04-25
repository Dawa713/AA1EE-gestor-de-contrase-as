// Inicialización de variables globales
const api = new ApiService();
let categoryId = null;

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el ID de la categoría de la URL
    const urlParams = new URLSearchParams(window.location.search);
    categoryId = urlParams.get('categoryId');
    
    if (!categoryId) {
        alert('No se ha especificado una categoría');
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar eventos
    setupEventListeners();
});

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Formulario de site
    const form = document.getElementById('siteForm');
    form.addEventListener('submit', handleSubmit);
    
    // Validaciones dinámicas con blur
    document.getElementById('siteName').addEventListener('blur', () => validateField('siteName', 3));
    document.getElementById('siteUrl').addEventListener('blur', () => validateUrl());
    document.getElementById('siteUser').addEventListener('blur', () => validateField('siteUser', 3));
    document.getElementById('sitePassword').addEventListener('blur', () => validateField('sitePassword', 8));
    
    // Botón para mostrar/ocultar contraseña
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    
    // Botón para generar contraseña
    document.getElementById('generatePassword').addEventListener('click', generateSecurePassword);
}

/**
 * Valida un campo de texto
 */
function validateField(fieldId, minLength) {
    const input = document.getElementById(fieldId);
    const value = input.value.trim();
    
    if (value.length === 0) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        return false;
    } else if (value.length < minLength) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    }
}

/**
 * Valida el campo URL
 */
function validateUrl() {
    const input = document.getElementById('siteUrl');
    const value = input.value.trim();
    
    // La URL es opcional
    if (value.length === 0) {
        input.classList.remove('is-invalid', 'is-valid');
        return true;
    }
    
    // Validar formato URL
    try {
        new URL(value);
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    } catch (e) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        return false;
    }
}

/**
 * Alterna la visibilidad de la contraseña
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('sitePassword');
    const icon = document.querySelector('#togglePassword i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'bi bi-eye';
    }
}

/**
 * Genera una contraseña segura
 * - Mínimo 8 caracteres
 * - Incluye mayúsculas, minúsculas, números y caracteres especiales
 */
function generateSecurePassword() {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + special;
    
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Completar con caracteres aleatorios
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar la contraseña
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Establecer la contraseña en el campo
    const passwordInput = document.getElementById('sitePassword');
    passwordInput.value = password;
    passwordInput.type = 'text';
    document.querySelector('#togglePassword i').className = 'bi bi-eye-slash';
    
    // Validar el campo
    validateField('sitePassword', 8);
    
    // Notificar al usuario
    showNotification('Contraseña segura generada', 'success');
}

/**
 * Maneja el envío del formulario
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    // Validar todos los campos
    const isNameValid = validateField('siteName', 3);
    const isUrlValid = validateUrl();
    const isUserValid = validateField('siteUser', 3);
    const isPasswordValid = validateField('sitePassword', 8);
    
    if (!isNameValid || !isUrlValid || !isUserValid || !isPasswordValid) {
        showNotification('Por favor, completa todos los campos obligatorios correctamente', 'warning');
        return;
    }
    
    // Recoger los datos del formulario
    const siteData = {
        name: document.getElementById('siteName').value.trim(),
        url: document.getElementById('siteUrl').value.trim() || '',
        user: document.getElementById('siteUser').value.trim(),
        password: document.getElementById('sitePassword').value.trim(),
        description: document.getElementById('siteDescription').value.trim() || ''
    };
    
    try {
        // Guardar el site
        await api.addSite(categoryId, siteData);
        showNotification('Site añadido correctamente', 'success');
        
        // Redirigir a la página principal después de 1 segundo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        showNotification('Error al guardar el site', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Muestra una notificación temporal
 */
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
