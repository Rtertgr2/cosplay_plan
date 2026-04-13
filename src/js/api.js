/**
 * API Module — Communicates with the Google Apps Script Backend
 * 
 * Usage:
 *   1. Deploy the GAS Code.gs as a Web App
 *   2. Set GAS_URL below to the deployed URL
 *   3. All State operations will automatically sync with Google Sheets
 */

const API = {
    // ⚠️ Replace this with your deployed GAS Web App URL
    GAS_URL: 'https://script.google.com/macros/s/AKfycbytE0dk5N_51L7kNJC3zRYb9Z96caJmptqDzFEL8qtaNjMD7pM_1_Xlp8qzAEijz7Gs7A/exec',

    /**
     * Check if API is configured
     */
    isConfigured() {
        return this.GAS_URL && this.GAS_URL.length > 10;
    },

    /**
     * GET: Fetch all projects (lightweight — no Base64 images)
     */
    async fetchAll() {
        if (!this.isConfigured()) return null;

        try {
            const url = `${this.GAS_URL}?action=list`;
            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                console.error('API fetchAll error:', result.error);
                return null;
            }
        } catch (error) {
            console.error('API fetchAll failed:', error);
            return null;
        }
    },

    /**
     * GET: Fetch a single project with full data (including Base64 image)
     * This is the "Lazy Load Round 2"
     */
    async fetchById(projectId) {
        if (!this.isConfigured()) return null;

        try {
            const url = `${this.GAS_URL}?action=get&id=${encodeURIComponent(projectId)}`;
            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                console.error('API fetchById error:', result.error);
                return null;
            }
        } catch (error) {
            console.error('API fetchById failed:', error);
            return null;
        }
    },

    /**
     * POST: Create a new project
     */
    async create(projectData) {
        if (!this.isConfigured()) return null;

        try {
            const response = await fetch(this.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' }, // GAS requirement for CORS
                body: JSON.stringify({
                    action: 'create',
                    data: projectData
                })
            });
            const result = await response.json();

            if (!result.success) {
                console.error('API create error:', result.error);
            }
            return result;
        } catch (error) {
            console.error('API create failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * POST: Update an existing project
     */
    async update(projectData) {
        if (!this.isConfigured()) return null;

        try {
            const response = await fetch(this.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'update',
                    data: projectData
                })
            });
            const result = await response.json();

            if (!result.success) {
                console.error('API update error:', result.error);
            }
            return result;
        } catch (error) {
            console.error('API update failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * POST: Delete a project
     */
    async remove(projectId) {
        if (!this.isConfigured()) return null;

        try {
            const response = await fetch(this.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'delete',
                    data: { id: projectId }
                })
            });
            const result = await response.json();

            if (!result.success) {
                console.error('API delete error:', result.error);
            }
            return result;
        } catch (error) {
            console.error('API delete failed:', error);
            return { success: false, error: error.message };
        }
    }
};

window.API = API;
