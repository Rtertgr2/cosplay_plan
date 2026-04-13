/**
 * State Management for Cosplay Planner
 * 
 * Supports two modes:
 * - Offline: localStorage only (when GAS_URL is not configured)
 * - Online: localStorage + Google Sheets sync via API
 */

const State = {
    projects: [],
    currentEditId: null,
    currentDetailId: null,
    tempItems: [],
    tempBase64Image: null,
    tempImageInfo: null,
    syncing: false,

    /**
     * Initialize state — Load from localStorage first, then try API
     */
    async init() {
        // Always load from localStorage first for instant display
        this.loadFromLocal();

        // Then attempt to sync from API if configured
        if (window.API && window.API.isConfigured()) {
            await this.syncFromAPI();
        }
    },

    /**
     * Load projects from localStorage
     */
    loadFromLocal() {
        try {
            const data = localStorage.getItem('cosplayProjects');
            if (data) {
                this.projects = JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load from localStorage', e);
            this.projects = [];
        }
    },

    /**
     * Save projects to localStorage
     */
    saveToLocal() {
        try {
            localStorage.setItem('cosplayProjects', JSON.stringify(this.projects));
            return true;
        } catch (e) {
            console.error('LocalStorage save failed', e);
            return false;
        }
    },

    /**
     * Sync project list from API (Round 1: no images)
     */
    async syncFromAPI() {
        if (!window.API || !window.API.isConfigured()) return;

        this.syncing = true;
        try {
            const apiProjects = await window.API.fetchAll();
            if (apiProjects) {
                this.projects = apiProjects;
                this.saveToLocal();
                window.UI.updateStats();
                window.UI.renderProjects();
            }
        } catch (e) {
            console.error('API sync failed', e);
        } finally {
            this.syncing = false;
        }
    },

    /**
     * Fetch full project details from API (Round 2: with images)
     */
    async fetchFullProject(projectId) {
        if (!window.API || !window.API.isConfigured()) {
            return this.getProject(projectId);
        }

        try {
            const fullProject = await window.API.fetchById(projectId);
            if (fullProject) {
                // Update local cache
                const idx = this.projects.findIndex(p => p.id === fullProject.id);
                if (idx !== -1) {
                    this.projects[idx] = fullProject;
                }
                this.saveToLocal();
                return fullProject;
            }
        } catch (e) {
            console.error('Failed to fetch full project', e);
        }

        // Fallback to local
        return this.getProject(projectId);
    },

    /**
     * Save — writes to localStorage + API
     */
    save() {
        return this.saveToLocal();
    },

    /**
     * Add a new project (local + API)
     */
    async addProject(project) {
        this.projects.unshift(project);
        this.saveToLocal();

        // Async API sync — don't block the UI
        if (window.API && window.API.isConfigured()) {
            const result = await window.API.create(project);
            if (result && !result.success) {
                window.UI.showToast(result.error || 'API sync failed', 'error');
            }
        }

        return true;
    },

    /**
     * Update an existing project (local + API)
     */
    async updateProject(projectId, projectData) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...projectData };
            this.saveToLocal();

            if (window.API && window.API.isConfigured()) {
                const result = await window.API.update(projectData);
                if (result && !result.success) {
                    window.UI.showToast(result.error || 'API sync failed', 'error');
                }
            }

            return true;
        }
        return false;
    },

    /**
     * Delete a project (local + API)
     */
    async deleteProject(projectId) {
        this.projects = this.projects.filter(p => p.id !== projectId);
        this.saveToLocal();

        if (window.API && window.API.isConfigured()) {
            const result = await window.API.remove(projectId);
            if (result && !result.success) {
                window.UI.showToast(result.error || 'API sync failed', 'error');
            }
        }

        return true;
    },

    /**
     * Get a project by ID from local state
     */
    getProject(projectId) {
        return this.projects.find(p => p.id === projectId);
    },

    /**
     * Reset temporary state (for forms)
     */
    resetTemp() {
        this.currentEditId = null;
        this.tempItems = [];
        this.tempBase64Image = null;
        this.tempImageInfo = null;
    }
};

window.State = State;
