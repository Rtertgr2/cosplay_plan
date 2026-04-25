/**
 * Main Application Module for Cosplay Planner
 */

const App = {
    async init() {
        UI.showLoading(true, 'กำลังเริ่มต้นแอปพลิเคชัน...');
        UI.initTheme();
        State.init();
        this.setupEventListeners();
        await this.loadDashboard();
        UI.showLoading(false);
    },

    setupEventListeners() {
        let searchTimeout;
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.handleSearch(searchInput.value), 300);
            });
        }
        const statusFilter = document.getElementById("statusFilter");
        if (statusFilter) {
            statusFilter.addEventListener("change", () => this.handleFilter(statusFilter.value));
        }
    },

    async loadDashboard() {
        const grid = document.getElementById("projectGrid");
        if (!grid) return;
        
        UI.showLoading(true, 'กำลังโหลดโปรเจกต์...');
        grid.innerHTML = '';

        try {
            const projects = await this.getProjects();
            const stats = this.getLocalStats(projects);
            UI.updateStats(stats);
            UI.renderProjects(projects, "", "");
        } catch (error) {
            console.error("Failed to load dashboard:", error);
            const localProjects = State.getAll();
            const stats = this.getLocalStats(localProjects);
            UI.updateStats(stats);
            UI.renderProjects(localProjects, "", "");
        } finally {
            UI.showLoading(false);
        }
    },

    /**
     * Get projects — fetch from API and merge with local data
     */
    async getProjects() {
        let localProjects = State.getAll();
        
        if (API.isConfigured()) {
            try {
                const response = await API.list();
                if (response.success && Array.isArray(response.data)) {
                    const remoteProjects = response.data;
                    const projectMap = new Map();
                    localProjects.forEach(p => projectMap.set(p.id, p));
                    
                    remoteProjects.forEach(remote => {
                        const local = projectMap.get(remote.id);
                        if (!local) {
                            projectMap.set(remote.id, remote);
                        } else {
                            const localTime = new Date(local.updatedAt || 0).getTime();
                            const remoteTime = new Date(remote.updatedAt || 0).getTime();
                            if (remoteTime > localTime) {
                                projectMap.set(remote.id, remote);
                            }
                        }
                    });
                    
                    const merged = Array.from(projectMap.values());
                    State.projects = merged;
                    State.saveToLocal();
                    return merged;
                }
            } catch (e) {
                console.warn('API sync failed, using local data:', e);
            }
        }
        return localProjects;
    },

    getLocalStats(projects) {
        const list = projects || State.getAll();
        const totalBudget = list.reduce((sum, p) => sum + (p.budget || 0), 0);
        return {
            total: list.length,
            active: list.filter(p => p.status === 'active').length,
            completed: list.filter(p => p.status === 'completed').length,
            budgetTotal: totalBudget
        };
    },

    async handleSearch(query) {
        const projects = await this.getProjects();
        UI.renderProjects(projects, query, document.getElementById("statusFilter")?.value || "");
    },

    async handleFilter(status) {
        const projects = await this.getProjects();
        UI.renderProjects(projects, document.getElementById("searchInput")?.value || "", status);
    },

    createNewProject() {
        State.currentEditId = null;
        this.setFormDefaults();
        UI.switchView("viewCreate");
        State.tempItems = [];
        State.tempBase64Image = null;
    },

    setFormDefaults() {
        const fields = ["charName", "seriesName", "budget", "note", "imageUrl"];
        fields.forEach(id => { if (document.getElementById(id)) document.getElementById(id).value = ""; });
        if (document.getElementById("status")) document.getElementById("status").value = "planning";
        if (document.getElementById("imagePreview")) document.getElementById("imagePreview").style.display = "none";
        if (document.getElementById("formTitle")) document.getElementById("formTitle").textContent = "สร้างโปรเจกต์ใหม่";
        if (document.getElementById("itemsList")) {
            document.getElementById("itemsList").innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1rem;">ยังไม่มีรายการสินค้า กดปุ่ม "+ เพิ่มสินค้า" เพื่อเพิ่มรายการแรก</p>`;
        }
        
        // Reset image state
        State.tempBase64Image = null;
    },

    /**
     * Populate form with existing project data for editing
     */
    populateForm(project) {
        if (!project) return;
        
        document.getElementById("charName").value = project.charName || "";
        document.getElementById("seriesName").value = project.seriesName || "";
        document.getElementById("budget").value = project.budget || 0;
        document.getElementById("status").value = project.status || "planning";
        document.getElementById("note").value = project.note || "";
        document.getElementById("formTitle").textContent = "แก้ไขโปรเจกต์: " + project.charName;
        
        if (project.base64Image) {
            this.processImage(project.base64Image);
        } else {
            document.getElementById("imagePreview").style.display = "none";
        }
        
        // Populate items
        const itemsList = document.getElementById("itemsList");
        itemsList.innerHTML = "";
        if (project.items && project.items.length > 0) {
            project.items.forEach(item => {
                this.addEmptyItemWithData(item);
            });
        } else {
            itemsList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1rem;">ยังไม่มีรายการสินค้า กดปุ่ม "+ เพิ่มสินค้า" เพื่อเพิ่มรายการแรก</p>`;
        }
    },

    /**
     * Helper to add item with pre-filled data
     */
    addEmptyItemWithData(item) {
        const itemsList = document.getElementById("itemsList");
        const itemCard = document.createElement("div");
        itemCard.className = "card";
        itemCard.style.padding = "1rem";
        itemCard.style.marginBottom = "0.75rem";
        itemCard.innerHTML = `
            <form onsubmit="return false;">
                <div class="grid-2-col" style="gap: 0.75rem;">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ชื่อสินค้า *</label>
                        <input type="text" name="name" value="${item.name || ''}" required>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ราคา (บาท) *</label>
                        <input type="number" name="price" value="${item.price || 0}" min="0" required>
                    </div>
                </div>
                <div class="grid-2-col" style="gap: 0.75rem; margin-top: 0.75rem;">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ลิงค์ร้านค้า</label>
                        <input type="url" name="shopLink" value="${item.shopLink || ''}">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ประเภท</label>
                        <select name="category">
                            <option value="">เลือก...</option>
                            <option value="วิก" ${item.category === 'วิก' ? 'selected' : ''}>วิก</option>
                            <option value="ชุด" ${item.category === 'ชุด' ? 'selected' : ''}>ชุด</option>
                            <option value="พร็อพ" ${item.category === 'พร็อพ' ? 'selected' : ''}>พร็อพ</option>
                            <option value="รองเท้า" ${item.category === 'รองเท้า' ? 'selected' : ''}>รองเท้า</option>
                        </select>
                    </div>
                </div>
                <button type="button" onclick="this.closest('.card').remove()" class="btn btn-ghost" style="margin-top: 0.75rem; color: var(--error); width: 100%;">🗑️ ลบ</button>
            </form>
        `;
        itemsList.appendChild(itemCard);
    },

    toggleTheme() {
        UI.toggleTheme();
    },

    handleImageFile(input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        
        // Check size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            UI.showToast("ไฟล์รูปภาพใหญ่เกินไป (จำกัด 10MB)", "error");
            input.value = "";
            return;
        }

        UI.showLoading(true, 'กำลังประมวลผลรูปภาพ...');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Compression logic using Canvas
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Max dimension 1200px to keep file size small but clear
                const maxDim = 1200;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height *= maxDim / width;
                        width = maxDim;
                    } else {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to WebP or JPEG with 0.7 quality
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                this.processImage(compressedBase64);
                UI.showLoading(false);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        input.value = "";
    },

    processImage(base64) {
        const preview = document.getElementById("imagePreview");
        const img = document.getElementById("previewImg");
        if (preview) preview.style.display = "block";
        if (img) img.src = base64;
        State.tempBase64Image = base64;
    },

    addItem() {
        const itemsList = document.getElementById("itemsList");
        if (!itemsList) return;
        const emptyMsg = itemsList.querySelector("p");
        if (emptyMsg) emptyMsg.remove();
        
        const itemCard = document.createElement("div");
        itemCard.className = "card";
        itemCard.style.padding = "1rem";
        itemCard.style.marginBottom = "0.75rem";
        itemCard.innerHTML = `
            <form onsubmit="return false;">
                <div class="grid-2-col" style="gap: 0.75rem;">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ชื่อสินค้า *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ราคา (บาท) *</label>
                        <input type="number" name="price" min="0" required>
                    </div>
                </div>
                <div class="grid-2-col" style="gap: 0.75rem; margin-top: 0.75rem;">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ลิงค์ร้านค้า</label>
                        <input type="url" name="shopLink">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">ประเภท</label>
                        <select name="category">
                            <option value="">เลือก...</option>
                            <option value="วิก">วิก</option><option value="ชุด">ชุด</option>
                            <option value="พร็อพ">พร็อพ</option><option value="รองเท้า">รองเท้า</option>
                        </select>
                    </div>
                </div>
                <button type="button" onclick="this.closest('.card').remove()" class="btn btn-ghost" style="margin-top: 0.75rem; color: var(--error); width: 100%;">🗑️ ลบ</button>
            </form>
        `;
        itemsList.appendChild(itemCard);
    },

    editProject(projectId) {
        UI.showLoading(true, 'กำลังดึงข้อมูลเพื่อแก้ไข...');
        API.get(projectId).then(response => {
            if (response.success && response.data) {
                State.currentEditId = projectId;
                this.populateForm(response.data);
                UI.switchView("viewCreate");
            } else {
                UI.showToast("ไม่พบข้อมูลโปรเจกต์", "error");
            }
        }).catch(err => {
            UI.showToast("เกิดข้อผิดพลาด", "error");
        }).finally(() => {
            UI.showLoading(false);
        });
    },

    getItems() {
        const itemsList = document.getElementById("itemsList");
        if (!itemsList) return [];
        const forms = itemsList.querySelectorAll("form");
        const items = [];
        forms.forEach(form => {
            const fd = new FormData(form);
            const name = fd.get("name");
            const price = parseInt(fd.get("price")) || 0;
            const shopLink = fd.get("shopLink");
            const category = fd.get("category");
            if (name) items.push({ name, price, shopLink, category });
        });
        return items;
    },

    async saveProject() {
        const charName = document.getElementById("charName").value.trim();
        if (!charName) { UI.showToast("กรุณากรอกชื่อตัวละคร", "error"); return; }

        UI.showLoading(true, 'กำลังบันทึกข้อมูล...');
        const projectData = {
            id: State.currentEditId || "proj_" + Date.now(),
            charName,
            seriesName: document.getElementById("seriesName").value.trim(),
            budget: parseInt(document.getElementById("budget").value) || 0,
            status: document.getElementById("status").value,
            note: document.getElementById("note").value.trim(),
            base64Image: State.tempBase64Image || (State.currentEditId ? State.get(State.currentEditId)?.base64Image : ""),
            items: this.getItems(),
            updatedAt: new Date().toISOString()
        };

        try {
            let response;
            if (State.currentEditId) {
                // If editing, use API.update
                response = await API.update(State.currentEditId, projectData);
            } else {
                // If new, use API.create
                response = await API.create(projectData);
            }

            if (response.success) {
                UI.showToast("บันทึกสำเร็จ! 🎉", "success");
                
                // Update local State to keep UI in sync
                if (State.currentEditId) {
                    State.update(projectData);
                } else {
                    State.add(projectData);
                }
                
                this.setFormDefaults();
                State.currentEditId = null; // Clear edit mode
                setTimeout(() => UI.switchView("viewDashboard"), 500);
            } else {
                UI.showToast("บันทึกล้มเหลว: " + (response.error || "ไม่ทราบสาเหตุ"), "error");
            }
        } catch (error) {
            console.error("Save failed:", error);
            UI.showToast("Error: " + error.message, "error");
        } finally {
            UI.showLoading(false);
        }
    },

    async loadProjectDetails(projectId) {
        UI.showLoading(true, 'กำลังดึงข้อมูล...');
        try {
            const response = await API.get(projectId);
            if (response.success && response.data) {
                const project = response.data;
                document.getElementById("detailCharacter").textContent = project.charName || "—";
                document.getElementById("detailSeries").textContent = project.seriesName || "—";
                document.getElementById("detailBudget").textContent = "฿" + (project.budget || 0).toLocaleString();
                document.getElementById("detailNote").textContent = project.note || "—";
                const badge = document.getElementById("detailBadge");
                if (badge) {
                    badge.className = "badge " + (project.status || "planning");
                    badge.textContent = UI.getBadgeText(project.status);
                }
                const img = document.getElementById("detailImage");
                const ph = document.getElementById("detailImagePlaceholder");
                if (project.base64Image) {
                    img.src = project.base64Image; img.style.display = "block"; ph.style.display = "none";
                } else {
                    img.style.display = "none"; ph.style.display = "flex";
                }
                UI.renderItems(project.items || []);
                State.currentEditId = projectId;
            }
        } catch (e) {
            UI.showToast("โหลดข้อมูลล้มเหลว", "error");
        } finally {
            UI.showLoading(false);
        }
    },

    async deleteProject(projectId) {
        if (!confirm("ลบโปรเจกต์นี้?")) return;
        UI.showLoading(true, 'กำลังลบ...');
        try {
            const response = await API.delete(projectId);
            if (response.success) {
                State.delete(projectId);
                UI.showToast("ลบสำเร็จ", "success");
                UI.switchView("viewDashboard");
            }
        } finally {
            UI.showLoading(false);
        }
    }
};

window.App = App;
document.addEventListener("DOMContentLoaded", () => App.init());
console.log("✅ App Module initialized");
