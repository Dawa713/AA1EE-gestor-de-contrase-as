/**
 * Clase para gestionar todas las llamadas a la API
 * Utiliza fetch con promesas
 */
class ApiService {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    /**
     * Realiza una petición fetch genérica
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                return null;
            }

            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        } catch (error) {
            console.error('Error en la petición:', error);
            throw error;
        }
    }

    // ========== MÉTODOS PARA CATEGORÍAS ==========

    /**
     * Obtiene todas las categorías
     */
    async getCategories() {
        return await this.request('/categories');
    }

    /**
     * Añade una nueva categoría
     */
    async addCategory(name) {
        return await this.request('/categories', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    }

    /**
     * Elimina una categoría
     */
    async deleteCategory(id) {
        return await this.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * Obtiene los sites de una categoría específica
     */
    async getCategorySites(categoryId) {
        return await this.request(`/categories/${categoryId}`);
    }

    // ========== MÉTODOS PARA SITES ==========

    /**
     * Obtiene todos los sites
     */
    async getSites() {
        return await this.request('/sites');
    }

    /**
     * Añade un nuevo site a una categoría
     */
    async addSite(categoryId, siteData) {
        return await this.request(`/categories/${categoryId}`, {
            method: 'POST',
            body: JSON.stringify(siteData)
        });
    }

    /**
     * Elimina un site
     */
    async deleteSite(siteId) {
        return await this.request(`/sites/${siteId}`, {
            method: 'DELETE'
        });
    }
}
