/**
 * API Module — Communicates with the Google Apps Script Backend
 */

const API = {
    // URL สำหรับเชื่อมต่อกับ Google Apps Script
    GAS_URL: window.API_BASE_URL || 'https://script.google.com/macros/s/AKfycbytE0dk5N_51L7kNJC3zRYb9Z96caJmptqDzFEL8qtaNjMD7pM_1_Xlp8qzAEijz7Gs7A/exec',

    isConfigured() {
        return !!this.GAS_URL && this.GAS_URL.length > 10 && !this.GAS_URL.includes('YOUR_GAS_URL');
    },

    /**
     * Build URL with query parameters for GAS
     */
    buildUrl(action, params = {}) {
        const url = new URL(this.GAS_URL);
        url.searchParams.set('action', action);
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        }
        return url.toString();
    },

    /**
     * GET request to GAS
     */
    async getRequest(action, params = {}) {
        const url = this.buildUrl(action, params);
        console.log(`🌐 API Calling (GET): ${action}`, params);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`❌ API GET failed (${action}):`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * POST request to GAS
     * Note: We don't set Content-Type header to avoid CORS preflight (OPTIONS)
     */
    async postRequest(action, data = {}) {
        console.log(`🌐 API Calling (POST): ${action}`, data);
        
        try {
            const response = await fetch(this.GAS_URL, {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({ action, data })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`❌ API POST failed (${action}):`, error);
            return { success: false, error: error.message };
        }
    },

    // ==========================================
    //  API Methods
    // ==========================================

    async list() {
        if (!this.isConfigured()) return { success: false, error: 'API not configured' };
        return await this.getRequest('list');
    },

    async get(id) {
        if (!this.isConfigured()) return { success: false, error: 'API not configured' };
        return await this.getRequest('get', { id });
    },

    async search(query) {
        if (!this.isConfigured()) return { success: false, error: 'API not configured' };
        return await this.getRequest('search', { q: query });
    },

    async create(projectData) {
        if (!this.isConfigured()) return { success: false, error: 'API not configured' };
        return await this.postRequest('create', projectData);
    },

    async update(projectId, projectData) {
        if (!this.isConfigured()) return { success: false, error: 'API not configured' };
        return await this.postRequest('update', { ...projectData, id: projectId });
    },

    async delete(projectId) {
        if (!this.isConfigured()) return { success: false, error: 'API not configured' };
        return await this.postRequest('delete', { id: projectId });
    },

    // Lightweight list for local operations
    getLocalList() {
        return State.getAll().sort((a, b) => {
            const aDate = new Date(a.updatedAt || 0);
            const bDate = new Date(b.updatedAt || 0);
            return bDate - aDate;
        });
    }
};

window.API = API;
console.log('✅ API Module initialized');
