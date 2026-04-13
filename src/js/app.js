/**
 * Main Application Module for Cosplay Planner
 * Supports both offline (localStorage) and online (Google Sheets API) modes
 */

const App = {
    /**
     * Initialize Application
     */
    async init() {
        // Load local state immediately so UI is responsive
        window.State.loadFromLocal();
        window.UI.updateStats();
        window.UI.renderProjects();
        this.setupEventListeners();

        // Sync from API in background if configured
        if (window.API && window.API.isConfigured()) {
            window.State.syncFromAPI().then(() => {
                // UI will be updated by syncFromAPI internal calls
            });
        }

        // Show mode indicator
        setTimeout(() => {
            if (window.API && window.API.isConfigured()) {
                window.UI.showToast('เชื่อมต่อคลาวด์แล้ว', 'success');
            } else {
                window.UI.showToast('โหมดออฟไลน์', 'info');
            }
        }, 800);
    },

    /**
     * Global Event Listeners
     */
    setupEventListeners() {
        // Image Upload
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    window.UI.showToast('กำลังประมวลผลรูปภาพ...', 'info');
                    const result = await window.ImageProcessor.process(file);

                    // Check GAS size limit (50,000 chars)
                    if (window.API && window.API.isConfigured() && result.base64.length > 50000) {
                        window.UI.showToast(`รูปภาพใหญ่เกินไป (${result.base64Length.toLocaleString()} chars) สูงสุด 50,000`, 'error');
                        return;
                    }

                    window.State.tempBase64Image = result.base64;
                    window.State.tempImageInfo = result;

                    this.showImagePreview(result.base64, `ขนาด: ${result.width}×${result.height}px — ${result.processedSizeKB} KB (-${result.reductionPercent}%)`);
                    window.UI.showToast('ประมวลผลรูปภาพสำเร็จ', 'success');
                } catch (error) {
                    window.UI.showToast(String(error), 'error');
                }
            });
        }

        // Budget Input listener
        const budgetInput = document.getElementById('totalBudget');
        if (budgetInput) {
            budgetInput.addEventListener('input', () => window.UI.updateFormBudget());
        }
    },

    // ============ IMAGE TAB & URL SUPPORT ============

    switchImageTab(mode) {
        const tabUpload = document.getElementById('tabUpload');
        const tabUrl = document.getElementById('tabUrl');
        const panelUpload = document.getElementById('imageTabUpload');
        const panelUrl = document.getElementById('imageTabUrl');

        if (mode === 'url') {
            tabUrl.style.background = 'var(--primary)';
            tabUrl.style.color = 'white';
            tabUpload.style.background = 'white';
            tabUpload.style.color = 'var(--text-muted)';
            panelUrl.classList.remove('hidden');
            panelUpload.classList.add('hidden');
        } else {
            tabUpload.style.background = 'var(--primary)';
            tabUpload.style.color = 'white';
            tabUrl.style.background = 'white';
            tabUrl.style.color = 'var(--text-muted)';
            panelUpload.classList.remove('hidden');
            panelUrl.classList.add('hidden');
        }
    },

    loadImageFromUrl() {
        const urlInput = document.getElementById('imageUrlInput');
        const url = urlInput.value.trim();
        if (!url) {
            window.UI.showToast('กรุณาใส่ URL รูปภาพ', 'error');
            return;
        }

        // Store URL directly (no base64 conversion — saves space)
        window.State.tempBase64Image = url;
        window.State.tempImageInfo = { type: 'url' };

        this.showImagePreview(url, 'ใช้รูปจาก URL (ไม่ใช้ Base64)');
        window.UI.showToast('โหลด URL รูปภาพสำเร็จ', 'success');
    },

    clearImage() {
        window.State.tempBase64Image = null;
        window.State.tempImageInfo = null;
        document.getElementById('imagePreviewBox').classList.add('hidden');
        document.getElementById('imageInput').value = '';
        document.getElementById('imageUrlInput').value = '';
        window.UI.showToast('ลบรูปภาพแล้ว', 'info');
    },

    showImagePreview(src, infoText) {
        const box = document.getElementById('imagePreviewBox');
        const img = document.getElementById('imagePreview');
        const info = document.getElementById('imageProcessingInfo');

        img.src = src;
        img.onerror = () => {
            info.innerHTML = '<p style="color: var(--error);">❌ โหลดรูปไม่สำเร็จ — ตรวจสอบ URL</p>';
        };
        info.innerHTML = `<p>${infoText}</p>`;
        box.classList.remove('hidden');
    },

    /**
     * Create New Project — reset form and switch view
     */
    createNewProject() {
        window.State.resetTemp();
        document.getElementById('projectForm').reset();
        document.getElementById('formTitle').textContent = 'สร้างโปรเจกต์ใหม่';
        document.getElementById('imagePreviewBox').classList.add('hidden');
        document.getElementById('imageProcessingInfo').innerHTML = '';
        document.getElementById('imageUrlInput').value = '';
        this.switchImageTab('upload');
        window.UI.renderFormItems();
        window.UI.switchView('viewCreate');
    },

    /**
     * Edit Project — populate form with existing data
     */
    async editProject(projectId) {
        // Fetch full data (including image) if API is available
        let project;
        if (window.API && window.API.isConfigured()) {
            window.UI.showToast('กำลังโหลดข้อมูล...', 'info');
            project = await window.State.fetchFullProject(projectId);
        } else {
            project = window.State.getProject(projectId);
        }

        if (!project) return;

        window.State.currentEditId = projectId;
        window.State.tempItems = JSON.parse(JSON.stringify(project.items || []));
        window.State.tempBase64Image = project.base64Image || null;

        // Populate Form
        document.getElementById('charName').value = project.charName || '';
        document.getElementById('seriesName').value = project.seriesName || '';
        document.getElementById('totalBudget').value = project.budget || '';
        document.getElementById('projectStatus').value = project.status || 'planning';
        document.getElementById('projectNote').value = project.note || '';
        document.getElementById('formTitle').textContent = 'แก้ไขโปรเจกต์';

        // Image Preview
        if (project.base64Image) {
            const isUrl = project.base64Image.startsWith('http');
            const label = isUrl ? 'รูปจาก URL' : 'รูปอัปโหลด (Base64)';
            this.showImagePreview(project.base64Image, label);
            if (isUrl) {
                document.getElementById('imageUrlInput').value = project.base64Image;
                this.switchImageTab('url');
            }
        } else {
            document.getElementById('imagePreviewBox').classList.add('hidden');
        }

        window.UI.renderFormItems();
        window.UI.switchView('viewCreate');
    },

    /**
     * Save Project — create or update
     */
    async saveProject() {
        const charName = document.getElementById('charName').value.trim();
        const seriesName = document.getElementById('seriesName').value.trim();
        const budget = parseFloat(document.getElementById('totalBudget').value) || 0;
        const status = document.getElementById('projectStatus').value;
        const note = document.getElementById('projectNote').value.trim();

        if (!charName) {
            window.UI.showToast('กรุณากรอกชื่อตัวละคร', 'error');
            document.getElementById('charName').focus();
            return;
        }

        const projectData = {
            id: window.State.currentEditId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            charName,
            seriesName,
            budget,
            status,
            note,
            items: window.State.tempItems,
            base64Image: window.State.tempBase64Image,
            updatedAt: new Date().toISOString()
        };

        window.UI.showToast('กำลังบันทึก...', 'info');

        if (window.State.currentEditId) {
            await window.State.updateProject(window.State.currentEditId, projectData);
            window.UI.showToast('บันทึกการแก้ไขสำเร็จ', 'success');
        } else {
            projectData.createdAt = new Date().toISOString();
            await window.State.addProject(projectData);
            window.UI.showToast('สร้างโปรเจกต์สำเร็จ', 'success');
        }

        window.State.currentEditId = null;
        window.UI.switchView('viewDashboard');
    },

    // ============ ITEM MANAGEMENT ============

    addItem() {
        const newItem = {
            id: Date.now(),
            name: '',
            price: 0,
            type: 'other',
            shop: '',
            shopUrl: '',
            completed: false
        };
        window.State.tempItems.push(newItem);
        window.UI.renderFormItems();
    },

    removeItem(itemId) {
        window.State.tempItems = window.State.tempItems.filter(i => i.id !== itemId);
        window.UI.renderFormItems();
    },

    updateItemField(itemId, field, value) {
        const item = window.State.tempItems.find(i => i.id === itemId);
        if (item) {
            if (field === 'price') value = parseFloat(value) || 0;
            item[field] = value;
            if (field === 'price') window.UI.updateFormBudget();
        }
    },

    toggleItemComplete(itemId) {
        const item = window.State.tempItems.find(i => i.id === itemId);
        if (item) {
            item.completed = !item.completed;
            window.UI.renderFormItems();
        }
    },

    // ============ PROJECT DETAIL ============

    async openProjectDetail(projectId) {
        // Show basic data instantly from local state
        const localProject = window.State.getProject(projectId);
        if (!localProject) return;

        window.State.currentDetailId = projectId;
        this.renderDetailView(localProject);
        window.UI.switchView('viewDetail');

        // Lazy Load Round 2: fetch full data (with image) from API
        if (window.API && window.API.isConfigured() && !localProject.base64Image && localProject.hasImage) {
            const fullProject = await window.State.fetchFullProject(projectId);
            if (fullProject) {
                this.renderDetailView(fullProject);
                window.UI.showToast('โหลดรูปภาพสำเร็จ (Lazy Load)', 'success');
            }
        }
    },

    /**
     * Render the Detail View with project data
     */
    renderDetailView(project) {
        document.getElementById('detailChar').textContent = project.charName || '-';
        document.getElementById('detailSeries').textContent = project.seriesName || '';
        document.getElementById('detailNote').textContent = project.note || 'ไม่มีหมายเหตุ';

        const status = window.UI.getStatusConfig(project.status);
        const statusBadge = document.getElementById('detailStatus');
        statusBadge.textContent = status.label;
        statusBadge.style.background = status.bg;
        statusBadge.style.color = status.color;

        // Items List
        const list = document.getElementById('detailItemsList');
        list.innerHTML = '';

        const items = project.items || [];
        if (items.length === 0) {
            list.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-light); font-size: 0.875rem;">ยังไม่มีรายการไอเทม</div>';
        } else {
            // Summary row
            const totalSpent = items.reduce((s, i) => s + (i.price || 0), 0);
            const completedCount = items.filter(i => i.completed).length;
            const summaryEl = document.createElement('div');
            summaryEl.style.cssText = 'display: flex; justify-content: space-between; padding: 0.75rem 0; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); font-size: 0.8125rem;';
            summaryEl.innerHTML = `
                <span style="color: var(--text-muted);">${completedCount}/${items.length} รายการเสร็จ</span>
                <span style="font-weight: 700;">฿${totalSpent.toLocaleString()} / ฿${(project.budget || 0).toLocaleString()}</span>
            `;
            list.appendChild(summaryEl);

            items.forEach(item => {
                const config = window.UI.getItemTypeConfig(item.type);
                const shopLabel = item.shop ? { shopee: 'Shopee', lazada: 'Lazada', fb: 'Facebook', other: 'อื่นๆ' }[item.shop] || '' : '';

                const itemEl = document.createElement('div');
                itemEl.style.cssText = `
                    border: 1px solid var(--border); border-radius: var(--radius-md);
                    margin-bottom: 0.75rem; overflow: hidden;
                    ${item.completed ? 'opacity: 0.5;' : ''}
                `;
                itemEl.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.625rem; flex: 1; min-width: 0;">
                            <span style="font-size: 1.125rem;">${config.icon}</span>
                            <div style="min-width: 0;">
                                <div style="font-weight: 600; font-size: 0.875rem; ${item.completed ? 'text-decoration: line-through;' : ''}">${window.UI.escapeHtml(item.name || '(ไม่มีชื่อ)')}</div>
                                ${shopLabel ? `<div style="font-size: 0.75rem; color: var(--text-light);">${shopLabel}</div>` : ''}
                            </div>
                        </div>
                        <div style="font-weight: 700; font-size: 0.9375rem; color: var(--primary); white-space: nowrap;">฿${(item.price || 0).toLocaleString()}</div>
                    </div>
                    ${item.shopUrl ? `
                    <a href="${window.UI.escapeHtml(item.shopUrl)}" target="_blank" rel="noopener" style="
                        display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                        padding: 0.625rem 1rem;
                        background: #eef2ff; color: var(--primary);
                        text-decoration: none; font-size: 0.8125rem; font-weight: 600;
                        border-top: 1px solid var(--border);
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#eef2ff'">
                        🔗 เปิดลิงก์ร้านค้า — ${shopLabel}
                    </a>
                    ` : ''}
                `;
                list.appendChild(itemEl);
            });
        }

        // Image Container Logic
        const img = document.getElementById('detailImage');
        const imgBox = img.parentElement;
        
        // Remove any existing status placeholders
        const existingStatus = imgBox.querySelector('.img-status');
        if (existingStatus) existingStatus.remove();

        if (project.base64Image) {
            img.src = project.base64Image;
            img.style.display = 'block';
            imgBox.style.display = 'block';
        } else if (project.hasImage) {
            // API mode: image not loaded yet — show placeholder, KEEP img tag
            img.style.display = 'none';
            imgBox.style.display = 'block';
            const status = document.createElement('div');
            status.className = 'img-status';
            status.style.cssText = 'padding: 4rem 2rem; text-align: center; color: var(--text-light); background: #f8fafc; border-radius: var(--radius-md);';
            status.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;">🖼️</div>
                <div style="font-size: 0.8125rem; font-weight: 500;">กำลังโหลดรูปจากคลาวด์...</div>
            `;
            imgBox.appendChild(status);
        } else {
            img.style.display = 'none';
            imgBox.style.display = 'none';
        }
    },

    editCurrentProject() {
        this.editProject(window.State.currentDetailId);
    },

    async deleteCurrentProject() {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้?')) {
            await window.State.deleteProject(window.State.currentDetailId);
            window.UI.showToast('ลบโปรเจกต์สำเร็จ', 'warning');
            window.UI.switchView('viewDashboard');
        }
    }
};

window.App = App;

// Bootstrap
document.addEventListener('DOMContentLoaded', () => window.App.init());
