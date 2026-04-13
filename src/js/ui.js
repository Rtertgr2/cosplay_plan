/**
 * UI Rendering and Interaction Module (Clean & Minimal Edition)
 */

const UI = {
    views: ['viewDashboard', 'viewCreate', 'viewDetail'],

    switchView(viewName) {
        this.views.forEach(viewId => {
            const el = document.getElementById(viewId);
            if (viewId === viewName) {
                el.classList.remove('hidden');
                el.classList.add('animate-fade-in');
            } else {
                el.classList.add('hidden');
            }
        });

        const navDashboard = document.getElementById('navDashboard');
        if (viewName === 'viewDashboard') {
            navDashboard.classList.add('btn-secondary');
            this.updateStats();
            this.renderProjects();
        } else {
            navDashboard.classList.remove('btn-secondary');
        }
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast animate-fade-in';
        toast.innerHTML = `<span>${this.getToastIcon(type)}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getToastIcon(type) {
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        return icons[type] || '✅';
    },

    updateStats() {
        const projects = window.State.projects;
        document.getElementById('statTotal').textContent = projects.length;
        document.getElementById('statActive').textContent = projects.filter(p => !['completed', 'cancelled'].includes(p.status)).length;
        document.getElementById('statCompleted').textContent = projects.filter(p => p.status === 'completed').length;
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        document.getElementById('statBudget').textContent = '฿' + totalBudget.toLocaleString();
    },

    renderProjects() {
        const projects = window.State.projects;
        const grid = document.getElementById('projectGrid');
        const emptyState = document.getElementById('emptyState');

        grid.innerHTML = '';

        if (projects.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        projects.forEach((project, index) => {
            const itemTotal = (project.items || []).reduce((sum, item) => sum + (item.price || 0), 0);
            const budgetPercent = project.budget > 0 ? Math.min((itemTotal / project.budget) * 100, 100) : 0;
            const status = this.getStatusConfig(project.status);

            const card = document.createElement('div');
            card.className = 'card animate-fade-in cursor-pointer hover:border-indigo-300 transition-colors';
            card.style.animationDelay = `${index * 0.05}s`;
            card.onclick = () => window.App.openProjectDetail(project.id);

            card.innerHTML = `
                <div style="padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        <div style="flex: 1; min-width: 0;">
                            <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(project.charName)}</h3>
                            <p style="font-size: 0.8125rem; color: var(--text-muted);">${this.escapeHtml(project.seriesName)}</p>
                        </div>
                        <span class="badge" style="background: ${status.bg}; color: ${status.color};">${status.label}</span>
                    </div>
                    
                    ${project.base64Image ? `
                    <div style="width: 100%; height: 140px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1rem; background: #f1f5f9;">
                        <img src="${project.base64Image}" style="width: 100%; height: 100%; object-fit: cover;" alt="Reference">
                    </div>
                    ` : `
                    <div style="width: 100%; height: 40px; border-radius: var(--radius-md); background: #f8fafc; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #cbd5e1; border: 1px dashed #e2e8f0;">🎭 No Image</div>
                    `}
                    
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.375rem;">
                        <span style="font-weight: 500;">฿${itemTotal.toLocaleString()} <span style="font-weight: 400; color: var(--text-light);">/ ฿${(project.budget || 0).toLocaleString()}</span></span>
                        <span style="color: ${itemTotal > project.budget ? 'var(--error)' : 'var(--text-muted)'}">${Math.round(budgetPercent)}%</span>
                    </div>
                    <div style="width: 100%; background: #f1f5f9; border-radius: 99px; height: 6px; overflow: hidden;">
                        <div style="height: 100%; border-radius: 99px; width: ${budgetPercent}%; background: ${itemTotal > project.budget ? 'var(--error)' : 'var(--primary)'}; transition: width 0.6s ease;"></div>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });
    },

    renderFormItems() {
        const container = document.getElementById('itemsList');
        const items = window.State.tempItems;
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; border: 1px dashed var(--border); border-radius: var(--radius-lg); color: var(--text-light); font-size: 0.875rem;">ยังไม่มีรายการไอเทม</div>';
            return;
        }

        items.forEach((item, index) => {
            const config = this.getItemTypeConfig(item.type);
            const row = document.createElement('div');
            row.style.background = 'white';
            row.style.border = '1px solid var(--border)';
            row.style.borderRadius = 'var(--radius-md)';
            row.style.padding = '1rem';
            row.style.marginBottom = '0.75rem';
            row.style.display = 'flex';
            row.style.flexDirection = 'column';
            row.style.gap = '0.75rem';
            row.className = 'animate-fade-in';

            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <button onclick="window.App.toggleItemComplete(${item.id})" style="width: 1.25rem; height: 1.25rem; border-radius: 4px; border: 1px solid ${item.completed ? 'var(--primary)' : '#d1d5db'}; background: ${item.completed ? 'var(--primary)' : 'transparent'}; cursor: pointer; color: white; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;">
                        ${item.completed ? '✓' : ''}
                    </button>
                    <span style="font-size: 1.125rem;">${config.icon}</span>
                    <input type="text" class="input-field" value="${this.escapeHtml(item.name)}" oninput="window.App.updateItemField(${item.id}, 'name', this.value)" placeholder="ชื่อไอเทม (เช่น วิกสีบลอนด์, ผ้าลูกไม้)" style="flex: 1;">
                    <button onclick="window.App.removeItem(${item.id})" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.25rem;">🗑️</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <div style="position: relative;">
                        <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.875rem; color: #94a3b8;">฿</span>
                        <input type="number" class="input-field" value="${item.price || ''}" oninput="window.App.updateItemField(${item.id}, 'price', this.value)" placeholder="ราคา" style="padding-left: 1.75rem;">
                    </div>
                    <select class="input-field" onchange="window.App.updateItemField(${item.id}, 'shop', this.value)">
                        <option value="">-- แหล่งซื้อ --</option>
                        <option value="shopee" ${item.shop === 'shopee' ? 'selected' : ''}>Shopee</option>
                        <option value="lazada" ${item.shop === 'lazada' ? 'selected' : ''}>Lazada</option>
                        <option value="fb" ${item.shop === 'fb' ? 'selected' : ''}>Facebook</option>
                        <option value="other" ${item.shop === 'other' ? 'selected' : ''}>อื่นๆ / ทำเอง</option>
                    </select>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                   <input type="url" class="input-field" value="${this.escapeHtml(item.shopUrl)}" oninput="window.App.updateItemField(${item.id}, 'shopUrl', this.value)" placeholder="https://ลิงก์สินค้า..." style="flex: 1;">
                   <select class="input-field" onchange="window.App.updateItemField(${item.id}, 'type', this.value)" style="width: auto; min-width: 120px;">
                        <option value="wig" ${item.type === 'wig' ? 'selected' : ''}>💇 วิก</option>
                        <option value="costume" ${item.type === 'costume' ? 'selected' : ''}>👗 ชุด</option>
                        <option value="prop" ${item.type === 'prop' ? 'selected' : ''}>⚔️ พร็อพ</option>
                        <option value="shoes" ${item.type === 'shoes' ? 'selected' : ''}>👟 รองเท้า</option>
                        <option value="accessory" ${item.type === 'accessory' ? 'selected' : ''}>💎 เครื่องประดับ</option>
                        <option value="makeup" ${item.type === 'makeup' ? 'selected' : ''}>💄 เมคอัพ</option>
                        <option value="other" ${item.type === 'other' ? 'selected' : ''}>📦 อื่นๆ</option>
                   </select>
                </div>
            `;
            container.appendChild(row);
        });

        this.updateFormBudget();
    },

    updateFormBudget() {
        const items = window.State.tempItems;
        const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
        const budget = parseFloat(document.getElementById('totalBudget').value) || 0;
        const percent = budget > 0 ? (total / budget) * 100 : 0;

        document.getElementById('itemTotal').textContent = '฿' + total.toLocaleString();
        document.getElementById('budgetDisplay').textContent = '฿' + budget.toLocaleString();
        document.getElementById('budgetPercent').textContent = Math.round(percent) + '%';
        
        const progressBar = document.getElementById('budgetProgress');
        progressBar.style.width = Math.min(percent, 100) + '%';
        progressBar.style.background = total > budget && budget > 0 ? 'var(--error)' : 'var(--primary)';
    },

    getStatusConfig(status) {
        const configs = {
            'planning': { label: 'วางแผน', bg: '#f1f5f9', color: '#475569' },
            'in-progress': { label: 'กำลังทำ', bg: '#eff6ff', color: '#2563eb' },
            'waiting': { label: 'รอของ', bg: '#fffbeb', color: '#d97706' },
            'completed': { label: 'เสร็จแล้ว', bg: '#ecfdf5', color: '#059669' },
            'cancelled': { label: 'ยกเลิก', bg: '#fef2f2', color: '#dc2626' }
        };
        return configs[status] || configs['planning'];
    },

    getItemTypeConfig(type) {
        const configs = {
            wig: { icon: '💇' }, costume: { icon: '👗' }, prop: { icon: '⚔️' },
            shoes: { icon: '👟' }, accessory: { icon: '💎' }, makeup: { icon: '💄' },
            other: { icon: '📦' }
        };
        return configs[type] || configs['other'];
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.UI = UI;
