/**
 * UI Rendering and Interaction Module for Cosplay Planner
 */

const UI = {
    /**
     * Initialize Theme
     */
    initTheme() {
        const savedTheme = localStorage.getItem('cosplay-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            if (prefersDark.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('cosplay-theme', 'dark');
                this.updateThemeIcon('dark');
            }
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('cosplay-theme', newTheme);
        this.updateThemeIcon(newTheme);
    },

    updateThemeIcon(theme) {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },

    switchView(viewName) {
        const views = ['viewDashboard', 'viewCreate', 'viewDetail'];
        views.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === viewName) {
                    el.removeAttribute('hidden');
                    el.style.animation = 'fadeIn 0.3s ease';
                } else {
                    el.setAttribute('hidden', '');
                }
            }
        });

        if (viewName === 'viewDashboard' && window.App) {
            window.App.loadDashboard();
        }
    },

    /**
     * Show or hide loading overlay
     */
    showLoading(show, message = 'กำลังโหลดข้อมูล...') {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;

        const text = overlay.querySelector('.loading-text');
        if (text) text.textContent = message;

        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    },

    updateStats(stats) {
        if (!stats) return;
        const statTotal = document.getElementById('statTotal');
        const statActive = document.getElementById('statActive');
        const statCompleted = document.getElementById('statCompleted');
        const statBudget = document.getElementById('statBudget');

        if (statTotal) statTotal.textContent = stats.total || 0;
        if (statActive) statActive.textContent = stats.active || 0;
        if (statCompleted) statCompleted.textContent = stats.completed || 0;
        if (statBudget) statBudget.textContent = '฿' + (stats.budgetTotal || 0).toLocaleString();
    },

    renderProjects(projects, searchQuery = '', statusFilter = '') {
        const grid = document.getElementById('projectGrid');
        if (!grid) return;

        let filteredProjects = [...projects];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredProjects = filteredProjects.filter(p =>
                (p.charName || '').toLowerCase().includes(query) ||
                (p.seriesName || '').toLowerCase().includes(query) ||
                (p.note || '').toLowerCase().includes(query)
            );
        }

        if (statusFilter) {
            filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
        }

        grid.innerHTML = '';

        if (filteredProjects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; padding: 3rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎭</div>
                    <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">ยังไม่มีโปรเจกต์</p>
                    <p style="font-size: 0.875rem; color: var(--text-muted);">กดปุ่ม "+ สร้างโปรเจกต์" เพื่อเริ่มต้น</p>
                </div>
            `;
            return;
        }

        filteredProjects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.onclick = () => this.showDetail(project.id);

            const statusClass = project.status || 'planning';
            const badgeText = this.getBadgeText(project.status);
            const charName = project.charName || '—';
            const seriesName = project.seriesName || 'Unknown Series';
            const budget = (project.budget || 0).toLocaleString();
            const itemCount = project.items ? project.items.length : 0;
            const hasImage = project.base64Image && project.base64Image.length > 10;

            card.innerHTML = `
                <div style="display: flex; gap: 1rem;">
                    ${hasImage ? `
                        <div style="width: 80px; height: 80px; border-radius: var(--radius-lg); overflow: hidden; flex-shrink: 0; background: var(--bg-secondary);">
                            <img src="${project.base64Image}" alt="${charName}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    ` : `
                        <div style="width: 80px; height: 80px; border-radius: var(--radius-lg); overflow: hidden; flex-shrink: 0; background: linear-gradient(135deg, var(--primary), #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">🎭</div>
                    `}

                    <div style="flex: 1;">
                        <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; line-height: 1.3;">${charName}</h3>
                        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.75rem;">${seriesName}</p>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; align-items: center;">
                            <span class="badge ${statusClass}">${badgeText}</span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.75rem;">
                            <span>📦 Items: ${itemCount}</span>
                            <span>💰 ฿${budget}</span>
                        </div>
                    </div>
                </div>
                <div class="project-actions" style="position: absolute; top: 1rem; right: 1rem; opacity: 0; transition: opacity 0.15s ease;">
                    <button onclick="event.stopPropagation(); window.App.editProject('${project.id}')" class="btn btn-ghost" style="padding: 0.5rem;">✏️</button>
                    <button onclick="event.stopPropagation(); window.App.deleteProject('${project.id}')" class="btn btn-ghost" style="padding: 0.5rem; color: var(--error);">🗑️</button>
                </div>
            `;

            grid.appendChild(card);
        });

        this.addHoverEffects();
    },

    getBadgeText(status) {
        const mapping = {
            'planning': '📋 วางแผนอยู่',
            'active': '🔨 กำลังดำเนินการ',
            'waiting': '⏳ กำลังรอของ',
            'completed': '✅ คอสเสร็จแล้ว',
            'cancelled': '❌ ยกเลิก'
        };
        return mapping[status] || '—';
    },

    addHoverEffects() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const actions = card.querySelector('.project-actions');
                if (actions) actions.style.opacity = '1';
            });
            card.addEventListener('mouseleave', () => {
                const actions = card.querySelector('.project-actions');
                if (actions) actions.style.opacity = '0';
            });
        });
    },

    showDetail(projectId) {
        window.App.loadProjectDetails(projectId);
        this.switchView('viewDetail');
    },

    /**
     * Render items list in detail view (Includes Shop Link Button)
     */
    renderItems(items) {
        const container = document.getElementById('detailItemsList');
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 3rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">📦</div>
                    <p>ยังไม่มีรายการสินค้า</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map((item) => {
            const price = (item.price || 0).toLocaleString();
            return `
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; position: relative; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <strong style="font-size: 1.125rem;">${item.name || 'สินค้าใหม่'}</strong>
                                ${item.category ? `<span class="badge planning" style="font-size: 0.75rem;">${item.category}</span>` : ''}
                            </div>
                            <p style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem;">฿${price}</p>
                            
                            ${item.shopLink ? `
                                <a href="${item.shopLink}" target="_blank" class="btn-shop">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                                    </svg>
                                    ไปที่ร้านค้า
                                </a>
                            ` : `
                                <span style="font-size: 0.875rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
                                    <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                    </svg>
                                    ยังไม่ได้ระบุลิงก์ร้านค้า
                                </span>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        const colors = { 'success': 'var(--success)', 'error': 'var(--error)', 'warning': 'var(--warning)', 'info': 'var(--primary)' };
        toast.style.borderLeftColor = colors[type] || colors['info'];
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.UI = UI;
console.log("✅ UI Module initialized");
