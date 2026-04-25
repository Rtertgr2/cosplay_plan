/**
 * State Management for Cosplay Planner — Fixed Version
 * 
 * State เป็น local-only data manager
 * การ sync กับ cloud จัดการผ่าน API module ใน api_fixed.js
 */

const State = {
    projects: [],
    currentEditId: null,
    currentDetailId: null,
    tempItems: [],
    tempBase64Image: null,
    tempImageInfo: null,

    init() {
        this.loadFromLocal();
    },

    loadFromLocal() {
        try {
            const stored = localStorage.getItem("cosplayProjects");
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure it's always an array
                this.projects = Array.isArray(parsed) ? parsed : [];
            } else {
                this.projects = [];
            }
        } catch (error) {
            console.error("Failed to load from localStorage:", error);
            this.projects = [];
        }
    },

    saveToLocal() {
        try {
            localStorage.setItem("cosplayProjects", JSON.stringify(this.projects));
            return true;
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
            return false;
        }
    },

    add(project) {
        // Safeguard: ensure projects is an array
        if (!Array.isArray(this.projects)) {
            console.warn("State.projects was not an array, resetting");
            this.projects = [];
        }
        if (!project.id) {
            project.id = "proj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        }
        if (!project.createdAt) project.createdAt = new Date().toISOString();
        project.updatedAt = new Date().toISOString();
        this.projects.push(project);
        this.saveToLocal();
        return project;
    },

    update(project) {
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            project.updatedAt = new Date().toISOString();
            this.projects[index] = { ...this.projects[index], ...project };
            this.saveToLocal();
            return this.projects[index];
        }
        console.warn("Project not found:", project.id);
        return null;
    },

    delete(id) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            const removed = this.projects.splice(index, 1)[0];
            this.saveToLocal();
            return removed;
        }
        console.warn("Project not found:", id);
        return null;
    },

    get(id) {
        return this.projects.find(p => p.id === id) || null;
    },

    getAll() {
        return [...this.projects];
    },

    setImage(base64, info = {}) {
        this.tempBase64Image = base64;
        this.tempImageInfo = { ...info };
    },

    getEditId() {
        return this.currentEditId || null;
    },

    setEditId(id) {
        this.currentEditId = id || null;
    },

    getDetailId() {
        return this.currentDetailId || null;
    },

    setDetailId(id) {
        this.currentDetailId = id || null;
    }
};

window.State = State;
console.log("✅ State Module initialized");
