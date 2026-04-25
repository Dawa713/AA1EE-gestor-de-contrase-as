// Inicialización de variables globales
const api = new ApiService();
let selectedCategoryId = null;
let categoryModal;

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modal de Bootstrap
    categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar categorías al iniciar
    loadCategories();
});

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Botón para añadir categoría
    document.getElementById('btnAddCategory').addEventListener('click', showAddCategoryModal);
    
    // Botón para guardar categoría
    document.getElementById('btnSaveCategory').addEventListener('click', saveCategory);
    
    // Botón para añadir site
    document.getElementById('btnAddSite').addEventListener('click', () => {
        if (selectedCategoryId) {
            window.location.href = `site.html?categoryId=${selectedCategoryId}`;
        }
    });
    
    // Validación en tiempo real del formulario de categoría
    document.getElementById('categoryName').addEventListener('blur', validateCategoryName);
}

/**
 * Valida el nombre de la categoría (validación dinámica con blur)
 */
function validateCategoryName() {
    const input = document.getElementById('categoryName');
    const value = input.value.trim();
    
    if (value.length === 0) {
        input.classList.add('is-invalid');
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    }
}

/**
 * Muestra el modal para añadir una categoría
 */
function showAddCategoryModal() {
    const form = document.getElementById('categoryForm');
    form.reset();
    document.getElementById('categoryName').classList.remove('is-valid', 'is-invalid');
    categoryModal.show();
}

/**
 * Guarda una nueva categoría
 */
async function saveCategory() {
    const nameInput = document.getElementById('categoryName');
    const name = nameInput.value.trim();
    
    // Validar que el nombre no esté vacío
    if (!name) {
        nameInput.classList.add('is-invalid');
        return;
    }
    
    try {
        await api.addCategory(name);
        categoryModal.hide();
        await loadCategories();
        showNotification('Categoría añadida correctamente', 'success');
    } catch (error) {
        showNotification('Error al añadir la categoría', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Carga todas las categorías
 */
async function loadCategories() {
    try {
        const categories = await api.getCategories();
        renderCategories(categories);
    } catch (error) {
        showNotification('Error al cargar las categorías', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Renderiza la lista de categorías
 */
function renderCategories(categories) {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay categorías</p>';
        return;
    }
    
    categories.forEach(category => {
        const categoryItem = createCategoryElement(category);
        container.appendChild(categoryItem);
    });
}

/**
 * Crea un elemento de categoría
 */
function createCategoryElement(category) {
    const div = document.createElement('div');
    div.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
    div.dataset.categoryId = category.id;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'category-name';
    nameSpan.textContent = category.name;
    nameSpan.style.cursor = 'pointer';
    nameSpan.addEventListener('click', () => selectCategory(category.id, category.name));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCategory(category.id);
    });
    
    div.appendChild(nameSpan);
    div.appendChild(deleteBtn);
    
    return div;
}

/**
 * Selecciona una categoría y carga sus sites
 */
async function selectCategory(categoryId, categoryName) {
    selectedCategoryId = categoryId;
    
    // Actualizar UI
    document.getElementById('categoryTitle').textContent = categoryName;
    document.getElementById('btnAddSite').style.display = 'block';
    
    // Marcar categoría seleccionada
    document.querySelectorAll('#categoriesList .list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category-id="${categoryId}"]`).classList.add('active');
    
    // Cargar sites de la categoría
    await loadSites(categoryId);
}

/**
 * Elimina una categoría
 */
async function deleteCategory(categoryId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
        return;
    }
    
    try {
        await api.deleteCategory(categoryId);
        
        // Si la categoría eliminada era la seleccionada, limpiar la selección
        if (selectedCategoryId === categoryId) {
            selectedCategoryId = null;
            document.getElementById('categoryTitle').textContent = 'Selecciona una categoría';
            document.getElementById('btnAddSite').style.display = 'none';
            document.getElementById('sitesList').innerHTML = '';
        }
        
        await loadCategories();
        showNotification('Categoría eliminada correctamente', 'success');
    } catch (error) {
        showNotification('Error al eliminar la categoría', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Carga los sites de una categoría
 */
async function loadSites(categoryId) {
    try {
        const category = await api.getCategorySites(categoryId);
        renderSites(category.sites || []);
    } catch (error) {
        showNotification('Error al cargar los sites', 'danger');
        console.error('Error:', error);
    }
}

/**
 * Renderiza la lista de sites
 */
function renderSites(sites) {
    const container = document.getElementById('sitesList');
    container.innerHTML = '';
    
    if (!sites || sites.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay sites en esta categoría</p>';
        return;
    }
    
    sites.forEach(site => {
        const siteCard = createSiteCard(site);
        container.appendChild(siteCard);
    });
}

/**
 * Crea una tarjeta de site
 */
function createSiteCard(site) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-3';
    
    col.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${escapeHtml(site.name)}</h5>
                <p class="card-text">
                    <strong>URL:</strong> ${escapeHtml(site.url || 'N/A')}<br>
                    <strong>Usuario:</strong> ${escapeHtml(site.user)}<br>
                    <strong>Contraseña:</strong> <span class="password-hidden">••••••••</span>
                    <button class="btn btn-sm btn-link toggle-password" data-password="${escapeHtml(site.password)}">
                        <i class="bi bi-eye"></i>
                    </button>
                </p>
                ${site.description ? `<p class="card-text"><small class="text-muted">${escapeHtml(site.description)}</small></p>` : ''}
                <button class="btn btn-sm btn-danger delete-site" data-site-id="${site.id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
    
    // Event listener para mostrar/ocultar contraseña
    col.querySelector('.toggle-password').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const passwordSpan = btn.previousElementSibling;
        const icon = btn.querySelector('i');
        
        if (passwordSpan.classList.contains('password-hidden')) {
            passwordSpan.textContent = btn.dataset.password;
            passwordSpan.classList.remove('password-hidden');
            icon.className = 'bi bi-eye-slash';
        } else {
            passwordSpan.textContent = '••••••••';
            passwordSpan.classList.add('password-hidden');
            icon.className = 'bi bi-eye';
        }
    });
    
    // Event listener para eliminar site
    col.querySelector('.delete-site').addEventListener('click', () => {
        deleteSite(site.id);
    });
    
    return col;
}

/**
 * Elimina un site
 */
async function deleteSite(siteId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este site?')) {
        return;
    }
    
    try {
        await api.deleteSite(siteId);
        await loadSites(selectedCategoryId);
        showNotification('Site eliminado correctamente', 'success');
    } catch (error) {
        showNotification('Error al eliminar el site', 'danger');
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

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
